import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";

// --- CONFIGURATION & MOCK DATA ---
const BACKEND_URL = 'http://localhost:5000/api/interview/submitbitsassessment';
const CANDIDATE_NAME = "Jai";
const CANDIDATE_USERNAME = "jai01"; 
const EXAM_DURATION = 600;
const MAX_RESUMES = 2;

const RAW_QUESTIONS = [
  { id: 1, text: "Which of the following is a core characteristic of a pure function?", options: ["It modifies global state", "It always returns the same output for the same input", "It relies on external variables", "It execution depends on time"] },
  { id: 2, text: "What hook would you use to optimize expensive computations in React?", options: ["useEffect", "useCallback", "useMemo", "useRef"] },
  { id: 3, text: "Which HTTP status code represents an unauthorized client access attempt?", options: ["400 Bad Request", "401 Unauthorized", "403 Forbidden", "404 Not Found"] },
  { id: 4, text: "What is the primary objective of salt hashing in database credential storage?", options: ["Data compression", "Defense against rainbow table attacks", "Bi-directional decryption", "Speeding up query runtimes"] },
  { id: 5, text: "Which data structure operates on a Last-In, First-Out (LIFO) framework?", options: ["Queue", "Stack", "Binary Tree", "Linked List"] }
];

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

export default function BitsAssessment() {
  // --- STATE ---

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false); 
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [statuses, setStatuses] = useState({});
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [logs, setLogs] = useState([]);
  
  const [fullscreenExits, setFullscreenExits] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [isBlurred, setIsBlurred] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [resumeCount, setResumeCount] = useState(() => parseInt(localStorage.getItem("resume_count") || "0", 10));

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // --- INITIAL COMPONENT REFRESH & PERSISTENCE HOOK ---
  useEffect(() => {
    const isRunning = localStorage.getItem("exam_running") === "true";
    const savedQuestions = localStorage.getItem('exam_questions');
    const savedAnswers = localStorage.getItem('exam_answers');
    const savedStatuses = localStorage.getItem('exam_statuses');
    const savedTime = localStorage.getItem('exam_time');

    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    } else {
      const randomized = shuffleArray(RAW_QUESTIONS).map(q => ({
        ...q,
        options: shuffleArray(q.options)
      }));
      setQuestions(randomized);
      localStorage.setItem('exam_questions', JSON.stringify(randomized));
    }

    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
    if (savedStatuses) setStatuses(JSON.parse(savedStatuses));
    if (savedTime) setTimeLeft(parseInt(savedTime, 10));

    if (isRunning) {
      logEvent("Application refresh or unexpected crash recovery sequence triggered.");
    }
  }, []);


useEffect(() => {
  if (!examStarted || examFinished) return;

  const restoreFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
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
}, [examStarted, examFinished]);

  // --- AUTOMATIC WEBCAM ATTACHMENT ---
  useEffect(() => {
    if (examStarted && !examFinished) {
      initProctoring();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [examStarted, examFinished]);

  // --- UNIFIED COUNTDOWN TIMER EFFECT ---
  useEffect(() => {
    if (!examStarted || examFinished) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          autoSubmitExam("Timer expired.");
          return 0;
        }
        const nextTime = prev - 1;
        localStorage.setItem("exam_time", String(nextTime));
        if (nextTime === 300) alert("Warning: Only 5 minutes remaining!");
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [examStarted, examFinished]);

  // --- BACKGROUND AUTOMATIC PERIODIC BACKEND SAVING (Every 30 Seconds) ---
  useEffect(() => {
    if (!examStarted || examFinished) return;

    const autoSaveInterval = setInterval(() => {
      logEvent("Automated background periodic delta sync initialized.");
      sendExamData(null); 
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [examStarted, examFinished, answers, statuses, timeLeft, fullscreenExits, tabSwitches, logs]);

  // --- UNLOAD / REFRESH CAPTURE REGISTRATION ---
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (examStarted && !examFinished) {
        localStorage.setItem("exam_running", "true");
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [examStarted, examFinished]);

  // --- STRICT BROWSER BACK BUTTON DISABLE ENGINE ---
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      logEvent("Security blocked navigation: Candidate attempted browser navigation back step.");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // --- SECURITY LOG CONTROLLER ---
  const logEvent = (message) => {
    const timestamp = new Date().toISOString();
    const formattedLog = `[${timestamp}] ${message}`;
    setLogs(prev => [formattedLog, ...prev]);
  };

  // --- DATA SYNC CONTROLLER ---
  const sendExamData = async (videoBlob = null) => {
    try {
      const formData = new FormData();
      formData.append("username", user.id);
      formData.append("candidate", user.fullName);
      formData.append("timeLeft", timeLeft);
      formData.append("answers", JSON.stringify(answers));
      formData.append("statuses", JSON.stringify(statuses));
      formData.append("questions", JSON.stringify(questions));
      formData.append("violations", JSON.stringify({ fullscreenExits, tabSwitches, isBlurred, isOffline }));
      formData.append("logs", JSON.stringify(logs));
      formData.append("systemInfo", JSON.stringify({
        browser: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screen: { width: window.screen.width, height: window.screen.height },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }));

      if (videoBlob) {
        formData.append("video", videoBlob, "exam.webm");
      }

      await fetch(BACKEND_URL, {
        method: "POST",
        body: formData,
      });
      alert("Bits exam Submitted Successfully");
      navigate("/candidate");
    } catch (err) {
      console.error("Payload synchronization exception caught:", err);
    }
  };
 
  // --- PROCTORING HARDWARE INITIALIZATION ---
  const initProctoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: 15 }, 
        audio: true,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const options = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? { mimeType: "video/webm;codecs=vp9" }
        : { mimeType: "video/webm" };

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          mediaRecorderRef.current.finalBlob = event.data;
        }
      };

      recorder.start();
      logEvent("Camera/Mic hardware stream successfully linked.");
    } catch (err) {
      console.error("Hardware access exceptions:", err);
      alert("Hardware access is mandatory to take this exam.");
    }
  };

  // --- ANTI-CHEAT SECURITY HOOK ---
  useEffect(() => {
    if (!examStarted || examFinished) return;

    const preventMaliciousKeys = (e) => {
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key)) ||
        (e.ctrlKey && ['U','S','P','C','V','X','A'].includes(e.key))
      ) {
        e.preventDefault();
        logEvent(`Blocked shortcut restricted hotkey: ${e.key}`);
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const next = prev + 1;
          logEvent(`SECURITY ALERT: Tab switch detected (#${next})`);
          if (next >= 3) autoSubmitExam("Exceeded Max Tab Switch limit.");
          return next;
        });
      }
    };

    const handleFullscreenChange = async () => {
  // User exited fullscreen
  if (!document.fullscreenElement && examStarted && !examFinished) {

    setFullscreenExits(prev => {
      const next = prev + 1;

      logEvent(`Fullscreen exited (${next})`);

      if (next >= 3) {
        autoSubmitExam("Maximum fullscreen exits exceeded.");
      }

      return next;
    });

    // Keep trying until fullscreen is restored
    const retryFullscreen = () => {
      if (document.fullscreenElement || examFinished) return;

      document.documentElement.requestFullscreen()
        .then(() => {
          logEvent("Fullscreen restored automatically.");
        })
        .catch(() => {
          // Retry every second
          setTimeout(retryFullscreen, 1000);
        });
    };

    retryFullscreen();
  }
};

    const handleFocusBlur = () => { setIsBlurred(true); logEvent("Focus lost (Blur Event)."); };
    const handleFocusGain = () => { setIsBlurred(false); logEvent("Focus regained (Focus Event)."); };
    const handleOnline = () => { setIsOffline(false); logEvent("Network connection restored."); };
    const handleOffline = () => { setIsOffline(true); logEvent("Network drop connection context lost."); };

    window.addEventListener('keydown', preventMaliciousKeys);
    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('blur', handleFocusBlur);
    window.addEventListener('focus', handleFocusGain);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('keydown', preventMaliciousKeys);
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('blur', handleFocusBlur);
      window.removeEventListener('focus', handleFocusGain);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [examStarted, examFinished]);

  // --- NAVIGATION & CONTROL FLOW MANAGEMENT ---
  const startExam = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setExamStarted(true);
      localStorage.setItem("exam_running", "true");
      logEvent("Exam engine initiated successfully.");
    } catch (err) {
      alert("Fullscreen execution activation context required to switch layout containers.");
    }
  };

  const handleSelectOption = (option) => {
    const currentQ = questions[currentIndex];
    const updatedAnswers = { ...answers, [currentQ.id]: option };
    setAnswers(updatedAnswers);
    localStorage.setItem('exam_answers', JSON.stringify(updatedAnswers));

    if (statuses[currentQ.id] !== 'review') {
      const updatedStatuses = { ...statuses, [currentQ.id]: 'answered' };
      setStatuses(updatedStatuses);
      localStorage.setItem('exam_statuses', JSON.stringify(updatedStatuses));
    }
  };

  const markForReview = () => {
    const currentQ = questions[currentIndex];
    const updatedStatuses = { ...statuses, [currentQ.id]: 'review' };
    setStatuses(updatedStatuses);
    localStorage.setItem('exam_statuses', JSON.stringify(updatedStatuses));
    logEvent(`Question ID ${currentQ.id} marked for review layout flag.`);
    navigateNext();
  };

  const clearResponse = () => {
    const currentQ = questions[currentIndex];
    const updatedAnswers = { ...answers };
    delete updatedAnswers[currentQ.id];
    setAnswers(updatedAnswers);
    localStorage.setItem('exam_answers', JSON.stringify(updatedAnswers));

    const updatedStatuses = { ...statuses, [currentQ.id]: 'visited' };
    setStatuses(updatedStatuses);
    localStorage.setItem('exam_statuses', JSON.stringify(updatedStatuses));
    logEvent(`Cleared option selection response context for Question ID ${currentQ.id}.`);
  };

  const navigatePrev = () => { if (currentIndex > 0) setCurrentIndex(prev => prev - 1); };
  const navigateNext = () => {
    const currentQ = questions[currentIndex];
    if (!statuses[currentQ.id]) {
      setStatuses(prev => ({ ...prev, [currentQ.id]: 'visited' }));
    }
    if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const startNewExam = async () => {
    localStorage.removeItem("exam_submitted");
    localStorage.removeItem("resume_count");
    localStorage.removeItem("exam_answers");
    localStorage.removeItem("exam_statuses");
    localStorage.removeItem("exam_questions");
    localStorage.removeItem("exam_time");
    localStorage.removeItem("exam_running");

    setTimeLeft(EXAM_DURATION);
    setAnswers({});
    setStatuses({});
    setCurrentIndex(0);
    setFullscreenExits(0);
    setTabSwitches(0);
    setLogs([]);
    setExamFinished(false);
    setResumeCount(0);

    localStorage.setItem("exam_time", String(EXAM_DURATION));
    localStorage.setItem("exam_running", "true");

    const randomized = shuffleArray(RAW_QUESTIONS).map(q => ({
        ...q,
        options: shuffleArray(q.options),
    }));
    setQuestions(randomized);
    localStorage.setItem("exam_questions", JSON.stringify(randomized));

    await document.documentElement.requestFullscreen();
    setExamStarted(true);
    logEvent("Brand new operational exam profile generated.");
  };

  const resumeExam = async () => {
    if (resumeCount >= MAX_RESUMES) {
      autoSubmitExam("Resume limit exceeded.");
      return;
    }

    const count = resumeCount + 1;
    localStorage.setItem("resume_count", String(count));
    setResumeCount(count);

    // Reload persisted runtime operational values securely inside memory states
    const savedAnswers = JSON.parse(localStorage.getItem("exam_answers") || "{}");
    const savedStatuses = JSON.parse(localStorage.getItem("exam_statuses") || "{}");
    const savedQuestions = JSON.parse(localStorage.getItem("exam_questions") || "[]");
    const savedTime = Number(localStorage.getItem("exam_time") || EXAM_DURATION);

    setAnswers(savedAnswers);
    setStatuses(savedStatuses);
    setQuestions(savedQuestions);
    setTimeLeft(savedTime);

    localStorage.setItem("exam_running", "true");

    await document.documentElement.requestFullscreen();
    setExamStarted(true);
    logEvent(`Exam layout structure resumed. Interception attempt tracking counter incremented to: ${count}`);
  };

  const submitExamRequest = () => {
    const total = questions.length;
    const answeredCount = Object.keys(answers).length;
    const reviewCount = Object.values(statuses).filter(s => s === 'review').length;
    
    // const confirmation = window.confirm(
    //   `Confirm Submit:\n\n` +
    //   `Total Questions: ${total}\n` +
    //   `Answered: ${answeredCount}\n` +
    //   `Marked for Review: ${reviewCount}\n` +
    //   `Unanswered: ${total - answeredCount}\n\n` +
    //   `Are you sure you want to finish and submit?`
    // );

    // if (confirmation) 
      autoSubmitExam("User submission.");
  };

  const autoSubmitExam = async (reason) => {
    // Prevent duplicate processing collisions
    if (examFinished) return;

    logEvent(`Exam ending submission workflow instantiated: ${reason}`);
    localStorage.setItem("exam_submitted", "true");
    localStorage.removeItem("exam_running");

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      await new Promise((resolve) => {
        mediaRecorderRef.current.onstop = resolve;
      });
    }

    await sendExamData(mediaRecorderRef.current?.finalBlob || null);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    localStorage.removeItem("exam_answers");
    localStorage.removeItem("exam_statuses");
    localStorage.removeItem("exam_questions");
    localStorage.removeItem("exam_time");
    localStorage.removeItem("resume_count");

    setExamFinished(true);
    if(reason!=="User submission.")
    alert(`Exam finished context recorded.\nReason data: ${reason}`);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (examFinished) {
    const totalQs = questions.length;
    const answeredQs = Object.keys(answers).length;
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center', maxWidth: '600px', margin: '40px auto', border: '1px solid #c3e6cb', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', background: '#f8fff9' }}>
        <h2 style={{ color: '#28a745', marginBottom: '20px' }}>✓ Exam Submitted Successfully</h2>
        <div style={{ borderBottom: '1px solid #ddd', paddingBottom: '20px', marginBottom: '20px' }}>
          <p>Candidate: <strong>{CANDIDATE_NAME}</strong></p>
          <p>Username context record ID: <code>{CANDIDATE_USERNAME}</code></p>
        </div>
        <h4 style={{ color: '#495057' }}>Submission Metrics Summary</h4>
        <div style={{ display: 'flex', justifyContent: 'space-around', background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e9ecef', margin: '20px 0' }}>
          <div><strong>{totalQs}</strong><br/><small style={{color:'#6c757d'}}>Total Tasks</small></div>
          <div><strong>{answeredQs}</strong><br/><small style={{color:'#6c757d'}}>Answered</small></div>
          <div><strong>{totalQs - answeredQs}</strong><br/><small style={{color:'#6c757d'}}>Skipped</small></div>
        </div>
        <p style={{ fontSize: '14px', color: '#6c757d' }}>Your biometric tracks, responses, and security behavior telemetry log profiles are completely synchronized.</p>
        <p style={{ fontWeight: 'bold', color: '#495057', marginTop: '30px' }}>You may now safely close this browser portal window.</p>
      </div>
    );
  }

  // --- WELCOME & RESUME ENTRY DETECTION SCREEN ---
  if (!examStarted) {
    const hasExamData = localStorage.getItem("exam_time") && localStorage.getItem("exam_questions");
    const submittedData = localStorage.getItem("exam_submitted") === "true";

    return (
      <div style={{ padding: 30, maxWidth: 700, margin: "60px auto", border: "1px solid #ddd", borderRadius: 10, textAlign: "center", boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h2>Secure Examination Environment</h2>
        <h3>{CANDIDATE_NAME}</h3>
        <p style={{ color: '#dc3545', fontSize: '14px' }}>
          Warning: Professional anti-cheat logs, tab execution hooks, and camera tracking sync autonomously upon launch container entry.
        </p>

        {submittedData ? (
          <>
            <div style={{ background: "#d4edda", color: "#155724", padding: 15, borderRadius: 5, marginBottom: 20 }}>
              ✅ Previous structural exam layout data has already been fully processed and locked.
            </div>
            <button onClick={startNewExam} style={{ padding: "12px 25px", fontSize: 16, cursor: "pointer", background: '#007bff', color:'#fff', border:'none', borderRadius:'5px' }}>
              Start New Exam
            </button>
          </>
        ) : hasExamData ? (
          <>
            <div style={{ background: "#fff3cd", color: "#856404", padding: 15, borderRadius: 5, marginBottom: 20, textAlign: 'left' }}>
              <strong>Previous active exam state detected.</strong>
              <br /><br />
              Authorized Recovered Attempts remaining: <strong>{resumeCount} / {MAX_RESUMES}</strong>
            </div>
            <button onClick={resumeExam} disabled={resumeCount >= MAX_RESUMES} style={{ padding: "12px 25px", marginRight: 15, cursor: resumeCount >= MAX_RESUMES ? "not-allowed" : "pointer", background: '#28a745', color:'#fff', border:'none', borderRadius:'5px' }}>
              Resume Active Session
            </button>
            <button onClick={startNewExam} style={{ padding: "12px 25px", cursor: "pointer", background: '#dc3545', color:'#fff', border:'none', borderRadius:'5px' }}>
              Overwrite & Start New
            </button>
          </>
        ) : (
          <button onClick={startNewExam} style={{ padding: "14px 35px", fontSize: 16, cursor: "pointer", background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
            Start Exam Container
          </button>
        )}
      </div>
    );
  }

  if (questions.length === 0) return <div style={{textAlign:'center', marginTop:'100px'}}>Initializing Secure Question Bank Matrix Layers...</div>;

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.values(statuses).filter(s => s === 'review').length;

  return (
    <div style={{ padding: '20px', position: 'relative', minHeight: '100vh' }}>
      
      {/* FLOATING FLOOD LAYER CONTINUOUS PROFESSIONAL WATERMARK */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0.04,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#000',
        userSelect: 'none'
      }}>
        <div>{CANDIDATE_NAME} • {CANDIDATE_USERNAME}</div>
        <div>SECURE EXAM CONTEXT • {CANDIDATE_NAME}</div>
        <div>{CANDIDATE_USERNAME} • WORKFLOW RUNNING</div>
      </div>

      {isBlurred && (
        <div style={{ background: '#fff3cd', borderLeft: '6px solid #ffc107', color: '#856404', padding: '15px', margin: '0 0 20px 0', borderRadius: '4px' }}>
          <h3>⚠️ WARNING: Context Layout Focus Window Broken!</h3>
          <p>Please click inside this layout window element context instantly. Continued focus escapes initiate instant auto-termination submit commands.</p>
        </div>
      )}

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eaeaea', paddingBottom: '15px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Exam Terminal Dashboard</h2>
          {isOffline && <span style={{ background: '#dc3545', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>[OFFLINE NETWORK DISCONNECTED MODE]</span>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <h3 style={{ margin: 0, color: timeLeft < 60 ? '#dc3545' : '#333' }}>Time Remaining: {formatTime(timeLeft)}</h3>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '20px' }}>
        <section style={{ flex: 1 }}>
          <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px', borderRadius: '8px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6c757d', marginBottom: '15px' }}>
              <span>Question <strong>{currentIndex + 1}</strong> of {questions.length}</span>
              <span style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold', background: '#e9ecef', padding: '3px 8px', borderRadius: '4px' }}>
                Status: {statuses[currentQuestion.id] || 'unvisited'}
              </span>
            </div>
            <p style={{ fontWeight: 'bold', fontSize: '18px', marginTop: 0 }}>{currentQuestion.text}</p>

            <div style={{ marginTop: '20px' }}>
              {currentQuestion.options.map((opt, i) => (
                <label key={i} style={{ display: 'block', margin: '12px 0', padding: '12px', border: '1px solid #e9ecef', borderRadius: '6px', cursor: 'pointer', background: answers[currentQuestion.id] === opt ? '#f0f4f8' : '#fff', transition: 'background 0.2s' }}>
                  <input 
                    type="radio" 
                    name={`q-${currentQuestion.id}`} 
                    checked={answers[currentQuestion.id] === opt}
                    onChange={() => handleSelectOption(opt)}
                    style={{ marginRight: '10px' }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button disabled={currentIndex === 0} onClick={navigatePrev} style={{ padding: '10px 20px', cursor: 'pointer' }}>Previous</button>
            <button onClick={markForReview} style={{ padding: '10px 20px', cursor: 'pointer', background: '#ffc107', border: 'none', borderRadius: '4px' }}>Mark for Review</button>
            <button onClick={clearResponse} style={{ padding: '10px 20px', cursor: 'pointer', background: '#e9ecef', border: 'none', borderRadius: '4px' }}>Clear Response</button>
            <button onClick={currentIndex === questions.length - 1 ? submitExamRequest : navigateNext} style={{ padding: '10px 25px', cursor: 'pointer', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', marginLeft: 'auto', fontWeight: 'bold' }}>
              {currentIndex === questions.length - 1 ? "Submit Exam" : "Next Question"}
            </button>
          </div>
        </section>

        <aside style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', background: '#fff' }}>
            <h5 style={{ margin: '0 0 10px 0' }}>Biometric Stream Capture Feed</h5>
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              style={{ width: "100%", borderRadius: "6px", backgroundColor: "#000", transform: 'scaleX(-1)' }} 
            />
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', background: '#fff' }}>
            <h5 style={{ margin: '0 0 10px 0' }}>Question Grid Palette</h5>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {questions.map((q, idx) => {
                let btnBg = '#fff';
                let btnColor = '#000';
                if (statuses[q.id] === 'answered') { btnBg = '#28a745'; btnColor = '#fff'; }
                if (statuses[q.id] === 'review') { btnBg = '#ffc107'; btnColor = '#000'; }

                return (
                  <button 
                    key={q.id} 
                    onClick={() => setCurrentIndex(idx)}
                    style={{
                      fontWeight: idx === currentIndex ? 'bold' : 'normal',
                      border: idx === currentIndex ? '2px solid #000' : '1px solid #ced4da',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      background: btnBg,
                      color: btnColor,
                      minWidth: '40px'
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', background: '#fff', fontSize: '14px' }}>
            <h5 style={{ margin: '0 0 10px 0' }}>Statistical Telemetry</h5>
            <p style={{ margin: '5px 0' }}>Answered Tasks: <strong>{answeredCount}</strong></p>
            <p style={{ margin: '5px 0' }}>Marked Review Layers: <strong>{markedCount}</strong></p>
            <p style={{ margin: '5px 0' }}>Remaining Elements: <strong>{questions.length - answeredCount}</strong></p>
            <p style={{ color: (tabSwitches > 0 || fullscreenExits > 0) ? '#dc3545' : '#28a745', fontWeight: 'bold', margin: '10px 0 0 0' }}>
              Violations Logged: Tabs ({tabSwitches}/3) | Fullscreen Escapes ({fullscreenExits}/3)
            </p>
          </div>

          <button onClick={submitExamRequest} style={{ padding: '14px', background: '#28a745', color: 'white', fontWeight: 'bold', cursor: 'pointer', border: 'none', borderRadius: '6px', fontSize: '15px', boxShadow: '0 2px 6px rgba(40,167,69,0.3)' }}>
            Submit Final Responses
          </button>
        </aside>
      </div>
    </div>
  );
}