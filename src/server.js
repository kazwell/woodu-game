import express from 'express';
import sqlite3 from 'sqlite3';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var port = 3000; // Use the same port as your frontend
// Middleware
app.use(cors());
app.use(bodyParser.json());
// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));
// Database setup
var db = new sqlite3.Database(':memory:'); // Use a file instead of memory for persistence
// Create tables
db.serialize(function () {
    db.run("CREATE TABLE IF NOT EXISTS users (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    username TEXT UNIQUE NOT NULL\n  )");
    db.run("CREATE TABLE IF NOT EXISTS answers (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    user_id INTEGER NOT NULL,\n    question_id INTEGER NOT NULL,\n    answer TEXT NOT NULL,\n    FOREIGN KEY (user_id) REFERENCES users(id)\n  )");
    db.run("CREATE TABLE IF NOT EXISTS rankings (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    answer TEXT UNIQUE NOT NULL,\n    score INTEGER NOT NULL DEFAULT 1000\n  )");
});
// API Routes
app.post('/api/login', function (req, res) {
    var username = req.body.username;
    db.run('INSERT OR IGNORE INTO users (username) VALUES (?)', [username], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        db.get('SELECT * FROM users WHERE username = ?', [username], function (err, row) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(row);
        });
    });
});
app.post('/api/answer', function (req, res) {
    var _a = req.body, questionId = _a.questionId, answer = _a.answer, losingAnswer = _a.losingAnswer;
    var userId = 1; // In a real app, you'd get this from the session
    db.run('INSERT INTO answers (user_id, question_id, answer) VALUES (?, ?, ?)', [userId, questionId, answer], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        updateEloRankings(answer, losingAnswer);
        res.json({ message: 'Answer saved successfully' });
    });
});
app.get('/api/answers', function (req, res) {
    var userId = 1; // In a real app, you'd get this from the session
    db.all('SELECT * FROM answers WHERE user_id = ?', [userId], function (err, answers) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        db.all('SELECT * FROM rankings ORDER BY score DESC', function (err, rankings) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ answers: answers, rankings: rankings });
        });
    });
});
app.post('/api/clear-answers', function (req, res) {
    var userId = 1; // In a real app, you'd get this from the session
    db.run('DELETE FROM answers WHERE user_id = ?', [userId], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        db.run('DELETE FROM rankings', function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Answers and rankings cleared successfully' });
        });
    });
});
// Helper function for Elo ranking update
function updateEloRankings(winningAnswer, losingAnswer) {
    var K = 32;
    db.serialize(function () {
        db.run('INSERT OR IGNORE INTO rankings (answer, score) VALUES (?, 1000), (?, 1000)', [winningAnswer, losingAnswer]);
        db.get('SELECT score FROM rankings WHERE answer = ?', [winningAnswer], function (err, winner) {
            if (err) {
                console.error('Error fetching winner score:', err);
                return;
            }
            db.get('SELECT score FROM rankings WHERE answer = ?', [losingAnswer], function (err, loser) {
                var _a, _b;
                if (err) {
                    console.error('Error fetching loser score:', err);
                    return;
                }
                var winnerScore = (_a = winner === null || winner === void 0 ? void 0 : winner.score) !== null && _a !== void 0 ? _a : 1000;
                var loserScore = (_b = loser === null || loser === void 0 ? void 0 : loser.score) !== null && _b !== void 0 ? _b : 1000;
                var expectedWinner = 1 / (1 + Math.pow(10, (loserScore - winnerScore) / 400));
                var expectedLoser = 1 - expectedWinner;
                var newWinnerScore = Math.round(winnerScore + K * (1 - expectedWinner));
                var newLoserScore = Math.round(loserScore + K * (0 - expectedLoser));
                db.run('UPDATE rankings SET score = CASE WHEN answer = ? THEN ? WHEN answer = ? THEN ? END WHERE answer IN (?, ?)', [winningAnswer, newWinnerScore, losingAnswer, newLoserScore, winningAnswer, losingAnswer], function (err) {
                    if (err) {
                        console.error('Error updating rankings:', err);
                    }
                });
            });
        });
    });
}
// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});
// Start the server
app.listen(port, function () {
    console.log("Server running at http://localhost:".concat(port));
});
