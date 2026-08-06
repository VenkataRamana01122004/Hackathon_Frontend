// Presentational only. Reads the existing `statuses` map from
// BitsAssessment.jsx unchanged: undefined = unvisited, 'visited' = seen but
// unanswered, 'review' = marked for review, 'answered' = answered.

export default function QuestionGrid({ questions, statuses, currentIndex, onSelect }) {
  function statusOf(q) {
    return statuses[q.id] || "unvisited";
  }

  return (
    <div className="qlist">
      <div className="qlist-header">Question Grid</div>
      <div className="qlist-grid">
        {questions.map((q, idx) => {
          const status = statusOf(q);
          return (
            <button
              key={q.id}
              type="button"
              className={`qlist-item qlist-item--${status} ${idx === currentIndex ? "qlist-item--current" : ""}`}
              onClick={() => onSelect(idx)}
              title={`Question ${idx + 1}: ${status}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
      <div className="qlist-legend">
        <div className="legend-row"><span className="legend-swatch legend-swatch--unvisited" /> Not visited</div>
        <div className="legend-row"><span className="legend-swatch legend-swatch--visited" /> Visited, unanswered</div>
        <div className="legend-row"><span className="legend-swatch legend-swatch--review" /> Marked for review</div>
        <div className="legend-row"><span className="legend-swatch legend-swatch--answered" /> Answered</div>
      </div>
    </div>
  );
}
