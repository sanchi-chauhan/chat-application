const PORT = 4000;

const express = require('express');
const path = require('path');

const app = express();

app.set('view engine','ejs');
app.use(express.static('./assets'));
app.set('views',path.join(__dirname,'views'));

const server = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.get('/',function(req,res){
    return res.redirect('/chatRoom');
})

app.get('/chatRoom',function(req,res){
    return res.render('chat_box', { user: { name: 'Guest' } });
})




const port = process.env.PORT || 4000;
server.listen(port, function(err){
    if(err){
        console.log('Error starting server:', err);
        return;   
    }
    console.log("Server is running on port", port);
})

// Store conversation context for each user
const conversations = new Map();

// Knowledge base for accurate responses
const knowledgeBase = {
    javascript: {
        definition: "JavaScript is a high-level, interpreted programming language that conforms to the ECMAScript specification. It's one of the core technologies of the World Wide Web.",
        uses: ["Frontend web development", "Backend development (Node.js)", "Mobile app development (React Native)", "Desktop applications (Electron)", "Game development", "Serverless functions"],
        features: ["Dynamic typing", "First-class functions", "Prototype-based object orientation", "Event-driven programming", "Asynchronous programming with Promises/async-await"],
        syntax: "JavaScript uses C-style syntax with curly braces, semicolons (optional), and supports both object-oriented and functional programming paradigms."
    },
    python: {
        definition: "Python is a high-level, general-purpose programming language known for its clear syntax and readability.",
        uses: ["Web development (Django, Flask)", "Data science and analytics", "Machine learning and AI", "Automation and scripting", "Scientific computing", "Backend APIs"],
        features: ["Indentation-based syntax", "Dynamic typing", "Interpreted language", "Large standard library", "Multiple programming paradigms"],
        syntax: "Python uses indentation to define code blocks, making it highly readable. Example: 'if x > 0: print('positive')'"
    },
    react: {
        definition: "React is a JavaScript library for building user interfaces, particularly web applications. It was developed by Facebook (now Meta).",
        uses: ["Single Page Applications (SPAs)", "Interactive user interfaces", "Mobile apps (React Native)", "Component-based web development"],
        features: ["Virtual DOM for performance", "Component reusability", "JSX syntax", "Unidirectional data flow", "Hooks for state management"],
        concepts: ["Components are reusable UI pieces", "Props pass data to components", "State manages component data", "Hooks like useState and useEffect manage side effects"]
    },
    nodejs: {
        definition: "Node.js is a JavaScript runtime environment built on Chrome's V8 JavaScript engine that allows JavaScript to run on the server.",
        uses: ["Backend API development", "Real-time applications (chat, gaming)", "Microservices", "Serverless functions", "Command-line tools"],
        features: ["Non-blocking I/O", "Event-driven architecture", "NPM package ecosystem", "Single-threaded with event loop", "Can handle many concurrent connections"],
        frameworks: ["Express.js - web framework", "Socket.io - real-time communication", "Koa.js - modern web framework", "Nest.js - enterprise framework"]
    },
    html: {
        definition: "HTML (HyperText Markup Language) is the standard markup language for creating web pages and web applications.",
        purpose: "Defines the structure and content of web pages using elements like headings, paragraphs, links, images, and forms.",
        version: "Current version is HTML5, which includes semantic elements, multimedia support, and improved APIs."
    },
    css: {
        definition: "CSS (Cascading Style Sheets) is a stylesheet language used to describe the presentation of HTML documents.",
        purpose: "Controls layout, colors, fonts, spacing, and visual design of web pages.",
        features: ["Selectors target HTML elements", "Properties define styling", "Cascading determines which styles apply", "Supports responsive design with media queries"]
    }
};

// Check if message is tech/computer science related
function isTechRelated(msg) {
    const techKeywords = [
        // Programming languages
        'javascript', 'js', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
        // Web technologies
        'html', 'css', 'react', 'vue', 'angular', 'node', 'express', 'django', 'flask', 'web', 'website',
        // Databases
        'database', 'sql', 'mongodb', 'mysql', 'postgresql', 'redis', 'nosql',
        // Tech concepts
        'programming', 'coding', 'code', 'algorithm', 'data structure', 'software', 'application', 'app',
        'api', 'rest', 'graphql', 'backend', 'frontend', 'fullstack', 'devops', 'cloud', 'aws', 'azure',
        'git', 'github', 'version control', 'framework', 'library', 'package', 'npm', 'yarn',
        'computer', 'technology', 'tech', 'developer', 'programmer', 'coding', 'debug', 'error', 'bug',
        'function', 'variable', 'array', 'object', 'class', 'method', 'async', 'await', 'promise',
        'dom', 'json', 'xml', 'http', 'https', 'server', 'client', 'network', 'protocol',
        'machine learning', 'ai', 'artificial intelligence', 'data science', 'cybersecurity', 'blockchain',
        'operating system', 'linux', 'windows', 'macos', 'terminal', 'command line', 'shell',
        'docker', 'kubernetes', 'container', 'microservice', 'architecture', 'design pattern'
    ];
    
    const msgLower = msg.toLowerCase();
    return techKeywords.some(keyword => msgLower.includes(keyword));
}

// Intelligent response generator with enhanced knowledge
function generateResponse(userMessage, conversationHistory) {
    const message = userMessage.toLowerCase().trim();
    const history = conversationHistory || [];
    
    // Check if question is tech-related (skip for greetings, thank you, goodbye)
    const isGreeting = message.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/);
    const isThankYou = message.match(/(thank|thanks|appreciate|grateful)/);
    const isGoodbye = message.match(/(bye|goodbye|see you|farewell|exit|quit|later)/);
    const isAboutBot = message.match(/(who are you|what are you|what is your name|introduce yourself|what can you do)/);
    
    // Allow greetings, thank you, goodbye, and bot questions, but check others
    if (!isGreeting && !isThankYou && !isGoodbye && !isAboutBot) {
        if (!isTechRelated(message)) {
            return "I'm sorry, but I can only answer questions related to technology and computer science. I specialize in:\n• Programming languages (JavaScript, Python, Java, etc.)\n• Web development (HTML, CSS, React, Node.js, etc.)\n• Software engineering concepts\n• Databases and APIs\n• Computer science fundamentals\n• Tech tools and frameworks\n\nPlease ask me a technology or computer science related question, and I'll be happy to help!";
        }
    }
    
    // Extract specific terms and topics
    const extractTerms = (msg) => {
        const terms = [];
        const patterns = {
            javascript: /\b(javascript|js|ecmascript)\b/,
            python: /\b(python|py)\b/,
            react: /\b(react|jsx|reactjs)\b/,
            nodejs: /\b(node|nodejs|node\.js)\b/,
            html: /\b(html|html5)\b/,
            css: /\b(css|stylesheet)\b/,
            express: /\b(express|expressjs|express\.js)\b/,
            mongodb: /\b(mongodb|mongo)\b/,
            sql: /\b(sql|database|mysql|postgresql)\b/,
            api: /\b(api|rest|graphql|endpoint)\b/,
            async: /\b(async|await|promise|callback)\b/,
            dom: /\b(dom|document object model)\b/,
            json: /\b(json|javascript object notation)\b/
        };
        for (let [term, pattern] of Object.entries(patterns)) {
            if (pattern.test(msg)) terms.push(term);
        }
        return terms;
    };
    
    // Extract terms from message
    const terms = extractTerms(message);
    const hasQuestion = message.includes('?');
    const questionWords = message.match(/(what|how|why|when|where|who|which|explain|define|tell me about)/);
    
    // Greetings
    if (message.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/)) {
        return "Hello! I'm your AI assistant specialized in technology and computer science. I can help you with:\n• Programming languages and frameworks\n• Web development\n• Software engineering\n• Databases and APIs\n• Computer science concepts\n\nI only answer tech-related questions. What would you like to know?";
    }
    
    // Questions about the bot
    if (message.match(/(who are you|what are you|what is your name|introduce yourself|what can you do)/)) {
        return "I'm an AI assistant specialized in technology and computer science. I can help with:\n• Programming languages (JavaScript, Python, React, Node.js, etc.)\n• Web development (HTML, CSS, frameworks, APIs)\n• Software engineering concepts\n• Databases and data structures\n• Computer science fundamentals\n• Tech tools, frameworks, and best practices\n\nI only answer questions related to technology and computer science. What tech topic would you like to learn about?";
    }
    
    // How are you
    if (message.match(/(how are you|how's it going|how do you do)/)) {
        return "I'm functioning well and ready to help with your tech questions! What technology or computer science topic would you like to explore?";
    }
    
    // JavaScript - detailed knowledge base response
    if (terms.includes('javascript') || message.match(/\b(js|ecmascript)\b/)) {
        const kb = knowledgeBase.javascript;
        if (hasQuestion) {
            if (message.match(/(what is|what's|define|explain)/)) {
                return `${kb.definition}\n\nKey Uses:\n${kb.uses.map(u => `• ${u}`).join('\n')}\n\nKey Features:\n${kb.features.map(f => `• ${f}`).join('\n')}\n\n${kb.syntax}\n\nWould you like to know about a specific JavaScript concept like functions, arrays, objects, or async programming?`;
            }
            if (message.match(/(how to|how do|how can)/)) {
                return "Here's how to work with JavaScript:\n\n1. **Variables**: Use `let`, `const`, or `var`\n   Example: `let name = 'John';`\n\n2. **Functions**: Define with `function` keyword or arrow functions\n   Example: `const greet = (name) => 'Hello ' + name;`\n\n3. **Objects**: Key-value pairs\n   Example: `const person = { name: 'John', age: 30 };`\n\n4. **Arrays**: Ordered lists\n   Example: `const fruits = ['apple', 'banana'];`\n\n5. **Async/Await**: For asynchronous operations\n   Example: `const data = await fetch('/api/data');`\n\nWhat specific JavaScript topic would you like to explore?";
            }
        }
        return `${kb.definition}\n\nCommon uses: ${kb.uses.slice(0, 3).join(', ')}.\n\nWhat specific aspect of JavaScript interests you?`;
    }
    
    // Python - detailed knowledge base response
    if (terms.includes('python')) {
        const kb = knowledgeBase.python;
        if (hasQuestion) {
            if (message.match(/(what is|what's|define|explain)/)) {
                return `${kb.definition}\n\nCommon Uses:\n${kb.uses.map(u => `• ${u}`).join('\n')}\n\nKey Features:\n${kb.features.map(f => `• ${f}`).join('\n')}\n\n${kb.syntax}\n\nWould you like to know about specific Python concepts like lists, dictionaries, functions, or libraries?`;
            }
            if (message.match(/(how to|how do|how can)/)) {
                return "Here's how to work with Python:\n\n1. **Variables**: No declaration needed\n   Example: `name = 'John'`\n\n2. **Lists**: Ordered, mutable collections\n   Example: `fruits = ['apple', 'banana']`\n\n3. **Dictionaries**: Key-value pairs\n   Example: `person = {'name': 'John', 'age': 30}`\n\n4. **Functions**: Defined with `def`\n   Example: `def greet(name): return f'Hello {name}'`\n\n5. **Indentation**: Critical for code blocks\n   Example: `if x > 0:\n    print('positive')`\n\nWhat specific Python topic would you like to learn?";
            }
        }
        return `${kb.definition}\n\nCommon uses: ${kb.uses.slice(0, 3).join(', ')}.\n\nWhat would you like to know about Python?`;
    }
    
    // React - detailed knowledge base response
    if (terms.includes('react')) {
        const kb = knowledgeBase.react;
        if (hasQuestion) {
            if (message.match(/(what is|what's|define|explain)/)) {
                return `${kb.definition}\n\nCommon Uses:\n${kb.uses.map(u => `• ${u}`).join('\n')}\n\nKey Features:\n${kb.features.map(f => `• ${f}`).join('\n')}\n\nCore Concepts:\n${kb.concepts.map(c => `• ${c}`).join('\n')}\n\nWould you like to know about components, props, state, hooks, or JSX?`;
            }
            if (message.match(/(how to|how do|how can)/)) {
                return "Here's how to get started with React:\n\n1. **Install**: `npx create-react-app my-app`\n\n2. **Component Example**:\n```jsx\nfunction Welcome(props) {\n  return <h1>Hello, {props.name}</h1>;\n}\n```\n\n3. **State with Hooks**:\n```jsx\nconst [count, setCount] = useState(0);\n```\n\n4. **Props**: Pass data to components\n```jsx\n<Welcome name=\"John\" />\n```\n\n5. **JSX**: Write HTML-like syntax in JavaScript\n\nWhat specific React concept would you like to explore?";
            }
        }
        return `${kb.definition}\n\nKey features: ${kb.features.slice(0, 3).join(', ')}.\n\nWhat would you like to know about React?`;
    }
    
    // Node.js - detailed knowledge base response
    if (terms.includes('nodejs')) {
        const kb = knowledgeBase.nodejs;
        if (hasQuestion) {
            if (message.match(/(what is|what's|define|explain)/)) {
                return `${kb.definition}\n\nCommon Uses:\n${kb.uses.map(u => `• ${u}`).join('\n')}\n\nKey Features:\n${kb.features.map(f => `• ${f}`).join('\n')}\n\nPopular Frameworks:\n${kb.frameworks.map(f => `• ${f}`).join('\n')}\n\nWould you like to know about Express.js, npm, or building APIs?`;
            }
            if (message.match(/(how to|how do|how can)/)) {
                return "Here's how to work with Node.js:\n\n1. **Install**: Download from nodejs.org or use `nvm`\n\n2. **Create server**:\n```javascript\nconst http = require('http');\nconst server = http.createServer((req, res) => {\n  res.writeHead(200);\n  res.end('Hello World');\n});\nserver.listen(3000);\n```\n\n3. **Use Express**:\n```javascript\nconst express = require('express');\nconst app = express();\napp.get('/', (req, res) => res.send('Hello'));\napp.listen(3000);\n```\n\n4. **NPM packages**: `npm install package-name`\n\nWhat specific Node.js topic interests you?";
            }
        }
        return `${kb.definition}\n\nKey benefits: ${kb.features.slice(0, 3).join(', ')}.\n\nWhat would you like to know about Node.js?`;
    }
    
    // HTML
    if (terms.includes('html')) {
        const kb = knowledgeBase.html;
        if (hasQuestion) {
            return `${kb.definition}\n\n${kb.purpose}\n\n${kb.version}\n\nBasic structure:\n\`\`\`html\n<!DOCTYPE html>\n<html>\n<head>\n  <title>Page Title</title>\n</head>\n<body>\n  <h1>Heading</h1>\n  <p>Paragraph</p>\n</body>\n</html>\n\`\`\`\n\nWould you like to know about specific HTML elements or attributes?`;
        }
        return `${kb.definition}\n\n${kb.purpose}\n\nWhat would you like to know about HTML?`;
    }
    
    // CSS
    if (terms.includes('css')) {
        const kb = knowledgeBase.css;
        if (hasQuestion) {
            return `${kb.definition}\n\n${kb.purpose}\n\nKey Features:\n${kb.features.map(f => `• ${f}`).join('\n')}\n\nExample:\n\`\`\`css\nh1 {\n  color: blue;\n  font-size: 24px;\n}\n\`\`\`\n\nWould you like to know about selectors, properties, or responsive design?`;
        }
        return `${kb.definition}\n\n${kb.purpose}\n\nWhat would you like to know about CSS?`;
    }
    
    // Express.js
    if (terms.includes('express')) {
        return "Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.\n\n**Key Features:**\n• Fast, unopinionated web framework\n• Middleware support\n• Routing system\n• Template engine integration\n• HTTP utility methods\n\n**Basic Example:**\n```javascript\nconst express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => {\n  res.send('Hello World');\n});\n\napp.listen(3000, () => {\n  console.log('Server running on port 3000');\n});\n```\n\nWould you like to know about routing, middleware, or building APIs with Express?";
    }
    
    // MongoDB
    if (terms.includes('mongodb')) {
        return "MongoDB is a NoSQL document database that stores data in flexible, JSON-like documents.\n\n**Key Features:**\n• Document-based storage (BSON format)\n• Schema-less design\n• Horizontal scaling\n• Rich query language\n• Indexing support\n\n**Basic Operations:**\n• Insert: `db.collection.insertOne({name: 'John'})`\n• Find: `db.collection.find({name: 'John'})`\n• Update: `db.collection.updateOne({name: 'John'}, {$set: {age: 30}})`\n• Delete: `db.collection.deleteOne({name: 'John'})`\n\nWould you like to know about Mongoose (ODM), queries, or aggregation?";
    }
    
    // API
    if (terms.includes('api')) {
        return "API (Application Programming Interface) is a set of protocols and tools for building software applications.\n\n**REST API Concepts:**\n• **GET**: Retrieve data\n• **POST**: Create new data\n• **PUT**: Update existing data\n• **DELETE**: Remove data\n\n**Example Express API:**\n```javascript\napp.get('/api/users', (req, res) => {\n  res.json([{id: 1, name: 'John'}]);\n});\n\napp.post('/api/users', (req, res) => {\n  // Create user\n  res.status(201).json({id: 2, name: req.body.name});\n});\n```\n\nWould you like to know about REST principles, GraphQL, or API design best practices?";
    }
    
    // Async/Await
    if (terms.includes('async')) {
        return "Async/await is a modern JavaScript feature for handling asynchronous operations.\n\n**Key Concepts:**\n• `async` functions return Promises\n• `await` pauses execution until Promise resolves\n• Better error handling with try/catch\n• Cleaner code than callbacks or .then() chains\n\n**Example:**\n```javascript\nasync function fetchData() {\n  try {\n    const response = await fetch('/api/data');\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Error:', error);\n  }\n}\n```\n\nWould you like to know about Promises, error handling, or concurrent async operations?";
    }
    
    // JSON
    if (terms.includes('json')) {
        return "JSON (JavaScript Object Notation) is a lightweight data interchange format.\n\n**Structure:**\n• Key-value pairs\n• Strings in double quotes\n• Arrays and objects\n• No functions or comments\n\n**Example:**\n```json\n{\n  \"name\": \"John\",\n  \"age\": 30,\n  \"hobbies\": [\"reading\", \"coding\"]\n}\n```\n\n**In JavaScript:**\n• Parse: `JSON.parse(jsonString)`\n• Stringify: `JSON.stringify(object)`\n\nWould you like to know about JSON parsing, validation, or working with JSON APIs?";
    }
    
    // General programming help
    if (message.match(/(how.*code|how.*program|learn.*code|programming.*help|code.*help|debug|error|bug|fix)/)) {
        return "I'd be happy to help with programming! Here are some general tips:\n• Start with understanding the problem clearly\n• Break complex problems into smaller parts\n• Use proper debugging techniques (console.log, breakpoints)\n• Read error messages carefully - they often point to the issue\n• Test your code incrementally\n• Use version control (Git)\n• Write clean, readable code with comments\n\nWhat specific programming challenge are you facing? Share the language, framework, or error message, and I can provide more targeted help.";
    }
    
    // Web development
    if (message.match(/(website|web.*develop|build.*website|create.*site|html|css|frontend)/)) {
        return "Web development involves creating websites and web applications. The main components are:\n• HTML: Structure and content\n• CSS: Styling and layout\n• JavaScript: Interactivity and functionality\n• Backend: Server-side logic, databases, APIs\n\nModern web development often uses frameworks like React, Vue, or Angular for frontend, and Node.js, Python (Django/Flask), or other languages for backend. What type of website or web application are you looking to build?";
    }
    
    // Helper function to extract topic from message
    function extractTopic(msg) {
        const lowerMsg = msg.toLowerCase();
        if (lowerMsg.includes('programming') || lowerMsg.includes('code') || lowerMsg.includes('coding')) {
            return 'programming';
        }
        return null;
    }
    
    // General knowledge questions
    if (message.match(/(what is|what are|define|explain|tell me about|meaning of)/)) {
        const topic = extractTopic(message);
        if (topic === 'programming') {
            return "I'd be happy to explain programming concepts! Programming is the process of creating instructions for computers to follow. It involves writing code in programming languages to solve problems, build applications, and automate tasks. What specific programming concept would you like me to explain in detail?";
        }
        return "That's a great question! To give you the most accurate and helpful answer, could you provide a bit more context? For example:\n• What specific aspect interests you?\n• What's your current level of knowledge on this topic?\n• What do you hope to learn or accomplish?\n\nThis will help me tailor my response to be most useful for you.";
    }
    
    // How-to questions
    if (message.match(/(how to|how do|how can|steps to|way to|tutorial|guide)/)) {
        return "I can help you with step-by-step guidance! Here's a general approach:\n1. Define your goal clearly\n2. Break it down into smaller steps\n3. Research and gather necessary resources\n4. Start with the basics\n5. Practice and iterate\n6. Seek help when stuck\n\nWhat specific task or skill would you like to learn? I can provide detailed steps and best practices.";
    }
    
    // Problem-solving
    if (message.match(/(problem|issue|trouble|stuck|help.*with|can't|unable|difficulty|challenge)/)) {
        return "I'm here to help you solve problems! Here's a systematic approach:\n1. Clearly define the problem\n2. Identify what you've already tried\n3. Break it into smaller parts\n4. Research similar solutions\n5. Try one solution at a time\n6. Test and verify results\n\nCan you describe your specific problem in more detail? Include any error messages, what you're trying to accomplish, and what you've already attempted.";
    }
    
    // DOM
    if (terms.includes('dom')) {
        return "DOM (Document Object Model) is a programming interface for HTML and XML documents.\n\n**Key Concepts:**\n• Represents the page structure as a tree of nodes\n• JavaScript can manipulate the DOM to change content, structure, and style\n• Each HTML element is a node\n\n**Common Operations:**\n• Select: `document.querySelector('#id')` or `document.getElementById('id')`\n• Modify: `element.textContent = 'New text'`\n• Create: `document.createElement('div')`\n• Append: `parent.appendChild(child)`\n\nWould you like to know about DOM manipulation, events, or specific methods?";
    }
    
    // General questions with question words
    if (hasQuestion && questionWords) {
        const questionType = questionWords[0].toLowerCase();
        
        if (questionType === 'what' && message.match(/(what is|what's|what are)/)) {
            return "I'd be happy to explain! To give you the most accurate answer, could you specify:\n• What technology, concept, or term are you asking about?\n• Are you looking for a definition, explanation, or examples?\n\nFor example, you could ask 'What is JavaScript?' or 'What is React?' and I'll provide detailed information.";
        }
        
        if (questionType === 'how' && message.match(/(how to|how do|how can|how does)/)) {
            return "I can provide step-by-step guidance! To help you best:\n• What specific task or process are you trying to accomplish?\n• What technology or tool are you working with?\n• What's your current skill level?\n\nFor example, 'How to create a React component?' or 'How does async/await work?'";
        }
        
        if (questionType === 'why') {
            return "Great question! To explain the reasoning:\n• What concept or decision are you asking about?\n• What context or situation are you considering?\n\nI can explain the 'why' behind programming concepts, design decisions, or best practices.";
        }
    }
    
    // Contextual responses based on conversation history
    if (history.length >= 2) {
        const recentTopics = history.slice(-4).join(' ').toLowerCase();
        const recentTerms = extractTerms(recentTopics);
        
        // Continue conversation about detected topics
        if (recentTerms.length > 0 && message.length > 5) {
            const mainTopic = recentTerms[0];
            if (knowledgeBase[mainTopic]) {
                const kb = knowledgeBase[mainTopic];
                return `Building on our discussion about ${mainTopic}, here's additional information:\n\n${kb.definition}\n\nWhat specific aspect would you like to explore further? I can provide code examples, best practices, or answer specific questions.`;
            }
        }
    }
    
    // Thank you
    if (message.match(/(thank|thanks|appreciate|grateful)/)) {
        return "You're very welcome! I'm glad I could help. Is there anything else you'd like to know? I'm here to assist with programming, technology, or any other questions you have.";
    }
    
    // Goodbye
    if (message.match(/(bye|goodbye|see you|farewell|exit|quit|later)/)) {
        return "Goodbye! It was great chatting with you. Feel free to come back anytime if you have more questions. Have a wonderful day!";
    }
    
    // Short responses
    if (message.match(/(yes|yeah|yep|sure|okay|ok|alright|absolutely|definitely|correct|right)/)) {
        return "Great! What specific topic or question would you like to explore? I can provide detailed explanations, code examples, or step-by-step guidance.";
    }
    
    if (message.match(/(no|nope|nah|not really|disagree|don't think|wrong|incorrect)/)) {
        return "I understand. Could you help me understand your perspective better? What specifically would be more helpful, or what information are you looking for?";
    }
    
    // Default response - encourage specific tech questions
    return "I'm here to help with technology and computer science questions! To provide you with the most accurate information, please ask a specific tech-related question. For example:\n• 'What is JavaScript?'\n• 'How does React work?'\n• 'Explain Node.js'\n• 'What is an API?'\n• 'How do databases work?'\n\nI only answer questions related to technology and computer science. What tech topic interests you?";
}

io.on('connection',(socket)=>{
    console.log('User connected:',socket.id);
    
    // Initialize conversation history for this user
    conversations.set(socket.id, []);
    
    socket.on('message',(data)=>{
        console.log('Message received:', data);
        
        // Get conversation history for this user
        const history = conversations.get(socket.id) || [];
        
        // Broadcast to all other clients (for multi-user chat)
        socket.broadcast.emit('message',data);
        
        // Generate intelligent response
        setTimeout(() => {
            const response = generateResponse(data, history);
            console.log('Sending reply:', response);
            
            // Add user message and bot response to history for context
            history.push(data);
            history.push(response);
            
            // Keep only last 10 messages for context
            if (history.length > 10) {
                history.shift();
                history.shift(); // Remove pairs to maintain conversation flow
            }
            conversations.set(socket.id, history);
            
            // Send reply to the sender
            socket.emit('message', response);
        }, 800 + Math.random() * 400); // Random delay between 800-1200ms for more natural feel
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Clean up conversation history
        conversations.delete(socket.id);
    });
})