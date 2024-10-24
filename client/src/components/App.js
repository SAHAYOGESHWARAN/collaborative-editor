import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const socket = new WebSocket('ws://localhost:5000');

function App() {
  const [content, setContent] = useState('');

  useEffect(() => {
    // Handle incoming WebSocket messages
    socket.onmessage = (event) => {
      setContent(event.data);
    };
    
    return () => {
      socket.close();
    };
  }, []);

  const handleChange = (value) => {
    setContent(value);
    // Send the change to the server
    socket.send(value);
  };

  return (
    <div className="App">
      <h1>Collaborative Editor</h1>
      <ReactQuill theme="snow" value={content} onChange={handleChange} />
    </div>
  );
}

export default App;
