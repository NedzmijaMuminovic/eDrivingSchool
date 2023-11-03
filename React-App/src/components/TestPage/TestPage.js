import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpring, animated } from 'react-spring';
import './TestPage.css';

function TestPage({ test, testData }) {
  const navigate = useNavigate();

  const [isComponentVisible, setComponentVisible] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  
  const fadeIn = useSpring({
    opacity: isComponentVisible ? 1 : 0,
    from: { opacity: 0 },
  });

  const questionAnimation = useSpring({
    opacity: testStarted ? 1 : 0,
    from: { opacity: 0 },
  });

  useEffect(() => {
    setComponentVisible(true);
  }, []);

  const buttonStyle = 'button';
  const nextButtonStyle = `${buttonStyle} next-button`;
  const submitButtonStyle = `${buttonStyle} submit-button`;
  const backButtonStyle = `${buttonStyle} back-button`;

  const { Title, Description, ImageBase64, Category, Duration } = testData[test];
  const { Questions } = testData[test];
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(Array(Questions.length).fill(''));
  const [questionCount, setQuestionCount] = useState(0);

  const handleAnswerChange = (index, selectedAnswer) => {
    const newAnswers = [...answers];
    newAnswers[index] = selectedAnswer;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < Questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setQuestionCount(questionCount + 1);
    }
  };

  const handleBackQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setQuestionCount(questionCount - 1);
    }
  };

  const handleStartTest = () => {
    setTestStarted(true);
    setQuestionCount(1);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleBackToPreviousContent = () => {
    setTestStarted(false);
  };

  const handleSubmission = () => {
    console.log('Answers submitted:', answers);
  };

  return (
    <animated.div className={`container ${Title}`} style={fadeIn}>
      {!testStarted ? (
        <div className="start-test-container">
          <div className="category-page">
            <h2>{Title}</h2>
            <img src={`data:image/png;base64,${ImageBase64}`} alt={`Test: ${Title}`} width={"150"} className="category-image"/>
            <p><strong>{Description}</strong></p>
            <p>The exam for Category {Category} consists of {Questions.length} questions.</p>
            <p>You have {Duration} minutes to finish the exam.</p>
            <p>The required passing score is 108, with a maximum score of 120.</p>
          </div>
          <button type="button" className={`button back-to-home-button`} onClick={handleBackToHome}>
            Quit
          </button>
          <button type="button" className={`button start-test-button`} onClick={handleStartTest}>
            Start
          </button>
        </div>
      ) : (
        <animated.div style={questionAnimation}>
        <h2>{testData[test].Title} Test</h2>
        </animated.div>
        /*<animated.div style={questionAnimation}>
          <h2>{testData[test].headline} Test</h2>
          <p>Question {questionCount} of {questions.length}</p>
          <div className="form-container">
            <form>
              <div
                key={currentQuestion}
                className="question-container"
                style={{ marginBottom: '20px' }}
              >
                <p>{questions[currentQuestion].question}</p>
                <div>
                  {questions[currentQuestion].answers.map((answer, answerIndex) => (
                    <label key={answerIndex} style={{ display: 'block', marginBottom: '10px' }}>
                      <input
                        type="radio"
                        name={`question_${currentQuestion}`}
                        value={answer}
                        checked={answers[currentQuestion] === answer}
                        onChange={() => handleAnswerChange(currentQuestion, answer)}
                      />
                      {answer}
                    </label>
                  ))}
                </div>
              </div>
              <div className="button-container">
                {currentQuestion === 0 && (
                  <button
                    type="button"
                    className={`button back-to-previous-content-button`}
                    onClick={handleBackToPreviousContent}
                  >
                    Quit
                  </button>
                )}
                {currentQuestion > 0 && (
                  <button type="button" className={backButtonStyle} onClick={handleBackQuestion}>
                    Back
                  </button>
                )}
                {currentQuestion < questions.length - 1 ? (
                  <button type="button" className={nextButtonStyle} onClick={handleNextQuestion}>
                    Next
                  </button>
                ) : (
                  <button type="button" className={submitButtonStyle} onClick={handleSubmission}>
                    Submit
                  </button>
                )}
              </div>
            </form>
          </div>
        </animated.div>*/
      )}
    </animated.div>
  );
}

export default TestPage;