import { useState } from "react";
import axios from "axios";

function GenerateAIMCQModal({ close, refresh }) {
  const [form, setForm] = useState({
    topic: "Java",
    category: "Arrays",
    count: 2,
    questionType: "SINGLE",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "count" ? Number(value) : value,
    }));
  };

  const generateMCQs = async () => {
    if (!form.topic.trim() || !form.category.trim()) {
      alert("Enter topic and category");
      return;
    }

    if (!Number.isInteger(form.count) || form.count < 1 || form.count > 50) {
      alert("Count must be between 1 and 50");
      return;
    }

    if (!form.questionType) {
      alert("Select question type");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/interview/generate",
        {
          topic: form.topic.trim(),
          category: form.category.trim(),
          count: form.count,
          questionType: form.questionType,
        }
      );

      console.log("MCQ generation response:", response.data);

      alert(response.data.message || "AI MCQs generated successfully");

      try {
        await refresh();
      } catch (refreshError) {
        console.error("Failed to refresh MCQ list:", refreshError);
      }

      close();
    } catch (err) {
      console.error(
        "MCQ generation request failed:",
        err.response?.data || err.message
      );

      alert(
        err.response?.data?.message ||
          "Unable to generate AI MCQs"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="question-modal">
        <div className="modal-header">
          <h2>Generate AI MCQs</h2>
        </div>

        <div className="modal-body">
          <label>Topic</label>
          <input
            name="topic"
            value={form.topic}
            onChange={handleChange}
            placeholder="e.g. Java, Python, C++"
          />

          <label>Category</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="e.g. Simple, OOP, Collections"
          />

          <label>Question Type</label>
          <select
            name="questionType"
            value={form.questionType}
            onChange={handleChange}
          >
            <option value="SINGLE">
              Single Choice
            </option>
            <option value="MULTIPLE">
              Multiple Choice
            </option>
            <option value="BOTH">
              Both
            </option>
          </select>

          <label>Number of Questions</label>
          <input
            type="number"
            name="count"
            min="1"
            max="50"
            value={form.count}
            onChange={handleChange}
          />
        </div>

        <div className="modal-footer">
          <button
            className="cancel-btn"
            onClick={close}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="save-btn"
            onClick={generateMCQs}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate MCQs"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GenerateAIMCQModal;