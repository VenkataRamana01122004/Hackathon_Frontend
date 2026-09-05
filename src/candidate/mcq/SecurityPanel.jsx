export default function SecurityPanel({ answeredCount, markedCount, total, tabSwitches, fullscreenExits, blurEvents }) {
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
    </div>
  );
}
