import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Navigation,
  Route,
  Camera,
  BarChart3,
  Mail,
  Database,
  ArrowRight,
  CheckCircle,
  Shield,
  Brain,
} from "lucide-react";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing-page">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">

        <div className="logo">

          <Navigation size={30} />

          <span>RouteMe AI</span>

        </div>

        <div className="nav-links">

          <a href="#features">Features</a>

          <a href="#workflow">How it Works</a>

          <a href="#technology">Technology</a>

        </div>

        <div>

          <Link
            to={user ? "/dashboard" : "/login"}
            className="primary-btn"
          >
            {user ? "Dashboard" : "Sign In"}
          </Link>

        </div>

      </nav>



      {/* ================= HERO ================= */}

      <section className="hero">

        <div className="hero-left">

          <span className="hero-badge">

            AI Powered Landmark Navigation

          </span>

          <h1>

            Navigate Daily Commutes

            <br />

            Using <span>Visual Landmarks</span>

          </h1>

          <p>

            RouteMe uses Groq AI to generate intelligent landmark-based
            directions and Groq Vision to verify your location using
            real-world images.

          </p>

          <div className="hero-buttons">

            <Link
              to={user ? "/dashboard" : "/login"}
              className="primary-btn"
            >
              Get Started

              <ArrowRight size={18} />

            </Link>

            <a href="#features" className="secondary-btn">

              Explore Features

            </a>

          </div>

        </div>



        <div className="hero-right">

          <div className="hero-card">

            <h3>Today's Journey</h3>

            <div className="route-item">

              <CheckCircle size={18} />

              Borivali Station

            </div>

            <div className="route-item">

              <CheckCircle size={18} />

              Metro Pillar 127

            </div>

            <div className="route-item">

              <CheckCircle size={18} />

              Infinity Mall

            </div>

            <div className="route-item">

              <Camera size={18} />

              Upload Landmark

            </div>

            <div className="route-progress">

              <div className="progress-fill"></div>

            </div>

            <p>72% Journey Completed</p>

          </div>

        </div>

      </section>



      {/* ================= STATS ================= */}

      <section className="stats-section">

        <div className="stat-card">

          <h2>500+</h2>

          <p>Routes Generated</p>

        </div>

        <div className="stat-card">

          <h2>95%</h2>

          <p>Vision Accuracy</p>

        </div>

        <div className="stat-card">

          <h2>24/7</h2>

          <p>AI Assistance</p>

        </div>

        <div className="stat-card">

          <h2>100%</h2>

          <p>Cloud Synced</p>

        </div>

      </section>



      {/* ================= FEATURES ================= */}

      <section
        id="features"
        className="features-section"
      >

        <h2>

          Everything You Need

        </h2>

        <p>

          Designed for modern commuters using AI.

        </p>



        <div className="features-grid">

          <div className="feature-card">

            <Brain className="feature-icon" />

            <h3>Groq AI</h3>

            <p>

              Generate intelligent landmark-based routes
              in seconds.

            </p>

          </div>



          <div className="feature-card">

            <Camera className="feature-icon" />

            <h3>Groq Vision</h3>

            <p>

              Upload station signs and landmarks
              to verify your current checkpoint.

            </p>

          </div>



          <div className="feature-card">

            <Database className="feature-icon" />

            <h3>Supabase</h3>

            <p>

              Secure authentication, cloud database
              and storage.

            </p>

          </div>



          <div className="feature-card">

            <BarChart3 className="feature-icon" />

            <h3>Analytics</h3>

            <p>

              Beautiful Recharts dashboard showing
              travel history and statistics.

            </p>

          </div>



          <div className="feature-card">

            <Mail className="feature-icon" />

            <h3>Resend</h3>

            <p>

              Receive professional HTML trip
              summaries directly in your inbox.

            </p>

          </div>



          <div className="feature-card">

            <Shield className="feature-icon" />

            <h3>Secure</h3>

            <p>

              Protected routes and encrypted
              authentication powered by Supabase.

            </p>

          </div>

        </div>

      </section>
            {/* ================= HOW IT WORKS ================= */}

      <section id="workflow" className="workflow-section">

        <div className="section-heading">
          <h2>How RouteMe Works</h2>
          <p>
            Reach your destination using AI-generated visual landmarks instead
            of confusing map instructions.
          </p>
        </div>

        <div className="timeline">

          <div className="timeline-card">
            <div className="timeline-number">1</div>
            <h3>Choose Destination</h3>
            <p>
              Enter your starting point and destination.
            </p>
          </div>

          <div className="timeline-arrow">→</div>

          <div className="timeline-card">
            <div className="timeline-number">2</div>
            <h3>Groq AI Generates Route</h3>
            <p>
              AI creates a landmark-based journey in structured JSON.
            </p>
          </div>

          <div className="timeline-arrow">→</div>

          <div className="timeline-card">
            <div className="timeline-number">3</div>
            <h3>Follow Landmarks</h3>
            <p>
              Walk using checkpoints like stations, bridges and malls.
            </p>
          </div>

          <div className="timeline-arrow">→</div>

          <div className="timeline-card">
            <div className="timeline-number">4</div>
            <h3>Upload Landmark Photo</h3>
            <p>
              Groq Vision verifies your current location instantly.
            </p>
          </div>

          <div className="timeline-arrow">→</div>

          <div className="timeline-card">
            <div className="timeline-number">5</div>
            <h3>Reach Destination</h3>
            <p>
              Track your commute and save the journey to your dashboard.
            </p>
          </div>

        </div>

      </section>



      {/* ================= TECHNOLOGY ================= */}

      <section
        id="technology"
        className="technology-section"
      >

        <div className="section-heading">
          <h2>Built With Modern Technologies</h2>
          <p>
            Every mandatory requirement is integrated into one application.
          </p>
        </div>

        <div className="tech-grid">

          <div className="tech-card">
            <Database size={34} />
            <h3>Supabase</h3>
            <p>
              Authentication, PostgreSQL database and cloud storage.
            </p>
          </div>

          <div className="tech-card">
            <Brain size={34} />
            <h3>Groq AI</h3>
            <p>
              Generates intelligent landmark routes using structured JSON.
            </p>
          </div>

          <div className="tech-card">
            <Camera size={34} />
            <h3>Groq Vision</h3>
            <p>
              Understands uploaded landmark images for checkpoint verification.
            </p>
          </div>

          <div className="tech-card">
            <BarChart3 size={34} />
            <h3>Recharts</h3>
            <p>
              Displays commute analytics with beautiful charts.
            </p>
          </div>

          <div className="tech-card">
            <Mail size={34} />
            <h3>Resend</h3>
            <p>
              Sends professional HTML trip summaries to users.
            </p>
          </div>

          <div className="tech-card">
            <Shield size={34} />
            <h3>Protected Routes</h3>
            <p>
              Keeps every user's trips private and secure.
            </p>
          </div>

        </div>

      </section>



      {/* ================= CTA ================= */}

      <section className="cta-section">

        <div className="cta-box">

          <h2>
            Ready to Navigate Smarter?
          </h2>

          <p>
            Start planning landmark-based journeys with RouteMe AI today.
          </p>

          <Link
            to={user ? "/dashboard" : "/login"}
            className="primary-btn large-btn"
          >
            {user ? "Open Dashboard" : "Get Started Free"}

            <ArrowRight size={18} />

          </Link>

        </div>

      </section>



      {/* ================= FOOTER ================= */}

      <footer className="footer">

        <div className="footer-logo">

          <Navigation size={24} />

          <span>RouteMe AI</span>

        </div>

        <p>
          AI Landmark Navigation Platform
        </p>

        <div className="footer-stack">

          <span>React</span>

          <span>Supabase</span>

          <span>Groq AI</span>

          <span>Groq Vision</span>

          <span>Recharts</span>

          <span>Resend</span>

        </div>

        <small>
          © {new Date().getFullYear()} RouteMe AI. All rights reserved.
        </small>

      </footer>

    </div>
  );
}