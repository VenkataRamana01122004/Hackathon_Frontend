import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const questions = [
"Tell me about yourself.",
"Why do you want to join our company?",
"What are your strengths?"
];

function InterviewPanel() {
	
	const navigate = useNavigate();
	
	const user = JSON.parse(localStorage.getItem("user"));
	const loggedInUser = user?.id;
	
	const interviewStartRef = useRef(null);
	
	const tabSwitchCountRef = useRef(0);
	const [tabSwitchCount, setTabSwitchCount] = useState(0);
	
	const videoRef = useRef(null);
	const mediaStream = useRef(null);
	const recognitionRef = useRef(null);
	
	const mediaRecorder = useRef(null);
	const recordedChunks = useRef([]);
	
	const [started, setStarted] = useState(false);
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [allAnswers, setAllAnswers] = useState([]);
	
	const [isRecording, setIsRecording] = useState(false);
	const [transcript, setTranscript] = useState("");
	const [interimTranscript, setInterimTranscript] = useState("");
	
	const INTERVIEW_TIME = 30;
	
	const [timeLeft, setTimeLeft] = useState(INTERVIEW_TIME);
	const [startTime, setStartTime] = useState(null);
	const [endTime, setEndTime] = useState(null);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const submittedRef = useRef(false);
	
	useEffect(() => {
		const SpeechRecognition =
		window.SpeechRecognition || window.webkitSpeechRecognition;
		
		if (!SpeechRecognition) {
			alert("Speech Recognition not supported. Please use Google Chrome.");
			return;
		}
		
		const recognition = new SpeechRecognition();
		
		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.lang = "en-US";
		
		recognition.onstart = () => {
			setIsRecording(true);
		};
		
		recognition.onend = () => {
			setIsRecording(false);
		};
		
		recognition.onerror = (e) => {
			console.log("Speech Error:", e);
			setIsRecording(false);
		};
		
		recognition.onresult = (event) => {
			let finalTranscript = "";
			let interim = "";
			
			for (let i = event.resultIndex; i < event.results.length; i++) {
				const text = event.results[i][0].transcript;
				
				if (event.results[i].isFinal) {
					finalTranscript += text + " ";
				} else {
					interim += text;
				}
			}
			
			if (finalTranscript) {
				setTranscript((prev) => prev + finalTranscript);
			}
			
			setInterimTranscript(interim);
		};
		
		recognitionRef.current = recognition;
	}, []);
	
	useEffect(() => {
		const handleVisibility = () => {
			if (document.hidden) {
				tabSwitchCountRef.current += 1;
				setTabSwitchCount(tabSwitchCountRef.current);
				
				console.log("Tab Switch:", tabSwitchCountRef.current);
				
				if (tabSwitchCountRef.current >= 3 && !submittedRef.current) {
					const finalAnswers = [
					...allAnswers,
					{
						questionNo: currentQuestion + 1,
						question: questions[currentQuestion],
						answer: transcript.trim(),
					},
					];
					
					finishInterview(finalAnswers);
				}
			}
		};
		
		document.addEventListener("visibilitychange", handleVisibility);
		
		return () =>
		document.removeEventListener("visibilitychange", handleVisibility);
	}, [currentQuestion, transcript, allAnswers]);
	
	useEffect(() => {
		if (!started)
			return;
		
		const timer = setInterval(() => {
			setElapsedSeconds(prev => prev + 1);
			
			setTimeLeft(prev => {
				if (prev <= 1) {
					clearInterval(timer);
					
					const finalAnswers = [
					...allAnswers,
					{
						questionNo: currentQuestion + 1,
						question: questions[currentQuestion],
						answer: transcript.trim(),
					},
					];
					
					finishInterview(finalAnswers);
					
					return 0;
				}
				
				return prev - 1;
			});
		}, 1000);
		
		return () => clearInterval(timer);
		
	}, [started, currentQuestion, transcript, allAnswers]);
	
	useEffect(() => {
		if (!started)
			return;
		
		const forceFullscreen = async () => {
			if (!document.fullscreenElement && !submittedRef.current) {
				try {
					await document.documentElement.requestFullscreen();
				} catch (err) {
					console.log("Unable to re-enter fullscreen:", err);
				}
			}
		};
		
		const handleFullscreenChange = () => {
			// User exited fullscreen
			if (!document.fullscreenElement) {
				forceFullscreen();
			}
		};
		
		document.addEventListener("fullscreenchange", handleFullscreenChange);
		
		// Also check every second
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
    if (!started) return;

    const handleFullscreenChange = () => {
        if (!document.fullscreenElement && !submittedRef.current) {
            alert("Fullscreen exited. Interview will be submitted.");

            finishInterview([
                ...allAnswers,
                {
                    questionNo: currentQuestion + 1,
                    question: questions[currentQuestion],
                    answer: transcript.trim(),
                },
            ]);
        }
    };

    document.addEventListener(
        "fullscreenchange",
        handleFullscreenChange
    );

    return () =>
        document.removeEventListener(
            "fullscreenchange",
            handleFullscreenChange
        );
}, [started, currentQuestion, transcript, allAnswers]);

	const startInterview = async () => {
		interviewStartRef.current = new Date().toISOString();
		try {
			if (document.documentElement.requestFullscreen) {
				await document.documentElement.requestFullscreen();
			}
			
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: true,
			});
			
			mediaStream.current = stream;
			videoRef.current.srcObject = stream;
			
			// Start recording video
			recordedChunks.current = [];
			
			const recorder = new MediaRecorder(stream);
			
			recorder.ondataavailable = (e) => {
				if (e.data.size > 0) {
					recordedChunks.current.push(e.data);
				}
			};
			
			recorder.start();
			
			mediaRecorder.current = recorder;
			
			setStarted(true);
		} catch (err) {
			console.log(err);
			alert("Camera/Microphone permission denied");
		}
	};
	
	const startAnswer = () => {
		setTranscript("");
		setInterimTranscript("");
		
		recognitionRef.current.start();
	};
	
	const nextQuestion = () => {
		recognitionRef.current.stop();
		
		const answerObject = {
			questionNo: currentQuestion + 1,
			question: questions[currentQuestion],
			answer: transcript.trim(),
		};
		
		const updatedAnswers = [...allAnswers, answerObject];
		
		setAllAnswers(updatedAnswers);
		
		if (currentQuestion < questions.length - 1) {
			setCurrentQuestion((prev) => prev + 1);
		} else {
			finishInterview(updatedAnswers);
		}
	};
  
	const finishInterview = async (answers) => {
		
		if (submittedRef.current)
			return;
		
		submittedRef.current = true;
		
		setEndTime(new Date().toISOString());
		if (!interviewStartRef.current) {
			interviewStartRef.current = new Date().toISOString();
		}
		try {
			recognitionRef.current.stop();
			
			// Stop recording
			if (mediaRecorder.current) {
				mediaRecorder.current.stop();
				
				await new Promise((resolve) => {
					mediaRecorder.current.onstop = resolve;
				});
			}
			
			// Stop camera
			if (mediaStream.current) {
				mediaStream.current.getTracks().forEach((track) => track.stop());
			}
			
			if (document.fullscreenElement) {
				await document.exitFullscreen();
			}
			
			const videoBlob = new Blob(recordedChunks.current, {
				type: "video/webm",
			});
			
			const formData = new FormData();
			
			// formData.append("userId", loggedInUser);
			// formData.append("username", user.email);
			// formData.append("submittedAt", new Date().toISOString());
			// formData.append("answers", JSON.stringify(answers));
			// formData.append("video", videoBlob, "interview.webm");
			
			formData.append("userId", user.id);
			formData.append("submittedAt", new Date().toISOString());
			
			formData.append("interviewStartTime", interviewStartRef.current);
			const interviewEnd = new Date().toISOString();
			formData.append("interviewEndTime", interviewEnd);
			
			formData.append("totalInterviewTime", INTERVIEW_TIME); // seconds
			formData.append("timeTaken", elapsedSeconds);
			
			formData.append("tabSwitchCount", tabSwitchCountRef.current);
			
			formData.append("answers", JSON.stringify(answers));
			formData.append("video", videoBlob, "interview.webm");
			
			await fetch("http://localhost:5000/api/interview/upload", {
			method: "POST",
			body: formData,
		});
		
		alert("Interview Submitted Successfully");
		navigate("/candidate");
	} catch (err) {
		console.log(err);
		alert("Submission Failed");
	}
};


  return (
    <div style={{ padding: 20 }}>
      <h2>Interview Panel</h2>

	  <h3>Tab Switch Count: {tabSwitchCount} / 3</h3>
      <h3>Candidate : {loggedInUser}</h3>
<h2 style={{ color: timeLeft < 300 ? "red" : "green" }}>
  Time Left :
  {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
  {String(timeLeft % 60).padStart(2, "0")}
</h2>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        width="700"
        style={{ border: "1px solid black" }}
      />

      <br />
      <br />

      {!started ? (
        <button onClick={startInterview}>Start Interview</button>
      ) : (
        <>
          <h2>
            Question {currentQuestion + 1} / {questions.length}
          </h2>

          <h3>{questions[currentQuestion]}</h3>

          <button onClick={startAnswer} disabled={isRecording}>
            Start Answer
          </button>

          <button
            onClick={nextQuestion}
            disabled={!isRecording}
            style={{ marginLeft: 10 }}
          >
            {currentQuestion === questions.length - 1
              ? "Finish Interview"
              : "Next Question"}
          </button>

          <hr />

          <h3>
            Recording : {isRecording ? "🎤 Listening..." : "Stopped"}
          </h3>

          <h3>Answer</h3>
          <p>{interimTranscript}</p>

          <h3>Final Transcript</h3>
          <textarea
            rows={6}
            cols={90}
            value={transcript}
            readOnly
          />

          <hr />

          <h2>Answers Submitted</h2>

          {allAnswers.map((item) => (
            <div
              key={item.questionNo}
              style={{
                border: "1px solid gray",
                marginBottom: 15,
                padding: 10,
              }}
            >
              <b>
                Q{item.questionNo}. {item.question}
              </b>

              <p>{item.answer}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default InterviewPanel;