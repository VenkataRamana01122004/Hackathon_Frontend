
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaPlus,
  FaEye,
  FaMagic,
  FaTimes,
  FaSync,
} from "react-icons/fa";

import "../components/manager-pages.css";
import "./InterviewQuestions.css";

const API = "http://localhost:5000/api/manager";

const initialQuestion = {
  question: "",
  expectedAnswer: "",
  category: "Java",
  difficulty: "Easy",
  questionType: "Technical",
  marks: 10,
  isActive: true,
};

function InterviewQuestions() {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [category, setCategory] = useState("");
  const [questionType, setQuestionType] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const [form, setForm] = useState(initialQuestion);
  const [generation, setGeneration] = useState({
    topic: "Java",
    category: "Easy",
    count: 2,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadQuestions();
  }, []);

  // Fetch all interview questions
  const loadQuestions = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${API}/getAllInterviewQuestions`
      );

      setQuestions(response.data.data || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load interview questions."
      );
    } finally {
      setLoading(false);
    }
  };

  // Search and filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch =
        q.question?.toLowerCase().includes(search.toLowerCase());

      const matchesDifficulty =
        !difficulty || q.difficulty === difficulty;

      const matchesCategory =
        !category ||
        q.category?.toLowerCase().includes(category.toLowerCase());

      const matchesType =
        !questionType || q.questionType === questionType;

      return (
        matchesSearch &&
        matchesDifficulty &&
        matchesCategory &&
        matchesType
      );
    });
  }, [questions, search, difficulty, category, questionType]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "marks"
          ? Number(value)
          : value,
    }));
  };

  const handleGenerationChange = (e) => {
    const { name, value } = e.target;

    setGeneration((prev) => ({
      ...prev,
      [name]: name === "count" ? Number(value) : value,
    }));
  };

  // Create a single interview question
  const createQuestion = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post(
        `${API}/createinterviewquestion`,
        form
      );

      setMessage(
        response.data.message || "Interview question created successfully."
      );

      setForm({ ...initialQuestion });
      setShowAdd(false);
      await loadQuestions();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create interview question."
      );
    } finally {
      setSaving(false);
    }
  };

  // Generate AI questions and save them to the database
  const generateQuestions = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post(
        `${API}/generateAndSaveInterviewQuestions`,
        generation
      );

      setMessage(
        response.data.message ||
          "Interview questions generated successfully."
      );

      setShowGenerate(false);
      await loadQuestions();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to generate interview questions."
      );
    } finally {
      setGenerating(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setDifficulty("");
    setCategory("");
    setQuestionType("");
  };

  return (
    <div className="interview-questions-page">
      <div className="manager-page-header interview-header">
        <div>
          <h1>Interview Questions</h1>
          <p>
            Manage interview questions and expected answers
          </p>
        </div>

        <div className="interview-header-actions">
          <button
            className="interview-secondary-btn"
            onClick={() => {
              setError("");
              setMessage("");
              setShowAdd(true);
            }}
          >
            <FaPlus /> Add Question
          </button>

          <button
            className="primary-btn"
            onClick={() => {
              setError("");
              setMessage("");
              setShowGenerate(true);
            }}
          >
            <FaMagic /> Generate AI Questions
          </button>
        </div>
      </div>

      {message && (
        <div className="interview-alert success-alert">
          {message}
        </div>
      )}

      {error && (
        <div className="interview-alert error-alert">
          {error}
        </div>
      )}

      <div className="interview-toolbar">
        <input
          type="text"
          placeholder="Search interview questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="">All Difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <input
          type="text"
          placeholder="Filter category..."
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="Technical">Technical</option>
          <option value="HR">HR</option>
          <option value="Behavioral">Behavioral</option>
        </select>

        <button
          className="interview-secondary-btn"
          onClick={clearFilters}
        >
          <FaSync /> Clear
        </button>
      </div>

      <div className="list-card manager-table-card">
        <table className="manager-table interview-table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Type</th>
              <th>Marks</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="interview-empty">
                  Loading interview questions...
                </td>
              </tr>
            ) : filteredQuestions.length === 0 ? (
              <tr>
                <td colSpan="7" className="interview-empty">
                  No interview questions found.
                </td>
              </tr>
            ) : (
              filteredQuestions.map((q) => (
                <tr key={q.id}>
                  <td className="interview-question-cell">
                    {q.question?.length > 30
                      ? `${q.question.slice(0, 30)}...`
                      : q.question}
                  </td>

                  <td>
                    <span className="interview-category">
                      {q.category || "General"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`interview-badge difficulty-${(
                        q.difficulty || "Easy"
                      ).toLowerCase()}`}
                    >
                      {q.difficulty}
                    </span>
                  </td>

                  <td>
                    <span className="interview-badge type-badge">
                      {q.questionType}
                    </span>
                  </td>

                  <td>{q.marks}</td>

                  <td>
                    <span
                      className={`interview-badge ${
                        q.isActive
                          ? "active-badge"
                          : "inactive-badge"
                      }`}
                    >
                      {q.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      title="View question and expected answer"
                      className="interview-icon-btn"
                      onClick={() => setSelectedQuestion(q)}
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="interview-table-footer">
          Showing {filteredQuestions.length} of {questions.length} questions
        </div>
      </div>

      {/* Add Question Modal */}
      {showAdd && (
        <div
          className="interview-modal-overlay"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="interview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="interview-modal-header">
              <h2>Add Interview Question</h2>
              <button
                type="button"
                className="interview-close-btn"
                onClick={() => setShowAdd(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={createQuestion}>
              <label>Question *</label>
              <textarea
                name="question"
                value={form.question}
                onChange={handleFormChange}
                placeholder="Enter the interview question"
                required
                rows="3"
              />

              <label>Expected Answer</label>
              <textarea
                name="expectedAnswer"
                value={form.expectedAnswer}
                onChange={handleFormChange}
                placeholder="Enter the expected answer"
                rows="4"
              />

              <div className="interview-form-grid">
                <div>
                  <label>Category</label>
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    placeholder="e.g. Java"
                  />
                </div>

                <div>
                  <label>Difficulty</label>
                  <select
                    name="difficulty"
                    value={form.difficulty}
                    onChange={handleFormChange}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label>Question Type</label>
                  <select
                    name="questionType"
                    value={form.questionType}
                    onChange={handleFormChange}
                  >
                    <option value="Technical">Technical</option>
                    <option value="HR">HR</option>
                    <option value="Behavioral">Behavioral</option>
                  </select>
                </div>

                <div>
                  <label>Marks</label>
                  <input
                    type="number"
                    name="marks"
                    min="1"
                    value={form.marks}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <label className="interview-checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleFormChange}
                />
                Active question
              </label>

              <div className="interview-modal-actions">
                <button
                  type="button"
                  className="interview-secondary-btn"
                  onClick={() => setShowAdd(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Create Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate AI Questions Modal */}
      {showGenerate && (
        <div
          className="interview-modal-overlay"
          onClick={() => setShowGenerate(false)}
        >
          <div
            className="interview-modal interview-generate-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="interview-modal-header">
              <h2>
                <FaMagic /> Generate AI Questions
              </h2>

              <button
                type="button"
                className="interview-close-btn"
                onClick={() => setShowGenerate(false)}
              >
                <FaTimes />
              </button>
            </div>

            <p className="interview-modal-description">
              Generate interview questions using AI and save them
              directly to your database.
            </p>

            <form onSubmit={generateQuestions}>
              <label>Topic *</label>
              <input
                name="topic"
                value={generation.topic}
                onChange={handleGenerationChange}
                placeholder="e.g. Java, Python, React"
                required
              />

              <label>Difficulty *</label>
              <select
                name="category"
                value={generation.category}
                onChange={handleGenerationChange}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <label>Number of Questions *</label>
              <input
                type="number"
                name="count"
                min="1"
                max="50"
                value={generation.count}
                onChange={handleGenerationChange}
                required
              />

              <div className="interview-modal-actions">
                <button
                  type="button"
                  className="interview-secondary-btn"
                  onClick={() => setShowGenerate(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={generating}
                >
                  <FaMagic />
                  {generating
                    ? "Generating..."
                    : "Generate and Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Question Modal */}
      {selectedQuestion && (
        <div
          className="interview-modal-overlay"
          onClick={() => setSelectedQuestion(null)}
        >
          <div
            className="interview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="interview-modal-header">
              <h2>Interview Question Details</h2>

              <button
                type="button"
                className="interview-close-btn"
                onClick={() => setSelectedQuestion(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="interview-detail-meta">
              <span>
                Category: {selectedQuestion.category || "General"}
              </span>
              <span>
                Difficulty: {selectedQuestion.difficulty}
              </span>
              <span>
                Type: {selectedQuestion.questionType}
              </span>
              <span>Marks: {selectedQuestion.marks}</span>
            </div>

            <label>Question</label>
            <div className="interview-detail-text">
              {selectedQuestion.question}
            </div>

            <label>Expected Answer</label>
            <div className="interview-detail-text expected-answer">
              {selectedQuestion.expectedAnswer ||
                "No expected answer provided."}
            </div>

            <div className="interview-modal-actions">
              <button
                className="primary-btn"
                onClick={() => setSelectedQuestion(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewQuestions;