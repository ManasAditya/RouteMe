import { useState } from "react";
import { MapPin, Navigation, Train, Loader2, Car, Bus, Footprints, ChevronRight, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getTransportOptions, getDetailedRoute } from "../services/groqService";
import { createRoute, addAnalytics } from "../services/routeService";
import { sendTripCreatedEmail } from "../services/resendService";

const TRANSPORT_ICONS = {
  Car: Car, Train: Train, Metro: Train, Auto: Car, Bus: Bus, Walking: Footprints, default: Train,
};

export default function RouteForm({ onRouteCreated }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [transportOptions, setTransportOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [detailedRoute, setDetailedRoute] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalCost = detailedRoute.reduce((sum, leg) => sum + (leg.estimated_cost_inr || 0), 0);
  const totalDistance = detailedRoute.reduce((sum, leg) => sum + (leg.distance_km || 0), 0);

  async function handleGetOptions(e) {
    e.preventDefault();
    if (!origin || !destination) return;
    setLoading(true); setError("");
    try {
      const options = await getTransportOptions(origin, destination);
      setTransportOptions(Array.isArray(options) ? options : []);
      setStep(2);
    } catch (err) { setError(err.message || "Failed to get transport options."); }
    finally { setLoading(false); }
  }

  async function handleSelectOption(option) {
    setSelectedOption(option);
    setLoading(true); setError("");
    try {
      const route = await getDetailedRoute(origin, destination, option.mode);
      setDetailedRoute(Array.isArray(route) ? route : []);
      setStep(3);
    } catch (err) { setError(err.message || "Failed to generate detailed route."); }
    finally { setLoading(false); }
  }

  async function handleConfirmRoute() {
    setLoading(true); setError("");
    try {
      const route = await createRoute({
        user_id: user.id, origin, destination,
        transit_type: selectedOption.mode,
        landmarks: detailedRoute, status: "active",
      });

      await addAnalytics({
        user_id: user.id, route_id: route.id,
        minutes_spent: parseInt(selectedOption.estimated_time) || 30,
        cost_incurred: totalCost,
        travel_date: new Date().toISOString().split("T")[0],
      });

      // 🔔 SEND EMAIL when trip is created
      await sendTripCreatedEmail({
        userEmail: user.email,
        origin,
        destination,
        transitType: selectedOption.mode,
        landmarks: detailedRoute,
        totalCost,
        totalDistance: totalDistance.toFixed(1),
      });

      setSuccess("Route created successfully! Check your email.");
      if (onRouteCreated) onRouteCreated(route);

      setTimeout(() => {
        setStep(1); setOrigin(""); setDestination("");
        setTransportOptions([]); setSelectedOption(null);
        setDetailedRoute([]); setSuccess("");
      }, 2500);
    } catch (err) { setError(err.message || "Failed to save route."); }
    finally { setLoading(false); }
  }

  function handleBack() {
    if (step === 3) { setStep(2); setSelectedOption(null); setDetailedRoute([]); }
    else if (step === 2) { setStep(1); setTransportOptions([]); }
  }

  const StepDot = ({ num, label, active }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div className={`step-dot ${active ? "active" : ""}`}>{num}</div>
      <span style={{ color: active ? "#fff" : "#6b7280", fontSize: "0.85rem", fontWeight: 500 }}>{label}</span>
    </div>
  );

  return (
    <div className="glass-card">
      <h2 className="mb-30">Generate AI Route</h2>
      <div className="wizard-step-indicator">
        <StepDot num={1} label="Trip" active={step >= 1} />
        <div className={`step-line ${step >= 2 ? "active" : ""}`} />
        <StepDot num={2} label="Transport" active={step >= 2} />
        <div className={`step-line ${step >= 3 ? "active" : ""}`} />
        <StepDot num={3} label="Route" active={step >= 3} />
      </div>

      {error && <div className="message-error mb-20">{error}</div>}
      {success && <div className="message-success mb-20">{success}</div>}

      {step === 1 && (
        <form onSubmit={handleGetOptions} className="auth-form">
          <div>
            <label>Where are you now?</label>
            <div style={{ position: "relative", marginTop: "8px" }}>
              <MapPin size={18} style={{ position: "absolute", left: "14px", top: "15px", color: "#777" }} />
              <input className="form-input" style={{ paddingLeft: "42px" }} placeholder="Borivali West" value={origin} onChange={(e) => setOrigin(e.target.value)} required />
            </div>
          </div>
          <div>
            <label>Where do you want to go?</label>
            <div style={{ position: "relative", marginTop: "8px" }}>
              <Navigation size={18} style={{ position: "absolute", left: "14px", top: "15px", color: "#777" }} />
              <input className="form-input" style={{ paddingLeft: "42px" }} placeholder="Infinity Mall, Andheri" value={destination} onChange={(e) => setDestination(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="primary-btn w-100" disabled={loading}>
            {loading ? (<><Loader2 size={18} className="spin" /> Finding options...</>) : (<><Train size={18} /> Find Transport Options <ChevronRight size={18} /></>)}
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="route-wizard-step">
          <h3 style={{ marginBottom: "10px", fontWeight: 700 }}>{origin} → {destination}</h3>
          <p style={{ color: "var(--muted)", marginBottom: "20px" }}>Choose your preferred transport mode:</p>
          <div className="transport-selector">
            {transportOptions.map((opt, i) => {
              const Icon = TRANSPORT_ICONS[opt.mode] || TRANSPORT_ICONS.default;
              return (
                <div key={i} className={`transport-option ${selectedOption?.mode === opt.mode ? "selected" : ""}`} onClick={() => handleSelectOption(opt)}>
                  <div className="transport-icon"><Icon size={24} /></div>
                  <h4>{opt.mode}</h4>
                  <p>{opt.description}</p>
                  <div className="transport-meta">
                    <span>⏱ {opt.estimated_time}</span>
                    <span>₹{opt.estimated_cost_inr}</span>
                    <span>{opt.direct ? "Direct" : "Multi-leg"}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {loading && <div className="text-center mt-20"><div className="loading"><div className="loader"></div><p>Generating route...</p></div></div>}
          <button className="secondary-btn mt-20" onClick={handleBack}>← Back</button>
        </div>
      )}

      {step === 3 && (
        <div className="route-wizard-step">
          <h3 style={{ marginBottom: "10px", fontWeight: 700 }}>{selectedOption.mode} Route: {origin} → {destination}</h3>
          <p style={{ color: "var(--muted)", marginBottom: "20px" }}>Review your AI-generated landmark route:</p>
          <div className="expense-summary mb-20">
            <div className="expense-item"><div className="expense-value">₹{totalCost}</div><div className="expense-label">Total Cost</div></div>
            <div className="expense-item"><div className="expense-value">{totalDistance.toFixed(1)} km</div><div className="expense-label">Total Distance</div></div>
            <div className="expense-item"><div className="expense-value">{selectedOption.estimated_time}</div><div className="expense-label">Est. Time</div></div>
          </div>
          <div className="timeline">
            {detailedRoute.map((leg, i) => (
              <div className="timeline-item" key={i}>
                <div className="timeline-circle">{i + 1}</div>
                <div className="timeline-details">
                  <div className="timeline-header">
                    <h4>{leg.checkpoint}</h4>
                    <span className="badge">{leg.transport_mode}</span>
                  </div>
                  <p>{leg.instruction}</p>
                  <small>Distance: {leg.distance_km} km | Cost: ₹{leg.estimated_cost_inr}</small>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "25px", flexWrap: "wrap" }}>
            <button className="secondary-btn" onClick={handleBack}>← Back</button>
            <button className="primary-btn" onClick={handleConfirmRoute} disabled={loading}>
              {loading ? (<><Loader2 size={18} className="spin" /> Saving...</>) : (<><CheckCircle size={18} /> Save Route & Email Me</>)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}