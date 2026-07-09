import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const questions = [
  {
    title: "Sum of Two Integers",
    description: "Write a program to print the sum of two integers.",
    input: "Two integers",
    output: "Print their sum.",
    sampleInput: "5 10",
    sampleOutput: "15",
    constraints: "1 ≤ N ≤ 10⁹",
    starterCode: {
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {

    }
}`,
      c: `#include<stdio.h>

int main() {

    return 0;
}`,
      python: `a, b = map(int, input().split())

print(a + b)`
    }
  },

  {
    title: "Largest of Three Numbers",
    description: "Write a program to print the largest among three integers.",
    input: "Three integers",
    output: "Print the largest integer.",
    sampleInput: "10 25 8",
    sampleOutput: "25",
    constraints: "-10⁹ ≤ N ≤ 10⁹",
    starterCode: {
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {

    }
}`,
      c: `#include<stdio.h>

int main() {

    return 0;
}`,
      python: ``
    }
  },

  {
    title: "Reverse a String",
    description: "Write a program to reverse a given string.",
    input: "A single string",
    output: "Reversed string",
    sampleInput: "hello",
    sampleOutput: "olleh",
    constraints: "Length ≤ 1000",
    starterCode: {
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {

    }
}`,
      c: `#include<stdio.h>

int main() {

    return 0;
}`,
      python: ``
    }
  }
];

function AssignmentPanel() {

const submittedRef = useRef(false);
const tabSwitchCountRef = useRef(0);
const [tabSwitchCount, setTabSwitchCount] = useState(0);
const assignmentStartRef = useRef(null);
const [started, setStarted] = useState(false);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [language, setLanguage] = useState("java");

  const [code, setCode] = useState(
    questions[0].starterCode.java
  );

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const currentQuestion = questions[questionIndex];

  useEffect(() => {
  if (!started) return;

  const forceFullscreen = async () => {
    if (!document.fullscreenElement && !submittedRef.current) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {}
    }
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      forceFullscreen();
    }
  };

  document.addEventListener(
    "fullscreenchange",
    handleFullscreenChange
  );

  const interval = setInterval(() => {
    if (!document.fullscreenElement && !submittedRef.current) {
      forceFullscreen();
    }
  }, 1000);

  return () => {
    document.removeEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );
    clearInterval(interval);
  };
}, [started]);

useEffect(() => {
  const handleVisibility = () => {
    if (document.hidden) {
      tabSwitchCountRef.current++;

      setTabSwitchCount(tabSwitchCountRef.current);

      if (
        tabSwitchCountRef.current >= 3 &&
        !submittedRef.current
      ) {
        alert("Maximum tab switches exceeded.");

        submitCode(true);
      }
    }
  };

  document.addEventListener(
    "visibilitychange",
    handleVisibility
  );

  return () =>
    document.removeEventListener(
      "visibilitychange",
      handleVisibility
    );
}, []);


const submitCode = async (auto = false) => {
  if (submittedRef.current) return;

  submittedRef.current = true;

  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }

    await axios.post(
      "http://localhost:5000/api/interview/submitAssignment",
      {
        language,
        code,
        question: currentQuestion,
        tabSwitchCount: tabSwitchCountRef.current,
        assignmentStartTime:
          assignmentStartRef.current,
        assignmentEndTime:
          new Date().toISOString(),
      }
    );

    if (auto) {
      alert(
        "Assignment auto-submitted due to excessive tab switching."
      );
    } else {
      alert("Assignment Submitted Successfully");
    }

    // navigate("/candidate");
  } catch (err) {
    console.log(err);
    alert("Submission Failed");
  }
};

  const startAssignment = async () => {
  assignmentStartRef.current = new Date().toISOString();

  try {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
  } catch (err) {
    console.log(err);
  }

  setStarted(true);
};

  const handleQuestionChange = (index) => {
    setQuestionIndex(index);
    setCode(questions[index].starterCode[language] || "");
    setOutput("");
    setInput("");
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(currentQuestion.starterCode[lang] || "");
  };

  const runCode = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/interview/compile",
        {
          language,
          code,
          input,
        }
      );

      setOutput(res.data.output);
    } catch (err) {
      setOutput(
        err.response?.data?.error ||
          err.response?.data?.output ||
          "Compilation Failed"
      );
    }
  };

if (!started) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
      }}
    >
      <h1>Coding Assignment</h1>

      <button onClick={startAssignment}>
        Start Assignment
      </button>
    </div>
  );
}else{
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Arial",
      }}
    >
      {/* LEFT PANEL */}
      <div
        style={{
          width: "40%",
          borderRight: "1px solid gray",
          padding: 20,
          overflowY: "auto",
        }}
      >
        <h2>Coding Assignment</h2>
        <h3>
    Tab Switch Count : {tabSwitchCount} / 3
</h3>

        <div style={{ marginBottom: 20 }}>
          <label>Select Question : </label>

          <select
            value={questionIndex}
            onChange={(e) =>
              handleQuestionChange(Number(e.target.value))
            }
          >
            {questions.map((q, index) => (
              <option key={index} value={index}>
                Question {index + 1}
              </option>
            ))}
          </select>
        </div>

        <h3>{currentQuestion.title}</h3>

        <p>{currentQuestion.description}</p>

        <h3>Input</h3>
        <p>{currentQuestion.input}</p>

        <h3>Output</h3>
        <p>{currentQuestion.output}</p>

        <h3>Sample Input</h3>

        <pre>{currentQuestion.sampleInput}</pre>

        <h3>Sample Output</h3>

        <pre>{currentQuestion.sampleOutput}</pre>

        <h3>Constraints</h3>

        <p>{currentQuestion.constraints}</p>
      </div>

      {/* RIGHT PANEL */}
      <div
        style={{
          width: "60%",
          padding: 20,
        }}
      >
        <div style={{ marginBottom: 15 }}>
          <label>Language : </label>

          <select
            value={language}
            onChange={(e) =>
              handleLanguageChange(e.target.value)
            }
          >
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="python">Python</option>
          </select>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{
            width: "100%",
            height: 300,
            fontFamily: "monospace",
            fontSize: 15,
          }}
        />

        <h3>Custom Input</h3>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            width: "100%",
            height: 80,
          }}
        />

        <div style={{ marginTop: 15 }}>
          <button onClick={runCode}>
            Run Code
          </button>

          <button
            onClick={submitCode}
            style={{ marginLeft: 10 }}
          >
            Submit
          </button>
        </div>

        <h3>Output</h3>

        <pre
          style={{
            background: "#111",
            color: "lime",
            padding: 10,
            minHeight: 120,
          }}
        >
          {output}
        </pre>
      </div>
    </div>
  );}
}

export default AssignmentPanel;