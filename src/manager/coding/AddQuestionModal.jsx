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
    starterCode: "",
    solutionCode: "",
    testCases: "",
    timeLimit: 2,
    memoryLimit: 256,
    marks: 100,
    isActive: true,
  });

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
        starterCode: form.starterCode
          ? JSON.parse(form.starterCode)
          : {},
        solutionCode: form.solutionCode
          ? JSON.parse(form.solutionCode)
          : {},
        testCases: form.testCases
          ? JSON.parse(form.testCases)
          : [],
      };

      await axios.post(
        "http://localhost:5000/manager/addquestion",
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

          <label>
            Starter Code (JSON)
          </label>

          <textarea
            rows="6"
            name="starterCode"
            placeholder='{"java":"...","python":"..."}'
            value={form.starterCode}
            onChange={handleChange}
          />

          <label>
            Solution Code (JSON)
          </label>

          <textarea
            rows="6"
            name="solutionCode"
            placeholder='{"java":"...","python":"..."}'
            value={form.solutionCode}
            onChange={handleChange}
          />

          <label>
            Test Cases (JSON)
          </label>

          <textarea
            rows="6"
            name="testCases"
            placeholder='[{"input":"1 2","output":"3"}]'
            value={form.testCases}
            onChange={handleChange}
          />

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