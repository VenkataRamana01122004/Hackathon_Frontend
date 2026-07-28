import { useState } from "react";


function ViewQuestionModal({ question, close }) {

  const [solutionLanguage, setSolutionLanguage] = useState("cpp");
  const [starterLanguage, setStarterLanguage] = useState("cpp");
  const [selectedTestCase, setSelectedTestCase] = useState(0);

  if (!question) return null;
  const formatText = (text) => text?.replace(/\\n/g, "\n");

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
            {/* <pre>{question.constraints}</pre> */}
            <pre>{question.constraints?.replace(/\\n/g, "\n")}</pre>
          </div>

          <div className="view-group">
            <h4>Input Format</h4>
            {/* <pre>{question.inputFormat}</pre> */}
            <pre>{question.inputFormat?.replace(/\\n/g, "\n")}</pre>
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

              <div className="language-tabs">
                {Object.keys(question.starterCode || {}).map((lang) => (
                  <button
                    key={lang}
                    className={`lang-btn ${
                      starterLanguage === lang ? "active" : ""
                    }`}
                    onClick={() => setStarterLanguage(lang)}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              <pre>
                {question.starterCode?.[starterLanguage]?.replace(/\\n/g, "\n")}
              </pre>
            </div>


<div className="view-group">
  <h4>Solution Code</h4>

  <div className="language-tabs">
    {Object.keys(question.solutionCode || {}).map((lang) => (
      <button
        key={lang}
        className={`lang-btn ${
          solutionLanguage === lang ? "active" : ""
        }`}
        onClick={() => setSolutionLanguage(lang)}
      >
        {lang.toUpperCase()}
      </button>
    ))}
  </div>

  <pre>
    {question.solutionCode?.[solutionLanguage]?.replace(/\\n/g, "\n")}
  </pre>
</div>


<div className="view-group">
  <h4>Test Cases</h4>

  <div className="language-tabs">
    {question.testCases?.map((_, index) => (
      <button
        key={index}
        className={`lang-btn ${
          selectedTestCase === index ? "active" : ""
        }`}
        onClick={() => setSelectedTestCase(index)}
      >
        Input {index + 1}
      </button>
    ))}
  </div>

  {question.testCases?.[selectedTestCase] && (
    <>
      <p>
        <strong>
          {question.testCases[selectedTestCase].hidden
            ? "Hidden Test Case"
            : "Visible Test Case"}
        </strong>
      </p>

      <h5>Input</h5>
      <pre>
        {question.testCases[selectedTestCase].input.replace(/\\n/g, "\n")}
      </pre>

      <h5>Expected Output</h5>
      <pre>
        {question.testCases[selectedTestCase].output.replace(/\\n/g, "\n")}
      </pre>
    </>
  )}
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