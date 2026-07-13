import { useState } from "react";
import axios from "axios";

function AddMCQModal({ close, refresh }) {

  const [question, setQuestion] = useState("");

  const [questionType, setQuestionType] = useState("SINGLE");

  const [difficulty, setDifficulty] = useState("Easy");

  const [category, setCategory] = useState("");

  const [marks, setMarks] = useState(1);

  const [negativeMarks, setNegativeMarks] = useState(0);

  const [isActive, setIsActive] = useState(true);

  const [options, setOptions] = useState([
    "",
    "",
    "",
    ""
  ]);

  const [correctAnswers, setCorrectAnswers] = useState([]);

  const handleOptionChange = (index, value) => {

    const arr = [...options];

    arr[index] = value;

    setOptions(arr);

  };

  const handleCorrectAnswer = (index) => {

    if (questionType === "SINGLE") {

      setCorrectAnswers([index]);

      return;

    }

    if (correctAnswers.includes(index)) {

      setCorrectAnswers(

        correctAnswers.filter((i) => i !== index)

      );

    } else {

      setCorrectAnswers([

        ...correctAnswers,

        index,

      ]);

    }

  };

  const saveMCQ = async () => {

    if (question.trim() === "") {

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

      await axios.post(

        "http://localhost:5000/manager/createmcq",

        {

          question,

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

      alert("MCQ Added Successfully");

      refresh();

      close();

    }

    catch (err) {

      console.log(err);

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

            value={question}

            onChange={(e)=>setQuestion(e.target.value)}

          />

          <div className="grid-2">

            <div>

              <label>Question Type</label>

              <select

                value={questionType}

                onChange={(e)=>{

                  setQuestionType(e.target.value);

                  setCorrectAnswers([]);

                }}

              >

                <option value="SINGLE">

                  Single Choice

                </option>

                <option value="MULTIPLE">

                  Multiple Choice

                </option>

              </select>

            </div>

            <div>

              <label>Category</label>

              <input

                value={category}

                onChange={(e)=>setCategory(e.target.value)}

              />

            </div>

          </div>

          <div className="grid-2">

            <div>

              <label>Difficulty</label>

              <select

                value={difficulty}

                onChange={(e)=>setDifficulty(e.target.value)}

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

                onChange={(e)=>setMarks(e.target.value)}

              />

            </div>

          </div>

          <label>Negative Marks</label>

          <input

            type="number"

            value={negativeMarks}

            onChange={(e)=>setNegativeMarks(e.target.value)}

          />

          <h3 style={{marginTop:"20px"}}>

            Options

          </h3>

          {

            options.map((option,index)=>(

              <div

                key={index}

                style={{

                  display:"flex",

                  alignItems:"center",

                  gap:"10px",

                  marginBottom:"12px"

                }}

              >

                {

                  questionType==="SINGLE"

                  ?

                  <input

                    type="radio"

                    checked={

                      correctAnswers.includes(index)

                    }

                    onChange={()=>handleCorrectAnswer(index)}

                  />

                  :

                  <input

                    type="checkbox"

                    checked={

                      correctAnswers.includes(index)

                    }

                    onChange={()=>handleCorrectAnswer(index)}

                  />

                }

                <input

                  style={{flex:1}}

                  placeholder={`Option ${index+1}`}

                  value={option}

                  onChange={(e)=>

                    handleOptionChange(

                      index,

                      e.target.value

                    )

                  }

                />

              </div>

            ))

          }

          <label className="checkbox">

            <input

              type="checkbox"

              checked={isActive}

              onChange={(e)=>setIsActive(e.target.checked)}

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

            onClick={saveMCQ}

          >

            Save MCQ

          </button>

        </div>

      </div>

    </div>

  );

}

export default AddMCQModal;