import { useState } from "react";
import {
  FaTimes,
  FaUserTie,
  FaCalendarAlt,
  FaStickyNote
} from "react-icons/fa";

import "./AssignReviewerModal.css";

function AssignReviewerModal({
  candidate,
  onClose,
  onAssign
}) {

  if (!candidate) return null;

  const [reviewer, setReviewer] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [comments, setComments] = useState("");

  const employees = [

    {
      id:"EMP001",
      name:"Rahul Verma",
      designation:"Frontend Lead"
    },

    {
      id:"EMP002",
      name:"Anjali Singh",
      designation:"Backend Lead"
    },

    {
      id:"EMP003",
      name:"Monisha",
      designation:"AI Engineer"
    },

    {
      id:"EMP004",
      name:"Peter",
      designation:"QA Lead"
    }

  ];

  const handleAssign=()=>{

      if(!reviewer){

          alert("Select reviewer");

          return;

      }

      if(!deadline){

          alert("Select deadline");

          return;

      }

      onAssign({

          ...candidate,

          reviewer,

          deadline,

          priority,

          comments,

          reviewStatus:"Assigned"

      });

      onClose();

  }

  return(

      <div className="review-overlay">

          <div className="review-modal">

              <div className="review-header">

                  <h2>Assign Reviewer</h2>

                  <button onClick={onClose}>

                      <FaTimes/>

                  </button>

              </div>

              <div className="candidate-review-card">

                  <h3>{candidate.name}</h3>

                  <p>{candidate.assignedRole}</p>

              </div>

              <div className="review-body">

                  <div className="review-group">

                      <label>

                          <FaUserTie/>

                          Reviewer

                      </label>

                      <select

                          value={reviewer}

                          onChange={(e)=>setReviewer(e.target.value)}

                      >

                          <option value="">Select Employee</option>

                          {

                              employees.map(emp=>(

                                  <option
                                    key={emp.id}
                                    value={emp.name}
                                  >

                                      {emp.name} - {emp.designation}

                                  </option>

                              ))

                          }

                      </select>

                  </div>

                  <div className="review-group">

                      <label>

                          <FaCalendarAlt/>

                          Review Deadline

                      </label>

                      <input

                          type="date"

                          value={deadline}

                          onChange={(e)=>setDeadline(e.target.value)}

                      />

                  </div>

                  <div className="review-group">

                      <label>

                          Priority

                      </label>

                      <select

                          value={priority}

                          onChange={(e)=>setPriority(e.target.value)}

                      >

                          <option>High</option>

                          <option>Medium</option>

                          <option>Low</option>

                      </select>

                  </div>

                  <div className="review-group">

                      <label>

                          <FaStickyNote/>

                          Manager Notes

                      </label>

                      <textarea

                          rows="4"

                          value={comments}

                          onChange={(e)=>setComments(e.target.value)}

                      />

                  </div>

              </div>

              <div className="review-footer">

                  <button

                      className="assign-btn"

                      onClick={handleAssign}

                  >

                      Assign Reviewer

                  </button>

              </div>

          </div>

      </div>

  );

}

export default AssignReviewerModal;