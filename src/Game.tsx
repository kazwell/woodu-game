import React, { useCallback, useState } from 'react';
import { useGame } from './GameContext';

type Question = { id: number; option1: string; option2: string };

const ANSWER_OPTIONS = [
  "Have the ability to see through people's clothes",
  "Have the ability to murder anyone without any consequences",
  "Have a tight knit and loyal friend group",
  "Have another set of eyes in the back of your head (they are fully functional)",
  "Have a very physically attractive romantic partner",
  "Be able to spawn pizzas by snapping your fingers (max 2 per 12 hours)",
  "Be able to eat whatever you want and stay at your ideal weight",
  "Have perfect health your whole life except for the illness that will eventually kill you",
  "Have a job you like that pays 3x the usual salary",
];

const Game: React.FC = () => {
  const { user, saveAnswer, progress } = useGame();

  const getRandomQuestion = useCallback((): Question => {
    const availableOptions = [...ANSWER_OPTIONS];
    const option1Index = Math.floor(Math.random() * availableOptions.length);
    const option1 = availableOptions.splice(option1Index, 1)[0];
    const option2Index = Math.floor(Math.random() * availableOptions.length);
    const option2 = availableOptions[option2Index];
    return { id: Math.random(), option1, option2 };
  }, []);

  const [currentQuestion, setCurrentQuestion] = useState<Question>(getRandomQuestion());

  const selectAnswer = useCallback((selectedAnswer: string, losingAnswer: string) => {
    if (user) {
      saveAnswer({ 
        questionId: currentQuestion.id, 
        answer: selectedAnswer,
        losingAnswer: losingAnswer
      });
      setCurrentQuestion(getRandomQuestion());
    } else {
      console.log('Please log in to save answers');
    }
  }, [currentQuestion, getRandomQuestion, saveAnswer, user]);

  return (
    <div className="game">
      <h2>Would you rather...</h2>
      <div className="options">
        <button onClick={() => selectAnswer(currentQuestion.option1, currentQuestion.option2)}>
          {currentQuestion.option1}
        </button>
        <button onClick={() => selectAnswer(currentQuestion.option2, currentQuestion.option1)}>
          {currentQuestion.option2}
        </button>
      </div>
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

export default Game;
