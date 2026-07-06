import React from 'react'
import { Link } from 'react-router-dom'

function CandidateHome() {
  return (
    <div>CandidateHome
      <br/>
      <Link to="interviewpanel">MCQ</Link>
      <Link to="interviewpanel">Compiler</Link>
      <Link to="interviewpanel">Interview</Link>
    </div>
  )
}

export default CandidateHome