import React, {
    useEffect,
    useRef,
    useState
} from "react";

import { useNavigate } from "react-router-dom";

import "./candidate.css";


const questions = [

    "Tell me about yourself.",

    "Why do you want to join our company?",

    "What are your strengths?"

];


function InterviewPanel() {

    const navigate = useNavigate();


    // ==================================================
    // USER
    // ==================================================

    const user =
        JSON.parse(
            localStorage.getItem("user")
        );

    const loggedInUser =
        user?.id;


    // ==================================================
    // INTERVIEW
    // ==================================================

    const interviewStartRef =
        useRef(null);

    const submittedRef =
        useRef(false);


    const [started, setStarted] =
        useState(false);

    const [currentQuestion, setCurrentQuestion] =
        useState(0);

    const [allAnswers, setAllAnswers] =
        useState([]);


    // ==================================================
    // ANSWER
    // ==================================================

    const [answer, setAnswer] =
        useState("");


    // ==================================================
    // TAB SWITCH
    // ==================================================

    const tabSwitchCountRef =
        useRef(0);

    const [tabSwitchCount, setTabSwitchCount] =
        useState(0);


    // ==================================================
    // CAMERA
    // ==================================================

    const videoRef =
        useRef(null);

    const mediaStream =
        useRef(null);


    // ==================================================
    // VIDEO RECORDING
    // ==================================================

    const mediaRecorder =
        useRef(null);

    const recordedChunks =
        useRef([]);


    // ==================================================
    // VOICE DETECTION
    // ==================================================

    const audioContextRef =
        useRef(null);

    const analyserRef =
        useRef(null);

    const audioAnimationRef =
        useRef(null);

    const isSpeakingRef =
        useRef(false);

    const [isSpeaking, setIsSpeaking] =
        useState(false);


    // ==================================================
    // TIMER
    // ==================================================

    const INTERVIEW_TIME = 30;

    const [timeLeft, setTimeLeft] =
        useState(INTERVIEW_TIME);

    const [startTime, setStartTime] =
        useState(null);

    const [endTime, setEndTime] =
        useState(null);

    const [elapsedSeconds, setElapsedSeconds] =
        useState(0);


    // ==================================================
    // VOICE DETECTION
    // ==================================================

    const startVoiceDetection = (stream) => {

        try {

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;


            if (!AudioContext) {

                console.log(
                    "Web Audio API not supported"
                );

                return;

            }


            const audioContext =
                new AudioContext();


            const analyser =
                audioContext.createAnalyser();


            analyser.fftSize = 2048;

            analyser.smoothingTimeConstant = 0.8;


            const microphone =
                audioContext.createMediaStreamSource(
                    stream
                );


            microphone.connect(
                analyser
            );


            audioContextRef.current =
                audioContext;

            analyserRef.current =
                analyser;


            const dataArray =
                new Uint8Array(
                    analyser.fftSize
                );


            const detectVoice = () => {

                if (
                    !analyserRef.current ||
                    submittedRef.current
                ) {
                    return;
                }


                analyserRef.current
                    .getByteTimeDomainData(
                        dataArray
                    );


                let sum = 0;


                for (
                    let i = 0;
                    i < dataArray.length;
                    i++
                ) {

                    const value =
                        (dataArray[i] - 128) /
                        128;


                    sum +=
                        value * value;

                }


                const volume =
                    Math.sqrt(
                        sum /
                        dataArray.length
                    );


                /*
                 * Adjust this value if required.
                 *
                 * Lower value =
                 * more sensitive.
                 *
                 * Higher value =
                 * less sensitive.
                 */

                const SPEAKING_THRESHOLD =
                    0.08;


                const speaking =
                    volume >
                    SPEAKING_THRESHOLD;


                // ------------------------------------------
                // SPEAKING STARTED
                // ------------------------------------------

                if (
                    speaking &&
                    !isSpeakingRef.current
                ) {

                    isSpeakingRef.current =
                        true;


                    setIsSpeaking(
                        true
                    );


                    alert(
                        "⚠️ Speaking detected. Please remain silent."
                    );

                }


                // ------------------------------------------
                // SPEAKING STOPPED
                // ------------------------------------------

                if (
                    !speaking &&
                    isSpeakingRef.current
                ) {

                    isSpeakingRef.current =
                        false;


                    setIsSpeaking(
                        false
                    );

                }


                audioAnimationRef.current =
                    requestAnimationFrame(
                        detectVoice
                    );

            };


            detectVoice();


        } catch (error) {

            console.log(
                "Voice detection error:",
                error
            );

        }

    };


    // ==================================================
    // STOP VOICE DETECTION
    // ==================================================

    const stopVoiceDetection = () => {

        if (
            audioAnimationRef.current
        ) {

            cancelAnimationFrame(
                audioAnimationRef.current
            );

            audioAnimationRef.current =
                null;

        }


        if (
            audioContextRef.current
        ) {

            try {

                audioContextRef.current.close();

            } catch (error) {

                console.log(
                    "Audio context close error:",
                    error
                );

            }

            audioContextRef.current =
                null;

        }


        analyserRef.current =
            null;


        isSpeakingRef.current =
            false;


        setIsSpeaking(
            false
        );

    };


    // ==================================================
    // TAB SWITCH DETECTION
    // ==================================================

    useEffect(() => {

        const handleVisibility =
            () => {

                if (
                    document.hidden &&
                    started &&
                    !submittedRef.current
                ) {

                    tabSwitchCountRef.current += 1;


                    setTabSwitchCount(
                        tabSwitchCountRef.current
                    );


                    console.log(
                        "Tab Switch:",
                        tabSwitchCountRef.current
                    );


                    if (
                        tabSwitchCountRef.current >=
                        3
                    ) {

                        alert(
                            "Maximum tab switches reached. Interview will be submitted."
                        );


                        const finalAnswers = [

                            ...allAnswers,

                            {
                                questionNo:
                                    currentQuestion + 1,

                                question:
                                    questions[
                                        currentQuestion
                                    ],

                                answer:
                                    answer.trim()
                            }

                        ];


                        finishInterview(
                            finalAnswers
                        );

                    }

                }

            };


        document.addEventListener(
            "visibilitychange",
            handleVisibility
        );


        return () => {

            document.removeEventListener(
                "visibilitychange",
                handleVisibility
            );

        };

    }, [
        started,
        currentQuestion,
        answer,
        allAnswers
    ]);


    // ==================================================
    // INTERVIEW TIMER
    // ==================================================

    useEffect(() => {

        if (!started)
            return;


        const timer =
            setInterval(() => {

                setElapsedSeconds(
                    (prev) => prev + 1
                );


                setTimeLeft(
                    (prev) => {

                        if (prev <= 1) {

                            clearInterval(
                                timer
                            );


                            const finalAnswers = [

                                ...allAnswers,

                                {
                                    questionNo:
                                        currentQuestion + 1,

                                    question:
                                        questions[
                                            currentQuestion
                                        ],

                                    answer:
                                        answer.trim()
                                }

                            ];


                            finishInterview(
                                finalAnswers
                            );


                            return 0;

                        }


                        return prev - 1;

                    }
                );


            }, 1000);


        return () =>
            clearInterval(timer);


    }, [
        started,
        currentQuestion,
        answer,
        allAnswers
    ]);


    // ==================================================
    // FORCE FULLSCREEN
    // ==================================================

    useEffect(() => {

        if (!started)
            return;


        const forceFullscreen =
            async () => {

                if (
                    !document.fullscreenElement &&
                    !submittedRef.current
                ) {

                    try {

                        await document
                            .documentElement
                            .requestFullscreen();

                    } catch (err) {

                        console.log(
                            "Unable to re-enter fullscreen:",
                            err
                        );

                    }

                }

            };


        const handleFullscreenChange =
            () => {

                if (
                    !document.fullscreenElement &&
                    !submittedRef.current
                ) {

                    forceFullscreen();

                }

            };


        document.addEventListener(
            "fullscreenchange",
            handleFullscreenChange
        );


        const interval =
            setInterval(() => {

                if (
                    !document.fullscreenElement &&
                    !submittedRef.current
                ) {

                    forceFullscreen();

                }

            }, 1000);


        return () => {

            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );


            clearInterval(
                interval
            );

        };

    }, [started]);


    // ==================================================
    // FULLSCREEN EXIT = SUBMIT
    // ==================================================

    useEffect(() => {

        if (!started)
            return;


        const handleFullscreenChange =
            () => {

                if (
                    !document.fullscreenElement &&
                    !submittedRef.current
                ) {

                    alert(
                        "Fullscreen exited. Interview will be submitted."
                    );


                    const finalAnswers = [

                        ...allAnswers,

                        {
                            questionNo:
                                currentQuestion + 1,

                            question:
                                questions[
                                    currentQuestion
                                ],

                            answer:
                                answer.trim()
                        }

                    ];


                    finishInterview(
                        finalAnswers
                    );

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

    }, [
        started,
        currentQuestion,
        answer,
        allAnswers
    ]);


    // ==================================================
    // START INTERVIEW
    // ==================================================

    const startInterview =
        async () => {

            interviewStartRef.current =
                new Date().toISOString();


            setStartTime(
                interviewStartRef.current
            );


            try {

                // ------------------------------------------
                // FULLSCREEN
                // ------------------------------------------

                if (
                    document
                        .documentElement
                        .requestFullscreen
                ) {

                    await document
                        .documentElement
                        .requestFullscreen();

                }


                // ------------------------------------------
                // CAMERA + MICROPHONE
                // ------------------------------------------

                const stream =
                    await navigator.mediaDevices
                        .getUserMedia({

                            video: true,

                            audio: true

                        });


                mediaStream.current =
                    stream;


                if (
                    videoRef.current
                ) {

                    videoRef.current.srcObject =
                        stream;

                }


                // ------------------------------------------
                // START VOICE DETECTION
                // ------------------------------------------

                startVoiceDetection(
                    stream
                );


                // ------------------------------------------
                // START VIDEO RECORDING
                // ------------------------------------------

                recordedChunks.current =
                    [];


                const recorder =
                    new MediaRecorder(
                        stream
                    );


                recorder.ondataavailable =
                    (e) => {

                        if (
                            e.data.size > 0
                        ) {

                            recordedChunks.current.push(
                                e.data
                            );

                        }

                    };


                recorder.start();


                mediaRecorder.current =
                    recorder;


                // ------------------------------------------
                // START INTERVIEW
                // ------------------------------------------

                setStarted(
                    true
                );


            } catch (err) {

                console.log(
                    err
                );


                alert(
                    "Camera/Microphone permission denied"
                );

            }

        };


    // ==================================================
    // NEXT QUESTION
    // ==================================================

    const nextQuestion =
        () => {

            const answerObject = {

                questionNo:
                    currentQuestion + 1,

                question:
                    questions[
                        currentQuestion
                    ],

                answer:
                    answer.trim()

            };


            const updatedAnswers = [

                ...allAnswers,

                answerObject

            ];


            setAllAnswers(
                updatedAnswers
            );


            // ------------------------------------------
            // NEXT QUESTION
            // ------------------------------------------

            if (
                currentQuestion <
                questions.length - 1
            ) {

                setCurrentQuestion(
                    (prev) =>
                        prev + 1
                );


                setAnswer(
                    ""
                );


            } else {

                // ------------------------------------------
                // FINISH
                // ------------------------------------------

                finishInterview(
                    updatedAnswers
                );

            }

        };


    // ==================================================
    // FINISH INTERVIEW
    // ==================================================

    const finishInterview =
        async (answers) => {

            if (
                submittedRef.current
            ) {

                return;

            }


            submittedRef.current =
                true;


            const interviewEnd =
                new Date().toISOString();


            setEndTime(
                interviewEnd
            );


            if (
                !interviewStartRef.current
            ) {

                interviewStartRef.current =
                    new Date().toISOString();

            }


            try {

                // ------------------------------------------
                // STOP VOICE DETECTION
                // ------------------------------------------

                stopVoiceDetection();


                // ------------------------------------------
                // STOP VIDEO RECORDING
                // ------------------------------------------

                if (
                    mediaRecorder.current &&
                    mediaRecorder.current.state !==
                        "inactive"
                ) {

                    mediaRecorder.current.stop();


                    await new Promise(
                        (resolve) => {

                            mediaRecorder.current.onstop =
                                resolve;

                        }
                    );

                }


                // ------------------------------------------
                // STOP CAMERA + MICROPHONE
                // ------------------------------------------

                if (
                    mediaStream.current
                ) {

                    mediaStream.current
                        .getTracks()
                        .forEach(
                            (track) =>
                                track.stop()
                        );

                }


                // ------------------------------------------
                // EXIT FULLSCREEN
                // ------------------------------------------

                if (
                    document.fullscreenElement
                ) {

                    await document.exitFullscreen();

                }


                // ------------------------------------------
                // CREATE VIDEO BLOB
                // ------------------------------------------

                const videoBlob =
                    new Blob(
                        recordedChunks.current,
                        {
                            type:
                                "video/webm"
                        }
                    );


                // ------------------------------------------
                // FORM DATA
                // ------------------------------------------

                const formData =
                    new FormData();


                formData.append(
                    "userId",
                    user.id
                );


                formData.append(
                    "submittedAt",
                    new Date().toISOString()
                );


                formData.append(
                    "interviewStartTime",
                    interviewStartRef.current
                );


                formData.append(
                    "interviewEndTime",
                    interviewEnd
                );


                formData.append(
                    "totalInterviewTime",
                    INTERVIEW_TIME
                );


                formData.append(
                    "timeTaken",
                    elapsedSeconds
                );


                formData.append(
                    "tabSwitchCount",
                    tabSwitchCountRef.current
                );


                formData.append(
                    "answers",
                    JSON.stringify(
                        answers
                    )
                );


                formData.append(
                    "video",
                    videoBlob,
                    "interview.webm"
                );


                // ------------------------------------------
                // UPLOAD
                // ------------------------------------------

                const response =
                    await fetch(
                        "http://localhost:5000/api/interview/upload",
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Upload failed"
                    );

                }

				const updatedUser = JSON.parse(localStorage.getItem("user") || "{}");
				updatedUser.interviewStatus = "Process";
				localStorage.setItem("user", JSON.stringify(updatedUser));


                alert(
                    "Interview Submitted Successfully"
                );


                navigate(
                    "/candidate"
                );


            } catch (err) {

                console.log(
                    err
                );


                alert(
                    "Submission Failed"
                );

            }

        };


    // ==================================================
    // CLEANUP
    // ==================================================

    useEffect(() => {

        return () => {

            stopVoiceDetection();


            if (
                mediaStream.current
            ) {

                mediaStream.current
                    .getTracks()
                    .forEach(
                        (track) =>
                            track.stop()
                    );

            }

        };

    }, []);


    // ==================================================
    // UI
    // ==================================================

    return (

        <div
            style={{
                padding: 20
            }}
        >

            <h2>
                Interview Panel
            </h2>


            <h3>
                Tab Switch Count:{" "}
                {tabSwitchCount} / 3
            </h3>


            <h3>
                Candidate:{" "}
                {loggedInUser}
            </h3>


            {!started ? (

                <>

                    <br />

                    <button
                        onClick={
                            startInterview
                        }
                    >
                        Start Interview
                    </button>

                </>

            ) : (

                <>

                    {/* ================================= */}
                    {/* TIMER */}
                    {/* ================================= */}

                    <h3>
                        Time Left:{" "}
                        {timeLeft} seconds
                    </h3>


                    {/* ================================= */}
                    {/* CAMERA PREVIEW */}
                    {/* ================================= */}

                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{
                            width: 300,
                            height: 200,
                            objectFit: "cover",
                            border:
                                "1px solid #ccc"
                        }}
                    />


                    <hr />


                    {/* ================================= */}
                    {/* VOICE DETECTION STATUS */}
                    {/* ================================= */}

                    <div
                        style={{
                            padding: 12,
                            marginBottom: 15,
                            border:
                                "1px solid #ccc",
                            background:
                                isSpeaking
                                    ? "#ffe5e5"
                                    : "#e8ffe8"
                        }}
                    >

                        <strong>
                            Microphone:{" "}
                            {isSpeaking
                                ? "⚠️ Speaking Detected"
                                : "✓ No Speaking Detected"}
                        </strong>


                        {isSpeaking && (

                            <p
                                style={{
                                    color: "red",
                                    fontWeight:
                                        "bold",
                                    marginBottom: 0
                                }}
                            >
                                Please remain silent
                                while answering by
                                typing.
                            </p>

                        )}

                    </div>


                    {/* ================================= */}
                    {/* QUESTION */}
                    {/* ================================= */}

                    <h2>
                        Question{" "}
                        {currentQuestion + 1}{" "}
                        /{" "}
                        {questions.length}
                    </h2>


                    <h3>
                        {
                            questions[
                                currentQuestion
                            ]
                        }
                    </h3>


                    <hr />


                    {/* ================================= */}
                    {/* TEXT ANSWER */}
                    {/* ================================= */}

                    <h3>
                        Your Answer
                    </h3>


                    <textarea
                        rows={10}
                        cols={90}
                        value={answer}
                        onChange={(e) =>
                            setAnswer(
                                e.target.value
                            )
                        }
                        placeholder="Type your answer here..."
                    />


                    <br />
                    <br />


                    {/* ================================= */}
                    {/* NEXT / FINISH */}
                    {/* ================================= */}

                    <button
                        onClick={
                            nextQuestion
                        }
                    >

                        {
                            currentQuestion ===
                            questions.length - 1

                                ? "Finish Interview"

                                : "Next Question"
                        }

                    </button>


                    <hr />


                    {/* ================================= */}
                    {/* SUBMITTED ANSWERS */}
                    {/* ================================= */}

                    <h2>
                        Answers Submitted
                    </h2>


                    {allAnswers.map(
                        (item) => (

                            <div
                                key={
                                    item.questionNo
                                }
                                style={{
                                    border:
                                        "1px solid gray",
                                    marginBottom:
                                        15,
                                    padding: 10
                                }}
                            >

                                <b>
                                    Q
                                    {
                                        item.questionNo
                                    }
                                    .{" "}
                                    {
                                        item.question
                                    }
                                </b>


                                <p>
                                    {
                                        item.answer
                                    }
                                </p>

                            </div>

                        )
                    )}

                </>

            )}

        </div>

    );

}


export default InterviewPanel;