import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Bot, User, MapPin, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { chatWithRouteAI, getNearbyFunPlaces } from "../services/groqService";

export default function ChatbotPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I'm your RouteMe travel assistant. Ask me about fun places nearby, route advice, or Mumbai travel tips!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("Andheri, Mumbai");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleNearbyPlaces() {
    setLoading(true);
    try {
      const places = await getNearbyFunPlaces(currentLocation);
      const placesText = places.map((p, i) => 
        `${i + 1}. **${p.name}** (${p.type}) - ${p.distance_km} km away\n   ${p.description}\n   Best for: ${p.best_for}`
      ).join("\n\n");
      
      setMessages(prev => [
        ...prev,
        { role: "user", text: `Show me fun places near ${currentLocation}` },
        { role: "ai", text: `Here are some great places near ${currentLocation}:\n\n${placesText}` }
      ]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", text: "Sorry, I couldn't fetch nearby places right now. Try again!" }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text
      }));
      
      const response = await chatWithRouteAI([
        ...chatHistory,
        { role: "user", content: userMsg }
      ]);
      
      setMessages(prev => [...prev, { role: "ai", text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", text: "Sorry, I'm having trouble responding. Please try again!" }]);
    } finally {
      setLoading(false);
    }
  }

  const quickPrompts = [
    "Best street food in Mumbai?",
    "Weekend getaways near Mumbai",
    "How to reach Gateway of India from Andheri?",
    "Show me fun places nearby"
  ];

  return (
    <div className="chatbot-container">
      <div className="header">
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button className="secondary-btn" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={18} /> Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #6366f1, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot size={22} color="white" />
            </div>
            <div>
              <h1>RouteMe AI Assistant</h1>
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Ask me about routes, places, or Mumbai travel tips</p>
            </div>
          </div>
        </div>
      </div>

      <div className="chat-window">
        <div className="chat-messages">
          {messages.length === 1 && (
            <div className="chat-welcome">
              <Sparkles size={48} style={{ color: "#6366f1", marginBottom: "15px" }} />
              <h3>Welcome to RouteMe AI!</h3>
              <p>I can help you discover fun places, plan routes, and answer Mumbai travel questions.</p>
              <div className="quick-prompts">
                {quickPrompts.map((prompt, i) => (
                  <button key={i} onClick={() => {
                    if (prompt === "Show me fun places nearby") {
                      handleNearbyPlaces();
                    } else {
                      setInput(prompt);
                    }
                  }}>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                {msg.role === "ai" ? <Bot size={14} /> : <User size={14} />}
                <span style={{ fontSize: "0.75rem", fontWeight: 600, opacity: 0.7 }}>
                  {msg.role === "ai" ? "RouteMe AI" : "You"}
                </span>
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
            </div>
          ))}

          {loading && (
            <div className="chat-message ai" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="loader" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
              <span style={{ color: "var(--muted)" }}>Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Ask about routes, places, or Mumbai travel..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="primary-btn" disabled={loading || !input.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
