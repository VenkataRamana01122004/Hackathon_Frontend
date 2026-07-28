import { useState } from "react";
import axios from "axios";

function EditMCQModal({question,close, refresh }) {

    const [questionText, setQuestionText] = useState(question?.question || "");
const [questionType, setQuestionType] = useState(question?.questionType || "SINGLE");
const [options, setOptions] = useState(question?.options || ["", "", "", ""]);
const [correctAnswers, setCorrectAnswers] = useState(question?.correctAnswers || []);
const [difficulty, setDifficulty] = useState(question?.difficulty || "Easy");
const [category, setCategory] = useState(question?.category || "");
const [marks, setMarks] = useState(question?.marks || 1);
const [negativeMarks, setNegativeMarks] = useState(question?.negativeMarks || 0);
const [isActive, setIsActive] = useState(question?.isActive ?? true);


  const handleOptionChange = (index, value) => {
    const oldValue = options[index];
    const arr = [...options];
    arr[index] = value;
    setOptions(arr);

    if (correctAnswers.includes(oldValue)) {
      setCorrectAnswers(
        correctAnswers.map((ans) => (ans === oldValue ? value : ans))
      );
    }
  };

  const handleCorrectAnswer = (index) => {
    const selectedOption = options[index];
    if (questionType === "SINGLE") {
      setCorrectAnswers([selectedOption]);
      return;
    }
    if (correctAnswers.includes(selectedOption)) {
      setCorrectAnswers(
        correctAnswers.filter((item) => item !== selectedOption)
      );
    } else {
      setCorrectAnswers([...correctAnswers, selectedOption]);
    }
  };

  const saveMCQ = async () => {
    if (questionText.trim() === "") {
      alert("Enter Question");
      return;
    }
    if (category.trim() === "") {
      alert("Enter Category");
      return;
    }
    if (correctAnswers.length === 0) {
      alert("Select Correct Answer");
      return;
    }

    try {
      await axios.put(
  `http://localhost:5000/api/manager/updatemcq/${question.id}`,
  {
    question: questionText,
    questionType,
    options,
    correctAnswers,
    difficulty,
    category,
    marks,
    negativeMarks,
    isActive,
  }
);
      alert("MCQ Update Successfully");
      refresh();
      close();
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Unable to Save");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="question-modal">
        <div className="modal-header">
          <h2>Add MCQ Question</h2>
        </div>

        <div className="modal-body">
          <label>Question</label>
          <textarea
            rows="4"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />

          <div className="grid-2">
            <div>
              <label>Question Type</label>
              <select
                value={questionType}
                onChange={(e) => {
                  setQuestionType(e.target.value);
                  setCorrectAnswers([]);
                }}
              >
                <option value="SINGLE">Single Choice</option>
                <option value="MULTIPLE">Multiple Choice</option>
              </select>
            </div>

            <div>
              <label>Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label>Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            <div>
              <label>Marks</label>
              <input
                type="number"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
              />
            </div>
          </div>

          <label>Negative Marks</label>
          <input
            type="number"
            value={negativeMarks}
            onChange={(e) => setNegativeMarks(e.target.value)}
          />

          <h3 style={{ marginTop: "20px" }}>Options</h3>

          {options.map((option, index) => (
            <div key={index} className="option-row">
              <span className="option-label">{index + 1}</span>
              {questionType === "SINGLE" ? (
                <input
                  type="radio"
                  checked={correctAnswers.includes(option)}
                  onChange={() => handleCorrectAnswer(index)}
                />
              ) : (
                <input
                  type="checkbox"
                  checked={correctAnswers.includes(option)}
                  onChange={() => handleCorrectAnswer(index)}
                />
              )}

              <div className="option-input-wrap">
                <input
                  className="option-input"
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
              </div>
            </div>
          ))}

          <label className="checkbox">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active
          </label>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={close}>
            Cancel
          </button>
          <button className="save-btn" onClick={saveMCQ}>
            Update MCQ
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditMCQModal;