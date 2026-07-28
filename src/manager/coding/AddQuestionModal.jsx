import { useState } from "react";
import axios from "axios";

function AddQuestionModal({ close, refresh }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    category: "",
    constraints: "",
    inputFormat: "",
    outputFormat: "",
    sampleInput: "",
    sampleOutput: "",
    explanation: "",
    starterCode: {
  cpp: "",
  java: "",
  python: "",
  javascript: "",
},
solutionCode: {
  cpp: "",
  java: "",
  python: "",
  javascript: "",
},
testCases: [
  {
    input: "",
    output: "",
    isHidden: false,
  },
],
    timeLimit: 2,
    memoryLimit: 256,
    marks: 100,
    isActive: true,
  });

  const [starterLanguage, setStarterLanguage] = useState("cpp");
const [solutionLanguage, setSolutionLanguage] = useState("cpp");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const saveQuestion = async () => {
    try {
      const payload = {
  ...form,
};

      await axios.post(
        "http://localhost:5000/api/manager/addquestion",
        payload
      );

      alert("Question Added Successfully");

      refresh();

      close();
    } catch (err) {
      console.log(err);

      alert("Unable to Add Question");
    }
  };

  return (
    <div className="modal-overlay">

      <div className="question-modal">

        <div className="modal-header">
          <h2>Add Coding Question</h2>
        </div>

        <div className="modal-body">

          <label>Title</label>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
          />

          <label>Description</label>

          <textarea
            rows="5"
            name="description"
            value={form.description}
            onChange={handleChange}
          />

          <div className="grid-2">

            <div>

              <label>Category</label>

              <input
                name="category"
                value={form.category}
                onChange={handleChange}
              />

            </div>

            <div>

              <label>Difficulty</label>

              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
              >

                <option>Easy</option>

                <option>Medium</option>

                <option>Hard</option>

              </select>

            </div>

          </div>

          <label>Constraints</label>

          <textarea
            rows="3"
            name="constraints"
            value={form.constraints}
            onChange={handleChange}
          />

          <label>Input Format</label>

          <textarea
            rows="3"
            name="inputFormat"
            value={form.inputFormat}
            onChange={handleChange}
          />

          <label>Output Format</label>

          <textarea
            rows="3"
            name="outputFormat"
            value={form.outputFormat}
            onChange={handleChange}
          />

          <label>Sample Input</label>

          <textarea
            rows="3"
            name="sampleInput"
            value={form.sampleInput}
            onChange={handleChange}
          />

          <label>Sample Output</label>

          <textarea
            rows="3"
            name="sampleOutput"
            value={form.sampleOutput}
            onChange={handleChange}
          />

          <label>Explanation</label>

          <textarea
            rows="3"
            name="explanation"
            value={form.explanation}
            onChange={handleChange}
          />

     <label>Starter Code</label>

<div className="language-tabs">
  {["cpp", "java", "python", "javascript"].map((lang) => (
    <button
      type="button"
      key={lang}
      className={starterLanguage === lang ? "active" : ""}
      onClick={() => setStarterLanguage(lang)}
    >
      {lang.toUpperCase()}
    </button>
  ))}
</div>

<textarea
  rows="8"
  value={form.starterCode[starterLanguage]}
  onChange={(e) =>
    setForm({
      ...form,
      starterCode: {
        ...form.starterCode,
        [starterLanguage]: e.target.value,
      },
    })
  }
/>
<label>Solution Code</label>

<div className="language-tabs">
  {["cpp", "java", "python", "javascript"].map((lang) => (
    <button
      type="button"
      key={lang}
      className={solutionLanguage === lang ? "active" : ""}
      onClick={() => setSolutionLanguage(lang)}
    >
      {lang.toUpperCase()}
    </button>
  ))}
</div>

<textarea
  rows="8"
  value={form.solutionCode[solutionLanguage]}
  onChange={(e) =>
    setForm({
      ...form,
      solutionCode: {
        ...form.solutionCode,
        [solutionLanguage]: e.target.value,
      },
    })
  }
/>
<label>Test Cases</label>

{form.testCases.map((testCase, index) => (
  <div key={index} className="test-case-card">

    <h4>Test Case {index + 1}</h4>

    <textarea
      rows="3"
      placeholder="Input"
      value={testCase.input}
      onChange={(e) => {
        const arr = [...form.testCases];
        arr[index].input = e.target.value;
        setForm({ ...form, testCases: arr });
      }}
    />

    <textarea
      rows="3"
      placeholder="Output"
      value={testCase.output}
      onChange={(e) => {
        const arr = [...form.testCases];
        arr[index].output = e.target.value;
        setForm({ ...form, testCases: arr });
      }}
    />

    <label>
      <input
        type="checkbox"
        checked={testCase.isHidden}
        onChange={(e) => {
          const arr = [...form.testCases];
          arr[index].isHidden = e.target.checked;
          setForm({ ...form, testCases: arr });
        }}
      />
      Hidden Test Case
    </label>

  </div>
))}

<button
  type="button"
  onClick={() =>
    setForm({
      ...form,
      testCases: [
        ...form.testCases,
        {
          input: "",
          output: "",
          isHidden: false,
        },
      ],
    })
  }
>
  + Add Test Case
</button>

          <div className="grid-3">

            <div>

              <label>Marks</label>

              <input
                type="number"
                name="marks"
                value={form.marks}
                onChange={handleChange}
              />

            </div>

            <div>

              <label>Time Limit</label>

              <input
                type="number"
                name="timeLimit"
                value={form.timeLimit}
                onChange={handleChange}
              />

            </div>

            <div>

              <label>Memory Limit</label>

              <input
                type="number"
                name="memoryLimit"
                value={form.memoryLimit}
                onChange={handleChange}
              />

            </div>

          </div>

          <label className="checkbox">

            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />

            Active

          </label>

        </div>

        <div className="modal-footer">

          <button
            className="cancel-btn"
            onClick={close}
          >
            Cancel
          </button>

          <button
            className="save-btn"
            onClick={saveQuestion}
          >
            Save Question
          </button>

        </div>

      </div>

    </div>
  );
}

export default AddQuestionModal;