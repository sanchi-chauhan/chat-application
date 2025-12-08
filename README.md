# Tech AI Chat Assistant

A real-time chat application with an AI assistant specialized in technology and computer science topics. Built with Node.js, Express, Socket.io, and EJS.

## 🌟 Features

- **Real-time Chat**: WebSocket-based instant messaging
- **AI Assistant**: Intelligent responses about tech topics (JavaScript, Python, React, Node.js, etc.)
- **Conversation Context**: Maintains conversation history for contextual responses
- **Seasonal Themes**: Beautiful themes (Winter, Autumn, Spring, Summer) with animated effects
- **Responsive Design**: Works on desktop and mobile devices
- **Tech-Only Filter**: Only answers technology and computer science questions

## 🚀 Live Demo

**Deployed on Render**: https://chat-application-3hhy.onrender.com

> **Note**: The app may take a few seconds to wake up if it's been idle (Render free tier spins down after inactivity).

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Real-time**: Socket.io
- **Frontend**: EJS, HTML, CSS, JavaScript
- **Styling**: CSS Variables, Animations
- **Deployment**: Render

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/sanchi-chauhan/chat-application.git
cd chat-application
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and visit:
```
http://localhost:4000
```

## 🎨 Themes

The app includes 4 beautiful seasonal themes:
- **Winter** ❄️ - Cool lavender/purple gradients with snowfall
- **Autumn** 🍂 - Warm colors with falling leaves
- **Spring** 🌸 - Soft pastels with floating flowers
- **Summer** ☀️ - Bright colors with strawberries

Click the theme toggle button to switch between themes!

## 🤖 AI Capabilities

The AI assistant can answer questions about:
- Programming languages (JavaScript, Python, Java, etc.)
- Web technologies (HTML, CSS, React, Node.js, Express, etc.)
- Databases (MongoDB, SQL, etc.)
- Software engineering concepts
- APIs and REST
- Computer science fundamentals

## 📝 Project Structure

```
chat-app/
├── server.js              # Backend server with AI logic
├── views/
│   └── chat_box.ejs       # Frontend template
├── assets/
│   └── css/
│       └── chat_box.css   # Styling and themes
├── package.json           # Dependencies
├── render.yaml            # Render deployment config
└── README.md              # This file
```

## 🚢 Deployment

### Deploy to Render (Recommended)

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Render will auto-detect the `render.yaml` configuration
6. Click "Create Web Service"

The app will be automatically deployed and you'll get a URL like:
`https://your-app-name.onrender.com`

### Why Not GitHub Pages?

GitHub Pages only serves **static files** (HTML, CSS, JavaScript). This app requires:
- **Node.js server** (Express.js)
- **WebSocket connections** (Socket.io)
- **Server-side rendering** (EJS templates)

These features cannot run on GitHub Pages. **Render** (or similar platforms like Heroku, Railway, Fly.io) is required for Node.js applications.

## 🔧 Configuration

The app uses environment variables:
- `PORT`: Server port (default: 4000)
- `NODE_ENV`: Environment (production/development)

## 📄 License

ISC

## 👤 Author

Sanchi Chauhan

---

**Note**: This is a portfolio project demonstrating real-time web applications, AI integration, and modern web development practices.

