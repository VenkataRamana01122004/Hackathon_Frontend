// Presentational only — all state and handlers still live in
// BitsAssessment.jsx exactly as before. This just renders them with the
// same look as the rest of the app instead of ad-hoc inline styles.

export default function QuestionPanel({
  question,
  index,
  total,
  statusLabel,
  selectedOption,
  onSelectOption,
  onPrev,
  onNext,
  onMarkForReview,
  onClearResponse,
  onSubmit,
  isFirst,
  isLast,
}) {
  const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className="question-window">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="question-count">
          Question {index + 1} of {total}
        </span>
        <span className="question-status-pill">Status: {statusLabel}</span>
      </div>

<p className="question-type">
  {question.questionType === "MULTIPLE"
    ? "Multiple Choice (Select one or more)"
    : "Single Choice (Select one)"}
</p>
      <p className="question-text">{question.text}</p>

      <div className="options-list">
  {question.questionType === "MULTIPLE"
    ? question.options.map((opt, i) => (
        <label
          key={i}
          className={`option-card ${
            (selectedOption || []).includes(opt)
              ? "option-card--selected"
              : ""
          }`}
        >
          <input
            type="checkbox"
            checked={(selectedOption || []).includes(opt)}
            onChange={() => onSelectOption(opt)}
          />
          <span className="option-letter">
            {OPTION_LABELS[i] || i + 1}
          </span>
          <span>{opt}</span>
        </label>
      ))
    : question.options.map((opt, i) => (
        <label
          key={i}
          className={`option-card ${
            selectedOption === opt ? "option-card--selected" : ""
          }`}
        >
          <input
            type="radio"
            name={`q-${question.id}`}
            checked={selectedOption === opt}
            onChange={() => onSelectOption(opt)}
          />
          <span className="option-letter">
            {OPTION_LABELS[i] || i + 1}
          </span>
          <span>{opt}</span>
        </label>
      ))}
</div>

      <div className="question-actions">
        <button type="button" className="btn btn--secondary" onClick={onPrev} disabled={isFirst} style={{ width: "auto" }}>
          ← Previous
        </button>
        <button type="button" className="btn btn--amber" onClick={onMarkForReview} style={{ width: "auto" }}>
          Mark for Review
        </button>
        <button type="button" className="btn btn--ghost" onClick={onClearResponse} style={{ width: "auto" }}>
          Clear Response
        </button>
        <button
          type="button"
          className="btn btn--submit"
          style={{ marginLeft: "auto", width: "auto" }}
          onClick={isLast ? onSubmit : onNext}
        >
          {isLast ? "Submit Exam" : "Next Question →"}
        </button>
      </div>
    </div>
  );
}
