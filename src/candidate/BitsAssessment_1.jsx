import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from "react";

import { useNavigate } from "react-router-dom";
import QuestionPanel from "./mcq/QuestionPanel.jsx";
import QuestionGrid from "./mcq/QuestionGrid.jsx";
import CamWindow from "./mcq/CamWindow.jsx";
import SecurityPanel from "./mcq/SecurityPanel.jsx";

import axios from "axios";
import "./candidate.css";

/* =========================================================
   CONFIGURATION
========================================================= */

const BACKEND_URL =
  "http://localhost:5000/api/interview/submitbitsassessment";

const QUESTIONS_URL =
  "http://localhost:5000/api/candidate/getMcqQuestions";

const SECURITY_URL =
  "http://localhost:5000/api/candidate/security-check";

const EXAM_DURATION = 300;

const MAX_RESUMES = 1;


/* =========================================================
   HELPERS
========================================================= */

const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};


export default function BitsAssessment() {

  const navigate = useNavigate();


  /* =======================================================
     USER
  ======================================================= */

  const getUser = () => {

    try {

      return JSON.parse(
        localStorage.getItem("user")
      ) || null;

    } catch {

      return null;

    }

  };


  const user = getUser();


  const CANDIDATE_NAME =
    user?.fullName ||
    "Unknown Candidate";


  const CANDIDATE_USERNAME =
    user?.candidateId ||
    user?.id ||
    "Unknown";


  /* =======================================================
     STATE
  ======================================================= */

  const [loading, setLoading] =
    useState(false);

  const [examStarted, setExamStarted] =
    useState(false);

  const [examFinished, setExamFinished] =
    useState(false);

  const [questions, setQuestions] =
    useState([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answers, setAnswers] =
    useState({});

  const [statuses, setStatuses] =
    useState({});

  const [timeLeft, setTimeLeft] =
    useState(EXAM_DURATION);

  const [logs, setLogs] =
    useState([]);

  const [isFullscreenViolated, setIsFullscreenViolated] =
    useState(false);

  const [fullscreenExits, setFullscreenExits] =
    useState(0);

  const [tabSwitches, setTabSwitches] =
    useState(0);

  const [isBlurred, setIsBlurred] =
    useState(false);

  const [isOffline, setIsOffline] =
    useState(!navigator.onLine);

  const [resumeCount, setResumeCount] =
    useState(
      () =>
        parseInt(
          localStorage.getItem("resume_count") || "0",
          10
        )
    );


  /* =======================================================
     MEDIA REFS
  ======================================================= */

  const videoRef =
    useRef(null);

  const streamRef =
    useRef(null);

  const mediaRecorderRef =
    useRef(null);


  /* =======================================================
     DATA REFS
  ======================================================= */

  const questionsRef =
    useRef([]);

  const answersRef =
    useRef({});

  const statusesRef =
    useRef({});

  const logsRef =
    useRef([]);

  const timeLeftRef =
    useRef(EXAM_DURATION);

  const fullscreenExitsRef =
    useRef(0);

  const tabSwitchesRef =
    useRef(0);

  const isBlurredRef =
    useRef(false);

  const isOfflineRef =
    useRef(!navigator.onLine);


  /* =======================================================
     CONTROL REFS
  ======================================================= */

  const submittingRef =
    useRef(false);

  const autoSavingRef =
    useRef(false);

  const examStartedRef =
    useRef(false);

  const examFinishedRef =
    useRef(false);

  const backgroundApplicationsRef =
    useRef([]);


  /* =======================================================
     SYNC STATE -> REFS
  ======================================================= */

  useEffect(() => {
    examStartedRef.current =
      examStarted;
  }, [examStarted]);


  useEffect(() => {
    examFinishedRef.current =
      examFinished;
  }, [examFinished]);


  useEffect(() => {
    questionsRef.current =
      questions;
  }, [questions]);


  useEffect(() => {
    answersRef.current =
      answers;
  }, [answers]);


  useEffect(() => {
    statusesRef.current =
      statuses;
  }, [statuses]);


  useEffect(() => {
    logsRef.current =
      logs;
  }, [logs]);


  useEffect(() => {
    timeLeftRef.current =
      timeLeft;
  }, [timeLeft]);


  useEffect(() => {
    fullscreenExitsRef.current =
      fullscreenExits;
  }, [fullscreenExits]);


  useEffect(() => {
    tabSwitchesRef.current =
      tabSwitches;
  }, [tabSwitches]);


  useEffect(() => {
    isBlurredRef.current =
      isBlurred;
  }, [isBlurred]);


  useEffect(() => {
    isOfflineRef.current =
      isOffline;
  }, [isOffline]);


  /* =======================================================
     LOGGING
  ======================================================= */

  const logEvent = useCallback((message) => {

    const timestamp =
      new Date().toISOString();

    const formatted =
      `[${timestamp}] ${message}`;

    logsRef.current = [
      formatted,
      ...logsRef.current
    ];

    setLogs(
      [...logsRef.current]
    );

  }, []);


  /* =======================================================
     LOAD SAVED EXAM
  ======================================================= */

  useEffect(() => {

    try {

      const isRunning =
        localStorage.getItem(
          "exam_running"
        ) === "true";


      const savedQuestions =
        localStorage.getItem(
          "exam_questions"
        );


      const savedAnswers =
        localStorage.getItem(
          "exam_answers"
        );


      const savedStatuses =
        localStorage.getItem(
          "exam_statuses"
        );


      const savedTime =
        localStorage.getItem(
          "exam_time"
        );


      const savedFullscreenExits =
        localStorage.getItem(
          "fullscreen_exits"
        );


      const savedTabSwitches =
        localStorage.getItem(
          "tab_switches"
        );


      if (savedQuestions) {

        const parsed =
          JSON.parse(savedQuestions);

        questionsRef.current =
          parsed;

        setQuestions(parsed);

      }


      if (savedAnswers) {

        const parsed =
          JSON.parse(savedAnswers);

        answersRef.current =
          parsed;

        setAnswers(parsed);

      }


      if (savedStatuses) {

        const parsed =
          JSON.parse(savedStatuses);

        statusesRef.current =
          parsed;

        setStatuses(parsed);

      }


      if (savedTime) {

        const parsed =
          parseInt(
            savedTime,
            10
          );

        timeLeftRef.current =
          parsed;

        setTimeLeft(parsed);

      }


      if (savedFullscreenExits) {

        const parsed =
          parseInt(
            savedFullscreenExits,
            10
          );

        fullscreenExitsRef.current =
          parsed;

        setFullscreenExits(parsed);

      }


      if (savedTabSwitches) {

        const parsed =
          parseInt(
            savedTabSwitches,
            10
          );

        tabSwitchesRef.current =
          parsed;

        setTabSwitches(parsed);

      }


      if (isRunning) {

        logEvent(
          "Previous active examination session detected."
        );

      }

    } catch (error) {

      console.error(
        "Exam restoration error:",
        error
      );

    }

  }, [logEvent]);


  /* =======================================================
     FETCH QUESTIONS
  ======================================================= */

  const fetchQuestions = async () => {

    try {

      setLoading(true);


      const response =
        await axios.get(
          QUESTIONS_URL,
          {
            timeout: 15000
          }
        );


      const rawData =
        response.data?.data ||
        response.data;


      if (!Array.isArray(rawData)) {

        throw new Error(
          "Invalid question response."
        );

      }


      return rawData.map((q) => ({

        id:
          q.id ||
          Math.random()
            .toString(36)
            .substring(2, 11),

        text:
          q.question ||
          q.text ||
          "Missing question text",

        options:
          Array.isArray(q.options)
            ? q.options
            : [],

        questionType:
          q.questionType ||
          "mcq",

        correctAnswers:
          q.correctAnswers ||
          [],

        difficulty:
          q.difficulty ||
          "medium",

        category:
          q.category ||
          "React",

        marks:
          q.marks ||
          1

      }));

    } catch (error) {

      console.error(
        "Question loading failed:",
        error
      );

      throw error;

    } finally {

      setLoading(false);

    }

  };


  /* =======================================================
     BACKGROUND APPLICATIONS
  ======================================================= */

  const getBackgroundApplications =
    async () => {

      try {

        if (
          !window.electronAPI ||
          !window.electronAPI.getBackgroundApplications
        ) {

          backgroundApplicationsRef.current =
            [];

          return;

        }


        const result =
          await window.electronAPI
            .getBackgroundApplications();


        backgroundApplicationsRef.current =
          result?.applications ||
          result?.processes ||
          [];


        console.log(
          "Background applications:",
          backgroundApplicationsRef.current
        );

      } catch (error) {

        console.error(
          "Background application detection failed:",
          error
        );

        backgroundApplicationsRef.current =
          [];

      }

    };


  /* =======================================================
     CAMERA / MICROPHONE
  ======================================================= */

  const initProctoring =
    async () => {

      try {

        const stream =
          await navigator.mediaDevices
            .getUserMedia({

              video: {
                width: 640,
                height: 480,
                frameRate: 15
              },

              audio: true

            });


        streamRef.current =
          stream;


        if (videoRef.current) {

          videoRef.current.srcObject =
            stream;

        }


        let options = {};


        if (
          MediaRecorder.isTypeSupported(
            "video/webm;codecs=vp9"
          )
        ) {

          options = {
            mimeType:
              "video/webm;codecs=vp9"
          };

        } else {

          options = {
            mimeType:
              "video/webm"
          };

        }


        const recorder =
          new MediaRecorder(
            stream,
            options
          );


        mediaRecorderRef.current =
          recorder;


        recorder.ondataavailable =
          (event) => {

            if (
              event.data &&
              event.data.size > 0
            ) {

              recorder.finalBlob =
                event.data;

            }

          };


        recorder.start();


        logEvent(
          "Camera and microphone successfully initialized."
        );

      } catch (error) {

        console.error(
          "Camera/microphone initialization failed:",
          error
        );

        alert(
          "Camera and microphone access is mandatory for this exam."
        );

      }

    };


  /* =======================================================
     START CAMERA WHEN EXAM STARTS
  ======================================================= */

  useEffect(() => {

    if (
      !examStarted ||
      examFinished
    ) {

      return;

    }


    initProctoring();


    return () => {

      if (
        streamRef.current
      ) {

        streamRef.current
          .getTracks()
          .forEach(
            track => track.stop()
          );

      }

    };

  }, [
    examStarted,
    examFinished
  ]);


  /* =======================================================
     FULLSCREEN
  ======================================================= */

  const restoreFullscreen =
    async () => {

      if (
        document.fullscreenElement
      ) {

        return true;

      }


      try {

        await document.documentElement
          .requestFullscreen();

        return true;

      } catch (error) {

        console.error(
          "Fullscreen restore failed:",
          error
        );

        return false;

      }

    };


  /* =======================================================
     FULLSCREEN CHANGE
  ======================================================= */

  useEffect(() => {

    if (
      !examStarted ||
      examFinished
    ) {

      return;

    }


    const handleFullscreenChange =
      () => {

        if (
          !examStartedRef.current ||
          examFinishedRef.current
        ) {

          return;

        }


        if (
          document.fullscreenElement
        ) {

          setIsFullscreenViolated(
            false
          );

          return;

        }


        setFullscreenExits(
          previous => {

            const next =
              previous + 1;


            fullscreenExitsRef.current =
              next;


            localStorage.setItem(
              "fullscreen_exits",
              String(next)
            );


            logEvent(
              `SECURITY ALERT: Fullscreen exited (#${next})`
            );


            if (next >= 3) {

              autoSubmitExam(
                "Maximum fullscreen exits exceeded."
              );

            } else {

              setIsFullscreenViolated(
                true
              );

            }


            return next;

          }
        );

      };


    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );


    return () => {

      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );

    };

  }, [
    examStarted,
    examFinished,
    logEvent
  ]);


  /* =======================================================
     FULLSCREEN RESTORE CLICK
  ======================================================= */

  useEffect(() => {

    if (
      !examStarted ||
      examFinished
    ) {

      return;

    }


    const restore =
      () => {

        if (
          !document.fullscreenElement
        ) {

          restoreFullscreen();

        }

      };


    window.addEventListener(
      "click",
      restore
    );


    window.addEventListener(
      "keydown",
      restore
    );


    return () => {

      window.removeEventListener(
        "click",
        restore
      );

      window.removeEventListener(
        "keydown",
        restore
      );

    };

  }, [
    examStarted,
    examFinished
  ]);


  /* =======================================================
     QUESTION LOADED -> ENSURE FULLSCREEN
  ======================================================= */

  useEffect(() => {

    if (
      !examStarted ||
      examFinished ||
      questions.length === 0
    ) {

      return;

    }


    const timer =
      setTimeout(
        async () => {

          if (
            !document.fullscreenElement
          ) {

            const success =
              await restoreFullscreen();

            if (success) {

              logEvent(
                "Fullscreen restored after question rendering."
              );

            }

          }

        },
        200
      );


    return () =>
      clearTimeout(timer);

  }, [
    questions,
    examStarted,
    examFinished,
    logEvent
  ]);


  /* =======================================================
     TIMER
  ======================================================= */

  useEffect(() => {

    if (
      !examStarted ||
      examFinished
    ) {

      return;

    }


    const interval =
      setInterval(() => {

        setTimeLeft(
          previous => {

            if (
              previous <= 1
            ) {

              timeLeftRef.current =
                0;

              localStorage.setItem(
                "exam_time",
                "0"
              );


              clearInterval(
                interval
              );


              autoSubmitExam(
                "Timer expired."
              );


              return 0;

            }


            const next =
              previous - 1;


            timeLeftRef.current =
              next;


            localStorage.setItem(
              "exam_time",
              String(next)
            );


            if (
              next === 60
            ) {

              alert(
                "Warning: Only 1 minute remaining!"
              );

            }


            return next;

          }
        );

      }, 1000);


    return () =>
      clearInterval(
        interval
      );

  }, [
    examStarted,
    examFinished
  ]);


  /* =======================================================
     AUTOSAVE
  ======================================================= */

  useEffect(() => {

    if (
      !examStarted ||
      examFinished
    ) {

      return;

    }


    const interval =
      setInterval(
        async () => {

          if (
            submittingRef.current ||
            autoSavingRef.current
          ) {

            return;

          }


          try {

            autoSavingRef.current =
              true;


            await sendExamData(
              null
            );


            console.log(
              "Exam autosaved."
            );

          } catch (error) {

            console.error(
              "Autosave failed:",
              error
            );

          } finally {

            autoSavingRef.current =
              false;

          }

        },
        30000
      );


    return () =>
      clearInterval(
        interval
      );

  }, [
    examStarted,
    examFinished
  ]);


  /* =======================================================
     BEFORE UNLOAD
  ======================================================= */

  useEffect(() => {

    const handleBeforeUnload =
      () => {

        if (
          examStartedRef.current &&
          !examFinishedRef.current
        ) {

          localStorage.setItem(
            "exam_running",
            "true"
          );

        }

      };


    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );


    return () =>
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );

  }, []);


  /* =======================================================
     BROWSER BACK BLOCK
  ======================================================= */

  useEffect(() => {

    window.history.pushState(
      null,
      "",
      window.location.href
    );


    const handlePopState =
      () => {

        window.history.pushState(
          null,
          "",
          window.location.href
        );


        logEvent(
          "Browser back navigation blocked."
        );

      };


    window.addEventListener(
      "popstate",
      handlePopState
    );


    return () =>
      window.removeEventListener(
        "popstate",
        handlePopState
      );

  }, [logEvent]);


  /* =======================================================
     SECURITY EVENTS
  ======================================================= */

  useEffect(() => {

    if (
      !examStarted ||
      examFinished
    ) {

      return;

    }


    const preventKeys =
      (event) => {

        const key =
          event.key.toUpperCase();


        if (
          event.key === "F12"
        ) {

          event.preventDefault();
          return;

        }


        if (
          event.ctrlKey &&
          event.shiftKey &&
          ["I", "J"].includes(key)
        ) {

          event.preventDefault();
          return;

        }


        if (
          event.ctrlKey &&
          key === "U"
        ) {

          event.preventDefault();
          return;

        }

      };


    const handleVisibility =
      () => {

        if (
          !document.hidden
        ) {

          return;

        }


        if (
          !examStartedRef.current ||
          examFinishedRef.current
        ) {

          return;

        }


        setTabSwitches(
          previous => {

            const next =
              previous + 1;


            tabSwitchesRef.current =
              next;


            localStorage.setItem(
              "tab_switches",
              String(next)
            );


            logEvent(
              `SECURITY ALERT: Tab switch detected (#${next})`
            );


            if (
              next >= 3
            ) {

              autoSubmitExam(
                "Exceeded maximum tab switch limit."
              );

            }


            return next;

          }
        );

      };


    const handleBlur =
      () => {

        if (
          !examStartedRef.current ||
          examFinishedRef.current
        ) {

          return;

        }


        isBlurredRef.current =
          true;


        setIsBlurred(
          true
        );


        logEvent(
          "Focus lost."
        );

      };


    const handleFocus =
      () => {

        if (
          !examStartedRef.current ||
          examFinishedRef.current
        ) {

          return;

        }


        isBlurredRef.current =
          false;


        setIsBlurred(
          false
        );


        logEvent(
          "Focus regained."
        );

      };


    const handleOnline =
      () => {

        isOfflineRef.current =
          false;


        setIsOffline(
          false
        );


        logEvent(
          "Network connection restored."
        );

      };


    const handleOffline =
      () => {

        isOfflineRef.current =
          true;


        setIsOffline(
          true
        );


        logEvent(
          "Network connection lost."
        );

      };


    window.addEventListener(
      "keydown",
      preventKeys
    );


    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );


    window.addEventListener(
      "blur",
      handleBlur
    );


    window.addEventListener(
      "focus",
      handleFocus
    );


    window.addEventListener(
      "online",
      handleOnline
    );


    window.addEventListener(
      "offline",
      handleOffline
    );


    return () => {

      window.removeEventListener(
        "keydown",
        preventKeys
      );


      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );


      window.removeEventListener(
        "blur",
        handleBlur
      );


      window.removeEventListener(
        "focus",
        handleFocus
      );


      window.removeEventListener(
        "online",
        handleOnline
      );


      window.removeEventListener(
        "offline",
        handleOffline
      );

    };

  }, [
    examStarted,
    examFinished,
    logEvent
  ]);


  /* =======================================================
     SEND EXAM DATA
  ======================================================= */

  const sendExamData =
    async (videoBlob = null) => {

      const formData =
        new FormData();


      formData.append(
        "username",
        String(
          user?.id ||
          CANDIDATE_USERNAME
        )
      );


      formData.append(
        "candidate",
        user?.fullName ||
        CANDIDATE_NAME
      );


      formData.append(
        "timeLeft",
        String(
          timeLeftRef.current
        )
      );


      formData.append(
        "answers",
        JSON.stringify(
          answersRef.current
        )
      );


      formData.append(
        "statuses",
        JSON.stringify(
          statusesRef.current
        )
      );


      formData.append(
        "questions",
        JSON.stringify(
          questionsRef.current
        )
      );


      formData.append(
        "violations",
        JSON.stringify({

          fullscreenExits:
            fullscreenExitsRef.current,

          tabSwitches:
            tabSwitchesRef.current,

          isBlurred:
            isBlurredRef.current,

          isOffline:
            isOfflineRef.current

        })
      );


      formData.append(
        "logs",
        JSON.stringify(
          logsRef.current
        )
      );


      formData.append(
        "systemInfo",
        JSON.stringify({

          browser:
            navigator.userAgent,

          language:
            navigator.language,

          platform:
            navigator.platform,

          screen: {

            width:
              window.screen.width,

            height:
              window.screen.height

          },

          timezone:
            Intl.DateTimeFormat()
              .resolvedOptions()
              .timeZone

        })
      );


      if (
        videoBlob
      ) {

        formData.append(
          "video",
          videoBlob,
          "exam.webm"
        );

      }


      const response =
        await fetch(
          BACKEND_URL,
          {
            method: "POST",
            body: formData
          }
        );


      if (
        !response.ok
      ) {

        let message =
          `Exam submission failed: HTTP ${response.status}`;


        try {

          const data =
            await response.json();


          message =
            data?.message ||
            data?.error ||
            message;

        } catch {

          // ignore

        }


        throw new Error(
          message
        );

      }


      try {

        return await response.json();

      } catch {

        return {};

      }

    };


  /* =======================================================
     SECURITY SUBMISSION
  ======================================================= */

  const submitSecurityCheck = async () => {

      const securityData = {

        candidateId:
          user?.id,

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

        securityPassed:
          true,

        securityLogs:
          logsRef.current

      };


      const response = await axios.post(
          SECURITY_URL,
          securityData,
          {
            timeout: 15000
          }
        );


      return response.data;

    };


  /* =======================================================
     STOP CAMERA
  ======================================================= */

  const stopCamera =
    () => {

      try {

        if (
          streamRef.current
        ) {

          streamRef.current
            .getTracks()
            .forEach(
              track => {

                try {

                  track.stop();

                } catch {

                  // ignore

                }

              }
            );

        }


        streamRef.current =
          null;


        if (
          videoRef.current
        ) {

          videoRef.current.srcObject =
            null;

        }

      } catch (error) {

        console.error(
          "Camera cleanup error:",
          error
        );

      }

    };


  /* =======================================================
     STOP RECORDER + GET FINAL VIDEO
  ======================================================= */

  const getFinalVideo =
    async () => {

      const recorder =
        mediaRecorderRef.current;


      if (
        !recorder
      ) {

        return null;

      }


      if (
        recorder.state === "inactive"
      ) {

        return recorder.finalBlob ||
          null;

      }


      return new Promise(
        (resolve) => {

          let finalBlob =
            null;


          recorder.ondataavailable =
            (event) => {

              if (
                event.data &&
                event.data.size > 0
              ) {

                finalBlob =
                  event.data;

              }

            };


          recorder.onstop =
            () => {

              mediaRecorderRef.current =
                null;

              resolve(
                finalBlob
              );

            };


          try {

            recorder.stop();

          } catch {

            resolve(
              recorder.finalBlob ||
              null
            );

          }

        }
      );

    };


  /* =======================================================
     CLEAR EXAM STORAGE
  ======================================================= */

  const clearExamStorage =
    () => {

      localStorage.removeItem(
        "exam_running"
      );

      localStorage.removeItem(
        "exam_answers"
      );

      localStorage.removeItem(
        "exam_statuses"
      );

      localStorage.removeItem(
        "exam_questions"
      );

      localStorage.removeItem(
        "exam_time"
      );

      localStorage.removeItem(
        "resume_count"
      );

      localStorage.removeItem(
        "fullscreen_exits"
      );

      localStorage.removeItem(
        "tab_switches"
      );

    };


  /* =======================================================
     UPDATE CANDIDATE STATUS
  ======================================================= */

  const updateCandidateStatus =
    () => {

      try {

        const storedUser =
          JSON.parse(
            localStorage.getItem(
              "user"
            ) || "{}"
          );


        storedUser.bitsExamStatus =
          "Process";


        localStorage.setItem(
          "user",
          JSON.stringify(
            storedUser
          )
        );

      } catch (error) {

        console.error(
          "Candidate status update failed:",
          error
        );

      }

    };


  /* =======================================================
     ELECTRON CLEANUP
  ======================================================= */

  const finishElectronExam =
    async () => {

      try {

        /*
         IMPORTANT:

         Do NOT use:

         setExamPhase("CODING")

         here.

         This is BITS/MCQ exam completion.
         We are returning to candidate dashboard.
        */


        if (
          window.electronAPI?.setExamPhase
        ) {

          await window.electronAPI
            .setExamPhase(
              "CANDIDATE"
            )
            .catch(
              error => {

                console.error(
                  "Electron phase update failed:",
                  error
                );

              }
            );

        }

      } catch (error) {

        console.error(
          "Electron cleanup failed:",
          error
        );

      }

    };


  /* =======================================================
     FINAL REDIRECT
  ======================================================= */

  const redirectToCandidate =
    async () => {

      try {

        await finishElectronExam();

      } catch {

        // Never stop redirect because Electron failed.

      }


      /*
       IMPORTANT:

       Always navigate to candidate.

       No security-check page.
       No coding page.
       No bits page.
       No submission page.
      */

      navigate(
        "/candidate",
        {
          replace: true
        }
      );

    };


  /* =======================================================
     MAIN SUBMISSION FUNCTION
  ======================================================= */

  const autoSubmitExam =
    async (reason) => {

      /*
       Prevent double submission.
      */

      if (
        submittingRef.current
      ) {

        console.log(
          "Submission already running."
        );

        return;

      }


      submittingRef.current =
        true;


      console.log(
        "===================================="
      );

      console.log(
        "BITS EXAM SUBMISSION STARTED"
      );

      console.log(
        "Reason:",
        reason
      );

      console.log(
        "===================================="
      );


      /*
       Stop timer-related logic.
      */

      examFinishedRef.current =
        true;


      setExamFinished(
        true
      );


      /*
       Mark submitted immediately.
      */

      localStorage.setItem(
        "exam_submitted",
        "true"
      );


      localStorage.removeItem(
        "exam_running"
      );


      logEvent(
        `Exam submission started: ${reason}`
      );


      let examSubmissionSuccess =
        false;

      let securitySubmissionSuccess =
        false;


      try {

        /* =============================================
           1. TELL ELECTRON EXAM IS SUBMITTING
        ============================================= */

        try {

          if (
            window.electronAPI?.startExamSubmission
          ) {

            await window.electronAPI
              .startExamSubmission();

          }

        } catch (error) {

          console.error(
            "Electron submission notification failed:",
            error
          );

        }


        /* =============================================
           2. GET FINAL VIDEO
        ============================================= */

        let finalVideoBlob =
          null;


        try {

          finalVideoBlob =
            await getFinalVideo();

        } catch (error) {

          console.error(
            "Final video creation failed:",
            error
          );

        }


        /* =============================================
           3. SUBMIT EXAM
        ============================================= */

        try {

          console.log(
            "Submitting BITS exam data..."
          );


          await sendExamData(
            finalVideoBlob
          );


          examSubmissionSuccess =
            true;


          logEvent(
            "Exam answers and video submitted successfully."
          );


        } catch (error) {

          console.error(
            "BITS exam API failed:",
            error
          );


          logEvent(
            `Exam API failed: ${
              error?.message ||
              "Unknown error"
            }`
          );

        }


        /* =============================================
           4. SUBMIT SECURITY DATA
        ============================================= */

        try {

          console.log(
            "Submitting security data..."
          );


          await submitSecurityCheck();


          securitySubmissionSuccess =
            true;


          logEvent(
            "Security data saved successfully."
          );


        } catch (error) {

          console.error(
            "Security API failed:",
            error
          );


          logEvent(
            `Security API failed: ${
              error?.message ||
              "Unknown error"
            }`
          );

        }


        /* =============================================
           5. STOP CAMERA
        ============================================= */

        stopCamera();


        /* =============================================
           6. EXIT FULLSCREEN
        ============================================= */

        try {

          if (
            document.fullscreenElement
          ) {

            await document
              .exitFullscreen()
              .catch(
                () => {}
              );

          }

        } catch (error) {

          console.error(
            "Fullscreen cleanup failed:",
            error
          );

        }


        /* =============================================
           7. UPDATE CANDIDATE STATUS
        ============================================= */

        updateCandidateStatus();


        /* =============================================
           8. CLEAR EXAM STORAGE
        ============================================= */

        clearExamStorage();


        /* =============================================
           9. MESSAGE
        ============================================= */

        if (
          examSubmissionSuccess &&
          securitySubmissionSuccess
        ) {

          alert(
            "BITS assessment submitted successfully."
          );

        } else if (
          examSubmissionSuccess
        ) {

          alert(
            "BITS assessment submitted successfully.\n\n" +
            "Security data could not be synchronized."
          );

        } else {

          alert(
            "The exam session has been closed.\n\n" +
            "The server could not confirm the exam submission."
          );

        }

      } catch (error) {

        /*
         NEVER allow an unexpected error
         to prevent candidate redirect.
        */

        console.error(
          "Unexpected submission error:",
          error
        );

      } finally {

        /*
         ============================================
         ABSOLUTE FINAL CLEANUP
         ============================================
        */

        submittingRef.current =
          true;


        localStorage.removeItem(
          "exam_running"
        );


        localStorage.setItem(
          "exam_submitted",
          "true"
        );


        updateCandidateStatus();


        stopCamera();


        /*
         IMPORTANT:

         Electron phase is CANDIDATE,
         NOT CODING.
        */

        try {

          await finishElectronExam();

        } catch {

          // ignore

        }


        /*
         ============================================
         FINAL REDIRECT

         NOTHING SHOULD BE AFTER THIS.
         ============================================
        */

        navigate(
          "/candidate",
          {
            replace: true
          }
        );

      }

    };


  /* =======================================================
     START NEW EXAM
  ======================================================= */

  const startNewExam =
    async () => {

      try {

        setLoading(
          true
        );


        /*
         Enter fullscreen while user click
         is still active.
        */

        try {

          await document.documentElement
            .requestFullscreen();

        } catch (error) {

          console.warn(
            "Initial fullscreen failed:",
            error
          );

        }


        /*
         Load questions.
        */

        const rawQuestions =
          await fetchQuestions();


        /*
         Clear old state.
        */

        localStorage.removeItem(
          "exam_submitted"
        );

        localStorage.removeItem(
          "exam_answers"
        );

        localStorage.removeItem(
          "exam_statuses"
        );

        localStorage.removeItem(
          "exam_questions"
        );

        localStorage.removeItem(
          "exam_time"
        );

        localStorage.removeItem(
          "exam_running"
        );

        localStorage.removeItem(
          "fullscreen_exits"
        );

        localStorage.removeItem(
          "tab_switches"
        );

        localStorage.removeItem(
          "resume_count"
        );


        /*
         Reset refs.
        */

        answersRef.current =
          {};

        statusesRef.current =
          {};

        logsRef.current =
          [];

        timeLeftRef.current =
          EXAM_DURATION;

        fullscreenExitsRef.current =
          0;

        tabSwitchesRef.current =
          0;


        /*
         Reset state.
        */

        setAnswers(
          {}
        );

        setStatuses(
          {}
        );

        setLogs(
          []
        );

        setTimeLeft(
          EXAM_DURATION
        );

        setFullscreenExits(
          0
        );

        setTabSwitches(
          0
        );

        setResumeCount(
          0
        );

        setCurrentIndex(
          0
        );

        setExamFinished(
          false
        );


        /*
         Randomize questions.
        */

        const randomized =
          shuffleArray(
            rawQuestions
          ).map(
            q => ({
              ...q,

              options:
                shuffleArray(
                  q.options
                )

            })
          );


        questionsRef.current =
          randomized;


        setQuestions(
          randomized
        );


        localStorage.setItem(
          "exam_questions",
          JSON.stringify(
            randomized
          )
        );


        localStorage.setItem(
          "exam_answers",
          "{}"
        );


        localStorage.setItem(
          "exam_statuses",
          "{}"
        );


        localStorage.setItem(
          "exam_time",
          String(
            EXAM_DURATION
          )
        );


        localStorage.setItem(
          "exam_running",
          "true"
        );


        localStorage.setItem(
          "resume_count",
          "0"
        );


        localStorage.setItem(
          "fullscreen_exits",
          "0"
        );


        localStorage.setItem(
          "tab_switches",
          "0"
        );


        /*
         Start exam.
        */

        examStartedRef.current =
          true;

        examFinishedRef.current =
          false;


        setExamStarted(
          true
        );


        /*
         Capture background apps.
        */

        await getBackgroundApplications();


        /*
         Make sure Electron knows
         that BITS exam is running.
        */

        try {

          if (
            window.electronAPI?.setExamPhase
          ) {

            await window.electronAPI
              .setExamPhase(
                "BITS"
              );

          }

        } catch (error) {

          console.error(
            "Electron BITS phase update failed:",
            error
          );

        }


        logEvent(
          "New BITS examination session started."
        );


        /*
         Final fullscreen check.
        */

        setTimeout(
          () => {

            if (
              !document.fullscreenElement
            ) {

              restoreFullscreen();

            }

          },
          300
        );


      } catch (error) {

        console.error(
          "Unable to start exam:",
          error
        );


        alert(
          "Unable to load exam questions. Please verify the server connection."
        );


        try {

          if (
            document.fullscreenElement
          ) {

            await document.exitFullscreen();

          }

        } catch {

          // ignore

        }

      } finally {

        setLoading(
          false
        );

      }

    };


  /* =======================================================
     RESUME EXAM
  ======================================================= */

  const resumeExam =
    async () => {

      /*
       If already used resume,
       submit/close the session.
      */

      if (
        resumeCount >= MAX_RESUMES
      ) {

        await autoSubmitExam(
          "Resume limit exceeded."
        );

        return;

      }


      const nextResumeCount =
        resumeCount + 1;


      setResumeCount(
        nextResumeCount
      );


      localStorage.setItem(
        "resume_count",
        String(
          nextResumeCount
        )
      );


      try {

        const savedAnswers =
          JSON.parse(
            localStorage.getItem(
              "exam_answers"
            ) || "{}"
          );


        const savedStatuses =
          JSON.parse(
            localStorage.getItem(
              "exam_statuses"
            ) || "{}"
          );


        const savedQuestions =
          JSON.parse(
            localStorage.getItem(
              "exam_questions"
            ) || "[]"
          );


        const savedTime =
          Number(
            localStorage.getItem(
              "exam_time"
            ) ||
            EXAM_DURATION
          );


        if (
          savedQuestions.length === 0
        ) {

          alert(
            "No recoverable exam session found."
          );

          return;

        }


        answersRef.current =
          savedAnswers;


        statusesRef.current =
          savedStatuses;


        questionsRef.current =
          savedQuestions;


        timeLeftRef.current =
          savedTime;


        setAnswers(
          savedAnswers
        );


        setStatuses(
          savedStatuses
        );


        setQuestions(
          savedQuestions
        );


        setTimeLeft(
          savedTime
        );


        localStorage.setItem(
          "exam_running",
          "true"
        );


        examStartedRef.current =
          true;


        examFinishedRef.current =
          false;


        setExamFinished(
          false
        );


        setExamStarted(
          true
        );


        await restoreFullscreen();


        await getBackgroundApplications();


        try {

          if (
            window.electronAPI?.setExamPhase
          ) {

            await window.electronAPI
              .setExamPhase(
                "BITS"
              );

          }

        } catch (error) {

          console.error(
            "Electron resume phase failed:",
            error
          );

        }


        logEvent(
          `BITS exam resumed. Resume count: ${nextResumeCount}`
        );

      } catch (error) {

        console.error(
          "Resume failed:",
          error
        );


        alert(
          "Unable to resume the examination."
        );

      }

    };


  /* =======================================================
     SELECT OPTION
  ======================================================= */

  const handleSelectOption =
    (option) => {

      const currentQuestion =
        questionsRef.current[
          currentIndex
        ];


      if (
        !currentQuestion
      ) {

        return;

      }


      setAnswers(
        previous => {

          const updated = {
            ...previous
          };


          if (
            currentQuestion.questionType ===
            "MULTIPLE"
          ) {

            const existing =
              updated[
                currentQuestion.id
              ] || [];


            if (
              existing.includes(
                option
              )
            ) {

              updated[
                currentQuestion.id
              ] =
                existing.filter(
                  item =>
                    item !== option
                );

            } else {

              updated[
                currentQuestion.id
              ] = [
                ...existing,
                option
              ];

            }

          } else {

            updated[
              currentQuestion.id
            ] =
              option;

          }


          answersRef.current =
            updated;


          localStorage.setItem(
            "exam_answers",
            JSON.stringify(
              updated
            )
          );


          return updated;

        }
      );


      setStatuses(
        previous => {

          if (
            previous[
              currentQuestion.id
            ] === "review"
          ) {

            return previous;

          }


          const updated = {

            ...previous,

            [currentQuestion.id]:
              "answered"

          };


          statusesRef.current =
            updated;


          localStorage.setItem(
            "exam_statuses",
            JSON.stringify(
              updated
            )
          );


          return updated;

        }
      );

    };


  /* =======================================================
     NAVIGATION
  ======================================================= */

  const navigatePrev =
    () => {

      if (
        currentIndex > 0
      ) {

        setCurrentIndex(
          previous =>
            previous - 1
        );

      }

    };


  const navigateNext =
    () => {

      const currentQuestion =
        questionsRef.current[
          currentIndex
        ];


      if (
        !currentQuestion
      ) {

        return;

      }


      if (
        !statusesRef.current[
          currentQuestion.id
        ]
      ) {

        setStatuses(
          previous => {

            const updated = {

              ...previous,

              [currentQuestion.id]:
                "visited"

            };


            statusesRef.current =
              updated;


            localStorage.setItem(
              "exam_statuses",
              JSON.stringify(
                updated
              )
            );


            return updated;

          }
        );

      }


      if (
        currentIndex <
        questions.length - 1
      ) {

        setCurrentIndex(
          previous =>
            previous + 1
        );

      }

    };


  /* =======================================================
     MARK FOR REVIEW
  ======================================================= */

  const markForReview =
    () => {

      const currentQuestion =
        questionsRef.current[
          currentIndex
        ];


      if (
        !currentQuestion
      ) {

        return;

      }


      setStatuses(
        previous => {

          const updated = {

            ...previous,

            [currentQuestion.id]:
              "review"

          };


          statusesRef.current =
            updated;


          localStorage.setItem(
            "exam_statuses",
            JSON.stringify(
              updated
            )
          );


          return updated;

        }
      );


      logEvent(
        `Question ${currentQuestion.id} marked for review.`
      );


      navigateNext();

    };


  /* =======================================================
     CLEAR RESPONSE
  ======================================================= */

  const clearResponse =
    () => {

      const currentQuestion =
        questionsRef.current[
          currentIndex
        ];


      if (
        !currentQuestion
      ) {

        return;

      }


      setAnswers(
        previous => {

          const updated = {
            ...previous
          };


          delete updated[
            currentQuestion.id
          ];


          answersRef.current =
            updated;


          localStorage.setItem(
            "exam_answers",
            JSON.stringify(
              updated
            )
          );


          return updated;

        }
      );


      setStatuses(
        previous => {

          const updated = {

            ...previous,

            [currentQuestion.id]:
              "visited"

          };


          statusesRef.current =
            updated;


          localStorage.setItem(
            "exam_statuses",
            JSON.stringify(
              updated
            )
          );


          return updated;

        }
      );


      logEvent(
        `Response cleared for question ${currentQuestion.id}.`
      );

    };


  /* =======================================================
     SUBMIT BUTTON
  ======================================================= */

  const submitExamRequest =
    () => {

      autoSubmitExam(
        "Candidate submitted the BITS assessment."
      );

    };


  /* =======================================================
     FULLSCREEN OVERLAY
  ======================================================= */

  const handleFullscreenOverlay =
    async (event) => {

      event.preventDefault();
      event.stopPropagation();


      const success =
        await restoreFullscreen();


      if (
        success
      ) {

        setIsFullscreenViolated(
          false
        );


        logEvent(
          "Fullscreen restored."
        );

      }

    };


  /* =======================================================
     EXAM FINISHED SCREEN
  ======================================================= */

  if (
    examFinished
  ) {

    const totalQs =
      questions.length;


    const answeredQs =
      Object.keys(
        answers
      ).length;


    return (

      <div
        style={{
          padding: "60px 40px",
          textAlign: "center",
          maxWidth: "600px",
          margin: "40px auto",
          border: "1px solid #a3b18a",
          borderRadius: "12px",
          boxShadow:
            "0 4px 12px rgba(0,0,0,0.05)",
          background: "#f2f7ee"
        }}
      >

        <h2
          style={{
            color: "#588157"
          }}
        >
          ✓ Exam Submission Processing
        </h2>


        <p>
          Candidate:
          {" "}
          <strong>
            {CANDIDATE_NAME}
          </strong>
        </p>


        <p>
          Please wait...
        </p>

      </div>

    );

  }


  /* =======================================================
     START / RESUME SCREEN
  ======================================================= */

  if (
    !examStarted
  ) {

    const hasExamData =
      !!(
        localStorage.getItem(
          "exam_time"
        ) &&
        localStorage.getItem(
          "exam_questions"
        )
      );


    const submittedData =
      localStorage.getItem(
        "exam_submitted"
      ) === "true";


    return (

      <div
        style={{
          padding: 30,
          maxWidth: 700,
          margin: "60px auto",
          border: "1px solid #a3b18a",
          borderRadius: 10,
          textAlign: "center",
          boxShadow:
            "0 4px 12px rgba(0,0,0,0.05)"
        }}
      >

        <h2>
          Secure Examination Environment
        </h2>


        <h3>
          {CANDIDATE_NAME}
        </h3>


        <p
          style={{
            color: "#bc4749",
            fontSize: "14px"
          }}
        >
          Secure examination monitoring is active.
        </p>


        {loading ? (

          <div>
            Loading Questions...
          </div>

        ) : submittedData ? (

          <>

            <div
              style={{
                background: "#e6efe1",
                color: "#335c39",
                padding: 15,
                borderRadius: 5,
                marginBottom: 20
              }}
            >
              Previous BITS assessment has been processed.
            </div>


            <button
              onClick={startNewExam}
              style={{
                padding: "12px 25px",
                fontSize: 16,
                cursor: "pointer",
                background: "#3a5a40",
                color: "#fff",
                border: "none",
                borderRadius: "5px"
              }}
            >
              Start New Exam
            </button>

          </>

        ) : hasExamData ? (

          <>

            <div
              style={{
                background: "#f5e6cf",
                color: "#8a5a1f",
                padding: 15,
                borderRadius: 5,
                marginBottom: 20
              }}
            >

              <strong>
                Previous active exam detected.
              </strong>

              <br />
              <br />

              Resume used:
              {" "}
              <strong>
                {resumeCount}
              </strong>
              {" "}
              /
              {" "}
              {MAX_RESUMES}

            </div>


            <button
              onClick={resumeExam}
              disabled={
                resumeCount >= MAX_RESUMES
              }
              style={{
                padding: "12px 25px",
                marginRight: 15,
                cursor:
                  resumeCount >= MAX_RESUMES
                    ? "not-allowed"
                    : "pointer",
                background: "#588157",
                color: "#fff",
                border: "none",
                borderRadius: "5px"
              }}
            >
              Resume Active Session
            </button>


            <button
              onClick={startNewExam}
              style={{
                padding: "12px 25px",
                cursor: "pointer",
                background: "#bc4749",
                color: "#fff",
                border: "none",
                borderRadius: "5px"
              }}
            >
              Overwrite & Start New
            </button>

          </>

        ) : (

          <button
            onClick={startNewExam}
            style={{
              padding: "14px 35px",
              fontSize: 16,
              cursor: "pointer",
              background: "#3a5a40",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              fontWeight: "bold"
            }}
          >
            Start Exam
          </button>

        )}

      </div>

    );

  }


  /* =======================================================
     WAIT FOR QUESTIONS
  ======================================================= */

  if (
    questions.length === 0
  ) {

    return (

      <div
        style={{
          textAlign: "center",
          marginTop: "100px"
        }}
      >
        Initializing Secure Question Bank...
      </div>

    );

  }


  /* =======================================================
     EXAM UI
  ======================================================= */

  const currentQuestion =
    questions[
      currentIndex
    ];


  const answeredCount =
    Object.keys(
      answers
    ).length;


  const markedCount =
    Object.values(
      statuses
    ).filter(
      status =>
        status === "review"
    ).length;


  const minutes =
    Math.floor(
      timeLeft / 60
    );


  const seconds =
    timeLeft % 60;


  return (

    <div
      className="app-shell"
      style={{
        position: "relative"
      }}
    >

      {/* WATERMARK */}

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 9999,
          opacity: 0.04,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
          alignItems: "center",
          fontSize: "28px",
          fontWeight: "bold",
          color: "#000",
          userSelect: "none"
        }}
      >

        <div>
          {CANDIDATE_NAME}
          {" • "}
          {CANDIDATE_USERNAME}
        </div>

        <div>
          SECURE EXAM CONTEXT
        </div>

        <div>
          {CANDIDATE_USERNAME}
          {" • WORKFLOW RUNNING"}
        </div>

      </div>


      {/* HEADER */}

      <header
        className="app-header"
      >

        <div
          className="app-title"
        >
          Exam Terminal Dashboard


          {isOffline && (

            <span
              style={{
                marginLeft: 10,
                background: "#bc4749",
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 11
              }}
            >
              OFFLINE
            </span>

          )}

        </div>


        <div
          className={
            `app-timer ${
              timeLeft < 60
                ? "app-timer--low"
                : ""
            }`
          }
        >

          <span
            className="app-timer-label"
          >
            Time left
          </span>


          <span
            className="app-timer-value"
          >
            {String(
              minutes
            ).padStart(2, "0")}

            :

            {String(
              seconds
            ).padStart(2, "0")}

          </span>

        </div>

      </header>


      {/* FULLSCREEN VIOLATION */}

      {isFullscreenViolated && (

        <div
          onClickCapture={
            handleFullscreenOverlay
          }
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 99999,
            pointerEvents: "auto",
            cursor: "pointer",
            backgroundColor:
              "transparent",
            userSelect: "none"
          }}
        >

          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "50%",
              transform:
                "translateX(-50%)",
              backgroundColor:
                "#ef4444",
              color: "white",
              padding:
                "6px 16px",
              borderRadius:
                "20px",
              fontSize:
                "14px",
              fontWeight:
                "bold"
            }}
          >
            Click anywhere to restore fullscreen
          </div>

        </div>

      )}


      {/* BLUR WARNING */}

      {isBlurred && (

        <div
          className="app-banner"
          style={{
            marginTop: 16
          }}
        >
          ⚠️ Focus lost — click back inside the exam window.
        </div>

      )}


      {/* MAIN */}

      <main
        className="app-main"
      >

        {currentQuestion && (

          <QuestionPanel
            question={
              currentQuestion
            }
            index={
              currentIndex
            }
            total={
              questions.length
            }
            statusLabel={
              statuses[
                currentQuestion.id
              ] ||
              "unvisited"
            }
            selectedOption={
              answers[
                currentQuestion.id
              ]
            }
            onSelectOption={
              handleSelectOption
            }
            onPrev={
              navigatePrev
            }
            onNext={
              navigateNext
            }
            onMarkForReview={
              markForReview
            }
            onClearResponse={
              clearResponse
            }
            onSubmit={
              submitExamRequest
            }
            isFirst={
              currentIndex === 0
            }
            isLast={
              currentIndex ===
              questions.length - 1
            }
          />

        )}


        <aside
          className="app-sidebar"
        >

          <CamWindow
            videoRef={
              videoRef
            }
          />


          <QuestionGrid
            questions={
              questions
            }
            statuses={
              statuses
            }
            currentIndex={
              currentIndex
            }
            onSelect={
              setCurrentIndex
            }
          />


          <SecurityPanel
            answeredCount={
              answeredCount
            }
            markedCount={
              markedCount
            }
            total={
              questions.length
            }
            tabSwitches={
              tabSwitches
            }
            fullscreenExits={
              fullscreenExits
            }
          />

        </aside>

      </main>

    </div>

  );

}