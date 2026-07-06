import { useState } from "react";
import { verifyLandmarkWithVision } from "../services/groqService";
import { supabase } from "../supabaseClient";

export default function VisionUpload({
  routeId,
  expectedCheckpoint,
  onVerified,
}) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image.");
      return;
    }

    setImage(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setPreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const verifyImage = async () => {
    if (!image || !preview) {
      alert("Please select an image first.");
      return;
    }

    setLoading(true);

    try {
      const verification = await verifyLandmarkWithVision(
        preview,
        expectedCheckpoint
      );

      setResult(verification);

      if (verification.verified) {
        // Get current verified landmarks
        const { data: route } = await supabase
          .from("routes")
          .select("verified_landmarks")
          .eq("id", routeId)
          .single();

        const current = route?.verified_landmarks || [];
        
        // Add new checkpoint if not already there
        if (!current.includes(expectedCheckpoint)) {
          const updated = [...current, expectedCheckpoint];

          await supabase
            .from("routes")
            .update({ verified_landmarks: updated })
            .eq("id", routeId);
        }

        if (onVerified) {
          onVerified(expectedCheckpoint);
        }
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="vision-card">
      <h3>Landmark Verification</h3>

      <p>
        Expected checkpoint:
        <strong> {expectedCheckpoint}</strong>
      </p>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
      />

      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="vision-preview"
        />
      )}

      <button
        className="primary-btn"
        disabled={loading || !image}
        onClick={verifyImage}
      >
        {loading ? "Verifying..." : "Verify Landmark"}
      </button>

      {result && (
        <div
          className={
            result.verified
              ? "verification success"
              : "verification failed"
          }
        >
          <h4>
            {result.verified
              ? "✅ Landmark Verified"
              : "❌ Verification Failed"}
          </h4>

          {result.confidence && (
            <p>
              <strong>Confidence:</strong>{" "}
              {result.confidence}%
            </p>
          )}

          <p>{result.reason}</p>
        </div>
      )}
    </div>
  );
}