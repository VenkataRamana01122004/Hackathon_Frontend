import { useEffect, useRef, useState } from "react";

// Presentational + a small amount of local drag/minimize state — the
// camera STREAM itself is still entirely owned by AssignmentPanel.jsx's
// existing startRecording()/videoPreviewRef, exactly as before. This
// component only wraps that existing <video> element in a floating,
// draggable, minimizable container instead of the old fixed 160x120 box
// in the left panel.

const WIDTH = 220;
const HEADER_HEIGHT = 34;

export default function DraggableCamWindow({ videoRef }) {
  const [pos, setPos] = useState(() => ({
    x: typeof window !== "undefined" ? window.innerWidth - WIDTH - 32 : 40,
    y: 90,
  }));
  const [minimized, setMinimized] = useState(false);
  const dragRef = useRef(null);

  function clamp(x, y) {
    const width = minimized ? 150 : WIDTH;
    const height = minimized ? HEADER_HEIGHT : HEADER_HEIGHT + 170;
    const maxX = window.innerWidth - width - 8;
    const maxY = window.innerHeight - height - 8;
    return {
      x: Math.min(Math.max(8, x), Math.max(8, maxX)),
      y: Math.min(Math.max(8, y), Math.max(8, maxY)),
    };
  }

  function handleMouseDown(e) {
    e.preventDefault();
    dragRef.current = { offsetX: e.clientX - pos.x, offsetY: e.clientY - pos.y };
    const handleMove = (ev) => {
      if (!dragRef.current) return;
      const next = clamp(ev.clientX - dragRef.current.offsetX, ev.clientY - dragRef.current.offsetY);
      setPos(next);
    };
    const handleUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  }

  return (
    <div className={`cam-float ${minimized ? "cam-float--minimized" : ""}`} style={{ left: pos.x, top: pos.y }}>
      <div className="cam-float-header" onMouseDown={handleMouseDown}>
        <span className="cam-dot" />
        <span className="cam-float-title">Live Camera</span>
        <button
          type="button"
          className="cam-float-toggle"
          onClick={() => setMinimized((m) => !m)}
          aria-label={minimized ? "Expand camera" : "Minimize camera"}
        >
          {minimized ? "▢" : "—"}
        </button>
      </div>
      {!minimized && (
        <div className="cam-float-frame">
          <video ref={videoRef} autoPlay muted playsInline style={{ transform: "scaleX(-1)" }} />
        </div>
      )}
    </div>
  );
}
