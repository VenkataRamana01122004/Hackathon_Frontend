import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProblemPanel from "./coding/ProblemPanel.jsx";
import DraggableCamWindow from "./coding/DraggableCamWindow.jsx";
import { getProgress, getRoundLocks, recordCodingResult } from "./utils/progress.js";
import useCameraCoverageWarning from "./utils/useCameraCoverageWarning.js";
import "./candidate.css";

const ASSIGNMENT_DURATION_SECONDS = 300; 
const MAX_RESUMES = 2;

function AssignmentPanel() {
  const navigate = useNavigate();
  
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || { id: "unknown", fullName: "Anonymous Candidate" };
    } catch (e) {
      return { id: "unknown", fullName: "Anonymous Candidate" };
    }
  }, []);


  const [hasPreviousAssignment, setHasPreviousAssignment] = useState(() => {
    return localStorage.getItem("assignment_running") === "true";
  });
  const [isSubmitted, setIsSubmitted] = useState(() => {
    return localStorage.getItem("assignment_submitted") === "true";
  });
  const [resumeCount, setResumeCount] = useState(() => {
    return parseInt(localStorage.getItem("assignment_resume_count") || "0", 10);
  });

  const [isFullscreenViolated, setIsFullscreenViolated] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ASSIGNMENT_DURATION_SECONDS);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("assignment_language") || "java";
  });
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [systemInfo, setSystemInfo] = useState({});
  const [submitting, setSubmitting] = useState(false); 
  const [runningCode, setRunningCode] = useState(false);
  const [securityWarning, setSecurityWarning] = useState("");
  const [cameraViolations, setCameraViolations] = useState(0);
  const [cameraWarningSeconds, setCameraWarningSeconds] = useState(0);

  const submittedRef = useRef(false);
  const assignmentStartRef = useRef(null);

  // Persistent proctoring counters loaded directly from localStorage to handle refreshes
  const tabSwitchCountRef = useRef(parseInt(localStorage.getItem("assignment_tab_switches") || "0", 10));
  const blurCountRef = useRef(parseInt(localStorage.getItem("assignment_blur_events") || "0", 10));
  const fullscreenExitCountRef = useRef(parseInt(localStorage.getItem("assignment_fullscreen_exits") || "0", 10));

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

  const languageRef = useRef(language);
  const codeRef = useRef(code);
  const questionIndexRef = useRef(questionIndex);
  const questionsRef = useRef([]);

  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => { codeRef.current = code; }, [code]);
  useEffect(() => { questionIndexRef.current = questionIndex; }, [questionIndex]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);

  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const videoPreviewRef = useRef(null);
  const cameraCovered = useCameraCoverageWarning(videoPreviewRef, started && !submitting);
  const cameraCoveredRef = useRef(false);
  const cameraViolationActiveRef = useRef(false);
  const cameraViolationCountRef = useRef(0);
  const cameraWarningTimerRef = useRef(null);

  useEffect(() => {
    cameraCoveredRef.current = cameraCovered;
  }, [cameraCovered]);

  const attachVideoElement = useCallback((element) => {
    videoPreviewRef.current = element;
    if (element && mediaStreamRef.current) {
      element.srcObject = mediaStreamRef.current;
      element.play().catch(() => {});
    }
  }, []);

  const [metrics, setMetrics] = useState({
    tabSwitches: tabSwitchCountRef.current,
    blurEvents: blurCountRef.current,
    fullscreenExits: fullscreenExitCountRef.current,
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

  // Load Questions
  useEffect(() => {
    const loadQuestions = async () => {
      setLoadingQuestions(true);
      try {
        const cachedQuestions = localStorage.getItem("assignment_questions");
        if (cachedQuestions) {
          const parsed = JSON.parse(cachedQuestions);
          if (parsed && parsed.length > 0) {
            setQuestions(parsed);
            questionsRef.current = parsed;
            setLoadingQuestions(false);
            return;
          }
        }

        const res = await axios.get("http://localhost:5000/api/candidate/getquestions");
        const questionList = res.data.data || res.data || [];

        localStorage.setItem("assignment_questions", JSON.stringify(questionList));

        setQuestions(questionList);
        questionsRef.current = questionList;
      } catch (err) {
        console.error("Failed to load coding questions:", err);
        alert("Unable to load coding questions.");
      } finally {
        setLoadingQuestions(false);
      }
    };

    loadQuestions();

    setSystemInfo({
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      cores: navigator.hardwareConcurrency || "N/A"
    });
  }, []);

  // Update question Index tracking in storage
  useEffect(() => {
    if (started) {
      localStorage.setItem("assignment_question", questionIndex);
    }
  }, [questionIndex, started]);

  // Load saved code on question/language change
  useEffect(() => {
    if (questions.length === 0) return;

    const savedCode = localStorage.getItem(`saved_code_q_${questionIndex}_${language}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(questions[questionIndex]?.starterCode?.[language] || "");
    }
  }, [questionIndex, language, questions]);

  // Save code dynamically
  useEffect(() => {
    if (started && currentQuestion) {
      localStorage.setItem(`saved_code_q_${questionIndex}_${language}`, code);
    }
  }, [code, started, questionIndex, language, currentQuestion]);

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
      mouseMoves: mouseMoveCountRef.current,
      keyPresses: keyboardLogsRef.current.length,
      blockedShortcuts: blockedShortcutAttemptsRef.current,
      idleTime: idleTimeSecondsRef.current
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        await videoPreviewRef.current.play().catch(() => {});
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

  const submitCode = async (reason = "manual") => {
    if (submittedRef.current || submitting) return;
    submittedRef.current = true;
    setSubmitting(true);
    await window.electronAPI?.stopExam?.();

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }

      const videoBlob = await stopRecordingAndGetBlob();

      const answersPayload = questionsRef.current.map((q, idx) => {
        const cachedJava = localStorage.getItem(`saved_code_q_${idx}_java`);
        const cachedC = localStorage.getItem(`saved_code_q_${idx}_c`);
        const cachedPython = localStorage.getItem(`saved_code_q_${idx}_python`);

        let chosenLanguage = "java";
        let finalCode = q.starterCode?.["java"] || "";

        if (idx === questionIndexRef.current) {
          chosenLanguage = languageRef.current;
          finalCode = codeRef.current;
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

      const startTime = assignmentStartRef.current || new Date().toISOString();

      const payload = {
        username: user.id,
        candidate: user.fullName,
        answers: answersPayload,
        assignmentStartTime: startTime,
        assignmentEndTime: new Date().toISOString(),
        totalTime: Date.now() - new Date(startTime).getTime(),
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

      const formData = new FormData();
      formData.append("metadata", JSON.stringify(payload));
      if (videoBlob) {
        formData.append("evidenceVideo", videoBlob, "exam_recording.webm");
      }

      await axios.post(
        "http://localhost:5000/api/interview/submitAssignment",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      recordCodingResult({ attempted: 1, total: 1 });
      
      // Target specific local keys to clean instead of clear()
      localStorage.removeItem("assignment_running");
      localStorage.removeItem("assignment_end_time");
      localStorage.removeItem("assignment_question");
      localStorage.removeItem("assignment_resume_count");
      localStorage.removeItem("assignment_start");
      localStorage.removeItem("assignment_language");
      localStorage.removeItem("assignment_questions");
      localStorage.removeItem("assignment_tab_switches");
      localStorage.removeItem("assignment_blur_events");
      localStorage.removeItem("assignment_fullscreen_exits");
      localStorage.setItem("assignment_submitted", "true");

      setHasPreviousAssignment(false);
      setIsSubmitted(true);

      // Safely delete all question codes from storage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("saved_code_q_")) {
          localStorage.removeItem(key);
        }
      });

      if (reason === "tab") alert("Exam auto-submitted due to excessive proctoring violations.");
      else if (reason === "timeout") alert("Time limit reached! System auto-submitted your work.");
      else if (reason === "resume_limit") alert("Exam ended because the resume limit was exceeded.");
      else alert("Assignment Submitted Successfully.");

      const updatedUser = JSON.parse(localStorage.getItem("user") || "{}");
      updatedUser.codingExamStatus = "Process";
      localStorage.setItem("user", JSON.stringify(updatedUser));

      navigate("/candidate", { replace: true });
      
    } catch (err) {
      console.error("Submission error:", err);
      alert("Submission failed. Your progress remains saved locally.");
      submittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!started || submitting || !cameraCovered) {
      cameraViolationActiveRef.current = false;
      if (cameraWarningTimerRef.current) {
        clearInterval(cameraWarningTimerRef.current);
        cameraWarningTimerRef.current = null;
      }
      setCameraWarningSeconds(0);
      return undefined;
    }

    if (cameraViolationActiveRef.current || submittedRef.current) return undefined;

    cameraViolationActiveRef.current = true;
    cameraViolationCountRef.current += 1;
    const violationNumber = cameraViolationCountRef.current;
    setCameraViolations(violationNumber);
    setCameraWarningSeconds(10);
    cameraWarningTimerRef.current = setInterval(() => {
      setCameraWarningSeconds((seconds) => {
        if (seconds <= 1) {
          clearInterval(cameraWarningTimerRef.current);
          cameraWarningTimerRef.current = null;
          if (cameraCoveredRef.current && !submittedRef.current) {
            submitCode("camera");
          }
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);

    return () => {
      if (cameraWarningTimerRef.current) {
        clearInterval(cameraWarningTimerRef.current);
        cameraWarningTimerRef.current = null;
      }
    };
  }, [cameraCovered, started, submitting]);

  const handleFullscreenChange = () => {
    if (!started || submittedRef.current) return;

    if (!document.fullscreenElement) {
      fullscreenExitCountRef.current++;
      localStorage.setItem("assignment_fullscreen_exits", fullscreenExitCountRef.current);
      syncMetrics();

      if (fullscreenExitCountRef.current >= 3) {
        submitCode("fullscreen");
        return;
      }

      setSecurityWarning(
        fullscreenExitCountRef.current === 2
          ? "Warning: one fullscreen exit remains before automatic submission."
          : `Fullscreen exited. ${3 - fullscreenExitCountRef.current} chances remain.`
      );
      setIsFullscreenViolated(true);
    }
  };

  const handleActionFullscreenCapture = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreenViolated(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!started) return;

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const handleVisibility = () => {
      if (document.hidden) {
        tabSwitchCountRef.current++;
        localStorage.setItem("assignment_tab_switches", tabSwitchCountRef.current);
        syncMetrics();
        if (tabSwitchCountRef.current >= 3 && !submittedRef.current) {
          submitCode("tab");
        }
      }
    };

    const handleBlur = () => {
      blurCountRef.current++;
      localStorage.setItem("assignment_blur_events", blurCountRef.current);
      syncMetrics();
    };

    const removeSecurityListener = window.electronAPI?.onSecurityEvent?.((event) => {
      if (event.type !== "APPLICATION_SWITCH" || submittedRef.current) return;

      tabSwitchCountRef.current = Math.max(
        tabSwitchCountRef.current,
        Number(event.count) || 0
      );
      localStorage.setItem("assignment_tab_switches", tabSwitchCountRef.current);
      syncMetrics();

      if (tabSwitchCountRef.current >= 3) {
        submitCode("tab");
      } else {
        setSecurityWarning(
          tabSwitchCountRef.current === 2
            ? "Warning: one tab switch remains before automatic submission."
            : `Tab switch detected. ${3 - tabSwitchCountRef.current} chances remain.`
        );
      }
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.href);
      alert("Navigation back is strictly locked during the examination.");
    };

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if ((e.ctrlKey || e.metaKey) && (key === "c" || key === "v" || key === "x")) {
        e.preventDefault();
        e.stopPropagation();

        if (key === "c") copyAttemptsRef.current++;
        if (key === "v") pasteAttemptsRef.current++;
        if (key === "x") cutAttemptsRef.current++;

        syncMetrics();
        return;
      }

      const isF12 = e.key === "F12";
      const isInspectElement = e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J");
      const isViewSource = e.ctrlKey && e.key.toLowerCase() === "u";

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
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("click", handleMouseClick);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("copy", handleCopy);
    window.addEventListener("cut", handleCut);
    window.addEventListener("paste", handlePaste);
    window.addEventListener("contextmenu", handleContextMenu);

    const timeInterval = setInterval(() => {
      const endTime = Number(localStorage.getItem("assignment_end_time"));
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));

      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timeInterval);
        submitCode("timeout");
      }

      const timeSinceLastActivity = (Date.now() - lastActivityTimeRef.current) / 1000;
      if (timeSinceLastActivity >= 30) {
        idleTimeSecondsRef.current += 1;
        syncMetrics();
      }
    }, 1000);

    return () => {
      removeSecurityListener?.();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("click", handleMouseClick);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("copy", handleCopy);
      window.removeEventListener("cut", handleCut);
      window.removeEventListener("paste", handlePaste);
      window.removeEventListener("contextmenu", handleContextMenu);
      clearInterval(timeInterval);
    };
  }, [started]); 

  const startAssignment = async () => {
    if (loadingQuestions) {
      alert("Coding questions are still loading. Please wait...");
      return;
    }

    if (questions.length === 0) {
      alert("No coding questions available.");
      return;
    }

    const startTimeISO = new Date().toISOString();
    assignmentStartRef.current = startTimeISO;
    lastActivityTimeRef.current = Date.now();

    // Reset previous submitted state & sync React State
    localStorage.removeItem("assignment_submitted");
    setIsSubmitted(false);

    // Reset metric logs in localStorage for a clean attempt
    localStorage.removeItem("assignment_tab_switches");
    localStorage.removeItem("assignment_blur_events");
    localStorage.removeItem("assignment_fullscreen_exits");
    tabSwitchCountRef.current = 0;
    blurCountRef.current = 0;
    fullscreenExitCountRef.current = 0;
    syncMetrics();

    // Assignment Starts -> Write storage config
    localStorage.setItem("assignment_running", "true");
    setHasPreviousAssignment(true);
    
    const absoluteEndTime = Date.now() + ASSIGNMENT_DURATION_SECONDS * 1000;
    localStorage.setItem("assignment_end_time", absoluteEndTime);
    
    localStorage.setItem("assignment_resume_count", "0");
    localStorage.setItem("assignment_start", startTimeISO);
    localStorage.setItem("assignment_language", language);
    localStorage.setItem("assignment_questions", JSON.stringify(questions));

    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.log("Fullscreen request initialization skipped:", err);
    }

    const examStartResult = await window.electronAPI?.startExam?.();
    if (examStartResult && !examStartResult.success) {
      throw new Error(examStartResult.message || "Unable to start the exam.");
    }

    setStarted(true);
    setTimeout(async () => {
      if (!document.fullscreenElement) {
        try {
          await document.documentElement.requestFullscreen();
        } catch (err) {
          console.error(err);
        }
      }
    }, 0);

    await startRecording();
  };

  const resumeAssignment = async () => {
    const count = Number(localStorage.getItem("assignment_resume_count") || 0);

    if (count >= MAX_RESUMES) {
      submitCode("resume_limit");
      return;
    }

    localStorage.setItem("assignment_resume_count", count + 1);
    setResumeCount(count + 1);

    const endTime = Number(localStorage.getItem("assignment_end_time"));
    const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    setTimeLeft(remaining);

    setQuestionIndex(Number(localStorage.getItem("assignment_question") || 0));
    
    const savedLanguage = localStorage.getItem("assignment_language") || "java";
    setLanguage(savedLanguage);

    const savedQuestions = JSON.parse(localStorage.getItem("assignment_questions") || "[]");
    if (savedQuestions && savedQuestions.length > 0) {
      setQuestions(savedQuestions);
      questionsRef.current = savedQuestions;
    }

    // Refresh refs to mirror metrics precisely upon sudden tab recovery
    tabSwitchCountRef.current = Math.max(0,parseInt(localStorage.getItem("assignment_tab_switches") || "0", 10) - 1);
    blurCountRef.current = parseInt(localStorage.getItem("assignment_blur_events") || "0", 10);
    fullscreenExitCountRef.current = parseInt(localStorage.getItem("assignment_fullscreen_exits") || "0", 10);
    syncMetrics();

    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.log("Fullscreen request initialization skipped:", err);
    }

    const examStartResult = await window.electronAPI?.startExam?.();
    if (examStartResult && !examStartResult.success) {
      throw new Error(examStartResult.message || "Unable to resume the exam.");
    }

    assignmentStartRef.current = localStorage.getItem("assignment_start");
    setStarted(true);
    await startRecording();
  };

  useEffect(() => {
    if (!started || submittedRef.current) return;

    const restoreFullscreen = async () => {
      if (!document.fullscreenElement) {
        try {
          await document.documentElement.requestFullscreen();
        } catch {}
      }
    };

    window.addEventListener("click", restoreFullscreen);
    window.addEventListener("keydown", restoreFullscreen);

    return () => {
      window.removeEventListener("click", restoreFullscreen);
      window.removeEventListener("keydown", restoreFullscreen);
    };
  }, [started]);

  // Before unload block to verify running status
  useEffect(() => {
    const beforeUnload = () => {
      if (started && !submittedRef.current) {
        localStorage.setItem("assignment_running", "true");
      }
    };

    window.addEventListener("beforeunload", beforeUnload);

    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [started]);

  const handleQuestionChange = (index) => {
    setQuestionIndex(index);
    setOutput("");
    setInput("");
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    if (started) {
      localStorage.setItem("assignment_language", lang);
    }
  };

  const runCode = async () => {
    try {
      // const res = await axios.post("http://localhost:5000/api/interview/compile", {
      const res = await axios.post("http://localhost:2004/api/compiler/run", {
        language,
        code,
        input,
      });
      setOutput(res.data.output);
    } catch (err) {
      setOutput(err.response?.data?.error || err.response?.data?.output || "Compilation Failed");
    }
    finally {
    setRunningCode(false);
  }
  };

  // 1. Resume Screen Layout
  if (!started && hasPreviousAssignment && !isSubmitted) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column", background: "#efefd0" }}>
        <h1 style={{ fontFamily: "Arial", color: "#2b3a2e", marginBottom: "20px" }}>Resume Assignment</h1>
        <div style={{ background: "#fff", padding: "30px", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", textAlign: "center", maxWidth: "500px" }}>
          <p style={{ fontFamily: "Arial", color: "#e11d48", fontWeight: "bold", marginBottom: "15px" }}>
            An active exam session was detected!
          </p>
          <p style={{ fontFamily: "Arial", color: "#4b5563", marginBottom: "25px", lineHeight: "1.5" }}>
            You have used <strong>{resumeCount}</strong> out of <strong>{MAX_RESUMES}</strong> allowed session resumes. 
            Exceeding this limit will instantly auto-submit your assignment.
          </p>
          {loadingQuestions ? (
            <p style={{ fontSize: "18px", fontWeight: "600", color: "#3a5a40" }}>
              Loading Questions...
            </p>
          ) : (
            <button
              onClick={resumeAssignment}
              style={{
                padding: "12px 24px",
                fontSize: 16,
                background: "#e11d48",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Resume Assignment
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. Default Initial Start Layout
  if (!started) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column", background: "#efefd0" }}>
        <h1 style={{ fontFamily: "Arial", color: "#2b3a2e", marginBottom: "20px" }}>Secure Assessment Environment</h1>
        <div style={{ background: "#fff", padding: "30px", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", textAlign: "center", maxWidth: "500px" }}>
          <p style={{ fontFamily: "Arial", color: "#9a9a8f", marginBottom: "25px", lineHeight: "1.5" }}>
            This test triggers comprehensive proctoring analytics including active background video/audio feed evaluation, layout lockouts, and context control locks.
          </p>
          {loadingQuestions ? (
            <p style={{ fontSize: "18px", fontWeight: "600", color: "#3a5a40" }}>
              Loading Questions...
            </p>
          ) : (
            <button
              onClick={startAssignment}
              style={{
                padding: "12px 24px",
                fontSize: 16,
                background: "#3a5a40",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Accept Permissions & Start
            </button>
          )}
        </div>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // 3. Main Coding Dashboard Layout
  return (
    <div className="app-shell" style={{ position: "relative" }}>
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 9999, opacity: 0.04, fontSize: '28px',
        fontWeight: 'bold', color: '#000', display: 'flex', flexWrap: 'wrap',
        justifyContent: 'space-around'
      }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} style={{ transform: "rotate(-25deg)", margin: "80px" }}>SECURE EXAM CONTEXT</div>
        ))}
      </div>

      <header className="app-header">
        {isFullscreenViolated && (
          <div
            onClickCapture={handleActionFullscreenCapture}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 99999,
              background: "transparent",
              cursor: "pointer",
              userSelect: "none",
              pointerEvents: "auto",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 20,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#ef4444",
                color: "#fff",
                padding: "10px 18px",
                borderRadius: 20,
                fontWeight: "bold",
              }}
            >
              Click anywhere to continue the exam in Fullscreen
            </div>
          </div>
        )}
        <div className="app-title">Coding Assignment</div>
        <div className={`app-timer ${timeLeft < 60 ? "app-timer--low" : ""}`}>
          <span className="app-timer-label">Time left</span>
          <span className="app-timer-value">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
      </header>

      {!isOnline && (
        <div className="app-banner" style={{ marginTop: 16 }}>
          ⚠️ Network offline — progress keeps saving locally, avoid refreshing.
        </div>
      )}

      {securityWarning && (
        <div className="app-banner" style={{ marginTop: 16, background: securityWarning.startsWith("Camera") ? "#fee2e2" : undefined, borderColor: securityWarning.startsWith("Camera") ? "#dc2626" : undefined, color: securityWarning.startsWith("Camera") ? "#991b1b" : undefined }} role="alert">
          ⚠️ {securityWarning}
        </div>
      )}

      {questions.length > 0 && (
        <div className="question-picker" style={{ margin: "16px 28px 0" }}>
          {questions.map((q, index) => (
            <button
              key={q.id}
              type="button"
              className={`question-picker-btn ${index === questionIndex ? "question-picker-btn--active" : ""}`}
              onClick={() => handleQuestionChange(index)}
              title={q.title}
            >
              Q{index + 1}
            </button>
          ))}
        </div>
      )}

      <main className="app-main">
        <ProblemPanel
          question={{
            ...currentQuestion,
            input: currentQuestion?.inputFormat,
            output: currentQuestion?.outputFormat
          }}
          index={questionIndex}
          total={questions.length}
        />
        <section className="editor-panel">
          <div className="editor-toolbar">
            <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--green-dark)" }}>Language: </label>
            <select
              className="language-select"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
            >
              <option value="java">Java</option>
              <option value="c">C</option>
              <option value="python">Python</option>
            </select>
            {/* <button type="button" className="btn btn--secondary" style={{ width: "auto" }} onClick={runCode}>
              Run Code
            </button> */}
            <button
              type="button"
              className="btn btn--secondary"
              style={{ width: "auto" }}
              onClick={runCode}
              disabled={runningCode}
            >
              {runningCode ? "Running..." : "Run Code"}
            </button>
            <button
              type="button"
              className="btn btn--submit"
              style={{ width: "auto", marginLeft: "auto" }}
              onClick={() => submitCode("manual")}
              disabled={submitting}
            >
              {submitting ? "Processing Submit..." : "Submit Examination"}
            </button>
          </div>

          <textarea className="code-editor-textarea" value={code} onChange={(e) => setCode(e.target.value)} />

          <div className="problem-section-label">Custom Terminal Input</div>
          <textarea className="terminal-input-textarea" value={input} onChange={(e) => setInput(e.target.value)} />

          <div className="problem-section-label">Output Console</div>
          <pre className="output-console">{output}</pre>
        </section>
      </main>

      <DraggableCamWindow
        videoRef={videoPreviewRef}
        onVideoRef={attachVideoElement}
      />

      {cameraCovered && (
        <div className="app-banner" style={{ margin: "12px 28px", background: "#fee2e2", borderColor: "#dc2626", color: "#991b1b" }} role="alert">
          ⚠️ Camera covered ({cameraViolations}/3). Uncover within {cameraWarningSeconds} seconds or the exam will be submitted.
        </div>
      )}

      <div className="security-panel" style={{ margin: "0 28px 24px" }}>
        <h5>Proctoring Metrics (Active Diagnostics)</h5>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px 16px" }}>
          <div className="security-row"><span>Tab switches</span><strong>{metrics.tabSwitches} / 3</strong></div>
          <div className="security-row"><span>Blur events</span><strong>{metrics.blurEvents}</strong></div>
          <div className="security-row"><span>Fullscreen exits</span><strong>{metrics.fullscreenExits}</strong></div>
        </div>
      </div>
    </div>
  );
}

export default AssignmentPanel;