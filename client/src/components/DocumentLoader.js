import React, { useState } from 'react';

const DocumentLoader = ({ setDocumentId }) => {
  const [docIdInput, setDocIdInput] = useState('');

  const handleLoadDocument = () => {
    if (docIdInput.trim()) {
      setDocumentId(docIdInput.trim());
    }
  };

  return (
    <div className="document-loader">
      <input 
        type="text" 
        placeholder="Enter Document ID"
        value={docIdInput}
        onChange={(e) => setDocIdInput(e.target.value)}
      />
      <button onClick={handleLoadDocument}>Load Document</button>
    </div>
  );
};

export default DocumentLoader;
