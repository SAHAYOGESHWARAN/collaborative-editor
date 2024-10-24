import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const Editor = ({ content, setContent }) => {
  const handleChange = (value) => {
    setContent(value);
  };

  return (
    <ReactQuill theme="snow" value={content} onChange={handleChange} />
  );
};

export default Editor;
