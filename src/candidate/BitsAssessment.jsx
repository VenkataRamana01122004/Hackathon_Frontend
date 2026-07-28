import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import QuestionPanel from "./mcq/QuestionPanel.jsx";
import QuestionGrid from "./mcq/QuestionGrid.jsx";
import CamWindow from "./mcq/CamWindow.jsx";
import SecurityPanel from "./mcq/SecurityPanel.jsx";
// import { hasSubmittedProfile } from "./utils/profile.js";
import axios from "axios";
import "./candidate.css";


// --- CONFIGURATION ---
const BACKEND_URL = 'http://localhost:5000/api/interview/submitbitsassessment';
const EXAM_DURATION = 300;
const MAX_RESUMES = 1;  

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

export default function BitsAssessment() {
  const navigate = useNavigate();

  // Safe User Parsing Helper
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  };
  const user = getUser();

  const CANDIDATE_NAME = user?.fullName|| "Unknown Candidate";
  const CANDIDATE_USERNAME = user?.candidateId || "Unknown";

  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false); 
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [statuses, setStatuses] = useState({});
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [logs, setLogs] = useState([]);
  const [isFullscreenViolated, setIsFullscreenViolated] = useState(false);
  
  const [fullscreenExits, setFullscreenExits] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [isBlurred, setIsBlurred] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [resumeCount, setResumeCount] = useState(() => parseInt(localStorage.getItem("resume_count") || "0", 10));



  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // --- ALL REFS (Eradicates stale closures in async intervals/listeners) ---
  const questionsRef = useRef(questions);
  const answersRef = useRef(answers);
  const statusesRef = useRef(statuses);
  const logsRef = useRef(logs);
  const timeLeftRef = useRef(timeLeft);
  const fullscreenExitsRef = useRef(fullscreenExits);
  const tabSwitchesRef = useRef(tabSwitches);
  const isBlurredRef = useRef(isBlurred);
  const isOfflineRef = useRef(isOffline);
  
  const submittingRef = useRef(false);
  const examStartedRef = useRef(false);
  const examFinishedRef = useRef(false);
  const isFullscreenRef = useRef(false);
  const lastFullscreenExitTimeRef = useRef(0);

  // Sync state values instantly to their respective refs
  useEffect(() => { examStartedRef.current = examStarted; }, [examStarted]);
  useEffect(() => { examFinishedRef.current = examFinished; }, [examFinished]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { statusesRef.current = statuses; }, [statuses]);
  useEffect(() => { logsRef.current = logs; }, [logs]);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);
  useEffect(() => { fullscreenExitsRef.current = fullscreenExits; }, [fullscreenExits]);
  useEffect(() => { tabSwitchesRef.current = tabSwitches; }, [tabSwitches]);
  useEffect(() => { isBlurredRef.current = isBlurred; }, [isBlurred]);
  useEffect(() => { isOfflineRef.current = isOffline; }, [isOffline]);

  // --- ROUTE PROTECTION ---
  // useEffect(() => {
  //   if (!hasSubmittedProfile()) {
  //     navigate("/candidate/submission", { state: { next: "/candidate/bitsassessment" } });
  //   }
  // }, [navigate]);

  // --- INITIAL REFRESH & PERSISTENCE RESTORATION ---
useEffect(() => {
  const isRunning = localStorage.getItem("exam_running") === "true";
  const savedQuestions = localStorage.getItem("exam_questions");
  const savedAnswers = localStorage.getItem("exam_answers");
  const savedStatuses = localStorage.getItem("exam_statuses");
  const savedTime = localStorage.getItem("exam_time");
  const savedFullscreenExits = localStorage.getItem("fullscreen_exits");
  const savedTabSwitches = localStorage.getItem("tab_switches");

  if (savedQuestions) {
    setQuestions(JSON.parse(savedQuestions));
  }

  if (savedAnswers) {
    setAnswers(JSON.parse(savedAnswers));
  }

  if (savedStatuses) {
    setStatuses(JSON.parse(savedStatuses));
  }

  if (savedTime) {
    setTimeLeft(parseInt(savedTime, 10));
  }

  if (savedFullscreenExits) {
    setFullscreenExits(parseInt(savedFullscreenExits, 10));
  }

  if (savedTabSwitches) {
    setTabSwitches(parseInt(savedTabSwitches, 10));
  }

  if (isRunning) {
    logEvent("Application refresh or unexpected crash recovery sequence triggered.");
  }
}, []);

  // --- STRICT FULLSCREEN LOCK GESTURES (Excluding mousemove) ---
  useEffect(() => {
    if (!examStarted || examFinished) return;

    const restoreFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    };

    window.addEventListener("click", restoreFullscreen);
window.addEventListener("keydown", restoreFullscreen);


    return () => {
      window.removeEventListener("click", restoreFullscreen);
      window.removeEventListener("keydown", restoreFullscreen);
    };
  }, [examStarted, examFinished]);

  // --- PROCTORING CAMERA STREAM ATTACHMENT ---
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

  // --- COUNTDOWN TIMER ---
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

  // --- BACKGROUND AUTO-SAVE (Runs every 30 seconds) ---
  useEffect(() => {
    if (!examStarted || examFinished) return;

    const autoSaveInterval = setInterval(() => {
      logEvent("Automated background periodic delta sync initialized.");
      sendExamData(null); 
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [examStarted, examFinished]);

  // --- UNLOAD / REFRESH INTERCEPTION ---
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (examStarted && !examFinished) {
        localStorage.setItem("exam_running", "true");
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [examStarted, examFinished]);

  // Ensure fullscreen after questions are loaded
useEffect(() => {
  if (!examStarted || examFinished || questions.length === 0) return;

  const ensureFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        logEvent("Fullscreen restored after question load.");
      } catch (err) {
        console.error("Unable to enter fullscreen:", err);
      }
    }
  };

  // Wait until the question is rendered
  const timer = setTimeout(ensureFullscreen, 100);

  return () => clearTimeout(timer);
}, [questions, examStarted, examFinished]);

  // --- BROWSER NAVIGATION BLOCKER ---
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      logEvent("Security blocked navigation: Candidate attempted browser navigation back step.");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const logEvent = (message) => {
    const timestamp = new Date().toISOString();
    const formattedLog = `[${timestamp}] ${message}`;
    setLogs(prev => [formattedLog, ...prev]);
  };

  // --- SECURE DATA SYNCHRONIZATION ENGINE ---
  const sendExamData = async (videoBlob = null) => {
    if (submittingRef.current && !videoBlob) return;

    try {
      const formData = new FormData();
      formData.append("username", user?.id || CANDIDATE_USERNAME);
      formData.append("candidate", user?.fullName || CANDIDATE_NAME);
      formData.append("timeLeft", timeLeftRef.current);
      formData.append("answers", JSON.stringify(answersRef.current));
      formData.append("statuses", JSON.stringify(statusesRef.current));
      formData.append("questions", JSON.stringify(questionsRef.current));
      formData.append("violations", JSON.stringify({ 
        fullscreenExits: fullscreenExitsRef.current, 
        tabSwitches: tabSwitchesRef.current, 
        isBlurred: isBlurredRef.current, 
        isOffline: isOfflineRef.current 
      }));
      formData.append("logs", JSON.stringify(logsRef.current));
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
    } catch (err) {
      console.error("Payload synchronization exception caught:", err);
    }
  };
   
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

  // --- EXTRA SHIELD OVERLAY ACCESSIBLE HANDLERS ---
const handleFullscreenChange = () => {
  if (!examStartedRef.current || examFinishedRef.current) return;

  const isCurrentlyFullscreen = !!document.fullscreenElement;

  if (!isCurrentlyFullscreen) {
    setFullscreenExits(prev => {
      const next = prev + 1;

      fullscreenExitsRef.current = next;
      localStorage.setItem("fullscreen_exits", String(next));

      logEvent(`SECURITY ALERT: Fullscreen exited (#${next})`);

      if (next >= 3) {
        autoSubmitExam("Maximum fullscreen exits exceeded.");
      } else {
        setIsFullscreenViolated(true);
      }

      return next;
    });
  }
};

  const handleActionFullscreenCapture = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreenViolated(false); 
        logEvent("SYSTEM: Fullscreen restored via user action");
      }
    } catch (err) {
      console.error("Failed to restore fullscreen:", err);
    }
  };

  const handleReturnToFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreenViolated(false);
      }
    } catch (err) {
      console.error("Failed to re-enter fullscreen:", err);
      logEvent("ERROR: Failed to force fullscreen re-entry");
    }
  };

  // --- ANTI-CHEAT SECURITY HOOKS ---
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

      tabSwitchesRef.current = next;
      localStorage.setItem("tab_switches", String(next));

      logEvent(`SECURITY ALERT: Tab switch detected (#${next})`);

      if (next >= 3) {
        autoSubmitExam("Exceeded Max Tab Switch limit.");
      }

      return next;
    });
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

    isFullscreenRef.current = !!document.fullscreenElement;

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

  // --- API CALL FOR QUESTIONS ---
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/candidate/getMcqQuestions"
      );

      const rawData = response.data?.data || response.data;
      if (!Array.isArray(rawData)) {
        throw new Error("Backend response format invalid. Expected an array inside 'data'.");
      }

      const formattedQuestions = rawData.map((q) => ({
        id: q.id || Math.random().toString(36).substr(2, 9), 
        text: q.question || q.text || "Missing question text", 
        options: Array.isArray(q.options) ? q.options : [],
        questionType: q.questionType || "mcq",
        correctAnswers: q.correctAnswers || [],
        difficulty: q.difficulty || "medium",
        category: q.category || "React",
        marks: q.marks || 1,
      }));

      return formattedQuestions;
    } catch (error) {
      console.error("Error inside fetchQuestions execution layer:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

const handleSelectOption = (option) => {
  const currentQ = questions[currentIndex];
  if (!currentQ) return;

  setAnswers((prev) => {
    const updated = { ...prev };

    if (currentQ.questionType === "MULTIPLE") {
      const existing = updated[currentQ.id] || [];

      if (existing.includes(option)) {
        updated[currentQ.id] = existing.filter(o => o !== option);
      } else {
        updated[currentQ.id] = [...existing, option];
      }
    } else {
      updated[currentQ.id] = option;
    }

    answersRef.current = updated;
    localStorage.setItem("exam_answers", JSON.stringify(updated));

    return updated;
  });

  setStatuses((prev) => {
    if (prev[currentQ.id] === "review") return prev;

    const updated = {
      ...prev,
      [currentQ.id]: "answered"
    };

    statusesRef.current = updated;
    localStorage.setItem("exam_statuses", JSON.stringify(updated));

    return updated;
  });
};


  const markForReview = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setStatuses((prev) => {
      const updated = { ...prev, [currentQ.id]: "review" };
      statusesRef.current = updated;
      localStorage.setItem("exam_statuses", JSON.stringify(updated));
      return updated;
    });

    logEvent(`Question ID ${currentQ.id} marked for review.`);
    navigateNext();
  };

  const clearResponse = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[currentQ.id];
      answersRef.current = updated;
      localStorage.setItem("exam_answers", JSON.stringify(updated));
      return updated;
    });

    setStatuses((prev) => {
      const updated = { ...prev, [currentQ.id]: "visited" };
      statusesRef.current = updated;
      localStorage.setItem("exam_statuses", JSON.stringify(updated));
      return updated;
    });

    logEvent(`Cleared option response for Question ID ${currentQ.id}.`);
  };

  const navigatePrev = () => { if (currentIndex > 0) setCurrentIndex(prev => prev - 1); };
  const navigateNext = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    if (!statuses[currentQ.id]) {
      setStatuses(prev => ({ ...prev, [currentQ.id]: 'visited' }));
    }
    if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
  };

 const startNewExam = async () => {
    try {
      setLoading(true);
      
      // 1. Trigger Fullscreen IMMEDIATELY while the user gesture is still active
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch((err) => {
          console.warn("Fullscreen deferred or blocked initially:", err);
        });
      }

      // 2. Now start your 7-second network request
      const rawQuestions = await fetchQuestions();

      // 3. Clear out old exam states
      localStorage.removeItem("exam_submitted");
      localStorage.removeItem("resume_count");
      localStorage.removeItem("exam_answers");
      localStorage.removeItem("exam_statuses");
      localStorage.removeItem("exam_questions");
      localStorage.removeItem("exam_time");
      localStorage.removeItem("exam_running");
      localStorage.removeItem("fullscreen_exits");
      localStorage.removeItem("tab_switches");

      setTimeLeft(EXAM_DURATION);
      setAnswers({});
      setStatuses({});
      setCurrentIndex(0);
      setFullscreenExits(0);
      setTabSwitches(0);
      setLogs([]);
      setExamFinished(false);
      setResumeCount(0);
      fullscreenExitsRef.current = 0;
      tabSwitchesRef.current = 0;

      setFullscreenExits(0);
      setTabSwitches(0);

      localStorage.setItem("exam_time", String(EXAM_DURATION));
      localStorage.setItem("exam_running", "true");

      const randomized = shuffleArray(rawQuestions).map((q) => ({
        ...q,
        options: shuffleArray(q.options),
      }));

      
      setQuestions(randomized);
localStorage.setItem("exam_questions", JSON.stringify(randomized));

setExamStarted(true);

// Wait for React to render the exam screen, then ensure fullscreen
setTimeout(async () => {
  if (!document.fullscreenElement) {
    try {
      await document.documentElement.requestFullscreen();
      logEvent("Fullscreen restored after questions loaded.");
    } catch (err) {
      console.error(err);
    }
  }
}, 0);

logEvent("Brand new operational exam profile generated.");

    } catch (error) {
      console.error(error);
      alert("Unable to load exam questions. Please verify connection to server.");
      
      // Exit fullscreen if the network or preparation fails
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    } finally {
      setLoading(false);
    }
  };

  const resumeExam = async () => {
    if (resumeCount >= MAX_RESUMES) {
      autoSubmitExam("Resume limit exceeded.");
      return;
    }

    const count = resumeCount;
    localStorage.setItem("resume_count", String(count));
    setResumeCount(count);

    const savedAnswers = JSON.parse(localStorage.getItem("exam_answers") || "{}");
    const savedStatuses = JSON.parse(localStorage.getItem("exam_statuses") || "{}");
    const savedQuestions = JSON.parse(localStorage.getItem("exam_questions") || "[]");
    const savedTime = Number(localStorage.getItem("exam_time") || EXAM_DURATION);

    setAnswers(savedAnswers);
    setStatuses(savedStatuses);
    setQuestions(savedQuestions);
    setTimeLeft(savedTime);

    localStorage.setItem("exam_running", "true");

    await document.documentElement.requestFullscreen().catch(() => {});
    setExamStarted(true);
    logEvent(`Exam session resumed. Attempt count: ${count}`);
  };

  const submitExamRequest = () => {
    autoSubmitExam("User submission.");
  };

  const autoSubmitExam = async (reason) => {
    if (submittingRef.current) return;

    submittingRef.current = true;
    setExamFinished(true);

    logEvent(`Exam ending submission workflow instantiated: ${reason}`);
    localStorage.setItem("exam_submitted", "true");
    localStorage.removeItem("exam_running");
    localStorage.removeItem("fullscreen_exits");
    localStorage.removeItem("tab_switches");

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
      examFinishedRef.current = true;
      document.exitFullscreen().catch(() => {});
    }

    localStorage.removeItem("exam_answers");
    localStorage.removeItem("exam_statuses");
    localStorage.removeItem("exam_questions");
    localStorage.removeItem("exam_time");
    localStorage.removeItem("resume_count");

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    user.bitsExamStatus = "Process";
    localStorage.setItem("user", JSON.stringify(user));

    alert(`Exam finished. Result: ${reason}`);
    navigate("/candidate");
  };

  if (examFinished) {
    const totalQs = questions.length;
    const answeredQs = Object.keys(answers).length;
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center', maxWidth: '600px', margin: '40px auto', border: '1px solid #a3b18a', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', background: '#f2f7ee' }}>
        <h2 style={{ color: '#588157', marginBottom: '20px' }}>✓ Exam Submitted Successfully</h2>
        <div style={{ borderBottom: '1px solid #a3b18a', paddingBottom: '20px', marginBottom: '20px' }}>
          <p>Candidate: <strong>{CANDIDATE_NAME}</strong></p>
          <p>Username: <code>{CANDIDATE_USERNAME}</code></p>
        </div>
        <h4 style={{ color: '#2b3a2e' }}>Submission Summary</h4>
        <div style={{ display: 'flex', justifyContent: 'space-around', background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #a3b18a', margin: '20px 0' }}>
          <div><strong>{totalQs}</strong><br/><small style={{color:'#9a9a8f'}}>Total Tasks</small></div>
          <div><strong>{answeredQs}</strong><br/><small style={{color:'#9a9a8f'}}>Answered</small></div>
          <div><strong>{totalQs - answeredQs}</strong><br/><small style={{color:'#9a9a8f'}}>Skipped</small></div>
        </div>
        <p style={{ fontSize: '14px', color: '#9a9a8f' }}>Your biometric data, response profile, and security logs are fully synchronized.</p>
      </div>
    );
  }

if (!examStarted) {
    const hasExamData = localStorage.getItem("exam_time") && localStorage.getItem("exam_questions");
    const submittedData = localStorage.getItem("exam_submitted") === "true";

    return (
      <div style={{ padding: 30, maxWidth: 700, margin: "60px auto", border: "1px solid #a3b18a", borderRadius: 10, textAlign: "center", boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h2>Secure Examination Environment</h2>
        <h3>{CANDIDATE_NAME}</h3>
        <p style={{ color: '#bc4749', fontSize: '14px' }}>
          Warning: Professional anti-cheat logs, tab tracking, and hardware camera monitoring sync automatically.
        </p>

        {loading ? (
          <div style={{ padding: "14px 35px", fontSize: 16, fontWeight: 'bold', color: '#3a5a40' }}>
            Loading Questions...
          </div>
        ) : submittedData ? (
          <>
            <div style={{ background: "#e6efe1", color: "#335c39", padding: 15, borderRadius: 5, marginBottom: 20 }}>
              ✅ Previous assessment layout data has already been fully processed and locked.
            </div>
            <button onClick={startNewExam} style={{ padding: "12px 25px", fontSize: 16, cursor: "pointer", background: '#3a5a40', color:'#fff', border:'none', borderRadius:'5px' }}>
              Start New Exam
            </button>
          </>
        ) : hasExamData ? (
          <>
            <div style={{ background: "#f5e6cf", color: "#8a5a1f", padding: 15, borderRadius: 5, marginBottom: 20, textAlign: 'left' }}>
              <strong>Previous active exam state detected.</strong>
              <br /><br />
              Authorized Recovered Attempts remaining: <strong>{resumeCount} / {MAX_RESUMES}</strong>
            </div>
            <button onClick={resumeExam} disabled={resumeCount >= MAX_RESUMES} style={{ padding: "12px 25px", marginRight: 15, cursor: resumeCount >= MAX_RESUMES ? "not-allowed" : "pointer", background: '#588157', color:'#fff', border:'none', borderRadius:'5px' }}>
              Resume Active Session
            </button>
            <button onClick={startNewExam} style={{ padding: "12px 25px", cursor: "pointer", background: '#bc4749', color:'#fff', border:'none', borderRadius:'5px' }}>
              Overwrite & Start New
            </button>
          </>
        ) : (
          <button onClick={startNewExam} style={{ padding: "14px 35px", fontSize: 16, cursor: "pointer", background: '#3a5a40', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
            Start Exam
          </button>
        )}
      </div>
    );
  }

  if (questions.length === 0) return <div style={{textAlign:'center', marginTop:'100px'}}>Initializing Secure Question Bank Matrix Layers...</div>;

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.values(statuses).filter(s => s === 'review').length;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="app-shell" style={{ position: "relative" }}>
      {/* watermark overlay */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 9999, opacity: 0.04, display: 'flex',
        flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center',
        fontSize: '28px', fontWeight: 'bold', color: '#000', userSelect: 'none'
      }}>
        <div>{CANDIDATE_NAME} • {CANDIDATE_USERNAME}</div>
        <div>SECURE EXAM CONTEXT • {CANDIDATE_NAME}</div>
        <div>{CANDIDATE_USERNAME} • WORKFLOW RUNNING</div>
      </div>

      <header className="app-header">
        <div className="app-title">
          Exam Terminal Dashboard
          {isOffline && (
            <span style={{ marginLeft: 10, background: "#bc4749", padding: "2px 8px", borderRadius: 4, fontSize: 11 }}>
              OFFLINE
            </span>
          )}
        </div>
        <div className={`app-timer ${timeLeft < 60 ? "app-timer--low" : ""}`}>
          <span className="app-timer-label">Time left</span>
          <span className="app-timer-value">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
      </header>

      {/* If timer is running and they exited fullscreen, intercept their next action */}
      {isFullscreenViolated && (
        <div 
          onClickCapture={handleActionFullscreenCapture}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 99999,
            pointerEvents: 'auto',
            cursor: 'pointer',
            boxShadow: 'inset 0 0 20px rgba(239, 68, 68, 0.6)', 
            backgroundColor: 'transparent',
            userSelect: 'none'
          }}
        >
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            fontFamily: 'sans-serif',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            Click anywhere (or your next button) to restore Fullscreen and continue
          </div>
        </div>
      )}

      {isBlurred && (
        <div className="app-banner" style={{ marginTop: 16 }}>
          ⚠️ Focus lost — click back inside the exam window. Repeated escapes will auto-submit.
        </div>
      )}

      <main className="app-main">
        {currentQuestion && (
          <QuestionPanel
            question={currentQuestion}
            index={currentIndex}
            total={questions.length}
            statusLabel={statuses[currentQuestion.id] || "unvisited"}
            selectedOption={answers[currentQuestion.id]}
            onSelectOption={handleSelectOption}
            onPrev={navigatePrev}
            onNext={navigateNext}
            onMarkForReview={markForReview}
            onClearResponse={clearResponse}
            onSubmit={submitExamRequest}
            isFirst={currentIndex === 0}
            isLast={currentIndex === questions.length - 1}
          />
        )}

        <aside className="app-sidebar">
          <CamWindow videoRef={videoRef} />
          <QuestionGrid
            questions={questions}
            statuses={statuses}
            currentIndex={currentIndex}
            onSelect={setCurrentIndex}
          />
          <SecurityPanel
            answeredCount={answeredCount}
            markedCount={markedCount}
            total={questions.length}
            tabSwitches={tabSwitches}
            fullscreenExits={fullscreenExits}
          />
        </aside>
      </main>
    </div>
  );
} 