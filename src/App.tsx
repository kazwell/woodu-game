import React, { useState } from 'react';
import Game from './Game';
import Answers from './Answers';
import Profile from './Profile';
import TabBar from './TabBar';
import SplashScreen from './SplashScreen';
import { GameProvider } from './GameContext';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [currentTab, setCurrentTab] = useState('game');

  if (showSplash) {
    return <SplashScreen onGetStarted={() => setShowSplash(false)} />;
  }

  return (
    <GameProvider>
      <div className="app">
        <header>
          <h1>Woodu</h1>
        </header>
        <main>
          {currentTab === 'game' && <Game />}
          {currentTab === 'answers' && <Answers />}
          {currentTab === 'profile' && <Profile />}
        </main>
        <TabBar currentTab={currentTab} onTabChange={setCurrentTab} />
      </div>
    </GameProvider>
  );
};

export default App;
