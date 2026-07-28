function ViewMCQModal({ question, close }) {

  if (!question) return null;

  return (
    <div className="modal-overlay">

      <div className="question-modal view-modal">

        <div className="modal-header">
          <h2>MCQ Question Details</h2>
        </div>

        <div className="modal-body">

          <div className="view-group">
            <h4>Question</h4>
            <p>{question.question}</p>
          </div>

          <div className="view-grid">

            <div>
              <h4>Category</h4>
              <p>{question.category}</p>
            </div>

            <div>
              <h4>Difficulty</h4>
              <p>{question.difficulty}</p>
            </div>

            <div>
              <h4>Question Type</h4>
              <p>{question.questionType}</p>
            </div>

            <div>
              <h4>Marks</h4>
              <p>{question.marks}</p>
            </div>

            <div>
              <h4>Negative Marks</h4>
              <p>{question.negativeMarks}</p>
            </div>

            <div>
              <h4>Status</h4>
              <p>
                {question.isActive ? "Active" : "Inactive"}
              </p>
            </div>

          </div>

          <div className="view-group">

            <h4>Options</h4>

<div style={{ marginTop: "10px" }}>
  {question.options?.map((option, index) => {
    const isCorrect = question.correctAnswers?.includes(option);

    return (
      <div
        key={index}
        style={{
          padding: "12px",
          marginBottom: "10px",
          borderRadius: "8px",
          border: isCorrect
            ? "2px solid #588157"
            : "1px solid #dcdcdc",
          backgroundColor: isCorrect
            ? "#EAF4E4"
            : "#fff",
          color: isCorrect
            ? "#3A5A40"
            : "#000",
          fontWeight: isCorrect ? 600 : 400,
        }}
      >
        <strong>{String.fromCharCode(65 + index)}.</strong> {option}
      </div>
    );
  })}
</div>
          

          </div>

        </div>

        <div className="modal-footer">

          <button
            className="cancel-btn"
            onClick={close}
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}

export default ViewMCQModal;