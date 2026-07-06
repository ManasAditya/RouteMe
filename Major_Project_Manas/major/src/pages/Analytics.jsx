import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, AreaChart, Area,
} from "recharts";
import { ArrowLeft, TrendingUp, Wallet, Clock, Car } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getTravelAnalytics, getExpenses } from "../services/routeService";

const COLORS = ["#6366f1", "#a78bfa", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];

export default function Analytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("week"); // day, week, month, year

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const [analyticsData, expensesData] = await Promise.all([
          getTravelAnalytics(user.id),
          getExpenses(user.id),
        ]);
        setAnalytics(analyticsData);
        setExpenses(expensesData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  // Filter data based on time range
  const filteredData = useMemo(() => {
    const now = new Date();
    return expenses.filter((item) => {
      const date = new Date(item.travel_date);
      if (timeFilter === "day") {
        return date.toDateString() === now.toDateString();
      } else if (timeFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= weekAgo;
      } else if (timeFilter === "month") {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      } else if (timeFilter === "year") {
        return date.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [expenses, timeFilter]);

  const totalMinutes = useMemo(() => filteredData.reduce((sum, item) => sum + Number(item.minutes_spent || 0), 0), [filteredData]);
  const totalCost = useMemo(() => filteredData.reduce((sum, item) => sum + Number(item.cost_incurred || 0), 0), [filteredData]);
  const totalTrips = filteredData.length;

  // Prediction: simple average based on trend
  const avgCostPerTrip = totalTrips > 0 ? totalCost / totalTrips : 0;
  const predictedMonthlyCost = avgCostPerTrip * 30; // Assume 30 trips/month

  // Transport mode breakdown
  const transportBreakdown = useMemo(() => {
    const map = {};
    filteredData.forEach((item) => {
      const key = item.transit_type || "Unknown";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.keys(map).map((key) => ({ name: key, value: map[key] }));
  }, [filteredData]);

  // Daily cost trend
  const dailyCost = useMemo(() => {
    const map = {};
    filteredData.forEach((item) => {
      const date = new Date(item.travel_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      map[date] = (map[date] || 0) + Number(item.cost_incurred || 0);
    });
    return Object.keys(map).map((date) => ({ date, cost: map[date] }));
  }, [filteredData]);

  // Daily time trend
  const dailyTime = useMemo(() => {
    const map = {};
    filteredData.forEach((item) => {
      const date = new Date(item.travel_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      map[date] = (map[date] || 0) + Number(item.minutes_spent || 0);
    });
    return Object.keys(map).map((date) => ({ date, minutes: map[date] }));
  }, [filteredData]);

  if (loading) {
    return (
      <div className="loading">
        <div className="loader"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="header">
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button className="secondary-btn" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={18} /> Back
          </button>
          <div>
            <h1>Travel Analytics</h1>
            <p style={{ color: "var(--muted)" }}>Track expenses, time, and transport patterns</p>
          </div>
        </div>
      </div>

      {/* Time Filter */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "25px", flexWrap: "wrap" }}>
        {["day", "week", "month", "year"].map((filter) => (
          <button
            key={filter}
            className={`secondary-btn ${timeFilter === filter ? "primary-btn" : ""}`}
            onClick={() => setTimeFilter(filter)}
            style={timeFilter === filter ? { background: "linear-gradient(135deg, #6366f1, #a78bfa)", color: "white" } : {}}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="analytics-grid">
        <div className="stat-card">
          <Wallet size={28} style={{ color: "#6366f1" }} />
          <h2>₹{totalCost}</h2>
          <p>Total Cost</p>
        </div>
        <div className="stat-card">
          <Clock size={28} style={{ color: "#a78bfa" }} />
          <h2>{totalMinutes}m</h2>
          <p>Time Travelled</p>
        </div>
        <div className="stat-card">
          <Car size={28} style={{ color: "#22c55e" }} />
          <h2>{totalTrips}</h2>
          <p>Total Trips</p>
        </div>
      </div>

      {/* Expense Prediction */}
      <div className="glass-card mb-30">
        <h3 style={{ marginBottom: "20px", fontWeight: 600 }}>
          <TrendingUp size={20} style={{ display: "inline", marginRight: "8px" }} />
          Expense Insights
        </h3>
        <div className="expense-summary">
          <div className="expense-item">
            <div className="expense-value">₹{totalCost}</div>
            <div className="expense-label">Current ({timeFilter})</div>
          </div>
          <div className="expense-item">
            <div className="expense-value predicted">₹{avgCostPerTrip.toFixed(0)}</div>
            <div className="expense-label">Avg / Trip</div>
          </div>
          <div className="expense-item">
            <div className="expense-value total">₹{predictedMonthlyCost.toFixed(0)}</div>
            <div className="expense-label">Predicted (Month)</div>
          </div>
          <div className="expense-item">
            <div className="expense-value">{totalMinutes}m</div>
            <div className="expense-label">Total Time</div>
          </div>
        </div>
      </div>

      <div className="grid-layout">
        {/* Cost Trend */}
        <div className="chart-card">
          <h3 className="chart-title">Daily Cost Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyCost}>
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip contentStyle={{ background: "#121214", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
              <Area type="monotone" dataKey="cost" stroke="#6366f1" fillOpacity={1} fill="url(#colorCost)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Transport Breakdown */}
        <div className="chart-card">
          <h3 className="chart-title">Transport Mode Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={transportBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {transportBreakdown.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#121214", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Time Trend */}
      <div className="chart-card">
        <h3 className="chart-title">Daily Travel Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip contentStyle={{ background: "#121214", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
            <Legend />
            <Line type="monotone" dataKey="minutes" stroke="#a78bfa" strokeWidth={2} dot={{ fill: "#a78bfa" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
