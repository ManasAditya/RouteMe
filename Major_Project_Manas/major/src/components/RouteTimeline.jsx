import VisionUpload from "./VisionUpload";

export default function RouteTimeline({
  landmarks = [],
  routeId,
  verifiedLandmarks = [],
  onVerified,
}) {
  if (!landmarks.length) {
    return (
      <div className="timeline">
        <p>No landmarks available.</p>
      </div>
    );
  }

  return (
    <div className="timeline">
      <h3>Journey Timeline</h3>

      {landmarks.map((landmark, index) => {
        const isVerified = verifiedLandmarks.includes(landmark.checkpoint);

        return (
          <div
            key={index}
            className={`timeline-item ${isVerified ? "verified" : ""}`}
          >
            <div className="timeline-circle">
              {index + 1}
            </div>

            <div className="timeline-details">
              <div className="timeline-header">
                <h4>{landmark.checkpoint}</h4>
                {isVerified && (
                  <span className="verified-badge">
                    ✓ Verified
                  </span>
                )}
              </div>

              <p>{landmark.instruction}</p>
              <small>Distance: {landmark.distance_km} km</small>

              {!isVerified && (
                <VisionUpload
                  routeId={routeId}
                  expectedCheckpoint={landmark.checkpoint}
                  onVerified={onVerified}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}