// src/services/resendService.js
const RESEND_URL = '/api/send-email';
const RESEND_FROM = 'RouteMe AI <onboarding@resend.dev>';

async function postEmail(payload) {
  const response = await fetch(RESEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export async function sendTripCreatedEmail({ userEmail, origin, destination, transitType, landmarks, totalCost, totalDistance }) {
  const landmarksHtml = (landmarks || []).map((l, i) =>
    `<tr><td>${i + 1}. <b>${l.checkpoint}</b></td><td>${l.transport_mode || "Walking"}</td><td>${l.distance_km} km</td><td>₹${l.estimated_cost_inr || 0}</td></tr>`
  ).join("");

  return postEmail({
    from: RESEND_FROM,
    to: [userEmail],
    subject: `🚗 New Trip: ${origin} → ${destination}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:linear-gradient(135deg,#6366f1,#a78bfa);color:white;padding:24px;border-radius:12px 12px 0 0;">
          <h1 style="margin:0;">🚗 New Trip Started</h1>
        </div>
        <div style="background:white;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;">
          <p><b>${origin} → ${destination}</b></p>
          <p>Mode: ${transitType}</p>
          <p>Distance: ${totalDistance} km | Cost: ₹${totalCost || 0}</p>
          <table width="100%">${landmarksHtml}</table>
          <p style="color:#94a3b8;font-size:12px;">Trip by ${userEmail}</p>
        </div>
      </div>`,
  });
}

export async function sendTripCompletedEmail({ userEmail, origin, destination, transitType, landmarks, totalCost, totalDistance, completedAt }) {
  const date = completedAt ? new Date(completedAt).toLocaleDateString('en-IN') : 'Today';

  const landmarksHtml = (landmarks || []).map((l, i) =>
    `<tr><td>${i + 1}. <b>${l.checkpoint}</b></td><td>${l.transport_mode || "Walking"}</td><td>${l.distance_km} km</td><td>₹${l.estimated_cost_inr || 0}</td></tr>`
  ).join("");

  return postEmail({
    from: RESEND_FROM,
    to: [userEmail],
    subject: `🎉 Trip Completed: ${origin} → ${destination}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:linear-gradient(135deg,#22c55e,#16a34a);color:white;padding:24px;border-radius:12px 12px 0 0;">
          <h1 style="margin:0;">🎉 Trip Completed!</h1>
        </div>
        <div style="background:white;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;">
          <p><b>${origin} → ${destination}</b></p>
          <p>Date: ${date}</p>
          <p>Mode: ${transitType}</p>
          <p>Distance: ${totalDistance} km | Cost: ₹${totalCost || 0}</p>
          <table width="100%">${landmarksHtml}</table>
          <p style="color:#94a3b8;font-size:12px;">Completed by ${userEmail}</p>
        </div>
      </div>`,
  });
}