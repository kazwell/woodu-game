import React from 'react';

interface TabBarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ currentTab, onTabChange }) => {
  return (
    <nav className="tab-bar">
      <button onClick={() => onTabChange('game')} className={currentTab === 'game' ? 'active' : ''}>Game</button>
      <button onClick={() => onTabChange('answers')} className={currentTab === 'answers' ? 'active' : ''}>Answers</button>
      <button onClick={() => onTabChange('profile')} className={currentTab === 'profile' ? 'active' : ''}>Profile</button>
    </nav>
  );
};

export default TabBar;
