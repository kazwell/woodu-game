import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var TabBar = function (_a) {
    var currentTab = _a.currentTab, onTabChange = _a.onTabChange;
    return (_jsxs("nav", { className: "tab-bar", children: [_jsx("button", { onClick: function () { return onTabChange('game'); }, className: currentTab === 'game' ? 'active' : '', children: "Game" }), _jsx("button", { onClick: function () { return onTabChange('answers'); }, className: currentTab === 'answers' ? 'active' : '', children: "Answers" }), _jsx("button", { onClick: function () { return onTabChange('profile'); }, className: currentTab === 'profile' ? 'active' : '', children: "Profile" })] }));
};
export default TabBar;
