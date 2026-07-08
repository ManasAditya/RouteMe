import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { ArrowLeft, MapPin, Route, ExternalLink, CircleDot } from "lucide-react";
import L from "leaflet";
import { useAuth } from "../context/AuthContext";
import { getRoutes } from "../services/routeService";
import 'leaflet/dist/leaflet.css';
// Mumbai center coordinates
const MUMBAI_CENTER = [19.0760, 72.8777];

// Create custom CSS-based markers (no image paths needed)
function createCustomIcon(type, number) {
  const className = type === "start" ? "marker-start" : type === "end" ? "marker-end" : "marker-middle";
  const size = type === "middle" ? 30 : 36;
  return L.divIcon({
    className: "custom-marker " + className,
    html: type === "middle" ? number : type === "start" ? "S" : "E",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// Generate approximate coordinates for checkpoints (spread around Mumbai)
function generateCheckpointCoords(checkpoints, base = MUMBAI_CENTER) {
  if (!checkpoints.length) return [];
  const coords = [];
  const total = checkpoints.length;
  for (let i = 0; i < total; i++) {
    const latOffset = (i - total / 2) * 0.015;
    const lngOffset = (i - total / 2) * 0.02;
    coords.push([base[0] + latOffset, base[1] + lngOffset]);
  }
  return coords;
}

export default function MapPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeRoute, setActiveRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const data = await getRoutes(user.id);
        const active = data.find((r) => r.status === "active");
        setActiveRoute(active || data[0] || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const landmarks = Array.isArray(activeRoute?.landmarks) ? activeRoute.landmarks : [];
  const origin = activeRoute?.origin || "Borivali West, Mumbai";
  const destination = activeRoute?.destination || "Infinity Mall, Andheri";

  // Free Google Maps directions link (no API key)
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=transit`;

  const checkpointCoords = useMemo(() => generateCheckpointCoords(landmarks), [landmarks]);

  const mapCenter = checkpointCoords.length > 0
    ? [
        checkpointCoords.reduce((sum, c) => sum + c[0], 0) / checkpointCoords.length,
        checkpointCoords.reduce((sum, c) => sum + c[1], 0) / checkpointCoords.length,
      ]
    : MUMBAI_CENTER;

  return (
    <div className="map-container">
      <div className="header">
        <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
          <button className="secondary-btn" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={18} /> Back
          </button>
          <div>
            <h1>Live Trip Map</h1>
            <p style={{ color: "var(--muted)" }}>
              {activeRoute ? `${origin} → ${destination}` : "No active trip"}
            </p>
          </div>
        </div>
        {activeRoute && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="primary-btn"
            style={{ marginLeft: "auto" }}
          >
            <ExternalLink size={16} />
            Open Route in Maps
          </a>
        )}
      </div>

      {loading ? (
        <div className="loading">
          <div className="loader"></div>
          <p>Loading map...</p>
        </div>
      ) : (
        <>
          {/* Interactive Leaflet Map */}
          <div className="map-wrapper" style={{ height: "500px", padding: 0, overflow: "hidden" }}>
            <MapContainer
              center={mapCenter}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%", borderRadius: "14px" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Route polyline connecting all checkpoints */}
              {checkpointCoords.length > 1 && (
                <Polyline
                  positions={checkpointCoords}
                  pathOptions={{ color: "#6366f1", weight: 4, opacity: 0.8, dashArray: "10, 10" }}
                />
              )}

              {/* Checkpoint markers with popups */}
              {landmarks.map((leg, i) => {
                const type = i === 0 ? "start" : i === landmarks.length - 1 ? "end" : "middle";
                const icon = createCustomIcon(type, i + 1);
                return (
                  <Marker
                    key={i}
                    position={checkpointCoords[i] || MUMBAI_CENTER}
                    icon={icon}
                  >
                    <Popup>
                      <div>
                        <h4>
                          {i + 1}. {leg.checkpoint}
                          <span style={{ fontSize: "0.75rem", color: "#a1a1aa", marginLeft: "8px" }}>
                            ({leg.transport_mode || "Walking"})
                          </span>
                        </h4>
                        <p>{leg.instruction}</p>
                        <p style={{ marginTop: "6px" }}>
                          <span style={{ color: "#22c55e", fontWeight: 600 }}>₹{leg.estimated_cost_inr || 0}</span>
                          <span style={{ color: "#a1a1aa", marginLeft: "10px" }}>{leg.distance_km || 0} km</span>
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Checkpoint timeline below map */}
          {activeRoute && (
            <div className="map-info-card" style={{ marginTop: "25px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", marginBottom: "20px" }}>
                <h3 style={{ fontWeight: 600, fontSize: "1.2rem" }}>
                  <Route size={20} style={{ display: "inline", marginRight: "8px", color: "#6366f1" }} />
                  {origin} → {destination}
                </h3>
                <div style={{ display: "flex", gap: "10px" }}>
                  <span className="badge">{activeRoute.transit_type}</span>
                  <span className="badge success">{activeRoute.status}</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
                {landmarks.map((leg, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "15px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                        background: i === 0 ? "linear-gradient(135deg, #22c55e, #16a34a)" :
                                     i === landmarks.length - 1 ? "linear-gradient(135deg, #ef4444, #dc2626)" :
                                     "linear-gradient(135deg, #6366f1, #a78bfa)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontSize: "0.8rem", fontWeight: 700,
                        boxShadow: "0 4px 12px rgba(99,102,241,0.3)", zIndex: 2
                      }}>
                        {i === 0 ? <CircleDot size={16} /> : i === landmarks.length - 1 ? <MapPin size={16} /> : i + 1}
                      </div>
                      {i < landmarks.length - 1 && (
                        <div style={{ width: "2px", height: "50px", background: "linear-gradient(180deg, #6366f1, #a78bfa)", marginTop: "-2px" }} />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingBottom: i < landmarks.length - 1 ? "18px" : "0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "5px" }}>
                        <h4 style={{ fontWeight: 600, fontSize: "1rem" }}>{leg.checkpoint}</h4>
                        <span style={{ fontSize: "0.8rem", color: "var(--muted)", background: "rgba(255,255,255,0.04)", padding: "3px 10px", borderRadius: "20px" }}>
                          {leg.transport_mode || "Walking"}
                        </span>
                      </div>
                      <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: "4px" }}>{leg.instruction}</p>
                      <p style={{ color: "#a1a1aa", fontSize: "0.8rem", marginTop: "2px" }}>
                        {leg.distance_km} km {leg.estimated_cost_inr ? `· ₹${leg.estimated_cost_inr}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!activeRoute && (
            <div className="empty-state" style={{ marginTop: "25px" }}>
              <MapPin size={48} style={{ color: "#6366f1", marginBottom: "15px" }} />
              <h3>No Active Trip</h3>
              <p>Create a route from your dashboard to see it on the interactive map.</p>
              <button className="primary-btn mt-20" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
