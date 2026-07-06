import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  MessageSquare,
  Camera,
  BarChart3,
  RefreshCw,
  LogOut,
  Loader2,
  Map,
  Navigation,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import RouteForm from "../components/RouteForm";
import { getRoutesWithExpenses } from "../services/routeService";
import RouteCard from "../components/RouteCard";
import StatsCards from "../components/StatsCards";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadRoutes() {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getRoutesWithExpenses(user.id);
      setRoutes(
        data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoutes();
  }, [user]);

  async function handleLogout() {
    await signOut();
    navigate("/login");
  }

  function handleRouteCreated(route) {
    setRoutes((prev) => [route, ...prev]);
  }

  function handleDelete(id) {
    setRoutes((prev) => prev.filter((r) => r.id !== id));
  }

  function handleUpdate(updated) {
    setRoutes((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
  }

  const quickActions = [
    { label: "Live Map", icon: Map, path: "/map", color: "#6366f1" },
    { label: "AI Chatbot", icon: MessageSquare, path: "/chatbot", color: "#a78bfa" },
    { label: "Image Scanner", icon: Camera, path: "/scanner", color: "#c084fc" },
    { label: "Analytics", icon: BarChart3, path: "/analytics", color: "#22c55e" },
  ];

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="header">
        <div>
          <h1>RouteMe AI Dashboard</h1>
          <p>{user?.email}</p>
        </div>

        <div className="header-buttons">
          <button className="secondary-btn" onClick={loadRoutes}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="secondary-btn" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="quick-actions">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <div
              key={action.label}
              className="quick-action-btn"
              onClick={() => navigate(action.path)}
            >
              <div
                className="action-icon"
                style={{
                  background: `linear-gradient(135deg, ${action.color}, ${action.color}88)`,
                }}
              >
                <Icon size={20} />
              </div>
              <span>{action.label}</span>
            </div>
          );
        })}
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="text-center mt-30">
          <div className="loading">
            <div className="loader"></div>
            <p>Loading your AI routes...</p>
          </div>
        </div>
      ) : (
        <>
          {/* STATS */}
          <StatsCards routes={routes} />

          {/* ROUTE FORM */}
          <div className="mt-30 mb-30">
            <RouteForm onRouteCreated={handleRouteCreated} />
          </div>

          {/* CURRENT TRIP SUMMARY */}
          {routes.length > 0 && routes[0]?.status === "active" && (
            <div className="glass-card mb-30">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <div>
                  <h3 style={{ fontWeight: 600, marginBottom: "4px" }}>
                    Current Trip
                  </h3>
                  <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                    {routes[0].origin} → {routes[0].destination}
                  </p>
                </div>
                <button
                  className="primary-btn"
                  onClick={() => navigate("/map")}
                >
                  <MapPin size={16} />
                  View on Map
                </button>
              </div>
              <div className="expense-summary">
                <div className="expense-item">
                  <div className="expense-value">₹{routes[0].cost_incurred || 0}</div>
                  <div className="expense-label">Current Cost</div>
                </div>
                <div className="expense-item">
                  <div className="expense-value">{routes[0].transit_type}</div>
                  <div className="expense-label">Transport</div>
                </div>
                <div className="expense-item">
                  <div className="expense-value">
                    {routes[0].landmarks?.length || 0}
                  </div>
                  <div className="expense-label">Checkpoints</div>
                </div>
              </div>
            </div>
          )}

          {/* ROUTES LIST */}
          <h2 className="mb-20">Recent Routes ({routes.length})</h2>

          {routes.length === 0 ? (
            <div className="empty-state text-center">
              <Navigation size={48} style={{ color: "#6366f1", marginBottom: "15px" }} />
              <h3>No Routes Yet</h3>
              <p>Create your first AI-powered route above.</p>
            </div>
          ) : (
            <div className="flex" style={{ flexDirection: "column", gap: "15px" }}>
              {routes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  onDelete={handleDelete}
                  onRefresh={loadRoutes}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
