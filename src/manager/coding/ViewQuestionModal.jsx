function ViewQuestionModal({ question, close }) {

  if (!question) return null;

  return (
    <div className="modal-overlay">

      <div className="question-modal view-modal">

        <div className="modal-header">
          <h2>Coding Question Details</h2>
        </div>

        <div className="modal-body">

          <div className="view-group">
            <h4>Title</h4>
            <p>{question.title}</p>
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
              <h4>Marks</h4>
              <p>{question.marks}</p>
            </div>

            <div>
              <h4>Time Limit</h4>
              <p>{question.timeLimit} sec</p>
            </div>

            <div>
              <h4>Memory Limit</h4>
              <p>{question.memoryLimit} MB</p>
            </div>

            <div>
              <h4>Status</h4>
              <p>{question.isActive ? "Active" : "Inactive"}</p>
            </div>

          </div>

          <div className="view-group">
            <h4>Description</h4>
            <p>{question.description}</p>
          </div>

          <div className="view-group">
            <h4>Constraints</h4>
            <pre>{question.constraints}</pre>
          </div>

          <div className="view-group">
            <h4>Input Format</h4>
            <pre>{question.inputFormat}</pre>
          </div>

          <div className="view-group">
            <h4>Output Format</h4>
            <pre>{question.outputFormat}</pre>
          </div>

          <div className="view-group">
            <h4>Sample Input</h4>
            <pre>{question.sampleInput}</pre>
          </div>

          <div className="view-group">
            <h4>Sample Output</h4>
            <pre>{question.sampleOutput}</pre>
          </div>

          <div className="view-group">
            <h4>Explanation</h4>
            <pre>{question.explanation}</pre>
          </div>

          <div className="view-group">
            <h4>Starter Code</h4>

            <pre>
              {JSON.stringify(
                question.starterCode,
                null,
                2
              )}
            </pre>

          </div>

          <div className="view-group">
            <h4>Solution Code</h4>

            <pre>
              {JSON.stringify(
                question.solutionCode,
                null,
                2
              )}
            </pre>

          </div>

          <div className="view-group">
            <h4>Test Cases</h4>

            <pre>
              {JSON.stringify(
                question.testCases,
                null,
                2
              )}
            </pre>

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

export default ViewQuestionModal;