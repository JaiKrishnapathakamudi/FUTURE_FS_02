const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db = null;

const connectDB = () => {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, '..', 'data', 'crm.db');
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('SQLite connection error:', err.message);
        return reject(err);
      }

      db.serialize(() => {
        db.run(
          `CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            source TEXT NOT NULL DEFAULT 'Website Contact Form',
            status TEXT NOT NULL DEFAULT 'new',
            company TEXT,
            phone TEXT,
            notes TEXT NOT NULL DEFAULT '[]',
            createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
          )`
        );
      });

      console.log('SQLite database connected');
      resolve(db);
    });
  });
};

const createDbHelpers = (dbInstance) => ({
  run: (sql, params = []) =>
    new Promise((resolve, reject) => {
      dbInstance.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, changes: this.changes });
      });
    }),
  get: (sql, params = []) =>
    new Promise((resolve, reject) => {
      dbInstance.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    }),
  all: (sql, params = []) =>
    new Promise((resolve, reject) => {
      dbInstance.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    }),
});

const getDatabase = () => {
  if (!db) {
    throw new Error('Database has not been initialized');
  }
  return db;
};

module.exports = { connectDB, createDbHelpers, getDatabase };
