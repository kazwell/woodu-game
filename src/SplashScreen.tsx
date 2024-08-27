import React from 'react';

interface SplashScreenProps {
  onGetStarted: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onGetStarted }) => {
  return (
    <div className="splash-screen">
      <h1>Welcome to Woodu</h1>
      <p>A game of questions to discover your values</p>
      <button onClick={onGetStarted}>Get Started</button>
    </div>
  );
};

export default SplashScreen;
