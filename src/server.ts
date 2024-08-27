import express from 'express';
import sqlite3 from 'sqlite3';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add these type definitions
type User = {
  id: number;
  username: string;
  password: string;
};

type Answer = {
  id: number;
  user_id: number;
  question_id: number;
  answer: string;
};

type Ranking = {
  id: number;
  answer: string;
  score: number;
};

const app = express();
const port = 3001; // Use a different port from the client

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// Database setup
const db = new sqlite3.Database(':memory:'); // Use a file instead of memory for persistence

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    answer TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS rankings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    answer TEXT UNIQUE NOT NULL,
    score INTEGER NOT NULL DEFAULT 1000
  )`);
});

// API Routes
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Username already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, username });
    });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user: User) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!result) {
        return res.status(400).json({ error: 'Incorrect password' });
      }
      res.json({ id: user.id, username: user.username });
    });
  });
});

app.post('/api/answer', (req, res) => {
  const { questionId, answer, losingAnswer } = req.body;
  const userId = 1; // In a real app, you'd get this from the session
  db.run('INSERT INTO answers (user_id, question_id, answer) VALUES (?, ?, ?)', [userId, questionId, answer], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    updateEloRankings(answer, losingAnswer);
    res.json({ message: 'Answer saved successfully' });
  });
});

app.get('/api/answers', (req, res) => {
  const userId = 1; // In a real app, you'd get this from the session
  db.all('SELECT * FROM answers WHERE user_id = ?', [userId], (err, answers) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    db.all('SELECT * FROM rankings ORDER BY score DESC', (err, rankings) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ answers, rankings });
    });
  });
});

app.post('/api/clear-answers', (req, res) => {
  const userId = 1; // In a real app, you'd get this from the session
  db.run('DELETE FROM answers WHERE user_id = ?', [userId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    db.run('DELETE FROM rankings', function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Answers and rankings cleared successfully' });
    });
  });
});

// Helper function for Elo ranking update
function updateEloRankings(winningAnswer: string, losingAnswer: string) {
  const K = 32;
  db.serialize(() => {
    db.run('INSERT OR IGNORE INTO rankings (answer, score) VALUES (?, 1000), (?, 1000)', [winningAnswer, losingAnswer]);
    db.get('SELECT score FROM rankings WHERE answer = ?', [winningAnswer], (err, winner) => {
      if (err) {
        console.error('Error fetching winner score:', err);
        return;
      }
      db.get('SELECT score FROM rankings WHERE answer = ?', [losingAnswer], (err, loser) => {
        if (err) {
          console.error('Error fetching loser score:', err);
          return;
        }
        
        const winnerScore = (winner as { score: number })?.score ?? 1000;
        const loserScore = (loser as { score: number })?.score ?? 1000;
        
        const expectedWinner = 1 / (1 + Math.pow(10, (loserScore - winnerScore) / 400));
        const expectedLoser = 1 - expectedWinner;
        const newWinnerScore = Math.round(winnerScore + K * (1 - expectedWinner));
        const newLoserScore = Math.round(loserScore + K * (0 - expectedLoser));
        
        db.run('UPDATE rankings SET score = CASE WHEN answer = ? THEN ? WHEN answer = ? THEN ? END WHERE answer IN (?, ?)',
          [winningAnswer, newWinnerScore, losingAnswer, newLoserScore, winningAnswer, losingAnswer],
          (err) => {
            if (err) {
              console.error('Error updating rankings:', err);
            }
          }
        );
      });
    });
  });
}

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
