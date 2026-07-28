// Presentational only — adapted to AssignmentPanel.jsx's existing question
// shape (title/description/input/output/sampleInput/sampleOutput/constraints),
// not the {examples:[...]} shape used elsewhere in this project.

export default function ProblemPanel({ question, index, total }) {
  if (!question) return null;
  return (
    <div className="problem-panel">
      <span className="question-count">
        Question {index + 1} of {total}
      </span>
      <h2 className="problem-title">{question.title}</h2>
      <p>{question.description}</p>

      <div className="problem-section-label">Input</div>
      <p>{question.input}</p>

      <div className="problem-section-label">Output</div>
      <p>{question.output}</p>

      <div className="problem-section-label">Sample Input</div>
      <pre className="problem-io-block">{question.sampleInput}</pre>

      <div className="problem-section-label">Sample Output</div>
      <pre className="problem-io-block">{question.sampleOutput}</pre>

      <div className="problem-section-label">Constraints</div>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>{question.constraints}</p>
    </div>
  );
}
