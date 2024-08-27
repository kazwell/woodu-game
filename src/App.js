import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import Game from './Game';
import Answers from './Answers';
import Profile from './Profile';
import TabBar from './TabBar';
import SplashScreen from './SplashScreen';
var App = function () {
    var _a = useState(true), showSplash = _a[0], setShowSplash = _a[1];
    var _b = useState('game'), currentTab = _b[0], setCurrentTab = _b[1];
    if (showSplash) {
        return _jsx(SplashScreen, { onGetStarted: function () { return setShowSplash(false); } });
    }
    return (_jsxs("div", { className: "app", children: [_jsx("header", { children: _jsx("h1", { children: "Woodu" }) }), _jsxs("main", { children: [currentTab === 'game' && _jsx(Game, {}), currentTab === 'answers' && _jsx(Answers, {}), currentTab === 'profile' && _jsx(Profile, {})] }), _jsx(TabBar, { currentTab: currentTab, onTabChange: setCurrentTab })] }));
};
export default App;
