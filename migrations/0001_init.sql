-- Migration number: 0001 	 2026-01-20T01:52:25.594Z
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  sentiment TEXT,
  themes_json TEXT,
  summary TEXT
);
