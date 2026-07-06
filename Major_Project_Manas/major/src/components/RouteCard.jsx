import { useState } from "react";
import { MapPin, Trash2, CheckCircle, Loader2, Mail } from "lucide-react";
import { deleteRoute, updateRoute } from "../services/routeService";
import { sendTripCompletedEmail } from "../services/resendService";
import { useAuth } from "../context/AuthContext";
import RouteTimeline from "./RouteTimeline";

export default function RouteCard({ route, onDelete, onRefresh }) {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  // State for verified landmarks (array)
  const [verifiedLandmarks, setVerifiedLandmarks] = useState(route.verified_landmarks || []);

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this route?")) return;
    setDeleting(true);
    try {
      await deleteRoute(route.id);
      onDelete(route.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  }

  async function handleComplete() {
    if (!window.confirm("Mark this trip as completed? An email summary will be sent.")) return;
    setCompleting(true);
    try {
      await updateRoute(route.id, { status: "completed" });

      const totalCost = (route.landmarks || []).reduce((sum, l) => sum + (l.estimated_cost_inr || 0), 0);
      const totalDistance = (route.landmarks || []).reduce((sum, l) => sum + (l.distance_km || 0), 0);

      await sendTripCompletedEmail({
        userEmail: user.email,
        origin: route.origin,
        destination: route.destination,
        transitType: route.transit_type,
        landmarks: route.landmarks || [],
        totalCost,
        totalDistance: totalDistance.toFixed(1),
        completedAt: new Date().toISOString(),
      });

      setEmailSent(true);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setCompleting(false);
    }
  }

  const isCompleted = route.status === "completed";
  const isCanceled = route.status === "canceled";

  return (
    <div className="route-card">
      <div className="route-header">
        <div>
          <h3 style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: "4px" }}>
            <MapPin size={16} style={{ display: "inline", marginRight: "6px", color: "#6366f1" }} />
            {route.origin} <span style={{ color: "var(--muted)" }}>→</span> {route.destination}
          </h3>
          <p className="route-date">{new Date(route.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {isCompleted && <span className="badge success">Completed</span>}
          {isCanceled && <span className="badge danger">Canceled</span>}
          {!isCompleted && !isCanceled && <span className="badge">Active</span>}
          <span className="status-badge">{route.transit_type}</span>
        </div>
      </div>

      <div className="route-info">
        <div><small>Origin:-</small><strong>{route.origin}</strong></div>
        <div><small>Destination:-</small><strong>{route.destination}</strong></div>
        <div><small>Checkpoints:-</small><strong>{route.landmarks?.length || 0}</strong></div>
        <div><small>Status:-</small><strong style={{ color: isCompleted ? "#22c55e" : isCanceled ? "#ef4444" : "#6366f1" }}>{route.status}</strong></div>
      </div>

      {route.landmarks && (
        <RouteTimeline 
          landmarks={route.landmarks} 
          routeId={route.id}
          verifiedLandmarks={verifiedLandmarks}
          onVerified={(checkpoint) => {
            setVerifiedLandmarks(prev => [...prev, checkpoint]);
            if (onRefresh) onRefresh();
          }}
        />
      )}

      <div className="route-actions" style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
        {!isCompleted && !isCanceled && (
          <button className="primary-btn" onClick={handleComplete} disabled={completing} style={{ padding: "10px 18px", fontSize: "0.9rem" }}>
            {completing ? (<><Loader2 size={16} className="spin" /> Completing...</>) : (<><CheckCircle size={16} /> Mark Complete</>)}
          </button>
        )}
        {emailSent && <span className="badge success"><Mail size={12} /> Email sent!</span>}
        <button className="delete-btn" onClick={handleDelete} disabled={deleting} style={{ padding: "10px 18px", fontSize: "0.9rem" }}>
          {deleting ? "Deleting..." : (<><Trash2 size={16} /> Delete</>)}
        </button>
      </div>
    </div>
  );
}