import { useState } from "react";
import { FaTimes, FaStar } from "react-icons/fa";
import "./ReviewModal.css";

function ReviewModal({ candidate, onClose }) {

  if (!candidate) return null;

  const [technical, setTechnical] = useState(3);
  const [communication, setCommunication] = useState(3);
  const [problemSolving, setProblemSolving] = useState(3);
  const [teamFit, setTeamFit] = useState(3);

  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [comments, setComments] = useState("");
  const [recommendation, setRecommendation] = useState("Recommend");

  const submitReview = () => {

    const review = {

      candidateId: candidate.id,

      technical,

      communication,

      problemSolving,

      teamFit,

      strengths,

      improvements,

      comments,

      recommendation

    };

    console.log(review);

    alert("Review Submitted Successfully");

    onClose();

  };

  const Rating = ({ value, setValue }) => (

    <div className="rating">

      {[1,2,3,4,5].map((star)=>(

        <FaStar

          key={star}

          className={star<=value ? "filled":"empty"}

          onClick={()=>setValue(star)}

        />

      ))}

    </div>

  );

  return (

    <div className="review-overlay">

      <div className="review-modal">

        <div className="review-header">

          <h2>Candidate Review</h2>

          <button onClick={onClose}>
            <FaTimes/>
          </button>

        </div>

        <div className="candidate-info">

          <h3>{candidate.name}</h3>

          <p>{candidate.role}</p>

        </div>

        <div className="review-body">

          <div className="rating-row">

            <label>Technical Skills</label>

            <Rating
              value={technical}
              setValue={setTechnical}
            />

          </div>

          <div className="rating-row">

            <label>Communication</label>

            <Rating
              value={communication}
              setValue={setCommunication}
            />

          </div>

          <div className="rating-row">

            <label>Problem Solving</label>

            <Rating
              value={problemSolving}
              setValue={setProblemSolving}
            />

          </div>

          <div className="rating-row">

            <label>Team Fit</label>

            <Rating
              value={teamFit}
              setValue={setTeamFit}
            />

          </div>

          <div className="form-group">

            <label>Strengths</label>

            <textarea
              rows="3"
              value={strengths}
              onChange={(e)=>setStrengths(e.target.value)}
            />

          </div>

          <div className="form-group">

            <label>Areas for Improvement</label>

            <textarea
              rows="3"
              value={improvements}
              onChange={(e)=>setImprovements(e.target.value)}
            />

          </div>

          <div className="form-group">

            <label>Additional Comments</label>

            <textarea
              rows="3"
              value={comments}
              onChange={(e)=>setComments(e.target.value)}
            />

          </div>

          <div className="form-group">

            <label>Recommendation</label>

            <select
              value={recommendation}
              onChange={(e)=>setRecommendation(e.target.value)}
            >

              <option>Recommend</option>

              <option>Hold</option>

              <option>Reject</option>

            </select>

          </div>

        </div>

        <div className="review-footer">

          <button
            className="submit-review-btn"
            onClick={submitReview}
          >

            Submit Review

          </button>

        </div>

      </div>

    </div>

  );

}

export default ReviewModal;