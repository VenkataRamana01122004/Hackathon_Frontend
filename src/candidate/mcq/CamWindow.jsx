// Presentational only — the actual camera stream (getUserMedia +
// MediaRecorder) is still set up by BitsAssessment.jsx's initProctoring()
// exactly as before. This just wraps the existing <video ref={videoRef}>
// element in the themed docked-camera look.

export default function CamWindow({ videoRef, onVideoRef }) {
  return (
    <div className="cam-window">
      <div className="cam-header">
        <span className="cam-dot" />
        Biometric Stream
      </div>
      <div className="cam-frame">
        <video
          ref={onVideoRef || videoRef}
          autoPlay
          muted
          playsInline
          style={{ transform: "scaleX(-1)" }}
        />
      </div>
    </div>
  );
}
