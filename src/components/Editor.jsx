import React, { useState } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';


const DraftEditor = ({ editorState, setEditorState }) => {
  return (
    <div className="border rounded-md shadow-md w-full mx-auto">
      <div className="border p-2 min-h-[20vh] bg-gray-50">
        <Editor
          editorState={editorState}
          wrapperClassName="demo-wrapper"
          editorClassName="demo-editor"
          onEditorStateChange={setEditorState}
        />
      </div>
    </div>
  );
};

export default DraftEditor;
