const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const axios = require('axios');
const { exec } = require('child_process');
const path = require('path');

dotenv.config();

const app = express();
const port = 5000;

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/api/analyze', upload.single('resume'), async (req, res) => {
  const { jobDescription } = req.body;
  const fileBuffer = req.file.buffer;

  // Save the file buffer to a file
  const filePath = path.join(__dirname, 'uploads', `${Date.now()}.pdf`);
  require('fs').writeFileSync(filePath, fileBuffer);

  // Execute the Python script
  exec(`python process_resume.py "${jobDescription}" "${filePath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // Send the response back to the client
    res.json({ result: stdout });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
