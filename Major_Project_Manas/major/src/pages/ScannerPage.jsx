import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Camera, MapPin, Plus, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { identifyLandmarkWithVision } from "../services/groqService";
import { createPlannedTrip, getPlannedTrips, deletePlannedTrip } from "../services/routeService";

export default function ScannerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [plannedTrips, setPlannedTrips] = useState([]);
  const [tripsLoaded, setTripsLoaded] = useState(false);

  async function loadPlannedTrips() {
    if (!user || tripsLoaded) return;
    try {
      const data = await getPlannedTrips(user.id);
      setPlannedTrips(data);
      setTripsLoaded(true);
    } catch (err) {
      console.error(err);
    }
  }

  useState(() => {
    loadPlannedTrips();
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image.");
      return;
    }
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    setResult(null);
  };

  const handleScan = async () => {
    if (!image || !preview) {
      alert("Please select an image first.");
      return;
    }
    setLoading(true);
    try {
      const identification = await identifyLandmarkWithVision(preview);
      setResult(identification);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToPlannedTrips = async () => {
    if (!result || !user) return;
    try {
      const trip = await createPlannedTrip({
        user_id: user.id,
        name: result.name,
        location: result.location,
        description: result.description,
        image_url: preview,
      });
      setPlannedTrips((prev) => [trip, ...prev]);
      alert(`${result.name} added to planned trips!`);
    } catch (err) {
      console.error(err);
    }
  };

  const removePlannedTrip = async (id) => {
    try {
      await deletePlannedTrip(id);
      setPlannedTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="scanner-container">
      <div className="header">
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button className="secondary-btn" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={18} /> Back
          </button>
          <div>
            <h1>Landmark Scanner</h1>
            <p style={{ color: "var(--muted)" }}>Take a photo of any famous place and let AI identify it</p>
          </div>
        </div>
      </div>

      <div className="grid-layout" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* Upload Section */}
        <div className="glass-card">
          <h3 className="mb-20"><Camera size={20} style={{ display: "inline", marginRight: "8px" }} /> Upload Image</h3>
          
          <label className="upload-box">
            <Upload size={40} style={{ color: "#6366f1", marginBottom: "15px" }} />
            <p style={{ color: "#a1a1aa", marginBottom: "8px" }}>Click or drag to upload a photo</p>
            <p style={{ color: "#6b7280", fontSize: "0.8rem" }}>JPG, PNG up to 5MB</p>
            <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} />
          </label>

          {preview && (
            <>
              <img src={preview} alt="Preview" className="scanner-preview" />
              <button
                className="primary-btn w-100"
                onClick={handleScan}
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 size={18} className="spin" /> Identifying...</>
                ) : (
                  <><Camera size={18} /> Identify Landmark</>
                )}
              </button>
            </>
          )}
        </div>

        {/* Result Section */}
        <div>
          {result && (
            <div className="scanner-result">
              <h3>
                {result.identified ? (
                  <><CheckCircle size={20} style={{ color: "#22c55e" }} /> {result.name}</>
                ) : (
                  "Could not identify landmark"
                )}
              </h3>
              
              {result.identified && (
                <>
                  <p style={{ color: "var(--muted)", marginBottom: "10px" }}>
                    <MapPin size={14} style={{ display: "inline", marginRight: "5px" }} />
                    {result.location}
                  </p>
                  <p>{result.description}</p>
                  
                  <div style={{ marginTop: "15px" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                      Confidence: {result.confidence}%
                    </span>
                    <div className="confidence-bar">
                      <div
                        className="confidence-bar-fill"
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                  </div>

                  <div className="scanner-actions">
                    <button className="primary-btn" onClick={addToPlannedTrips}>
                      <Plus size={16} /> Add to Planned Trips
                    </button>
                    <button className="secondary-btn" onClick={() => navigate("/dashboard")}>
                      <MapPin size={16} /> Add to Current Trip
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {!result && !loading && (
            <div className="empty-state" style={{ marginTop: 0 }}>
              <Camera size={48} style={{ color: "#6366f1", marginBottom: "15px" }} />
              <h3>Ready to Scan</h3>
              <p>Upload a photo of a famous landmark, station, or building to identify it.</p>
            </div>
          )}
        </div>
      </div>

      {/* Planned Trips */}
      <div className="planned-trips">
        <h2 className="mb-20">Planned Trips ({plannedTrips.length})</h2>
        
        {plannedTrips.length === 0 ? (
          <div className="empty-state">
            <MapPin size={48} style={{ color: "#6366f1", marginBottom: "15px" }} />
            <h3>No Planned Trips</h3>
            <p>Use the scanner to identify places and add them here.</p>
          </div>
        ) : (
          <div className="flex" style={{ flexDirection: "column", gap: "15px" }}>
            {plannedTrips.map((trip) => (
              <div className="planned-trip-card" key={trip.id}>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: "4px" }}>{trip.name}</h4>
                  <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{trip.location}</p>
                  <p style={{ color: "#a1a1aa", fontSize: "0.85rem", marginTop: "4px" }}>{trip.description}</p>
                </div>
                <button
                  className="danger-btn"
                  style={{ padding: "8px 14px" }}
                  onClick={() => removePlannedTrip(trip.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
