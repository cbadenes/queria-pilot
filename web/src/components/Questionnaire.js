import React, { useState } from 'react';

const Questionnaire = ({ questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleAnswerSubmit = (userAnswer) => {
    // Lógica para verificar la respuesta contra el backend.
    console.log("Submitted answer:", userAnswer);
    setIsCorrect(true); // Simular respuesta correcta.
    setUserAnswers([...userAnswers, userAnswer]);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  return (
    <div>
      <h3>Question {currentQuestionIndex + 1}</h3>
      <p>{questions[currentQuestionIndex].text}</p>
      <form onSubmit={() => handleAnswerSubmit('userAnswer')}>
        <input type="text" placeholder="Your answer here" />
        <button type="submit">Submit</button>
      </form>
      {isCorrect ? <p>Correct!</p> : <p>Incorrect, try again!</p>}
    </div>
  );
};

export default Questionnaire;
