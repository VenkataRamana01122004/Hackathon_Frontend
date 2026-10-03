import { useState } from "react";
import axios from "axios";

function GenerateAIQuestionsModal({ close, refresh }) {
  const [form, setForm] = useState({
    topic: "Strings",
    category: "Easy",
    count: 1,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "count" ? Number(value) : value,
    }));
  };

  const generateQuestions = async () => {
    if (!form.topic.trim() || !form.category.trim()) {
      alert("Please enter topic and category");
      return;
    }

    if (!Number.isInteger(form.count) || form.count < 1 || form.count > 50) {
      alert("Count must be between 1 and 50");
      return;
    }
try {
  setLoading(true);

  const response = await axios.post(
    "http://localhost:5000/api/interview/generatecodingquestions",
    {
      topic: form.topic.trim(),
      category: form.category.trim(),
      count: form.count,
    }
  );

  // API request succeeded
  alert(
    response.data.message || "AI questions generated successfully"
  );

  // Refresh separately to prevent a second alert
  try {
    await refresh();
  } catch (refreshError) {
    console.error("Question refresh failed:", refreshError);
  }

  close();

} catch (error) {
  console.error(
    "AI question generation failed:",
    error.response?.data || error.message
  );

  alert(
    error.response?.data?.message ||
      "Unable to generate AI questions"
  );
} finally {
  setLoading(false);
}

  };

  return (
    <div className="modal-overlay">
      <div className="question-modal">
        <div className="modal-header">
          <h2>Generate AI Questions</h2>
        </div>

        <div className="modal-body">
          <label>Topic</label>
          <input
            type="text"
            name="topic"
            placeholder="e.g. Java, Python, C++"
            value={form.topic}
            onChange={handleChange}
          />

          <label>Category</label>
          <input
            type="text"
            name="category"
            placeholder="e.g. Basic Arrays, Strings"
            value={form.category}
            onChange={handleChange}
          />

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
            type="button"
            className="cancel-btn"
            onClick={close}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="save-btn"
            onClick={generateQuestions}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Questions"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GenerateAIQuestionsModal;