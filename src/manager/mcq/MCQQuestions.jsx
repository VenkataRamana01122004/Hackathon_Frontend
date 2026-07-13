import { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaEye } from "react-icons/fa";

import "./MCQQuestions.css";

import AddMCQModal from "./AddMCQModal";
import ViewMCQModal from "./ViewMCQModal";

function MCQQuestions() {

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
        q.question.toLowerCase().includes(search.toLowerCase())
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
        "http://localhost:5000/manager/getallmcqs"
      );

      setQuestions(response.data);

    } catch (err) {

      console.log(err);

    }

  };

  const viewMCQ = async (id) => {

    try {

      const response = await axios.get(
        `http://localhost:5000/manager/getmcqbyid/${id}`
      );

      setSelectedQuestion(response.data);

      setShowView(true);

    } catch (err) {

      console.log(err);

    }

  };

  return (

    <div className="coding-page">

      <div className="coding-header">

        <h1>MCQ Questions</h1>

        <button
          className="primary-btn"
          onClick={() => setShowAdd(true)}
        >
          <FaPlus />
          Add MCQ
        </button>

      </div>

      <div className="coding-toolbar">

        <input
          placeholder="Search Question"
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />

        <select
          value={difficulty}
          onChange={(e)=>setDifficulty(e.target.value)}
        >

          <option value="">All Difficulty</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>

        </select>

        <input
          placeholder="Category"
          value={category}
          onChange={(e)=>setCategory(e.target.value)}
        />

      </div>

      <div className="coding-table">

        <table>

          <thead>

          <tr>

            <th>Question</th>

            <th>Category</th>

            <th>Difficulty</th>

            <th>Marks</th>

            <th>Type</th>

            <th>Status</th>

            <th>Action</th>

          </tr>

          </thead>

          <tbody>

          {filteredQuestions.map((mcq)=>(

            <tr key={mcq.id}>

              <td>{mcq.question}</td>

              <td>{mcq.category}</td>

              <td>{mcq.difficulty}</td>

              <td>{mcq.marks}</td>

              <td>{mcq.questionType}</td>

              <td>

                <span
                  className={
                    mcq.isActive
                    ? "status active"
                    : "status inactive"
                  }
                >

                  {mcq.isActive ? "Active" : "Inactive"}

                </span>

              </td>

              <td>

                <button
                  className="icon-btn"
                  onClick={()=>viewMCQ(mcq.id)}
                >

                  <FaEye/>

                </button>

              </td>

            </tr>

          ))}

          </tbody>

        </table>

      </div>

      {showAdd &&

        <AddMCQModal

          close={()=>setShowAdd(false)}

          refresh={loadQuestions}

        />

      }

      {showView &&

        <ViewMCQModal

          question={selectedQuestion}

          close={()=>setShowView(false)}

        />

      }

    </div>

  );

}

export default MCQQuestions;