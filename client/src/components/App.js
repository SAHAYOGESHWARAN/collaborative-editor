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

import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const socket = new WebSocket('ws://localhost:5000');

function App() {
  const [content, setContent] = useState('');
  const [documentId, setDocumentId] = useState('YOUR_DOCUMENT_ID'); // You can pass an actual document ID here
  
  useEffect(() => {
    // Fetch the document from the server
    const fetchDocument = async () => {
      const response = await fetch(`/api/documents/${documentId}`);
      const data = await response.json();
      setContent(data.content);
    };

    fetchDocument();

    // Handle incoming WebSocket messages
    socket.onmessage = (event) => {
      setContent(event.data);
    };
    
    return () => {
      socket.close();
    };
  }, [documentId]);

  const handleChange = (value) => {
    setContent(value);
    // Send the change to the WebSocket server
    socket.send(value);

    // Update document in the backend
    fetch(`/api/documents/${documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: value }),
    });
  };

  return (
    <div className="App">
      <h1>Collaborative Editor</h1>
      <ReactQuill theme="snow" value={content} onChange={handleChange} />
    </div>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DocumentLoader from './components/DocumentLoader';

const socket = new WebSocket('ws://localhost:5000');

function App() {
  const [content, setContent] = useState('');
  const [documentId, setDocumentId] = useState(null);

  useEffect(() => {
    if (documentId) {
      // Fetch the document from the server
      const fetchDocument = async () => {
        const response = await fetch(`/api/documents/${documentId}`);
        const data = await response.json();
        setContent(data.content);
      };

      fetchDocument();

      // Handle incoming WebSocket messages
      socket.onmessage = (event) => {
        setContent(event.data);
      };

      return () => {
        socket.close();
      };
    }
  }, [documentId]);

  const handleChange = (value) => {
    setContent(value);
    
    // Send the change to the WebSocket server
    socket.send(JSON.stringify({ documentId, content: value }));

    // Update document in the backend
    fetch(`/api/documents/${documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: value }),
    });
  };

  return (
    <div className="App">
      <h1>Collaborative Editor</h1>
      <DocumentLoader setDocumentId={setDocumentId} />
      {documentId ? (
        <ReactQuill theme="snow" value={content} onChange={handleChange} />
      ) : (
        <p>Please enter a document ID to start editing</p>
      )}
    </div>
  );
}

export default App;
