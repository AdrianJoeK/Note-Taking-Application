const { app, BrowserWindow } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./notes.db');
const { ipcMain } = require('electron');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    },
    title: "Note Taking App"
  });

  mainWindow.loadURL(`file://${__dirname}/app/build/index.html`);
  mainWindow.setMenu(null);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS notes (id TEXT, content TEXT, lastModified INTEGER)");
  });
  
  function createOrUpdateNote(note) {
    db.run(`INSERT INTO notes (id, content, lastModified) VALUES(?, ?, ?) 
            ON CONFLICT(id) DO UPDATE SET content = ?, lastModified = ?`, 
            [note.id, note.content, note.lastModified, note.content, note.lastModified]);
  }
  
  function deleteNote(id) {
    db.run(`DELETE FROM notes WHERE id = ?`, [id]);
  }
  
  function fetchNotes(callback) {
    db.all("SELECT * FROM notes", [], (err, rows) => {
      callback(err, rows);
    });
  }

  ipcMain.on('fetch-notes', (event) => {
    fetchNotes((err, notes) => {
      event.reply('notes-fetched', err ? [] : notes);
    });
  });
  
  ipcMain.on('save-note', (_, note) => {
    createOrUpdateNote(note);
  });
  
  ipcMain.on('delete-note', (_, id) => {
    deleteNote(id);
  });