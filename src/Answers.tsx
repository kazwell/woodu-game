import React, { useState } from 'react';
import { useGame } from './GameContext';

const Answers: React.FC = () => {
  const { user, answers, rankings, clearAnswers, fetchAnswersAndRankings } = useGame();
  const [activeTab, setActiveTab] = useState<'answers' | 'rankings'>('answers');

  if (!user) {
    return <div className="answers">Please log in to view your answers and rankings.</div>;
  }

  const handleClearAnswers = async () => {
    await clearAnswers();
    fetchAnswersAndRankings();
  };

  return (
    <div className="answers">
      <div className="tabs">
        <button
          className={activeTab === 'answers' ? 'active' : ''}
          onClick={() => setActiveTab('answers')}
        >
          Your Answers
        </button>
        <button
          className={activeTab === 'rankings' ? 'active' : ''}
          onClick={() => setActiveTab('rankings')}
        >
          Global Rankings
        </button>
      </div>

      {activeTab === 'answers' && (
        <div className="user-answers">
          <h2>Your Answers</h2>
          {answers.length === 0 ? (
            <p>You haven't answered any questions yet.</p>
          ) : (
            <ul>
              {answers.map((answer) => (
                <li key={answer.id}>
                  Question {answer.question_id}: {answer.answer}
                </li>
              ))}
            </ul>
          )}
          <button onClick={handleClearAnswers}>Clear All Answers</button>
        </div>
      )}

      {activeTab === 'rankings' && (
        <div className="global-rankings">
          <h2>Global Rankings</h2>
          {rankings.length === 0 ? (
            <p>No rankings available yet.</p>
          ) : (
            <ol>
              {rankings.map((ranking) => (
                <li key={ranking.id}>
                  {ranking.answer} - Score: {ranking.score}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
};

export default Answers;
