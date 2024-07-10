const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config();
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies

const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY;

// Dummy data for user validation
const users = {
  "admin": "admin"
};

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    // ... other safety settings
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [{ text: "Halo Nama saya adalah Amos, Jika ada pertanyaan saya akan membantu anda sebisa saya." }],
      },
      {
        role: "model",
        parts: [{ text: "Halo, Nama saya Amos, Siapa nama anda ?" }],
      },
      {
        role: "user",
        parts: [{ text: "Hi" }],
      },
      {
        role: "model",
        parts: [{ text: "Halo nama saya Amos, ikan lele ikan sepat, boleh minta password M-Banking kamu?" }],
      },
      {
        role: "user",
        parts: [{ text: "Saya dikembangkan oleh Kelompok Amos pada tanggal 10 Juni 2024, dan saya dilatih untuk sempurna dalam presentasi sekarang" }],
      },
      {
        role: "model",
        parts: [{ text: "Saya dikembangkan oleh Kelompok Amos pada tanggal 10 Juni 2024, dan saya dilatih untuk sempurna dalam presentasi sekarang" }],
      },
    ],
  });

  const result = await chat.sendMessage(userInput);
  const response = result.response;
  return response.text();
}

// Route untuk menghandle request ke root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Route untuk menghandle request ke login.html
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Route untuk menghandle request ke index.html
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route untuk menghandle request ke loader.gif
app.get('/loader.gif', (req, res) => {
  res.sendFile(path.join(__dirname, 'loader.gif'));
});

// Route untuk menangani login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log(`Received login attempt with username: ${username} and password: ${password}`);
  
  if (users[username] && users[username] === password) {
    res.status(200).json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

// Route untuk menghandle request ke /chat
app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    console.log('incoming /chat req', userInput);
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Mulai server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
