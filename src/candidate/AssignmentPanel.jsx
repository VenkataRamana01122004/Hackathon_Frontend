import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const originalQuestions = [
  {
    id: 1, // Added explicit ID for structural mapping
    title: "Sum of Two Integers",
    description: "Write a program to print the sum of two integers.",
    input: "Two integers",
    output: "Print their sum.",
    sampleInput: "5 10",
    sampleOutput: "15",
    constraints: "1 ≤ N ≤ 10⁹",
    starterCode: {
      java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n\n    }\n}`,
      c: `#include<stdio.h>\n\nint main() {\n\n    return 0;\n}`,
      python: `a, b = map(int, input().split())\nprint(a + b)`
    }
  },
  {
    id: 2, // Added explicit ID for structural mapping
    title: "Largest of Three Numbers",
    description: "Write a program to print the largest among three integers.",
    input: "Three integers",
    output: "Print the largest integer.",
    sampleInput: "10 25 8",
    sampleOutput: "25",
    constraints: "-10⁹ ≤ N ≤ 10⁹",
    starterCode: {
      java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n\n    }\n}`,
      c: `#include<stdio.h>\n\nint main() {\n\n    return 0;\n}`,
      python: `a = int(input())\n# Complete code`
    }
  },
  {
    id: 3, // Added explicit ID for structural mapping
    title: "Reverse a String",
    description: "Write a program to reverse a given string.",
    input: "A single string",
    output: "Reversed string",
    sampleInput: "hello",
    sampleOutput: "olleh",
    constraints: "Length ≤ 1000",
    starterCode: {
      java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n\n    }\n}`,
      c: `#include<stdio.h>\n\nint main() {\n\n    return 0;\n}`,
      python: `s = input()\nprint(s[::-1])`
    }
  }
];

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const ASSIGNMENT_DURATION_SECONDS = 300; 

function AssignmentPanel() {
  // --- STATE ---

  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem("user"));

  const [questions, setQuestions] = useState([]);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ASSIGNMENT_DURATION_SECONDS);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [systemInfo, setSystemInfo] = useState({});
  const [submitting, setSubmitting] = useState(false); 

  const submittedRef = useRef(false);
  const assignmentStartRef = useRef(null);
  const tabSwitchCountRef = useRef(0);
  const blurCountRef = useRef(0);
  const fullscreenExitCountRef = useRef(0);
  const keyboardLogsRef = useRef([]);
  const mouseClickCountRef = useRef(0);
  const mouseMoveCountRef = useRef(0);
  const copyAttemptsRef = useRef(0);
  const cutAttemptsRef = useRef(0);
  const pasteAttemptsRef = useRef(0);
  const rightClickAttemptsRef = useRef(0);
  const blockedShortcutAttemptsRef = useRef(0);
  const idleTimeSecondsRef = useRef(0);
  const lastActivityTimeRef = useRef(Date.now());
  const ignoreNextFullscreenExitRef = useRef(false);

  // Media Capture Refs
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const videoPreviewRef = useRef(null);

  const [metrics, setMetrics] = useState({
    tabSwitches: 0,
    blurEvents: 0,
    fullscreenExits: 0,
    copyAttempts: 0,
    cutAttempts: 0,
    pasteAttempts: 0,
    rightClicks: 0,
    mouseClicks: 0,
    mouseMoves: 0,
    keyPresses: 0,
    blockedShortcuts: 0,
    idleTime: 0
  });

  const currentQuestion = questions[questionIndex];

  // Initialize and Shuffle Questions once
  useEffect(() => {
    const randomized = shuffleArray(originalQuestions);
    setQuestions(randomized);
    
    setSystemInfo({
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      cores: navigator.hardwareConcurrency || "N/A"
    });
  }, []);

  // Handle starter code loading & LocalStorage state recovery
  useEffect(() => {
    if (questions.length === 0) return;

    const savedCode = localStorage.getItem(`saved_code_q_${questionIndex}_${language}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(questions[questionIndex]?.starterCode[language] || "");
    }
  }, [questionIndex, language, questions]);

  // Background Auto-Save to LocalStorage on keystroke change
  useEffect(() => {
    if (started && currentQuestion) {
      localStorage.setItem(`saved_code_q_${questionIndex}_${language}`, code);
    }
  }, [code, started, questionIndex, language]);

  const syncMetrics = () => {
    setMetrics({
      tabSwitches: tabSwitchCountRef.current,
      blurEvents: blurCountRef.current,
      fullscreenExits: fullscreenExitCountRef.current,
      copyAttempts: copyAttemptsRef.current,
      cutAttempts: cutAttemptsRef.current,
      pasteAttempts: pasteAttemptsRef.current,
      rightClicks: rightClickAttemptsRef.current,
      mouseClicks: mouseClickCountRef.current,
      mouseMoveCount: mouseMoveCountRef.current,
      keyPresses: keyboardLogsRef.current.length,
      blockedShortcuts: blockedShortcutAttemptsRef.current,
      idleTime: idleTimeSecondsRef.current
    });
  };

  // --- MEDIA RECORDING CORE ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }

      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.start(1000); 
    } catch (err) {
      console.error("Camera/Microphone access was denied or unavailable:", err);
      alert("Camera and Microphone permissions are strictly mandatory for this exam.");
    }
  };

  const stopRecordingAndGetBlob = () => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.onstop = () => {
          const videoBlob = new Blob(recordedChunksRef.current, { type: "video/webm" });
          resolve(videoBlob);
        };
        mediaRecorderRef.current.stop();
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
      } else {
        resolve(null);
      }
    });
  };

  // --- ASSIGNMENT SUBMISSION ---
  const submitCode = async (reason = "manual") => {
    if (submittedRef.current || submitting) return;
    submittedRef.current = true;
    setSubmitting(true);

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }

      // Stop recording and retrieve binary video evidence
      const videoBlob = await stopRecordingAndGetBlob();

      // Compile ALL compilation answers written by candidate from LocalStorage
      const answersPayload = questions.map((q, idx) => {
        // Fallback checks across all languages if the user worked on alternative sets
        const activeLang = idx === questionIndex ? language : "java"; 
        const cachedJava = localStorage.getItem(`saved_code_q_${idx}_java`);
        const cachedC = localStorage.getItem(`saved_code_q_${idx}_c`);
        const cachedPython = localStorage.getItem(`saved_code_q_${idx}_python`);

        // Check which language has text stored, fallback to original runtime context
        let chosenLanguage = "java";
        let finalCode = q.starterCode["java"];

        if (idx === questionIndex) {
          chosenLanguage = language;
          finalCode = code;
        } else if (cachedPython) {
          chosenLanguage = "python";
          finalCode = cachedPython;
        } else if (cachedC) {
          chosenLanguage = "c";
          finalCode = cachedC;
        } else if (cachedJava) {
          chosenLanguage = "java";
          finalCode = cachedJava;
        }

       return {
          questionId: q.id,
          title: q.title,
          description: q.description,
          language: chosenLanguage,
          code: finalCode
      };
      });

      const payload = {
        username:user.id,
        candidate:user.fullName,
        answers: answersPayload, // Added comprehensive structured array matching criteria
        assignmentStartTime: assignmentStartRef.current,
        assignmentEndTime: new Date().toISOString(),
        totalTime: Date.now() - new Date(assignmentStartRef.current).getTime(),
        submitReason: reason,
        timerExpired: reason === "timeout",
        candidateSystemInfo: systemInfo,
        proctoring: {
          tabSwitchCount: tabSwitchCountRef.current,
          blurCount: blurCountRef.current,
          fullscreenExitCount: fullscreenExitCountRef.current,
          mouseClicks: mouseClickCountRef.current,
          mouseMoveCount: mouseMoveCountRef.current,
          copyAttempts: copyAttemptsRef.current,
          cutAttempts: cutAttemptsRef.current,
          pasteAttempts: pasteAttemptsRef.current,
          rightClickAttempts: rightClickAttemptsRef.current,
          totalKeyPresses: keyboardLogsRef.current.length,
          keyboardLogs: keyboardLogsRef.current,
          idleTimeSeconds: idleTimeSecondsRef.current,
          blockedShortcutAttempts: blockedShortcutAttemptsRef.current
        }
      };

      // Construct Multi-part FormData for payload processing + direct video upload
      const formData = new FormData();
      formData.append("metadata", JSON.stringify(payload));
      if (videoBlob) {
        formData.append("evidenceVideo", videoBlob, "exam_recording.webm");
      }

      console.log("Submitting Final Compiled Answers Data Payload & Video Evidence...");

      await axios.post(
        "http://localhost:5000/api/interview/submitAssignment",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      localStorage.clear();

      if (reason === "tab") alert("Exam auto-submitted due to excessive proctoring violations.");
      else if (reason === "timeout") alert("Time limit reached! System auto-submitted your work.");
      else alert("Assignment Submitted Successfully.");

      navigate("/candidate", { replace: true });
      
    } catch (err) {
      console.error("Submission error:", err);
      alert("Submission failed. Your progress remains saved locally.");
      submittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  };

  // --- FULLSCREEN MANAGEMENT ---
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

  if (!document.fullscreenElement && !submittedRef.current) {

    if (ignoreNextFullscreenExitRef.current) {

      ignoreNextFullscreenExitRef.current = false;

      document.documentElement.requestFullscreen().catch(() => {});

      return;
    }

    fullscreenExitCountRef.current++;
    syncMetrics();

    if (fullscreenExitCountRef.current >= 3) {
      submitCode("fullscreen");
      return;
    }

    alert(
      `Fullscreen exited.\n\nRemaining Attempts: ${
        3 - fullscreenExitCountRef.current
      }`
    );

    document.documentElement.requestFullscreen().catch(() => {});
  }
};

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [started]);

  // --- HARD-BOUND PROCTORING LISTENERS ---
  useEffect(() => {
    if (!started) return;

    const handleVisibility = () => {
      if (document.hidden) {
        tabSwitchCountRef.current++;
        syncMetrics();
        if (tabSwitchCountRef.current >= 3 && !submittedRef.current) {
          submitCode("tab");
        }
      }
    };

    const handleBlur = () => {
      blurCountRef.current++;
      syncMetrics();
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.href);
      alert("Navigation back is strictly locked during the examination.");
    };

    const handleKeyDown = (e) => {
  const key = e.key.toLowerCase();

  // Block Ctrl+C, Ctrl+V, Ctrl+X
  if (
    (e.ctrlKey || e.metaKey) &&
    (key === "c" || key === "v" || key === "x")
  ) {
    e.preventDefault();
    e.stopPropagation();

    ignoreNextFullscreenExitRef.current = true;

    if (key === "c") copyAttemptsRef.current++;
    if (key === "v") pasteAttemptsRef.current++;
    if (key === "x") cutAttemptsRef.current++;

    syncMetrics();

    // alert(`${key.toUpperCase()} operation is disabled.`);

    return;
  }

  const isF12 = e.key === "F12";
  const isInspectElement =
    e.ctrlKey &&
    e.shiftKey &&
    (e.key === "I" || e.key === "J");

  const isViewSource =
    e.ctrlKey &&
    e.key.toLowerCase() === "u";

  if (isF12 || isInspectElement || isViewSource) {
    e.preventDefault();
    blockedShortcutAttemptsRef.current++;
    syncMetrics();
    return;
  }

  keyboardLogsRef.current.push({
    key: e.key,
    timestamp: new Date().toISOString()
  });

  lastActivityTimeRef.current = Date.now();
  syncMetrics();
};

    const handleMouseClick = () => {
      mouseClickCountRef.current++;
      lastActivityTimeRef.current = Date.now();
      syncMetrics();
    };

    const handleMouseMove = () => {
      mouseMoveCountRef.current++;
      lastActivityTimeRef.current = Date.now();
      syncMetrics();
    };

    const handleCopy = (e) => { e.preventDefault(); copyAttemptsRef.current++; syncMetrics(); };
    const handleCut = (e) => { e.preventDefault(); cutAttemptsRef.current++; syncMetrics(); };
    const handlePaste = (e) => { e.preventDefault(); pasteAttemptsRef.current++; syncMetrics(); alert("PASTE mechanism is barred."); };
    const handleContextMenu = (e) => { e.preventDefault(); rightClickAttemptsRef.current++; syncMetrics(); };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("popstate", handlePopState);
    // window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("click", handleMouseClick);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("copy", handleCopy);
    window.addEventListener("cut", handleCut);
    window.addEventListener("paste", handlePaste);
    window.addEventListener("contextmenu", handleContextMenu);

    const timeInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timeInterval);
          submitCode("timeout");
          return 0;
        }
        return prevTime - 1;
      });

      const timeSinceLastActivity = (Date.now() - lastActivityTimeRef.current) / 1000;
      if (timeSinceLastActivity >= 30) {
        idleTimeSecondsRef.current += 1;
        syncMetrics();
      }
    }, 1000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("popstate", handlePopState);
      // window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("click", handleMouseClick);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("copy", handleCopy);
      window.removeEventListener("cut", handleCut);
      window.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleContextMenu);
      clearInterval(timeInterval);
    };
  }, [started, language, code, questionIndex, questions, submitting]);

  const startAssignment = async () => {
    assignmentStartRef.current = new Date().toISOString();
    lastActivityTimeRef.current = Date.now();
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.log("Fullscreen request initialization skipped:", err);
    }
    setStarted(true);
    await startRecording();
  };

  useEffect(() => {
    if (!started || submittedRef.current) return;

    const restoreFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement
          .requestFullscreen()
          .catch(() => {});
      }
    };

    window.addEventListener("click", restoreFullscreen);
    window.addEventListener("mousemove", restoreFullscreen);
    window.addEventListener("keydown", restoreFullscreen);

    return () => {
      window.removeEventListener("click", restoreFullscreen);
      window.removeEventListener("mousemove", restoreFullscreen);
      window.removeEventListener("keydown", restoreFullscreen);
    };
  }, [started]);

  const handleQuestionChange = (index) => {
    setQuestionIndex(index);
    setOutput("");
    setInput("");
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
  };

  const runCode = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/interview/compile", {
        language,
        code,
        input,
      });
      setOutput(res.data.output);
    } catch (err) {
      setOutput(err.response?.data?.error || err.response?.data?.output || "Compilation Failed");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!started) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column", background: "#f8fafc" }}>
        <h1 style={{ fontFamily: "Arial", color: "#1e293b", marginBottom: "20px" }}>Secure Assessment Environment</h1>
        <div style={{ background: "#fff", padding: "30px", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", textAlign: "center", maxWidth: "500px" }}>
          <p style={{ fontFamily: "Arial", color: "#64748b", marginBottom: "25px", lineHeight: "1.5" }}>
            This test triggers comprehensive proctoring analytics including active background video/audio feed evaluation, layout lockouts, and context control locks.
          </p>
          <button onClick={startAssignment} style={{ padding: "12px 24px", fontSize: 16, background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
            Accept Permissions & Start
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial", position: "relative", overflow: "hidden" }}>
      {/* SECURITY WATERMARK OVERLAY */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 9999, opacity: 0.04, fontSize: "28px", fontWeight: "bold", color: "#000", display: "flex", flexWrap: "wrap", justifyContent: "space-around", contentVisibility: "auto" }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} style={{ transform: "rotate(-25deg)", margin: "80px" }}>SECURE EXAM CONTEXT</div>
        ))}
      </div>

      {/* LEFT PANEL */}
      <div style={{ width: "40%", borderRight: "1px solid #cbd5e1", padding: 20, overflowY: "auto", background: "#f8fafc" }}>
        <h2>Coding Assignment</h2>
        
        {!isOnline && (
          <div style={{ background: "#ef4444", color: "#fff", padding: "10px", borderRadius: "5px", marginBottom: "10px", fontWeight: "bold", textAlign: "center" }}>
            ⚠️ NETWORK OFFLINE DETECTED. Progress continues saving locally. Avoid refreshing.
          </div>
        )}

        <div style={{ background: "#fee2e2", padding: 10, borderRadius: 5, marginBottom: 10 }}>
          <h3 style={{ margin: 0, color: "#dc2626" }}>Time Remaining: {formatTime(timeLeft)}</h3>
        </div>

        {/* FEED MONITOR PREVIEW */}
        <div style={{ margin: "10px 0", borderRadius: "6px", overflow: "hidden", border: "2px solid #3b82f6", width: "160px", height: "120px", background: "#000" }}>
          <video ref={videoPreviewRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        {/* PROCTORING DIAGNOSTIC DASHBOARD */}
        <div style={{ background: "#f3f4f6", padding: "12px", borderRadius: 6, marginBottom: 20, fontSize: "13px", border: "1px solid #d1d5db" }}>
          <h4 style={{ margin: "0 0 8px 0", color: "#4b5563" }}>Proctoring Metrics (Active Diagnostics)</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            <div>Tab Switches: <strong>{metrics.tabSwitches} / 3</strong></div>
            <div>Blur Events: <strong>{metrics.blurEvents}</strong></div>
            <div>Fullscreen Exits: <strong>{metrics.fullscreenExits}</strong></div>
            <div>Copy Attempts: <strong>{metrics.copyAttempts}</strong></div>
            <div>Cut Attempts: <strong>{metrics.cutAttempts}</strong></div>
            <div>Paste Attempts: <strong>{metrics.pasteAttempts}</strong></div>
            <div>Right Clicks: <strong>{metrics.rightClicks}</strong></div>
            <div>Key Presses: <strong>{metrics.keyPresses}</strong></div>
            <div>Blocked Shortcuts: <strong>{metrics.blockedShortcuts}</strong></div>
            <div style={{ gridColumn: "1 / span 2" }}>Idle Tracker (&ge;30s Limit): <strong>{metrics.idleTime}s</strong></div>
          </div>
        </div>

        {questions.length > 0 && (
          <>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: "bold" }}>Select Question: </label>
              <select value={questionIndex} onChange={(e) => handleQuestionChange(Number(e.target.value))} style={{ padding: "6px", borderRadius: "4px" }}>
                {questions.map((q, index) => (
                  <option key={index} value={index}>Question {index + 1}: {q.title}</option>
                ))}
              </select>
            </div>

            <h3>{currentQuestion?.title}</h3>
            <p>{currentQuestion?.description}</p>
            <h3>Input Description</h3>
            <p>{currentQuestion?.input}</p>
            <h3>Output Description</h3>
            <p>{currentQuestion?.output}</p>
            <h3>Sample Input</h3>
            <pre style={{ background: "#e2e8f0", padding: "8px", borderRadius: "4px" }}>{currentQuestion?.sampleInput}</pre>
            <h3>Sample Output</h3>
            <pre style={{ background: "#e2e8f0", padding: "8px", borderRadius: "4px" }}>{currentQuestion?.sampleOutput}</pre>
            <h3>Constraints</h3>
            <p style={{ fontFamily: "monospace" }}>{currentQuestion?.constraints}</p>
          </>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div style={{ width: "60%", padding: 20, display: "flex", flexDirection: "column", background: "#ffffff" }}>
        <div style={{ marginBottom: 15 }}>
          <label style={{ fontWeight: "bold" }}>Language Selection: </label>
          <select value={language} onChange={(e) => handleLanguageChange(e.target.value)} style={{ padding: "6px", borderRadius: "4px" }}>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="python">Python</option>
          </select>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ width: "100%", flexGrow: 1, minHeight: "300px", fontFamily: "monospace", fontSize: 14, padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
        />

        <h3>Custom Terminal Input</h3>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ width: "100%", height: 60, padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
        />

        <div style={{ marginTop: 15, marginBottom: 15 }}>
          <button onClick={runCode} style={{ padding: "10px 20px", background: "#475569", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Run Code</button>
          <button 
            onClick={() => submitCode("manual")} 
            disabled={submitting}
            style={{ marginLeft: 10, padding: "10px 20px", background: submitting ? "#94a3b8" : "#16a34a", color: "white", border: "none", borderRadius: "4px", cursor: submitting ? "not-allowed" : "pointer", fontWeight: "bold" }}
          >
            {submitting ? "Processing Submit..." : "Submit Examination"}
          </button>
        </div>

        <h3>Output Console</h3>
        <pre style={{ background: "#0f172a", color: "#38bdf8", padding: 12, borderRadius: 6, minHeight: 100, overflowY: "auto", margin: 0, fontFamily: "monospace" }}>
          {output}
        </pre>
      </div>
    </div>
  );
}

export default AssignmentPanel;