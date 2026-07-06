import backgroundVideo from "../assets/background.mp4";

function Background() {
  return (
    <video
      className="background-video"
      autoPlay
      muted
      loop
      playsInline
    >
      <source src={backgroundVideo} type="video/mp4" />
    </video>
  );
}

export default Background;