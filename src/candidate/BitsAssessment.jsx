import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import QuestionPanel from "./mcq/QuestionPanel.jsx";
import QuestionGrid from "./mcq/QuestionGrid.jsx";
import CamWindow from "./mcq/CamWindow.jsx";
import SecurityPanel from "./mcq/SecurityPanel.jsx";
import useCameraCoverageWarning from "./utils/useCameraCoverageWarning.js";
// import { hasSubmittedProfile } from "./utils/profile.js";
import axios from "axios";
import "./candidate.css";


// --- CONFIGURATION ---
const BACKEND_URL = 'http://localhost:5000/api/interview/submitbitsassessment';
const SECURITY_URL = "http://localhost:5000/api/candidate/background-process";
const EXAM_DURATION = 1800;
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
  // The countdown is held until camera, microphone, video playback and recording are ready.
  const [cameraReady, setCameraReady] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [statuses, setStatuses] = useState({});
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [logs, setLogs] = useState([]);
  const [isFullscreenViolated, setIsFullscreenViolated] = useState(false);
  
  const [fullscreenExits, setFullscreenExits] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [blurEvents, setBlurEvents] = useState(0);
  const [isBlurred, setIsBlurred] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [securityWarning, setSecurityWarning] = useState("");
  const [cameraViolations, setCameraViolations] = useState(0);
  const [cameraWarningSeconds, setCameraWarningSeconds] = useState(0);
  const [cameraIssueDetected, setCameraIssueDetected] = useState(false);
  const [resumeCount, setResumeCount] = useState(() => parseInt(localStorage.getItem("resume_count") || "0", 10));



  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const cameraCovered = useCameraCoverageWarning(videoRef, examStarted && !examFinished);

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
  const backgroundApplicationsRef = useRef([]);
  const cameraCoveredRef = useRef(false);
  const cameraViolationActiveRef = useRef(false);
  const cameraViolationCountRef = useRef(0);
  const cameraWarningTimerRef = useRef(null);
  const lastTabSwitchAtRef = useRef(0);

  const frameCanvasRef = useRef(document.createElement("canvas"));
const lastFrameHashRef = useRef(null);
const frozenFramesRef = useRef(0);
const cameraIssueDetectedRef = useRef(false);

  const attachVideoElement = useCallback((element) => {
    videoRef.current = element;
    if (element && streamRef.current) {
      element.srcObject = streamRef.current;
      element.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    cameraCoveredRef.current = cameraCovered;
  }, [cameraCovered]);

  useEffect(() => {
  cameraIssueDetectedRef.current = cameraIssueDetected;
}, [cameraIssueDetected]);

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

  // The question currently on screen counts as "visited" the moment it's
  // shown â€” not just when the candidate clicks Next or jumps via the grid.
  // This also makes question 1 start out visited instead of unvisited.
  useEffect(() => {
    const currentQ = questions[currentIndex];
    if (!currentQ || statuses[currentQ.id]) return;

    setStatuses((prev) => {
      if (prev[currentQ.id]) return prev;
      const updated = { ...prev, [currentQ.id]: "visited" };
      statusesRef.current = updated;
      localStorage.setItem("exam_statuses", JSON.stringify(updated));
      return updated;
    });
  }, [currentIndex, questions, statuses]);

useEffect(() => {
  const isRunning = localStorage.getItem("exam_running") === "true";
  const savedQuestions = localStorage.getItem("exam_questions");
  const savedAnswers = localStorage.getItem("exam_answers");
  const savedStatuses = localStorage.getItem("exam_statuses");
  const savedTime = localStorage.getItem("exam_time");
  const savedFullscreenExits = localStorage.getItem("fullscreen_exits");
  const savedTabSwitches = localStorage.getItem("tab_switches");

  if (savedQuestions) {
    const restoredQuestions = JSON.parse(savedQuestions);
    questionsRef.current = restoredQuestions;
    setQuestions(restoredQuestions);
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

useEffect(() => {
  if (!examStarted || examFinished) return;

  const checkBackgroundApplications = async () => {
    try {
      // Electron environment
      if (
        window.electronAPI &&
        typeof window.electronAPI.getBackgroundApplications === "function"
      ) {
        const result =
          await window.electronAPI.getBackgroundApplications();

        if (result?.success) {
          backgroundApplicationsRef.current =
            result.applications || [];

          console.log(
            "Background applications:",
            backgroundApplicationsRef.current
          );
        } else {
          console.warn(
            "Background application check failed:",
            result?.error
          );
        }
      }
    } catch (error) {
      console.error(
        "Background application check error:",
        error
      );
    }
  };

  // Check immediately
  checkBackgroundApplications();

  // Then periodically
  const interval = setInterval(
    checkBackgroundApplications,
    5000
  );

  return () => clearInterval(interval);
}, [examStarted, examFinished]);

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
  // The exam UI renders first so CamWindow mounts. Then camera initialization
  // runs; the countdown remains paused until initProctoring sets cameraReady.
  useEffect(() => {
    if (examStarted && !examFinished) {
      setCameraReady(false);
      initProctoring();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [examStarted, examFinished]);

  // --- COUNTDOWN TIMER ---
  // Do not consume exam time until the camera and recorder are confirmed ready.
  useEffect(() => {
    if (!examStarted || !cameraReady || examFinished) return;

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
    }, 500);

    return () => clearInterval(interval);
  }, [examStarted, cameraReady, examFinished]);

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
   const isVideoFrozen = () => {
  const video = videoRef.current;

  if (!video || video.readyState < 2) {
    return false;
  }

  const canvas = frameCanvasRef.current;
  canvas.width = 32;
  canvas.height = 24;

  const ctx = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!ctx) return false;

  try {
    ctx.drawImage(video, 0, 0, 32, 24);

    const pixels = ctx.getImageData(0, 0, 32, 24).data;

    let hash = 0;

    for (let i = 0; i < pixels.length; i += 20) {
      hash += pixels[i];
    }

    if (hash === lastFrameHashRef.current) {
      frozenFramesRef.current += 1;
    } else {
      frozenFramesRef.current = 0;
    }

    lastFrameHashRef.current = hash;

    return frozenFramesRef.current >= 3;
  } catch {
    return false;
  }
};

  const initProctoring = async () => {
    let stream = null;

    // Always hold the timer until every proctoring startup step succeeds.
    setCameraReady(false);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera and microphone access is not supported in this environment.");
      }

      // 1. Acquire both camera and microphone.
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 30 },
          facingMode: "user",
        },
        audio: true,
      });

      streamRef.current = stream;

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      if (!videoTrack || videoTrack.readyState !== "live") {
        throw new Error("The camera could not be initialized.");
      }

      if (!audioTrack || audioTrack.readyState !== "live") {
        throw new Error("The microphone could not be initialized.");
      }

      videoTrack.addEventListener("ended", () => {
        logEvent("SECURITY ALERT: Camera disconnected.");
        setCameraIssueDetected(true);
      });

      videoTrack.addEventListener("mute", () => {
        logEvent("SECURITY ALERT: Camera feed muted.");
        setCameraIssueDetected(true);
      });

      videoTrack.addEventListener("unmute", () => {
        setCameraIssueDetected(false);
        frozenFramesRef.current = 0;
        lastFrameHashRef.current = null;
        logEvent("Camera feed restored.");
      });

      audioTrack.addEventListener("ended", () => {
        logEvent("SECURITY ALERT: Microphone disconnected.");
        setCameraIssueDetected(true);
      });

      // 2. Attach the stream to the already-mounted CamWindow and confirm playback.
      const video = videoRef.current;
      if (!video) {
        throw new Error("The camera preview element is not available.");
      }

      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;

      if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
        await new Promise((resolve, reject) => {
          const onLoadedMetadata = () => {
            cleanup();
            resolve();
          };
          const onError = () => {
            cleanup();
            reject(new Error("The camera video metadata could not be loaded."));
          };
          const cleanup = () => {
            video.removeEventListener("loadedmetadata", onLoadedMetadata);
            video.removeEventListener("error", onError);
          };
          video.addEventListener("loadedmetadata", onLoadedMetadata, { once: true });
          video.addEventListener("error", onError, { once: true });
        });
      }

      await video.play();

      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.videoWidth <= 0) {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            cleanup();
            reject(new Error("The camera did not provide a playable video frame."));
          }, 10000);

          const onPlaying = () => {
            cleanup();
            resolve();
          };
          const cleanup = () => {
            clearTimeout(timeout);
            video.removeEventListener("playing", onPlaying);
          };
          video.addEventListener("playing", onPlaying, { once: true });
        });
      }

      if (video.paused || video.videoWidth <= 0) {
        throw new Error("Camera video playback could not be confirmed.");
      }

      // 3. Start MediaRecorder only after video playback is confirmed.
      if (typeof MediaRecorder === "undefined") {
        throw new Error("MediaRecorder is not supported in this environment.");
      }

      const options = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? { mimeType: "video/webm;codecs=vp9" }
        : { mimeType: "video/webm" };

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0 && mediaRecorderRef.current === recorder) {
          mediaRecorderRef.current.finalBlob = event.data;
        }
      };

      recorder.onerror = (event) => {
        console.error("MediaRecorder error:", event.error);
        logEvent("SECURITY ALERT: Camera recording error.");
        setCameraIssueDetected(true);
      };

      recorder.start();

      if (recorder.state !== "recording") {
        throw new Error("The camera recording did not start successfully.");
      }

      // 4. Mark ready only after the stream, playback and recorder are all working.
      setCameraReady(true);
      logEvent("Camera and microphone initialized. Video playback confirmed and MediaRecorder started.");

      const freezeMonitor = setInterval(() => {
        if (examFinishedRef.current || submittingRef.current) {
          clearInterval(freezeMonitor);
          return;
        }

        setCameraIssueDetected(isVideoFrozen());
      }, 100);

    } catch (err) {
      console.error("Hardware access exceptions:", err);

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch (stopError) {
          console.warn("Unable to stop partially initialized recorder:", stopError);
        }
      }

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      streamRef.current = null;
      mediaRecorderRef.current = null;
      setCameraReady(false);
      setExamStarted(false);
      localStorage.removeItem("exam_running");

      try {
        await window.electronAPI?.stopExam?.();
      } catch (stopError) {
        console.warn("Unable to stop Electron exam mode:", stopError);
      }

      alert(
        `Unable to start the exam because camera/microphone initialization failed.\n\n${err.message || "Unknown hardware error"}\n\nPlease enable camera and microphone access, then try again.`
      );
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
        setSecurityWarning(
          next === 2
            ? "Warning: one fullscreen exit remains before automatic submission."
            : `Fullscreen exited. ${3 - next} chances remain.`
        );
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

    const recordTabSwitch = () => {
      const now = Date.now();
      if (now - lastTabSwitchAtRef.current < 750) return;
      lastTabSwitchAtRef.current = now;

      setTabSwitches((current) => {
        const next = current + 1;
        tabSwitchesRef.current = next;
        localStorage.setItem("tab_switches", String(next));
        logEvent(`SECURITY ALERT: Tab switch detected (#${next})`);

        if (next >= 3) {
          autoSubmitExam("Exceeded Max Tab Switch limit.");
        } else {
          setSecurityWarning(
            next === 2
              ? "Warning: one tab switch remains before automatic submission."
              : `Tab switch detected. ${3 - next} chances remain.`
          );
        }

        return next;
      });
    };

    const handleVisibility = () => {
      if (document.hidden) recordTabSwitch();
    };

    const removeSecurityListener = window.electronAPI?.onSecurityEvent?.((event) => {
      if (event.type !== "APPLICATION_SWITCH" || submittingRef.current) return;

      recordTabSwitch();
    });

    const handleFocusBlur = () => {
      setIsBlurred(true);
      recordTabSwitch();
      logEvent("Focus lost (tab/application switch detected).");
    };
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
      removeSecurityListener?.();
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
      // const response = await axios.get(
      //   "http://localhost:5000/api/candidate/getMcqQuestions"
      // );

      const storedUser = JSON.parse( localStorage.getItem("user") || "{}" ); 
      const candidateId = storedUser.id; 
      if (!candidateId) 
        { throw new Error("Candidate ID not found. Please log in again."); } 
      const response = await axios.get( "http://localhost:5000/api/candidate/getMcqQuestions", { params: { candidate_id: candidateId, }, } );

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
      localStorage.removeItem("mcq_result");
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
      questionsRef.current = randomized;
localStorage.setItem("exam_questions", JSON.stringify(randomized));

const examStartResult = await window.electronAPI?.startExam?.();
if (examStartResult && !examStartResult.success) {
  throw new Error(examStartResult.message || "Unable to start the exam.");
}

setCameraReady(false);
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
    questionsRef.current = savedQuestions;
    setTimeLeft(savedTime);

    localStorage.setItem("exam_running", "true");

    await document.documentElement.requestFullscreen().catch(() => {});
    const examStartResult = await window.electronAPI?.startExam?.();
    if (examStartResult && !examStartResult.success) {
      throw new Error(examStartResult.message || "Unable to resume the exam.");
    }
    setCameraReady(false);
    setExamStarted(true);
    logEvent(`Exam session resumed. Attempt count: ${count}`);
  };

  const submitExamRequest = () => {
    autoSubmitExam("User submission.");
  };

  const submitSecurityCheck = async () => {

  try {

    const securityData = {

      candidateId: user?.id,

      backgroundApplications:
        backgroundApplicationsRef.current,

      fullscreenExits:
        fullscreenExitsRef.current,

      tabSwitches:
        tabSwitchesRef.current,

      isBlurred:
        isBlurredRef.current,

      isOffline:
        isOfflineRef.current,

      securityPassed: true,

      securityLogs:
        logsRef.current
    };

    console.log(
      "Submitting security check data:",
      securityData
    );

    const response = await axios.post(
      SECURITY_URL,
      securityData,
      {
        timeout: 15000
      }
    );

    console.log(
      "Security check saved successfully:",
      response.data
    );

    return response.data;

  } catch (error) {

    console.error(
      "Security check submission failed:",
      error
    );

    // Do NOT stop exam submission if security API fails.
    return null;
  }
};


  const autoSubmitExam = async (reason) => {
    if (submittingRef.current) return;

    submittingRef.current = true;
    setCameraReady(false);
    setExamFinished(true);
    await window.electronAPI?.stopExam?.();

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

    await submitSecurityCheck();

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

    navigate("/candidate", { replace: true });
  };

  useEffect(() => {
    
    const cameraProblem =
  cameraCovered || cameraIssueDetected;

if (
  !examStarted ||
  examFinished ||
  !cameraProblem
) {
      cameraViolationActiveRef.current = false;
      if (cameraWarningTimerRef.current) {
        clearInterval(cameraWarningTimerRef.current);
        cameraWarningTimerRef.current = null;
      }
      setCameraWarningSeconds(0);
      return undefined;
    }

    if (cameraViolationActiveRef.current || submittingRef.current) return undefined;

    cameraViolationActiveRef.current = true;
    cameraViolationCountRef.current += 1;
    const violationNumber = cameraViolationCountRef.current;
    setCameraViolations(violationNumber);
    if (violationNumber >= 3 && !submittingRef.current) {
  autoSubmitExam("Maximum camera violations exceeded.");
  return;
}
    setCameraWarningSeconds(10);
    cameraWarningTimerRef.current = setInterval(() => {
      setCameraWarningSeconds((seconds) => {
        if (seconds <= 1) {
          clearInterval(cameraWarningTimerRef.current);
          cameraWarningTimerRef.current = null;
          if (
  (cameraCoveredRef.current ||
    cameraIssueDetectedRef.current) &&
  !submittingRef.current
){
            autoSubmitExam("Camera remained covered for 10 seconds.");
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
  }, [
  cameraCovered || cameraIssueDetected,
  examStarted,
  examFinished
]);

  if (examFinished) {
    // No results screen â€” submission finishes and autoSubmitExam() takes
    // the candidate straight back to the candidate home page. This is a
    // brief placeholder for the moment in between.
    return (
      <div className="glass-panel glass-panel--elevated" style={{ padding: '60px 40px', textAlign: 'center', maxWidth: '500px', margin: '40px auto', color: 'var(--text-primary)' }}>
        <h2 style={{ marginBottom: '10px' }}>Submitting your assessmentâ€¦</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Please wait, you'll be redirected shortly.</p>
      </div>
    );
  }

if (!examStarted) {
    const hasExamData = localStorage.getItem("exam_time") && localStorage.getItem("exam_questions");
    const submittedData = localStorage.getItem("exam_submitted") === "true";

    return (
      <div className="glass-panel glass-panel--elevated" style={{ padding: 30, maxWidth: 700, margin: "60px auto", textAlign: "center", color: 'var(--text-primary)' }}>
        <h2>Secure Examination Environment</h2>
        <h3>{CANDIDATE_NAME}</h3>
        <p style={{ color: '#fca5a5', fontSize: '14px' }}>
          Warning: Professional anti-cheat logs, tab tracking, and hardware camera monitoring sync automatically.
        </p>

        {loading ? (
          <div style={{ padding: "14px 35px", fontSize: 16, fontWeight: 'bold', color: 'var(--accent-light)' }}>
            Loading Questions...
          </div>
        ) : submittedData ? (
          <>
            <div style={{ background: "var(--success-soft)", color: "#4ade80", padding: 15, borderRadius: 5, marginBottom: 20 }}>
              âœ… Previous assessment layout data has already been fully processed and locked.
            </div>
            <button onClick={startNewExam} className="btn btn--primary" style={{ padding: "12px 25px", fontSize: 16 }}>
              Start New Exam
            </button>
          </>
        ) : hasExamData ? (
          <>
            <div style={{ background: "var(--warning-soft)", color: "#fbbf24", padding: 15, borderRadius: 5, marginBottom: 20, textAlign: 'left' }}>
              <strong>Previous active exam state detected.</strong>
              <br /><br />
              Authorized Recovered Attempts remaining: <strong>{resumeCount} / {MAX_RESUMES}</strong>
            </div>
            <button onClick={resumeExam} disabled={resumeCount >= MAX_RESUMES} className="btn" style={{ padding: "12px 25px", marginRight: 15, background: 'var(--success)', color: '#fff' }}>
              Resume Active Session
            </button>
            <button onClick={startNewExam} className="btn btn--danger" style={{ padding: "12px 25px" }}>
              Overwrite & Start New
            </button>
          </>
        ) : (
          <button onClick={startNewExam} className="btn btn--primary" style={{ padding: "14px 35px", fontSize: 16, fontWeight: 'bold' }}>
            Start Exam
          </button>
        )}
      </div>
    );
  }

  if (questions.length === 0) return <div style={{textAlign:'center', marginTop:'100px', color: 'var(--text-primary)'}}>Initializing Secure Question Bank Matrix Layers...</div>;

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.values(statuses).filter(s => s === 'review').length;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="app-shell" style={{ position: "relative" }}>
      {!cameraReady && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 12,
            padding: 24,
            background: "rgba(8, 12, 24, 0.94)",
            color: "#fff",
            textAlign: "center",
            pointerEvents: "all",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: 42,
              height: 42,
              border: "4px solid rgba(255,255,255,0.25)",
              borderTopColor: "#60a5fa",
              borderRadius: "50%",
              animation: "bitsCameraSpin 0.9s linear infinite",
            }}
          />
          <h2 style={{ margin: 0 }}>Preparing secure exam environment</h2>
          <p style={{ margin: 0, maxWidth: 440, color: "#cbd5e1" }}>
            Please allow camera and microphone access. The exam countdown will begin only after video playback and recording are confirmed.
          </p>
          <style>{`@keyframes bitsCameraSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* watermark overlay */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 9999, opacity: 0.04, display: 'flex',
        flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center',
        fontSize: '28px', fontWeight: 'bold', color: '#000', userSelect: 'none'
      }}>
        <div>{CANDIDATE_NAME} â€¢ {CANDIDATE_USERNAME}</div>
        <div>SECURE EXAM CONTEXT â€¢ {CANDIDATE_NAME}</div>
        <div>{CANDIDATE_USERNAME} â€¢ WORKFLOW RUNNING</div>
      </div>

      <header className="app-header">
        <div className="app-title">
          Exam Terminal Dashboard
          {isOffline && (
            <span style={{ marginLeft: 10, background: "var(--danger)", color: "#fff", padding: "2px 8px", borderRadius: 4, fontSize: 11 }}>
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
          ⚠️ Focus lost click back inside the exam window. Repeated escapes will auto-submit.
        </div>
      )}

      {securityWarning && (
        <div className="app-banner" style={{ marginTop: 16 }}>
          ⚠️ {securityWarning}
        </div>
      )}

      {(cameraCovered || cameraIssueDetected) && (
        <div
          className="app-banner"
          style={{
            marginTop: 16,
            background: "var(--danger-soft)",
            borderColor: "var(--danger)",
            color: "#fca5a5"
          }}
          role="alert"
        >
          ⚠️ Camera violation ({cameraViolations}/3). Restore camera within{" "}
          {cameraWarningSeconds} seconds or the exam will be submitted.
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
          <CamWindow videoRef={videoRef} onVideoRef={attachVideoElement} />
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
            blurEvents={blurEvents}
            cameraCovered={cameraCovered}
            cameraViolations={cameraViolations}
            cameraWarningSeconds={cameraWarningSeconds}
          />
        </aside>
      </main>
    </div>
  );
}