import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

const ResumeForm = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState(null);

  const onDrop = acceptedFiles => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please upload a resume');
      return;
    }

    const formData = new FormData();
    formData.append('jobDescription', jobDescription);
    formData.append('resume', file);

    try {
      const response = await axios.post('http://localhost:5000/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="resume-form">
      <form onSubmit={handleSubmit}>
        <textarea
          value={jobDescription}
          onChange={e => setJobDescription(e.target.value)}
          placeholder="Job Description"
        />
        <div {...getRootProps({ className: 'dropzone' })}>
          <input {...getInputProps()} />
          <p>Drag & drop a resume here, or click to select one</p>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ResumeForm;
