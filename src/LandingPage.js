import React, { useState } from 'react';
import axios from 'axios';
import Dropzone from 'react-dropzone';
import './LandingPage.css'; // Ensure this CSS file is imported

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
    <div className="App">
      <nav className="navbar">
        <h1>ATS Resume Expert</h1>
      </nav>
      <div className="header-container">
        <header className="header">
          <div className="typewriter">
            <h2>Welcome to ATS Tracking System</h2>
          </div>
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
            <button className="btn" onClick={() => handleSubmit('tell_me_about_resume')}>Tell Me About the Resume</button>
            <button className="btn" onClick={() => handleSubmit('suggest_missing_keywords')}>Suggest Missing Keywords</button>
            <button className="btn" onClick={() => handleSubmit('percentage_match')}>Percentage Match</button>
            <button className="btn" onClick={() => handleSubmit('improve_skills')}>Suggestions to Improve Skills</button>
            <button className="btn" onClick={() => handleSubmit('overall_feedback')}>Overall Resume Feedback</button>
          </div>
          {response && (
            <div className="response">
              <h3>Response:</h3>
              <p>{response}</p>
            </div>
          )}
        </header>
        {/* <img src="/Bglogo.png" alt="Logo" className="header-image" /> */}
      </div>
    </div>
  );
};

export default App;
