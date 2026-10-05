import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./candidate.css";
import useCameraCoverageWarning from "./utils/useCameraCoverageWarning.js";

const INTERVIEW_TIME = 30;
const MAX_TAB_SWITCHES = 3;
const API_URL = "http://localhost:5000/api/interview/upload";

function InterviewPanel() {
  const navigate = useNavigate();

  const user = (() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("user") || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  })();

  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [allAnswers, setAllAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(INTERVIEW_TIME);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const [mediaReady, setMediaReady] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [checkingMedia, setCheckingMedia] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const answerInputRef = useRef(null);

  const answerRef = useRef("");
  const questionRef = useRef(0);
  const answersRef = useRef([]);
  const tabSwitchRef = useRef(0);

  const submittedRef = useRef(false);
  const interviewStartRef = useRef(null);
  const cameraCovered = useCameraCoverageWarning(videoRef, started && !isSubmitting);

  useEffect(() => {
    if (started && !isSubmitting) {
      answerInputRef.current?.focus();
    }
  }, [started, currentQuestion, isSubmitting]);



  const [questions, setQuestions] = useState([]);
const [loadingQuestions, setLoadingQuestions] = useState(true);
const [questionError, setQuestionError] = useState("");

  const questionsListRef = useRef([]);

useEffect(() => {
  questionsListRef.current = questions;
}, [questions]);

useEffect(() => {
  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      setQuestionError("");

      const response = await fetch(
        "http://localhost:5000/api/candidate/getInterviewQuestions"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch interview questions");
      }

      const result = await response.json();

      // Supports either { data: [...] } or a direct array
      const fetchedQuestions = Array.isArray(result)
        ? result
        : result.data;

      if (!Array.isArray(fetchedQuestions) || fetchedQuestions.length === 0) {
        throw new Error("No interview questions available");
      }

      setQuestions(
        fetchedQuestions.filter((q) => q.isActive !== false)
      );
    } catch (error) {
      console.error("Fetch interview questions error:", error);
      setQuestionError(error.message);
    } finally {
      setLoadingQuestions(false);
    }
  };

  fetchQuestions();
}, []);

  // --------------------------------------------------
  // MEDIA
  // --------------------------------------------------

  const stopMedia = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setMediaReady(false);
  }, []);

  const checkMediaPermissions = useCallback(async () => {
    setCheckingMedia(true);
    setMediaError("");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera and microphone are not supported by this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      if (!stream.getVideoTracks().length) {
        throw new Error("Camera was not detected.");
      }

      if (!stream.getAudioTracks().length) {
        throw new Error("Microphone was not detected.");
      }

      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      setMediaReady(true);
    } catch (error) {
      console.error("Media error:", error);

      setMediaReady(false);

      const messages = {
        NotAllowedError:
          "Camera or microphone permission was denied. Please allow both permissions and try again.",
        NotFoundError:
          "Camera or microphone was not found. Please connect both devices and try again.",
        NotReadableError:
          "Camera or microphone is being used by another application.",
      };

      setMediaError(
        messages[error.name] ||
          error.message ||
          "Camera and microphone are required."
      );
    } finally {
      setCheckingMedia(false);
    }
  }, []);

  // --------------------------------------------------
  // RECORDING
  // --------------------------------------------------

  const startRecording = useCallback((stream) => {
    recordedChunksRef.current = [];

    try {
      const mimeType = MediaRecorder.isTypeSupported(
        "video/webm;codecs=vp8,opus"
      )
        ? "video/webm;codecs=vp8,opus"
        : "";

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data?.size) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = (event) => {
        console.error("Recording error:", event);
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      return true;
    } catch (error) {
      console.error("MediaRecorder error:", error);
      return false;
    }
  }, []);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;

      if (!recorder || recorder.state === "inactive") {
        setIsRecording(false);
        resolve();
        return;
      }

      recorder.onstop = () => {
        setIsRecording(false);
        resolve();
      };

      recorder.stop();
    });
  }, []);

  const saveLocalRecording = useCallback(async (blob, name) => {
    if (!blob?.size || !window.electronAPI?.saveRecording) return;

    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = "";
    for (let index = 0; index < bytes.length; index += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    }

    const result = await window.electronAPI.saveRecording({
      name,
      data: btoa(binary),
    });
    if (!result?.success) {
      throw new Error(result?.message || "Unable to save local recording.");
    }
  }, []);

  // --------------------------------------------------
  // ANSWERS
  // --------------------------------------------------

const getCurrentAnswer = useCallback(() => {
  const index = questionRef.current;
  const currentQ = questionsListRef.current[index];

  return {
    questionId: currentQ?.id || null,
    questionNo: index + 1,
    question: currentQ?.question || "",
    answer: answerRef.current.trim(),
  };
}, []);


  const saveCurrentAnswer = () => {
    const current = getCurrentAnswer();
    const updated = [
      ...answersRef.current.filter(
        (item) => item.questionNo !== current.questionNo
      ),
      current,
    ].sort((left, right) => left.questionNo - right.questionNo);

    answersRef.current = updated;
    setAllAnswers(updated);

    return updated;
  };

  // --------------------------------------------------
  // FINISH INTERVIEW
  // --------------------------------------------------

  const finishInterview = useCallback(
    async (answers) => {
      if (submittedRef.current) return;

      submittedRef.current = true;
      setIsSubmitting(true);
      await window.electronAPI?.stopExam?.();

      try {
        const endTime = new Date().toISOString();

        await stopRecording();

        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }

        if (document.fullscreenElement) {
          await document.exitFullscreen().catch(() => {});
        }

        const videoBlob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        await saveLocalRecording(videoBlob, `interview-${user?.id || Date.now()}.webm`);

        const formData = new FormData();

        formData.append("userId", String(user?.id || ""));
        formData.append("submittedAt", endTime);
        formData.append(
          "interviewStartTime",
          interviewStartRef.current || ""
        );
        formData.append("interviewEndTime", endTime);
        formData.append("totalInterviewTime", String(INTERVIEW_TIME));
        formData.append("timeTaken", String(elapsedSeconds));
        formData.append(
          "tabSwitchCount",
          String(tabSwitchRef.current)
        );
        formData.append("answers", JSON.stringify(answers));

        if (videoBlob.size > 0) {
          formData.append("video", videoBlob, "interview.webm");
        }

        const response = await fetch(API_URL, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          let message = "Interview submission failed.";
          try {
            const payload = await response.json();
            message = payload.message || message;
          } catch {
            // Keep the generic message when the server does not return JSON.
          }
          throw new Error(message);
        }

        let updatedUser = {};
        try {
          const parsed = JSON.parse(localStorage.getItem("user") || "{}");
          updatedUser = parsed && typeof parsed === "object" ? parsed : {};
        } catch (error) {
          console.error("Unable to update candidate interview status:", error);
        }

        updatedUser.interviewStatus = "Process";

        localStorage.setItem("user", JSON.stringify(updatedUser));
        localStorage.removeItem("interview_running");

        alert("Interview submitted successfully.");
        navigate("/candidate");
      } catch (error) {
        console.error("Submission error:", error);

        submittedRef.current = false;
        setIsSubmitting(false);

        setSubmissionError(error.message || "Interview submission failed.");
      }
    },
    [
      elapsedSeconds,
      navigate,
      stopRecording,
      saveLocalRecording,
      user?.id,
    ]
  );

  // --------------------------------------------------
  // START INTERVIEW
  // --------------------------------------------------

  const startInterview = async () => {
    if (!mediaReady) {
      await checkMediaPermissions();
      return;
    }

    try {
      setSubmissionError("");
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }

      const stream = mediaStreamRef.current;

      if (!stream) {
        throw new Error("Camera/microphone stream is unavailable.");
      }

      if (!startRecording(stream)) {
        throw new Error("Unable to start video recording.");
      }

      const examStartResult = await window.electronAPI?.startExam?.();
      if (examStartResult && !examStartResult.success) {
        throw new Error(examStartResult.message || "Unable to start the exam.");
      }

      localStorage.setItem("interview_running", "true");
      interviewStartRef.current = new Date().toISOString();

      setTimeLeft(INTERVIEW_TIME);
      setElapsedSeconds(0);
      setStarted(true);
    } catch (error) {
      console.error("Start interview error:", error);
      alert("Unable to start interview. Please check your camera and microphone.");
    }
  };

  // The permission-screen <video> and the in-interview <video> are two
  // separate DOM nodes sharing videoRef — when `started` flips to true,
  // React mounts a fresh element that never got the stream attached, so
  // the camera goes blank unless it's reattached here.
  useEffect(() => {
    if (!started) return;
    const video = videoRef.current;
    const stream = mediaStreamRef.current;
    if (video && stream) {
      video.srcObject = stream;
      video.play().catch(() => {});
    }
  }, [started]);

  // --------------------------------------------------
  // NEXT QUESTION
  // --------------------------------------------------

  const nextQuestion = () => {
    if (submittedRef.current || isSubmitting) return;

    const updatedAnswers = saveCurrentAnswer();

    if (questionRef.current < questions.length - 1) {
      const next = questionRef.current + 1;

      questionRef.current = next;
      answerRef.current = "";

      setCurrentQuestion(next);
      setAnswer("");
    } else {
      finishInterview(updatedAnswers);
    }
  };

  const handleAnswerInput = (event) => {
    const nextAnswer = event.currentTarget.value;
    answerRef.current = nextAnswer;
    setAnswer(nextAnswer);
  };

  // --------------------------------------------------
  // TIMER
  // --------------------------------------------------

  useEffect(() => {
    if (!started) return;

    const timer = setInterval(() => {
      setElapsedSeconds((value) => value + 1);

      setTimeLeft((value) => {
        if (value <= 1) {
          clearInterval(timer);

          finishInterview([
            ...answersRef.current,
            getCurrentAnswer(),
          ]);

          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, finishInterview, getCurrentAnswer]);

  useEffect(() => {
    if (!started || submittedRef.current || !("FaceDetector" in window)) return;

    const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
    const video = videoRef.current;
    let suspiciousSince = null;

    const checkFacePosition = async () => {
      if (!video?.videoWidth || submittedRef.current) return;

      try {
        const faces = await detector.detect(video);
        const face = faces[0]?.boundingBox;
        const centerX = face ? (face.x + face.width / 2) / video.videoWidth : null;
        const centerY = face ? (face.y + face.height / 2) / video.videoHeight : null;
        const suspicious = !face || centerX < 0.2 || centerX > 0.8 || centerY < 0.15 || centerY > 0.85;

        if (!suspicious) {
          suspiciousSince = null;
          return;
        }

        suspiciousSince ??= Date.now();
        if (Date.now() - suspiciousSince >= 2000) {
          alert("Face is not centered in the camera. The interview will be submitted.");
          finishInterview([...answersRef.current, getCurrentAnswer()]);
        }
      } catch (error) {
        console.error("Face position check failed:", error);
      }
    };

    const intervalId = window.setInterval(checkFacePosition, 500);
    return () => window.clearInterval(intervalId);
  }, [started, finishInterview, getCurrentAnswer]);

  // --------------------------------------------------
  // TAB SWITCH + FULLSCREEN
  // --------------------------------------------------

  useEffect(() => {
    if (!started) return;

    const handleVisibility = () => {
      if (!document.hidden || submittedRef.current) return;

      const count = tabSwitchRef.current + 1;

      tabSwitchRef.current = count;
      setTabSwitchCount(count);

      if (count >= MAX_TAB_SWITCHES) {
        alert("Maximum tab switches reached. Interview will be submitted.");

        finishInterview([
          ...answersRef.current,
          getCurrentAnswer(),
        ]);
      }
    };

    const handleFullscreen = () => {
      if (!document.fullscreenElement && !submittedRef.current) {
        alert("Fullscreen was exited. Interview will be submitted.");

        finishInterview([
          ...answersRef.current,
          getCurrentAnswer(),
        ]);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("fullscreenchange", handleFullscreen);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("fullscreenchange", handleFullscreen);
    };
  }, [started, finishInterview, getCurrentAnswer]);

  // --------------------------------------------------
  // CLEANUP
  // --------------------------------------------------

  useEffect(() => {
    return () => stopMedia();
  }, [stopMedia]);

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  if (loadingQuestions) {
  return (
    <div className="interview-panel">
      <div className="media-permission-box">
        <h2>Loading interview questions...</h2>
      </div>
    </div>
  );
}

if (questionError) {
  return (
    <div className="interview-panel">
      <div className="media-permission-box">
        <h2>Unable to load interview questions</h2>
        <div className="media-error">⚠️ {questionError}</div>
      </div>
    </div>
  );
}

if (questions.length === 0) {
  return (
    <div className="interview-panel">
      <div className="media-permission-box">
        <h2>No interview questions available</h2>
      </div>
    </div>
  );
}

  return (
    <div className="interview-panel">
      <div className="interview-header">
        <div>
          <h2>Interview Panel</h2>
          <p>
            Candidate: <strong>{user?.id || "N/A"}</strong>
          </p>
        </div>

        {started && (
          <div className={timeLeft <= 10 ? "timer danger" : "timer"}>
            ⏱️ {timeLeft}s
          </div>
        )}
      </div>

      {!started && (
        <div className="media-permission-box">
          <h2>Camera & Microphone Required</h2>

          <p>
            Before starting the interview, please enable your camera
            and microphone.
          </p>

          <div className="permission-video-wrapper">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="permission-video"
            />

            {!mediaReady && (
              <div className="video-placeholder">
                <div className="camera-icon">📷</div>
                <strong>Camera preview</strong>
                <span>Enable camera to see yourself here</span>
              </div>
            )}
          </div>

          <div className="device-status-container">
            {["📹 Camera", "🎤 Microphone"].map((device) => (
              <div
                key={device}
                className={
                  mediaReady
                    ? "device-status success"
                    : "device-status warning"
                }
              >
                <span>{device.split(" ")[0]}</span>

                <div>
                  <strong>{device.substring(3)}</strong>
                  <p>{mediaReady ? "Enabled" : "Not enabled"}</p>
                </div>
              </div>
            ))}
          </div>

          {mediaError && (
            <div className="media-error">⚠️ {mediaError}</div>
          )}

          {!mediaReady && (
            <button
              className="primary-button"
              onClick={checkMediaPermissions}
              disabled={checkingMedia}
            >
              {checkingMedia
                ? "Checking Camera & Microphone..."
                : "Enable Camera & Microphone"}
            </button>
          )}

          {mediaReady && (
            <>
              <div className="ready-message">
                <div className="ready-icon">✓</div>

                <div>
                  <strong>Camera and microphone are ready</strong>
                  <p>You can now start the interview.</p>
                </div>
              </div>

              <button
                className="primary-button start-button"
                onClick={startInterview}
                disabled={isSubmitting}
              >
                Start Interview
              </button>
            </>
          )}
        </div>
      )}

      {started && (
        <div className="interview-content">
          <div className="security-status">
            Tab Switches: <strong>{tabSwitchCount}</strong> /{" "}
            {MAX_TAB_SWITCHES}
          </div>

          <div className="camera-container">
            <div className="camera-header">
              <h3>Live Camera</h3>

              {isRecording && (
                <div className="recording-badge">
                  <span className="recording-dot" />
                  RECORDING
                </div>
              )}
            </div>

            <div className="video-wrapper">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="interview-video"
              />

              {isRecording && (
                <div className="live-badge">
                  <span>●</span> LIVE
                </div>
              )}
            </div>

            {cameraCovered && (
              <div className="media-error" role="alert">
                ⚠️ Camera view appears covered or too dark. Please uncover the camera.
              </div>
            )}

          </div>

          <div className="question-section">
            <div className="question-number">
             Question {currentQuestion + 1} / {questions.length}
            </div>

            <h2>{questions[currentQuestion]?.question}</h2>
          </div>

          <div className="answer-section">
            <label>Your Answer</label>

            <textarea
              ref={answerInputRef}
              autoFocus
              rows={10}
              value={answer}
              disabled={isSubmitting}
              spellCheck
              placeholder="Type your answer here..."
              onChange={handleAnswerInput}
              onInput={handleAnswerInput}
            />
          </div>

          <div className="action-section">
           <button
            className="primary-button"
            onClick={nextQuestion}
            disabled={isSubmitting}
          >
            {currentQuestion === questions.length - 1
              ? "Finish Interview"
              : "Next Question"}
          </button>

          </div>

          {submissionError && (
            <div className="media-error" role="alert">
              {submissionError}
            </div>
          )}

          {allAnswers.length > 0 && (
            <div className="submitted-answers">
              <h3>Completed Answers</h3>

              {allAnswers.map((item) => (
                <div key={item.questionNo} className="answer-card">
                  <strong>
                    Q{item.questionNo}. {item.question}
                  </strong>

                  <p>{item.answer || "No answer provided."}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default InterviewPanel;