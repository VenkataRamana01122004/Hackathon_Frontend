import React from 'react'
import { Link } from 'react-router-dom'

function CandidateHome() {
  return (
    <div>CandidateHome
      <br/>
      <Link to="assignment">Assignment</Link>&nbsp;&nbsp;&nbsp;&nbsp;
      <Link to="assignment">Compiler</Link>&nbsp;&nbsp;&nbsp;&nbsp;
      <Link to="interviewpanel">Interview</Link>
    </div>
  )
}

export default CandidateHome