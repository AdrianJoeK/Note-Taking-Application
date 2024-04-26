import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { marked } from 'marked';
import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './App.css';
import useDocumentTitle from './hooks/useDocumentTitle';

function MarkdownEditor({ note, saveNote }) {
  const handleContentChange = content => {
    saveNote({
      ...note,
      content: content,
      lastModified: Date.now()
    });
  };

  return (
    <ReactQuill value={note.content} onChange={handleContentChange} />
  );
}

function NoteTitle({ note, updateNote }) {
  const handleTitleChange = (event) => {
    updateNote({
      ...note,
      title: event.target.value,
      lastModified: Date.now()
    });
  };

  return (
    <input
      type="text"
      value={note.title}
      onChange={handleTitleChange}
      className="note-title-input"
    />
  );
}

function App() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    localforage.getItem('notes').then(storedNotes => {
      if (storedNotes) setNotes(storedNotes);
    });
  }, []);

  useEffect(() => {
    localforage.setItem('notes', notes);
  }, [notes]);

  const createNewNote = () => {
    const newNote = {
      id: uuidv4(),
      title: "Untitled Note",
      content: '',
      lastModified: Date.now()
    };
    setNotes([...notes, newNote]);
  };

  const updateNote = (updatedNote) => {
    const updatedNotes = notes.map(note =>
      note.id === updatedNote.id ? updatedNote : note
    );
    setNotes(updatedNotes);
  };

  const deleteNote = (noteId) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };

  return (
    <Router>
      <div className="app-container">
        <h1>Note Taking App</h1>
        <div className="navbar">
          <div className="nav-links-container">
            {notes.map(note => (
              <div key={note.id} className="note-item">
                <Link to={`/note/${note.id}`} className="nav-link">
                  <NoteTitle note={note} updateNote={updateNote} />
                </Link>
                <button onClick={() => deleteNote(note.id)} className="delete-note-button">Delete</button>
              </div>
            ))}
          </div>
          <button onClick={createNewNote} className="create-note-button">Create New Note</button>
        </div>
        <Routes>
          {notes.map(note => (
            <Route
              key={note.id}
              path={`/note/${note.id}`}
              element={
                <div className="editor-container">
                  <MarkdownEditor note={note} saveNote={updateNote} />
                </div>
              }
            />
          ))}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
