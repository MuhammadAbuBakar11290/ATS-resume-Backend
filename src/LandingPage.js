import React, { useState } from 'react';
import axios from 'axios';
import Dropzone from 'react-dropzone';

const App = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [response, setResponse] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
  };

  const handleFileUpload = (files) => {
    setResumeFile(files[0]);
    setUploadSuccess(true);
  };

  const handleSubmit = async (promptType) => {
    if (!jobDescription || !resumeFile) {
      alert('Please provide both job description and resume file.');
      return;
    }

    const formData = new FormData();
    formData.append('jobDescription', jobDescription);
    formData.append('resume', resumeFile);
    formData.append('promptType', promptType);

    try {
      const res = await axios.post('http://localhost:5000/api/analyze', formData);
      setResponse(res.data.result);
    } catch (error) {
      console.error('Error:', error);
      setResponse('An error occurred while processing your request.');
    }
  };

  return (
    <div>
      <nav className="navbar">
        <h1>ATS Resume Expert</h1>
      </nav>
      <header className="header">
        <h2>ATS Tracking System</h2>
        <textarea
          placeholder="Job Description"
          value={jobDescription}
          onChange={handleJobDescriptionChange}
        />
        <Dropzone onDrop={handleFileUpload}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()} className="dropzone">
              <input {...getInputProps()} />
              {uploadSuccess ? (
                <p>PDF Uploaded Successfully ✅</p>
              ) : (
                <p>Drag & drop a resume file, or click to select one</p>
              )}
            </div>
          )}
        </Dropzone>
        <div className="buttons">
          <button onClick={() => handleSubmit('tell_me_about_resume')}>Tell Me About the Resume</button>
          <button onClick={() => handleSubmit('suggest_missing_keywords')}>Suggest Missing Keywords</button>
          <button onClick={() => handleSubmit('percentage_match')}>Percentage Match</button>
          <button onClick={() => handleSubmit('improve_skills')}>Suggestions to Improve Skills</button>
          <button onClick={() => handleSubmit('overall_feedback')}>Overall Resume Feedback</button>
        </div>
        {response && (
          <div className="response">
            <h3>Response:</h3>
            <p>{response}</p>
          </div>
        )}
      </header>
    </div>
  );
};

export default App;
