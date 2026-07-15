import { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaEye } from "react-icons/fa";

import "./CodingQuestions.css";

import AddQuestionModal from "./AddQuestionModal";
import ViewQuestionModal from "./ViewQuestionModal";

function CodingQuestions() {

  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [category, setCategory] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState(false);

  const [selectedQuestion, setSelectedQuestion] = useState(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {

    let data = [...questions];

    if (search !== "") {

      data = data.filter((q) =>
        q.title.toLowerCase().includes(search.toLowerCase())
      );

    }

    if (difficulty !== "") {

      data = data.filter(
        (q) => q.difficulty === difficulty
      );

    }

    if (category !== "") {

      data = data.filter(
        (q) => q.category === category
      );

    }

    setFilteredQuestions(data);

  }, [questions, search, difficulty, category]);

  const loadQuestions = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/manager/allquestions"
      );

      setQuestions(response.data);

    } catch (err) {

      console.log(err);

    }

  };

  const viewQuestion = async (id) => {

    try {

      const response = await axios.get(
        `http://localhost:5000/manager/questionbyid/${id}`
      );

      setSelectedQuestion(response.data);

      setShowView(true);

    } catch (err) {

      console.log(err);

    }

  };

  return (

    <div className="coding-page">

      <div className="manager-page-header">

        <div>
          <h1>Coding Questions</h1>
          <p>Manage coding challenges and test cases</p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowAdd(true)}
        >
          <FaPlus />
          Add Question
        </button>

      </div>

      <div className="manager-toolbar">

        <input
          placeholder="Search question..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >

          <option value="">All Difficulty</option>

          <option>Easy</option>

          <option>Medium</option>

          <option>Hard</option>

        </select>

        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

      </div>

      <div className="manager-table-card">

        <table className="manager-table">

          <thead>

            <tr>

              <th>Title</th>

              <th>Category</th>

              <th>Difficulty</th>

              <th>Marks</th>

              <th>Time</th>

              <th>Status</th>

              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            {filteredQuestions.map((question) => (

              <tr key={question.id}>

                <td>{question.title}</td>

                <td>{question.category}</td>

                <td>{question.difficulty}</td>

                <td>{question.marks}</td>

                <td>{question.timeLimit} sec</td>

                <td>

                  <span
                    className={
                      question.isActive
                        ? "status active"
                        : "status inactive"
                    }
                  >
                    {question.isActive ? "Active" : "Inactive"}
                  </span>

                </td>

                <td>

                  <button
                    className="icon-btn"
                    onClick={() => viewQuestion(question.id)}
                  >

                    <FaEye />

                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {showAdd && (

        <AddQuestionModal

          close={() => setShowAdd(false)}

          refresh={loadQuestions}

        />

      )}

      {showView && (

        <ViewQuestionModal

          question={selectedQuestion}

          close={() => setShowView(false)}

        />

      )}

    </div>

  );

}

export default CodingQuestions;