
// import { useEffect, useState } from "react";
// import axios from "axios";
// import { FaTimes, FaSearch, FaCode, FaListAlt } from "react-icons/fa";
// import "./CandidateQuestionModal.css";

// function CandidateQuestionModal({ candidate, onClose, onSave }) {
//   const [codingQuestions, setCodingQuestions] = useState([]);
//   const [mcqQuestions, setMcqQuestions] = useState([]);

//   const [codingIds, setCodingIds] = useState([]);
//   const [bitsIds, setBitsIds] = useState([]);

//   const [activeTab, setActiveTab] = useState("coding");
//   const [search, setSearch] = useState("");
//   const [difficulty, setDifficulty] = useState("");

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     loadQuestions();
//   }, []);

//   const loadQuestions = async () => {
//     try {
//       setLoading(true);

//       const [codingResponse, mcqResponse] = await Promise.all([
//         axios.get("http://localhost:5000/api/manager/allquestions"),
//         axios.get("http://localhost:5000/api/manager/getallmcqs"),
//       ]);

//       setCodingQuestions(
//         Array.isArray(codingResponse.data.data)
//           ? codingResponse.data.data
//           : []
//       );

//       setMcqQuestions(
//         Array.isArray(mcqResponse.data.data)
//           ? mcqResponse.data.data
//           : []
//       );
//     } catch (error) {
//       console.error("Failed to fetch questions:", error);
//       alert("Failed to load coding and MCQ questions.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleQuestion = (id, type) => {
//     const setter = type === "coding" ? setCodingIds : setBitsIds;

//     setter((previous) =>
//       previous.includes(id)
//         ? previous.filter((questionId) => questionId !== id)
//         : [...previous, id]
//     );
//   };

//   const currentQuestions =
//     activeTab === "coding" ? codingQuestions : mcqQuestions;

//   const selectedIds = activeTab === "coding" ? codingIds : bitsIds;

//   const filteredQuestions = currentQuestions.filter((question) => {
//     const title = question.title || question.question || "";

//     const matchesSearch = title
//       .toLowerCase()
//       .includes(search.toLowerCase());

//     const matchesDifficulty =
//       !difficulty || question.difficulty === difficulty;

//     return matchesSearch && matchesDifficulty;
//   });

//   const saveAssignment = async () => {
//     if (!candidate?.id) {
//       alert("Candidate ID is missing.");
//       return;
//     }

//     if (codingIds.length === 0 || bitsIds.length === 0) {
//       alert(
//         "Please select at least one coding question and one MCQ question."
//       );
//       return;
//     }

//     try {
//       setSaving(true);

//       await onSave({
//         candidate_id: candidate.id,
//         coding_question_ids: codingIds,
//         bits_question_ids: bitsIds,
//         completedstatus: false,
//       });

//       alert("Questions assigned successfully.");
//       onClose();
//     } catch (error) {
//       console.error("Failed to assign questions:", error);

//       alert(
//         error.response?.data?.message ||
//           error.message ||
//           "Failed to save question assignment."
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (!candidate) return null;

//   return (
//     <div className="cqm-overlay">
//       <div className="cqm-modal">
//         {/* Header */}
//         <div className="cqm-header">
//           <div>
//             <h2>Assign Assessment Questions</h2>
//             <p>
//               Candidate: <strong>{candidate.fullName}</strong>
//             </p>
//           </div>

//           <button
//             className="cqm-close"
//             onClick={onClose}
//             disabled={saving}
//             title="Close"
//           >
//             <FaTimes />
//           </button>
//         </div>

//         {/* Summary */}
//         <div className="cqm-summary">
//           <div>
//             <FaCode />
//             <span>Coding selected</span>
//             <strong>{codingIds.length}</strong>
//           </div>

//           <div>
//             <FaListAlt />
//             <span>MCQs selected</span>
//             <strong>{bitsIds.length}</strong>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="cqm-tabs">
//           <button
//             type="button"
//             className={activeTab === "coding" ? "active" : ""}
//             onClick={() => {
//               setActiveTab("coding");
//               setSearch("");
//               setDifficulty("");
//             }}
//           >
//             Coding Questions ({codingQuestions.length})
//           </button>

//           <button
//             type="button"
//             className={activeTab === "bits" ? "active" : ""}
//             onClick={() => {
//               setActiveTab("bits");
//               setSearch("");
//               setDifficulty("");
//             }}
//           >
//             BITS / MCQ Questions ({mcqQuestions.length})
//           </button>
//         </div>

//         {/* Filters */}
//         <div className="cqm-filters">
//           <div className="cqm-search">
//             <FaSearch />

//             <input
//               type="text"
//               placeholder="Search questions..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>

//           <select
//             value={difficulty}
//             onChange={(e) => setDifficulty(e.target.value)}
//           >
//             <option value="">All Difficulty</option>
//             <option value="Easy">Easy</option>
//             <option value="Medium">Medium</option>
//             <option value="Hard">Hard</option>
//           </select>
//         </div>

//         {/* Question list */}
//         <div className="cqm-question-list">
//           {loading ? (
//             <div className="cqm-message">Loading questions...</div>
//           ) : filteredQuestions.length === 0 ? (
//             <div className="cqm-message">
//               No questions found.
//             </div>
//           ) : (
//             filteredQuestions.map((question) => {
//               const id = question.id;
//               const title = question.title || question.question;
//               const isSelected = selectedIds.includes(id);

//               return (
//                 <label
//                   className={`cqm-question ${
//                     isSelected ? "selected" : ""
//                   }`}
//                   key={id}
//                 >
//                   <input
//                     type="checkbox"
//                     checked={isSelected}
//                     onChange={() => toggleQuestion(id, activeTab)}
//                     disabled={saving}
//                   />

//                   <div className="cqm-question-details">
//                     <strong>{title}</strong>

//                     <div className="cqm-question-meta">
//                       <span>{question.category || "General"}</span>
//                       <span>{question.difficulty || "N/A"}</span>
//                       <span>{question.marks ?? 0} marks</span>
//                     </div>
//                   </div>

//                   <span className="cqm-question-id">
//                     #{id}
//                   </span>
//                 </label>
//               );
//             })
//           )}
//         </div>

//         {/* Footer */}
//         <div className="cqm-footer">
//           <div className="cqm-selection-count">
//             {codingIds.length} coding · {bitsIds.length} MCQs selected
//           </div>

//           <button
//             type="button"
//             className="cqm-cancel"
//             onClick={onClose}
//             disabled={saving}
//           >
//             Cancel
//           </button>

//           <button
//             type="button"
//             className="cqm-save"
//             onClick={saveAssignment}
//             disabled={loading || saving}
//           >
//             {saving ? "Saving..." : "Assign Questions"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default CandidateQuestionModal;



import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import {
  FaTimes,
  FaSearch,
  FaCode,
  FaListAlt,
} from "react-icons/fa";

import "./CandidateTable.css";

function CandidateQuestionModal({ candidate, onClose, onSave }) {

    const MAX_CODING_QUESTIONS = 3;
const MAX_MCQ_QUESTIONS = 15;

  const [codingQuestions, setCodingQuestions] = useState([]);
  const [mcqQuestions, setMcqQuestions] = useState([]);

  const [codingIds, setCodingIds] = useState([]);
  const [bitsIds, setBitsIds] = useState([]);

  const [activeTab, setActiveTab] = useState("coding");
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (candidate) {
      loadQuestions();
    }
  }, [candidate]);

  

const handleQuestionToggle = (questionId, type) => {
  if (type === "coding") {
    setCodingIds((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId);
      }

      if (prev.length >= MAX_CODING_QUESTIONS) {
        alert("You can select a maximum of 3 coding questions.");
        return prev;
      }

      return [...prev, questionId];
    });
  } else {
    setBitsIds((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId);
      }

      if (prev.length >= MAX_MCQ_QUESTIONS) {
        alert("You can select a maximum of 15 MCQ questions.");
        return prev;
      }

      return [...prev, questionId];
    });
  }
};

// const loadQuestions = async () => {
//   try {
//     setLoading(true);

//     const candidateId = candidate?.id;

//     if (!candidateId) {
//       alert("Candidate ID not found.");
//       return;
//     }

//     // First, check whether questions are already assigned
//     try {
//       const assignedResponse = await axios.get(
//         `http://localhost:5000/api/manager/assigned-questions/${candidateId}`
//       );

//       const assignedData = assignedResponse.data?.data;

//       if (
//         assignedResponse.data?.success &&
//         assignedData &&
//         (Array.isArray(assignedData.codingQuestions) ||
//           Array.isArray(assignedData.mcqQuestions))
//       ) {
//         setCodingQuestions(
//           assignedData.codingQuestions || []
//         );

//         setMcqQuestions(
//           assignedData.mcqQuestions || []
//         );

//         return;
//       }
//     } catch (error) {
//       // If no assignment exists, load available questions below.
//       if (error.response?.status !== 404) {
//         throw error;
//       }
//     }

//     // No assignment exists: load questions available for assignment
//     const [codingResponse, mcqResponse] = await Promise.all([
//       axios.get("http://localhost:5000/api/manager/allquestions"),
//       axios.get("http://localhost:5000/api/manager/getallmcqs"),
//     ]);

//     setCodingQuestions(
//       Array.isArray(codingResponse.data?.data)
//         ? codingResponse.data.data
//         : []
//     );

//     setMcqQuestions(
//       Array.isArray(mcqResponse.data?.data)
//         ? mcqResponse.data.data
//         : []
//     );
//   } catch (error) {
//     console.error("Failed to fetch questions:", error);
//     alert("Failed to load assigned or available questions.");
//   } finally {
//     setLoading(false);
//   }
// };



const loadQuestions = async () => {
  try {
    setLoading(true);

    const candidateId = candidate?.id;

    if (!candidateId) {
      alert("Candidate ID not found.");
      return;
    }

    let hasAssignedQuestions = false;

    // 1. Check for previously assigned questions
    try {
      const response = await axios.get(
        `http://localhost:5000/api/manager/assigned-questions/${candidateId}`
      );

      const data = response.data?.data;

      const coding = Array.isArray(data?.codingQuestions)
        ? data.codingQuestions
        : [];

      const mcqs = Array.isArray(data?.mcqQuestions)
        ? data.mcqQuestions
        : [];

      if (coding.length > 0 || mcqs.length > 0) {
        setCodingQuestions(coding);
        setMcqQuestions(mcqs);

        setCodingIds(coding.map((q) => q.id));
        setBitsIds(mcqs.map((q) => q.id));

        hasAssignedQuestions = true;
      }
    } catch (error) {
      // 404 means no assignment exists; load all questions below.
      if (error.response?.status !== 404) {
        throw error;
      }
    }

    // 2. If there are no assigned questions, load all questions
    if (!hasAssignedQuestions) {
      const [codingResponse, mcqResponse] = await Promise.all([
        axios.get("http://localhost:5000/api/manager/allquestions"),
        axios.get("http://localhost:5000/api/manager/getallmcqs"),
      ]);

      const coding = Array.isArray(codingResponse.data?.data)
        ? codingResponse.data.data
        : [];

      const mcqs = Array.isArray(mcqResponse.data?.data)
        ? mcqResponse.data.data
        : [];

      setCodingQuestions(coding);
      setMcqQuestions(mcqs);

      setCodingIds([]);
      setBitsIds([]);
    }
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    alert("Failed to load coding and MCQ questions.");
  } finally {
    setLoading(false);
  }
};



  // const loadQuestions = async () => {
  //   try {
  //     setLoading(true);

  //     const [codingResponse, mcqResponse] = await Promise.all([
  //       axios.get("http://localhost:5000/api/manager/allquestions"),
  //       axios.get("http://localhost:5000/api/manager/getallmcqs"),
  //     ]);

  //     setCodingQuestions(
  //       Array.isArray(codingResponse.data.data)
  //         ? codingResponse.data.data
  //         : []
  //     );

  //     setMcqQuestions(
  //       Array.isArray(mcqResponse.data.data)
  //         ? mcqResponse.data.data
  //         : []
  //     );
  //   } catch (error) {
  //     console.error("Failed to fetch questions:", error);
  //     alert("Failed to load coding and MCQ questions.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const toggleQuestion = (id, type) => {
    const setter =
      type === "coding" ? setCodingIds : setBitsIds;

    setter((previous) =>
      previous.includes(id)
        ? previous.filter((questionId) => questionId !== id)
        : [...previous, id]
    );
  };

  const currentQuestions =
    activeTab === "coding" ? codingQuestions : mcqQuestions;

  const selectedIds =
    activeTab === "coding" ? codingIds : bitsIds;

  const filteredQuestions = currentQuestions.filter((question) => {
    const title = question.title || question.question || "";

    return (
      title.toLowerCase().includes(search.toLowerCase()) &&
      (!difficulty || question.difficulty === difficulty)
    );
  });

 
const saveAssignment = async () => {
  if (!candidate?.id) {
    alert("Candidate ID is missing.");
    return;
  }

  if (codingIds.length < 1 || bitsIds.length < 1) {
    alert("Select at least 1 coding question and 1 MCQ.");
    return;
  }

  if (codingIds.length > 3 || bitsIds.length > 15) {
    alert("Select no more than 3 coding questions and 15 MCQs.");
    return;
  }

  try {
    await onSave({
      candidate_id: candidate.id,
      coding_question_ids: codingIds,
      bits_question_ids: bitsIds,
      completedstatus: false,
    });

    onClose();
  } catch (error) {
    console.error("Assignment failed:", error);
    alert("Failed to assign questions.");
  }
};

  if (!candidate) return null;

  const buttonStyle = {
    border: "none",
    borderRadius: "8px",
    padding: "11px 16px",
    cursor: "pointer",
    fontWeight: 600,
  };

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100vh",
        height: "100dvh",
        zIndex: 99999,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-questions-title"
        style={{
          width: "100%",
          maxWidth: "900px",
          maxHeight: "90vh",
          maxHeight: "90dvh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          flexShrink: 0,
          margin: "auto",
          boxSizing: "border-box",
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
          color: "var(--text-primary)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            padding: "22px 26px",
            borderBottom: "1px solid var(--glass-border)",
            flexShrink: 0,
          }}
        >
          <div>
            <h2
              id="assign-questions-title"
              style={{
                margin: 0,
                color: "var(--text-primary)",
              }}
            >
              Assign Assessment Questions
            </h2>

            <p
              style={{
                margin: "8px 0 0",
                color: "var(--text-secondary)",
              }}
            >
              Candidate:{" "}
              <strong>
                {candidate.fullName || candidate.name || "Unknown"}
              </strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            title="Close"
            style={{
              ...buttonStyle,
              background: "var(--glass-bg)",
              color: "var(--text-primary)",
              padding: "10px",
              flexShrink: 0,
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Selected question summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "14px",
            padding: "18px 26px",
            flexShrink: 0,
          }}
        >
          <div
            className="score"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <FaCode />
            Coding selected: {codingIds.length}
          </div>

          <div
            className="score"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <FaListAlt />
            MCQs selected: {bitsIds.length}
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            padding: "0 26px",
            borderBottom: "1px solid var(--glass-border)",
            flexShrink: 0,
            overflowX: "auto",
          }}
        >
          {[
            {
              id: "coding",
              label: `Coding Questions (${codingQuestions.length})`,
            },
            {
              id: "bits",
              label: `BITS / MCQ Questions (${mcqQuestions.length})`,
            },
          ].map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearch("");
                setDifficulty("");
              }}
              style={{
                ...buttonStyle,
                whiteSpace: "nowrap",
                borderRadius: 0,
                borderBottom:
                  activeTab === tab.id
                    ? "3px solid var(--accent)"
                    : "3px solid transparent",
                background: "transparent",
                color:
                  activeTab === tab.id
                    ? "var(--accent-light)"
                    : "var(--text-secondary)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and difficulty filters */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            padding: "18px 26px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flex: 1,
              minWidth: 0,
              padding: "0 12px",
              border: "1px solid var(--glass-border)",
              borderRadius: "8px",
              background: "var(--glass-bg)",
            }}
          >
            <FaSearch />

            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                minWidth: 0,
                padding: "12px 0",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid var(--glass-border)",
              borderRadius: "8px",
              background: "var(--glass-bg)",
              color: "var(--text-primary)",
              maxWidth: "150px",
            }}
          >
            <option value="">All Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Questions list */}
        {/* <div
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            overflowY: "auto",
            overscrollBehavior: "contain",
            padding: "0 26px 20px",
          }}
        >
          {loading ? (
            <div className="no-data">Loading questions...</div>
          ) : filteredQuestions.length === 0 ? (
            <div className="no-data">No questions found.</div>
          ) : (
            filteredQuestions.map((question) => {
              const id = question.id;
              const title = question.title || question.question;
              const isSelected = selectedIds.includes(id);

              return (
                <label
                  key={id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "16px",
                    marginBottom: "10px",
                    border: `1px solid ${
                      isSelected
                        ? "var(--accent)"
                        : "var(--glass-border)"
                    }`,
                    borderRadius: "10px",
                    background: isSelected
                      ? "var(--accent-soft)"
                      : "var(--glass-bg)",
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleQuestion(id, activeTab)}
                    disabled={saving}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong
                      style={{
                        display: "block",
                        color: "var(--text-primary)",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {title || "Untitled question"}
                    </strong>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginTop: "10px",
                      }}
                    >
                      <span className="status qualified">
                        {question.category || "General"}
                      </span>

                      <span className="status eligible">
                        {question.difficulty || "N/A"}
                      </span>

                      <span
                        className="status"
                        style={{
                          background: "var(--glass-bg)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {question.marks ?? 0} marks
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      color: "var(--text-muted)",
                      flexShrink: 0,
                    }}
                  >
                    #{id}
                  </span>
                </label>
              );
            })
          )}
        </div> */}

{/* Questions list */}
<div
  style={{
    flex: "1 1 auto",
    minHeight: 0,
    overflowY: "auto",
    overscrollBehavior: "contain",
    padding: "0 26px 20px",
  }}
>
{loading ? (
  <div className="no-data">Loading questions...</div>
) : filteredQuestions.length === 0 ? (
  <div className="no-data">
    No questions found.
  </div>
) : (
  filteredQuestions.map((question) => {
    const id = question.id;
    const title =
      question.title ||
      question.text ||
      question.question ||
      "Untitled question";

    const isSelected = selectedIds.includes(id);

    return (
      <div
        key={id}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "16px",
          marginBottom: "10px",
          border: isSelected
            ? "1px solid var(--accent-color, #6366f1)"
            : "1px solid var(--glass-border)",
          borderRadius: "10px",
          background: isSelected
            ? "var(--selected-bg, rgba(99, 102, 241, 0.12))"
            : "var(--glass-bg)",
          transition: "all 0.2s ease",
        }}
      >
        {/* Question selection checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() =>
            handleQuestionToggle(id, activeTab)
          }
          disabled={saving}
          style={{
            width: "18px",
            height: "18px",
            cursor: saving ? "not-allowed" : "pointer",
            flexShrink: 0,
            accentColor: "#6366f1",
          }}
        />

        {/* Question details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong
            style={{
              display: "block",
              color: "var(--text-primary)",
              overflowWrap: "anywhere",
            }}
          >
            {title}
          </strong>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "10px",
            }}
          >
            <span className="status qualified">
              {question.category || "General"}
            </span>

            <span className="status eligible">
              {question.difficulty || "N/A"}
            </span>

            <span className="status">
              {question.marks ?? 0} marks
            </span>
          </div>
        </div>

        <span
          style={{
            color: "var(--text-muted)",
            flexShrink: 0,
          }}
        >
          #{id}
        </span>
      </div>
    );
  })
)}
</div>


        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            padding: "18px 26px",
            borderTop: "1px solid var(--glass-border)",
            flexShrink: 0,
          }}
        >
          <span style={{ color: "var(--text-secondary)" }}>
            {codingIds.length} coding · {bitsIds.length} MCQs selected
          </span>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                ...buttonStyle,
                background: "var(--glass-bg)",
                color: "var(--text-primary)",
                border: "1px solid var(--glass-border)",
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={saveAssignment}
              disabled={loading || saving}
              style={{
                ...buttonStyle,
                background: "var(--accent)",
                color: "#fff",
                opacity: loading || saving ? 0.6 : 1,
                cursor:
                  loading || saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving..." : "Assign Questions"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default CandidateQuestionModal;