export default function SecurityPanel({ answeredCount, markedCount, total, tabSwitches, fullscreenExits, blurEvents, cameraCovered, cameraViolations, cameraWarningSeconds }) {
  const hasViolations = tabSwitches > 0 || fullscreenExits > 0;
  return (
    <div className="security-panel">
      <h5>Statistical Telemetry</h5>
      <div className="security-row"><span>Answered</span><strong>{answeredCount}</strong></div>
      <div className="security-row"><span>Marked for review</span><strong>{markedCount}</strong></div>
      <div className="security-row"><span>Remaining</span><strong>{total - answeredCount}</strong></div>
      <div className={`security-row ${hasViolations ? "security-row--alert" : ""}`}>
        <span>Tab switches</span><strong>{tabSwitches} / 3</strong>
      </div>
      <div className={`security-row ${hasViolations ? "security-row--alert" : ""}`}>
        <span>Fullscreen exits</span><strong>{fullscreenExits} / 3</strong>
      </div>
      <div className="security-row">
        <span>Blur events</span><strong>{blurEvents}</strong>
      </div>
      <div className={`security-row ${cameraViolations > 0 ? "security-row--alert" : ""}`}>
        <span>Camera covered</span><strong>{cameraViolations} / 3</strong>
      </div>
      {cameraViolations > 0 && (
        <div className="security-row security-row--alert">
          <span>Camera attempts left</span><strong>{Math.max(0, 3 - cameraViolations)}</strong>
        </div>
      )}
    </div>
  );
}
