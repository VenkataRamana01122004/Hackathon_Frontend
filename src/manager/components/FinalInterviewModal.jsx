// import { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   FaTimes,
//   FaUsers,
//   FaCalendarAlt,
//   FaClock,
//   FaVideo,
//   FaStickyNote
// } from "react-icons/fa";

// import "./FinalInterviewModal.css";

// function FinalInterviewModal({ candidate, onClose, onSchedule }) {

//   if (!candidate) return null;

//   const [panel, setPanel] = useState([]);
//   const [date, setDate] = useState("");
//   const [time, setTime] = useState("");
//   const [mode, setMode] = useState("Google Meet");
//   const [remarks, setRemarks] = useState("");

//   const [employees, setEmployees] = useState([]);

//     useEffect(() => {
//     fetchEmployees();
//   }, []);

//   const fetchEmployees = async () => {
//     try {
//       const response = await axios.get(
//         "http://localhost:5000/api/manager/viewemployee"
//       );

//       setEmployees(response.data);
//     } catch (error) {
//       console.error("Error fetching employees:", error);
//     }
//   };

//   const toggleEmployee = (employee) => {
//     if (panel.includes(employee)) {
//       setPanel(panel.filter((e) => e !== employee));
//     } else {
//       setPanel([...panel, employee]);
//     }
//   };

//   const handleSubmit = () => {

//     if(panel.length===0){

//       alert("Please select interview panel.");

//       return;

//     }

//     if(!date || !time){

//       alert("Please select date and time.");

//       return;

//     }

//     onSchedule({
//       ...candidate,
//       panel,
//       date,
//       time,
//       mode,
//       remarks
//     });

//     onClose();

//   };

//   return (

//     <div className="final-overlay">

//       <div className="final-modal">

//         <div className="final-header">

//           <h2>Final Interview</h2>

//           <button onClick={onClose}>
//             <FaTimes/>
//           </button>

//         </div>

//         <div className="candidate-banner">

//           <h3>{candidate.name}</h3>

//           <span>{candidate.assignedRole || candidate.role}</span>

//         </div>

//         <div className="final-body">

//           <div className="field">

//             <label>

//               <FaUsers/>

//               Interview Panel

//             </label>

//             <div className="employee-list">

//               {employees.map(emp => (

//                 <label key={emp}>

//                   <input
//                     type="checkbox"
//                     checked={panel.includes(emp)}
//                     onChange={() => toggleEmployee(emp)}
//                   />

//                   {emp.fullName}

//                 </label>

//               ))}

//             </div>

//           </div>

//           <div className="two-column">

//             <div className="field">

//               <label>

//                 <FaCalendarAlt/>

//                 Interview Date

//               </label>

//               <input
//                 type="date"
//                 value={date}
//                 onChange={(e)=>setDate(e.target.value)}
//               />

//             </div>

//             <div className="field">

//               <label>

//                 <FaClock/>

//                 Interview Time

//               </label>

//               <input
//                 type="time"
//                 value={time}
//                 onChange={(e)=>setTime(e.target.value)}
//               />

//             </div>

//           </div>

//           {/* <div className="field">

//             <label>

//               <FaVideo/>

//               Interview Mode

//             </label>

//             <select
//               value={mode}
//               onChange={(e)=>setMode(e.target.value)}
//             >

//               <option>Google Meet</option>

//               <option>Microsoft Teams</option>

//               <option>Zoom</option>

//               <option>Offline</option>

//             </select>

//           </div> */}

//           {/* <div className="field">

//             <label>

//               <FaStickyNote/>

//               Remarks

//             </label>

//             <textarea

//               rows="4"

//               value={remarks}

//               onChange={(e)=>setRemarks(e.target.value)}

//             />

//           </div> */}

//         </div>

//         <div className="final-footer">

//           <button
//             className="schedule-final-btn"
//             onClick={handleSubmit}
//           >

//             Schedule Final Interview

//           </button>

//         </div>

//       </div>

//     </div>

//   );

// }

// export default FinalInterviewModal;


import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaTimes,
  FaUsers,
  FaCalendarAlt,
  FaClock
} from "react-icons/fa";

import "./FinalInterviewModal.css";

function FinalInterviewModal({ candidate, onClose, onSchedule }) {
  if (!candidate) return null;

  // Changed from array panel to a single assignedEmployeeId string
  const [assignedEmployeeId, setAssignedEmployeeId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/manager/viewemployee"
      );
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleSubmit = async () => {
    if (!assignedEmployeeId) {
      alert("Please select an assigned employee.");
      return;
    }

    if (!date || !time) {
      alert("Please select date and time.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/manager/schedule/${candidate.candidateId}`,
        {
          date,
          time,
          assignedEmployeeId,
        }
      );

      // alert("Interview scheduled successfully!");
      onSchedule(response.data.candidate);
      onClose();
    } catch (error) {
      console.error("Error scheduling interview:", error);
      alert("Failed to schedule interview.");
    }
  };

  return (
    <div className="final-overlay">
      <div className="final-modal">
        <div className="final-header">
          <h2>Final Interview</h2>
          <button onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="candidate-banner">
          <h3>{candidate.fullName || candidate.name}</h3>
          <span>{candidate.appliedRole || candidate.role}</span>
        </div>

        <div className="final-body">
          <div className="field">
            <label>
              <FaUsers />
              Assigned Employee
            </label>
            <select
              value={assignedEmployeeId}
              onChange={(e) => setAssignedEmployeeId(e.target.value)}
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id || emp.employeeId} value={emp.employeeId || emp.id}>
                  {emp.fullName} ({emp.employeeId || emp.id})
                </option>
              ))}
            </select>
          </div>

          <div className="two-column">
            <div className="field">
              <label>
                <FaCalendarAlt />
                Interview Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="field">
              <label>
                <FaClock />
                Interview Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="final-footer">
          <button className="schedule-final-btn" onClick={handleSubmit}>
            Schedule Final Interview
          </button>
        </div>
      </div>
    </div>
  );
}

export default FinalInterviewModal;