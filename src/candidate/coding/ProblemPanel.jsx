import { useState } from "react";

export default function ProblemPanel({ question, index, total }) {
  const [selectedTestCase, setSelectedTestCase] = useState(0);

  if (!question) return null;

  // Convert literal "\\n" into actual line breaks
  const formatText = (value) => {
    if (value === null || value === undefined) return "";

    return String(value)
      .replace(/\\n/g, "\n")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n");
  };

  // Only visible test cases
  const visibleTestCases = Array.isArray(question.testCases)
    ? question.testCases.filter(
        (testCase) => testCase.hidden === false
      )
    : [];

  const currentTestCase =
    visibleTestCases[selectedTestCase];

  return (
    <div className="problem-panel">

      {/* Question Number */}
      <span className="question-count">
        Question {index + 1} of {total}
      </span>

      {/* Title */}
      <h2 className="problem-title">
        {question.title}
      </h2>

      {/* Description */}
      <p>{question.description}</p>

      {/* Input */}
      <div className="problem-section-label">
        Input
      </div>

      <pre className="problem-io-block">
        {formatText(question.input)}
      </pre>

      {/* Output */}
      <div className="problem-section-label">
        Output
      </div>

      <pre className="problem-io-block">
        {formatText(question.output)}
      </pre>

      {/* Sample Input */}
      {question.sampleInput && (
        <>
          <div className="problem-section-label">
            Sample Input
          </div>

          <pre className="problem-io-block">
            {formatText(question.sampleInput)}
          </pre>
        </>
      )}

      {/* Sample Output */}
      {question.sampleOutput && (
        <>
          <div className="problem-section-label">
            Sample Output
          </div>

          <pre className="problem-io-block">
            {formatText(question.sampleOutput)}
          </pre>
        </>
      )}

      {/* Constraints */}
      {question.constraints && (
        <>
          <div className="problem-section-label">
            Constraints
          </div>

          <pre
            className="problem-io-block"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              whiteSpace: "pre-wrap",
            }}
          >
            {formatText(question.constraints)}
          </pre>
        </>
      )}

      {/* ========================================= */}
      {/* TEST CASES */}
      {/* ========================================= */}

      {visibleTestCases.length > 0 && (
        <div className="test-cases-section">

          <div className="problem-section-label">
            Test Cases
          </div>
          <div
            className="test-case-buttons"
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "15px",
              flexWrap: "wrap",
            }}
          >
            {visibleTestCases.map((_, testIndex) => (
              <button
                key={testIndex}
                type="button"
                onClick={() =>
                  setSelectedTestCase(testIndex)
                }
                style={{
                  padding: "8px 14px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  cursor: "pointer",
                  background:
                    selectedTestCase === testIndex
                      ? "#2563eb"
                      : "#fff",
                  color:
                    selectedTestCase === testIndex
                      ? "#fff"
                      : "#333",
                }}
              >
                Test Case {testIndex + 1}
              </button>
            ))}
          </div>
          {/* Currently selected test case */}
          {currentTestCase && (
            <div className="test-case">

              <h4>
                Test Case {selectedTestCase + 1}
              </h4>

              {/* Input */}
              <div className="test-case-label">
                Input
              </div>

              <pre className="problem-io-block">
                {formatText(currentTestCase.input)}
              </pre>

              {/* Expected Output */}
              <div className="test-case-label">
                Expected Output
              </div>

              <pre className="problem-io-block">
                {formatText(currentTestCase.output)}
              </pre>

            </div>
          )}

          {/* Test Case Buttons */}
          

        </div>
      )}

    </div>
  );
}