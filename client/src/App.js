import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DocumentLoader from './components/DocumentLoader';
import AuthForm from './components/AuthForm';
import UserList from './components/UserList';
import Notification from './components/Notification';

const socket = new WebSocket('ws://localhost:5000');

function App() {
  const [content, setContent] = useState('');
  const [documentId, setDocumentId] = useState(null);
  const [token, setToken] = useState(null);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser ] = useState('');
  const [cursorPositions, setCursorPositions] = useState({});
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleLogin = (token, username) => {
    setToken(token);
    setUser (username);
    localStorage.setItem('token', token);
    setMessage('Successfully logged in!');
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setUsers([]);
    setMessage('You have been logged out.');
  };

  useEffect(() => {
    if (documentId && token) {
      const fetchDocument = async () => {
        const response = await fetch(`/api/documents/${documentId}`, {
          headers: { Authorization: token },
        });
        const data = await response.json();
        setContent(data.content);
      };

      fetchDocument();

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'users') {
          setUsers(data.users);
        } else if (data.type === 'notification') {
          setNotifications(prev => [...prev, data.message]);
        } else if (data.documentId === documentId) {
          setContent(data.content);
          setCursorPositions(prev => ({
            ...prev,
            [data.user]: data.cursorPosition,
          }));
        }
      };

      return () => {
        socket.close();
      };
    }
  }, [documentId, token]);

  const handleChange = async (value) => {
    setContent(value);
    const cursorPosition = document.querySelector('.ql-editor').selectionStart; // Get the cursor position
    socket.send(JSON.stringify({ documentId, content: value, user, cursorPosition }));

    try {
      await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({ content: value }),
      });
      setMessage('Document saved successfully.');
    } catch (err) {
      setError('Failed to save the document. Please try again.');
    }
  };

  return (
    <div className="App">
      <h1>Collaborative Editor</h1>
      
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      
      {!token ? (
        <AuthForm onLogin={handleLogin} />
      ) : (
        <>
          <button onClick={handleLogout}>Logout</button>
          <DocumentLoader setDocumentId={setDocumentId} />
          {documentId ? (
            <div>
              <User List users={users} />
              {notifications.map((notification, index) => (
                <Notification key={index} message={notification} />
              ))}
              <ReactQuill theme="snow" value={content} onChange={handleChange} />
            </div>
          ) : (
            <p>Please enter a document ID to start editing</p>
          )}
        </>
      )}
    </div>
  );
}

export default App;