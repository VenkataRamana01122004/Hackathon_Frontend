import { useState } from "react";
import {
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaStar
} from "react-icons/fa";

import "./EmployeeReviews.css";

function EmployeeReviews() {

  const [reviews, setReviews] = useState([

    {

      id:1,

      candidate:"Rahul Sharma",

      role:"Backend Developer",

      reviewer:"Monisha",

      recommendation:"Recommend",

      technical:5,

      communication:4,

      problemSolving:5,

      teamFit:5,

      strengths:"Excellent coding skills and communication.",

      improvements:"Needs more cloud exposure.",

      comments:"Highly recommended for Backend Team.",

      status:"Pending"

    },

    {

      id:2,

      candidate:"Anjali",

      role:"Frontend Developer",

      reviewer:"Rahul",

      recommendation:"Hold",

      technical:4,

      communication:4,

      problemSolving:4,

      teamFit:3,

      strengths:"Good React knowledge.",

      improvements:"Improve system design.",

      comments:"Can be considered later.",

      status:"Pending"

    }

  ]);

  const [selectedReview,setSelectedReview]=useState(null);

  const approveCandidate=(id)=>{

      setReviews(

          reviews.map(review=>

              review.id===id

              ?

              {...review,status:"Approved"}

              :

              review

          )

      );

      alert("Candidate Approved");

  }

  const rejectCandidate=(id)=>{

      setReviews(

          reviews.map(review=>

              review.id===id

              ?

              {...review,status:"Rejected"}

              :

              review

          )

      );

      alert("Candidate Rejected");

  }

  return(

      <div className="manager-review-page">

          <div className="review-title">

              <h1>Employee Reviews</h1>

              <p>Final Hiring Decision</p>

          </div>

          <table className="review-table">

              <thead>

                  <tr>

                      <th>Candidate</th>

                      <th>Role</th>

                      <th>Reviewer</th>

                      <th>Recommendation</th>

                      <th>Status</th>

                      <th>Actions</th>

                  </tr>

              </thead>

              <tbody>

                  {

                      reviews.map(review=>(

                          <tr key={review.id}>

                              <td>{review.candidate}</td>

                              <td>{review.role}</td>

                              <td>{review.reviewer}</td>

                              <td>

                                  <span className="recommend">

                                      {review.recommendation}

                                  </span>

                              </td>

                              <td>

                                  <span className={review.status.toLowerCase()}>

                                      {review.status}

                                  </span>

                              </td>

                              <td>

                                  <button

                                      className="view-btn"

                                      onClick={()=>setSelectedReview(review)}

                                  >

                                      <FaEye/>

                                  </button>

                                  <button

                                      className="approve-btn"

                                      onClick={()=>approveCandidate(review.id)}

                                  >

                                      <FaCheckCircle/>

                                  </button>

                                  <button

                                      className="reject-btn"

                                      onClick={()=>rejectCandidate(review.id)}

                                  >

                                      <FaTimesCircle/>

                                  </button>

                              </td>

                          </tr>

                      ))

                  }

              </tbody>

          </table>

          {

              selectedReview &&

              <div className="popup">

                  <div className="popup-card">

                      <h2>

                          {selectedReview.candidate}

                      </h2>

                      <h4>

                          {selectedReview.role}

                      </h4>

                      <hr/>

                      <p>

                          <FaStar/> Technical :

                          {selectedReview.technical}

                      </p>

                      <p>

                          <FaStar/> Communication :

                          {selectedReview.communication}

                      </p>

                      <p>

                          <FaStar/> Problem Solving :

                          {selectedReview.problemSolving}

                      </p>

                      <p>

                          <FaStar/> Team Fit :

                          {selectedReview.teamFit}

                      </p>

                      <hr/>

                      <p>

                          <strong>Strengths</strong>

                      </p>

                      <p>

                          {selectedReview.strengths}

                      </p>

                      <p>

                          <strong>Areas for Improvement</strong>

                      </p>

                      <p>

                          {selectedReview.improvements}

                      </p>

                      <p>

                          <strong>Comments</strong>

                      </p>

                      <p>

                          {selectedReview.comments}

                      </p>

                      <button

                          onClick={()=>setSelectedReview(null)}

                      >

                          Close

                      </button>

                  </div>

              </div>

          }

      </div>

  );

}

export default EmployeeReviews;