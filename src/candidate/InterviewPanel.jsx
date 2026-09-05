import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./candidate.css";

const QUESTIONS = [
  "Tell me about yourself.",
  "Why do you want to join our company?",
  "What are your strengths?",
];

const INTERVIEW_TIME = 30;
const MAX_TAB_SWITCHES = 3;
const API_URL = "http://localhost:5000/api/interview/upload";

function InterviewPanel() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

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

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioAnimationRef = useRef(null);

  const answerRef = useRef("");
  const questionRef = useRef(0);
  const answersRef = useRef([]);
  const tabSwitchRef = useRef(0);

  const submittedRef = useRef(false);
  const interviewStartRef = useRef(null);

  // --------------------------------------------------
  // MEDIA
  // --------------------------------------------------

  const stopVoiceDetection = useCallback(() => {
    if (audioAnimationRef.current) {
      cancelAnimationFrame(audioAnimationRef.current);
      audioAnimationRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setIsSpeaking(false);
  }, []);

  const stopMedia = useCallback(() => {
    stopVoiceDetection();

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setMediaReady(false);
  }, [stopVoiceDetection]);

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
  // VOICE DETECTION
  // --------------------------------------------------

  const startVoiceDetection = useCallback(async (stream) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;

      if (!AudioContext) return;

      const audioContext = new AudioContext();
      await audioContext.resume();
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;

      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.fftSize);
      const THRESHOLD = 0.04;

      const detect = () => {
        if (!analyserRef.current || submittedRef.current) return;

        analyserRef.current.getByteTimeDomainData(data);

        let sum = 0;

        for (const value of data) {
          const normalized = (value - 128) / 128;
          sum += normalized * normalized;
        }

        const volume = Math.sqrt(sum / data.length);
        setIsSpeaking(volume > THRESHOLD);

        audioAnimationRef.current = requestAnimationFrame(detect);
      };

      detect();
    } catch (error) {
      console.error("Voice detection error:", error);
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

  // --------------------------------------------------
  // ANSWERS
  // --------------------------------------------------

  const getCurrentAnswer = useCallback(() => {
    const index = questionRef.current;

    return {
      questionNo: index + 1,
      question: QUESTIONS[index],
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

        stopVoiceDetection();
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

        const updatedUser = JSON.parse(
          localStorage.getItem("user") || "{}"
        );

        updatedUser.interviewStatus = "Process";

        localStorage.setItem("user", JSON.stringify(updatedUser));

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
      stopVoiceDetection,
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

      await startVoiceDetection(stream);

      if (!startRecording(stream)) {
        throw new Error("Unable to start video recording.");
      }

      const examStartResult = await window.electronAPI?.startExam?.();
      if (examStartResult && !examStartResult.success) {
        throw new Error(examStartResult.message || "Unable to start the exam.");
      }

      interviewStartRef.current = new Date().toISOString();

      setTimeLeft(INTERVIEW_TIME);
      setElapsedSeconds(0);
      setStarted(true);
    } catch (error) {
      console.error("Start interview error:", error);
      alert("Unable to start interview. Please check your camera and microphone.");
    }
  };

  // --------------------------------------------------
  // NEXT QUESTION
  // --------------------------------------------------

  const nextQuestion = () => {
    if (submittedRef.current || isSubmitting) return;

    const updatedAnswers = saveCurrentAnswer();

    if (questionRef.current < QUESTIONS.length - 1) {
      const next = questionRef.current + 1;

      questionRef.current = next;
      answerRef.current = "";

      setCurrentQuestion(next);
      setAnswer("");
    } else {
      finishInterview(updatedAnswers);
    }
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

            <div
              className={
                isSpeaking
                  ? "voice-status speaking"
                  : "voice-status silent"
              }
            >
              <div className="voice-icon">🎤</div>

              <div className="voice-text">
                <strong>
                  {isSpeaking ? "Voice Detected" : "No Voice Detected"}
                </strong>

                <span>
                  {isSpeaking
                    ? "Please remain silent while typing your answer."
                    : "Microphone is active and monitoring."}
                </span>
              </div>

              <div
                className={
                  isSpeaking
                    ? "voice-indicator active"
                    : "voice-indicator"
                }
              >
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>

          <div className="question-section">
            <div className="question-number">
              Question {currentQuestion + 1} / {QUESTIONS.length}
            </div>

            <h2>{QUESTIONS[currentQuestion]}</h2>
          </div>

          <div className="answer-section">
            <label>Your Answer</label>

            <textarea
              autoFocus
              rows={10}
              value={answer}
              disabled={isSubmitting}
              placeholder="Type your answer here..."
              onChange={(e) => {
                answerRef.current = e.target.value;
                setAnswer(e.target.value);
              }}
            />
          </div>

          <div className="action-section">
            <button
              className="primary-button"
              onClick={nextQuestion}
              disabled={isSubmitting}
            >
              {currentQuestion === QUESTIONS.length - 1
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