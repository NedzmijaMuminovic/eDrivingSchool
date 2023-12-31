import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSpring, animated } from "react-spring";
import "./TestPage.css";
import { useAuth } from "../AuthContext/AuthContext";

function TestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const test = location.state?.test;
  const { authToken } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [showWarningAll, setShowWarningAll] = useState(false);
  const [isComponentVisible, setComponentVisible] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const buttonStyle = "button";
  const nextButtonStyle = `${buttonStyle} next-button`;
  const submitButtonStyle = `${buttonStyle} submit-button`;
  const backButtonStyle = `${buttonStyle} back-button`;
  const [selectedOptions, setSelectedOptions] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const { ID, Title, Description, Questions, ImageBase64, Category, Duration, MaxScore } = test;
  const [questionData, setQuestionData] = useState([]);
  const [optionData, setOptionData] = useState([]);
  const [timer, setTimer] = useState(Duration * 60);
  const [timeUp, setTimeUp] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(1);

  const fadeIn = useSpring({
    opacity: isComponentVisible ? 1 : 0,
    from: { opacity: 0 },
  });

  const questionAnimation = useSpring({
    opacity: testStarted ? 1 : 0,
    from: { opacity: 0 },
  });

  const fetchQuestionsData = async () => {
    try {
      const response = await fetch("http://localhost:8080/questions/getbyids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Questions }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setQuestionData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleAttemptSubmission = async (userresponses) => {
    var testid = ID;
    const formattedUserResponses = userresponses.map(([questionId, selectedOptionIds]) => ({
      questionid: questionId,
      selectedoptions: selectedOptionIds,
    }));

    try {
      const response = await fetch("http://localhost:8080/attempt/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: authToken, testid, userresponses: formattedUserResponses }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      navigate(`/testresults`, { state: { attempt: data } });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchOptionsData = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/options/getbyquestionids",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Questions }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setOptionData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (timeUp && Object.keys(selectedOptions).length > 0) {
      handleSubmissionAutomatically();
    }
    if (timeUp && Object.keys(selectedOptions).length === 0) {
      handleSubmissionEmpty();
    }
  }, [timeUp, selectedOptions]);

  const timerCountdown = () => {
    const initialTimer = Duration * 60;
    setTimer(initialTimer);

    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        const newTimer = prevTimer - 1;

        if (newTimer <= 0) {
          setTimeUp(true);
          clearInterval(interval);
          return 0;
        }

        return newTimer;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  };

  useEffect(() => {
    setTimeout(() => {
      setComponentVisible(true);
    }, 100);
    fetchQuestionsData();
    fetchOptionsData();
  }, []);

  const handleOptionChange = (questionId, optionId) => {
    const isMultipleSelect = questionData[currentQuestion].MultipleSelect;
    if (isMultipleSelect) {
      setSelectedOptions((prevSelectedOptions) => ({
        ...prevSelectedOptions,
        [questionId]: [...(prevSelectedOptions[questionId] || []), optionId],
      }));
    } else {
      setSelectedOptions((prevSelectedOptions) => {
        return {
          ...prevSelectedOptions,
          [questionId]: [optionId],
        };
      });
    }
  };

  const handleOptionRemove = (questionId, optionId) => {
    setSelectedOptions((prevSelectedOptions) => {
      const options = prevSelectedOptions[questionId] || [];
      const updatedOptions = options.filter((id) => id !== optionId);
      return {
        ...prevSelectedOptions,
        [questionId]: updatedOptions,
      };
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < Questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setQuestionCount(questionCount + 1);
      setSelectedQuestion(selectedQuestion + 1);
    }
  };

  const handleBackQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setQuestionCount(questionCount - 1);
      setSelectedQuestion(selectedQuestion - 1);
    }
  };

  const handleStartTest = () => {
    setTimeUp(false);
    setTestStarted(true);
    setQuestionCount(1);
    timerCountdown();
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleBackToPreviousContent = () => {
    window.location.reload();
    setTestStarted(false);
  };

  const handleQuestionChange = (event) => {
    const selectedNumber = parseInt(event.target.value, 10);
    setSelectedQuestion(selectedNumber);
    setCurrentQuestion(selectedNumber - 1);
    setQuestionCount(selectedNumber);
  };

  const handleSubmission = () => {
    const userresponses = Object.entries(selectedOptions).map(
      ([questionId, selectedOptionIds]) => [+questionId, selectedOptionIds]
    );
    const hasEmptySelection = Object.values(selectedOptions).some(
      (selectedOptionIds) => selectedOptionIds.length === 0
    );
    if (hasEmptySelection) {
      setShowWarning(true);
    } else {
      if (userresponses.length < Questions.length) {
        setShowWarning(true);
      }
      else {
        setShowWarning(false);
        setShowWarningAll(true);
      }
    }
  };

  const handleSubmissionConfirm = () => {
    if (Object.keys(selectedOptions).length > 0) {
      handleSubmissionAutomatically();
    }
    else if (Object.keys(selectedOptions).length === 0) {
      handleSubmissionEmpty();
    }
    else {
      const userresponses = Object.entries(selectedOptions).map(
        ([questionId, selectedOptionIds]) => [+questionId, selectedOptionIds]
      );
      handleAttemptSubmission(userresponses);
    }
  };

  const handleSubmissionAutomatically = () => {
    const userresponses = Object.entries(selectedOptions).map(
      ([questionId, selectedOptionIds]) => [+questionId, selectedOptionIds]
    );
    handleAttemptSubmission(userresponses);
  };

  const handleSubmissionEmpty = async () => {
    var testid = ID;

    try {
      const response = await fetch("http://localhost:8080/attempt/submitempty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: authToken, testid }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      navigate(`/testresults`, { state: { attempt: data } });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getOptionsForCurrentQuestion = () => {
    const currentQuestionID = questionData[currentQuestion].ID;
    return optionData.filter(
      (option) => option.QuestionID === currentQuestionID
    );
  };

  return (
    <animated.div className={`container ${Title}`} style={fadeIn}>
      {!testStarted ? (
        <div className="start-test-container">
          <div className="category-page">
            <h2>{Title}</h2>
            <img
              src={`data:image/png;base64,${ImageBase64}`}
              alt={`Test: ${Title}`}
              width={"150"}
              className="category-image"
            />
            <p><strong>{Description}</strong></p>
            <p>The exam for category {Category} consists of {Questions.length}{" "} questions.</p>
            <p>You have {Duration} minutes to finish the exam.</p>
            <p>The required passing score is {MaxScore * 0.9}/{MaxScore} (90%).</p>
          </div>
          <button type="button" className={`button back-to-home-button`} onClick={handleBackToHome}>Quit</button>
          <button type="button" className={`button start-test-button`} onClick={handleStartTest}>Start</button>
        </div>
      ) : (
        <animated.div style={questionAnimation}>
          <h2>{test.Title} Test</h2>
          <div className="time-left">
            <div className="question-container">
              <p>Question {questionCount} of {Questions.length}</p>
            </div>
            <p>Time Left: {Math.floor(timer / 60)}:{(timer % 60).toLocaleString('en-US', { minimumIntegerDigits: 2 })}</p>
            {timeUp && <div>Time's up! Finish and submit your test.</div>}
            <div className="select-container">
                <p>Select Question:</p>
                <select value={selectedQuestion} onChange={handleQuestionChange}>
                  {Array.from({ length: Questions.length }, (_, i) => i + 1).map((number) => (
                    <option key={number} value={number}>
                      {number}
                    </option>
                  ))}
                </select>
              </div>
          </div>
          <div className="form-container">
            <form>
              <div key={currentQuestion} className="question-container" style={{ marginBottom: "20px" }}>
                <p>{questionData[currentQuestion].QuestionText}</p>
                {questionData[currentQuestion].ImageBase64 && (
                  <img
                    src={`data:image/png;base64,${questionData[currentQuestion].ImageBase64}`}
                    alt={`Test: ${questionData[currentQuestion].QuestionText}`}
                    className="question-image"
                  />
                )}
                <div>
                  {getOptionsForCurrentQuestion().map((option, optionIndex) => (
                    <label className="option-input" key={optionIndex} style={{ display: "block", marginBottom: "10px" }}>
                      <input
                        className="option-input"
                        type={questionData[currentQuestion].MultipleSelect ? "checkbox" : "radio"}
                        name={`question_${questionData[currentQuestion].ID}`}
                        value={option.ID}
                        checked={selectedOptions[questionData[currentQuestion].ID]?.includes(option.ID) || false}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleOptionChange(questionData[currentQuestion].ID, option.ID);
                          } else {
                            handleOptionRemove(questionData[currentQuestion].ID, option.ID);
                          }
                        }}
                      />
                      {option.OptionText}
                    </label>
                  ))}
                </div>
              </div>
              <div className="button-container">
                {currentQuestion === 0 && (
                  <button type="button" className={`button back-to-previous-content-button`} onClick={handleBackToPreviousContent}>Quit</button>
                )}
                {currentQuestion > 0 && (
                  <button type="button" className={backButtonStyle} onClick={handleBackQuestion}>Back</button>
                )}
                {currentQuestion < Questions.length - 1 ? (
                  <button type="button" className={nextButtonStyle} onClick={handleNextQuestion}>Next</button>
                ) : !(showWarning || showWarningAll) && (
                  <button type="button" className={submitButtonStyle} onClick={handleSubmission}>Submit</button>
                ) || (showWarning || showWarningAll) && (
                  <button type="button" className={submitButtonStyle} onClick={handleSubmissionConfirm}>Confirm</button>
                )}
              </div>
            </form>
          </div>
        </animated.div>
      )}
      {showWarning && (
        <div className="submit-warning-container">
          <div className="submit-warning">
            <h5>Are you sure? You haven't selected an answer for each question.</h5>
          </div>
        </div>     
      )}
      {showWarningAll && (
        <div className="submit-warning-container">
        <div className="submit-warning">
          <h5>Are you sure?</h5>
        </div>
      </div>      
      )}
    </animated.div>
  );
}

export default TestPage;