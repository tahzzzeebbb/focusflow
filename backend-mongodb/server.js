const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// ============ JSON FILE STORAGE (FALLBACK) ============
const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize JSON storage if MongoDB fails
let useMongoDB = true;
let jsonData = {
    users: [],
    queries: [],
    tasks: [],
    nextId: 1
};

// Load JSON data if file exists
if (fs.existsSync(DATA_FILE)) {
    try {
        jsonData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        console.log('📁 JSON storage file loaded');
    } catch (e) {
        console.log('⚠️ Error reading JSON file, using fresh data');
    }
}

const saveJsonData = () => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(jsonData, null, 2));
};

// JSON storage functions
const jsonFindUserByEmail = (email) => jsonData.users.find(u => u.email === email);
const jsonFindUserById = (id) => jsonData.users.find(u => u.id === parseInt(id));
const jsonCreateUser = (user) => {
    const newUser = { id: jsonData.nextId++, ...user, createdAt: new Date().toISOString() };
    jsonData.users.push(newUser);
    saveJsonData();
    return newUser;
};
const jsonSaveQuery = (query) => {
    const newQuery = { id: jsonData.nextId++, ...query, createdAt: new Date().toISOString() };
    jsonData.queries.push(newQuery);
    saveJsonData();
    return newQuery;
};
const jsonGetQueriesByUser = (userId) => jsonData.queries.filter(q => q.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
const jsonDeleteQuery = (id) => {
    const index = jsonData.queries.findIndex(q => q.id === parseInt(id));
    if (index !== -1) { jsonData.queries.splice(index, 1); saveJsonData(); return true; }
    return false;
};

// ============ MONGODB SCHEMAS ============
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const querySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    queryText: { type: String, required: true },
    responseText: { type: String, required: true },
    tableData: { type: Object, default: null },
    chartData: { type: Object, default: null },
    queryType: { type: String, default: 'general' },
    createdAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'Other' },
    priority: { type: String, default: 'medium' },
    status: { type: String, default: 'pending' },
    dueDate: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

let User, Query, Task;

// ============ CONNECT TO MONGODB ATLAS ============
const connectToMongoDB = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;

        if (!MONGODB_URI) {
            console.log('⚠️ No MONGODB_URI found, using JSON storage');
            useMongoDB = false;
            return false;
        }

        console.log('📡 Connecting to MongoDB Atlas...');

        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
        });

        console.log('✅ Connected to MongoDB Atlas successfully!');
        console.log('📊 Database:', mongoose.connection.name);

        // Initialize models
        User = mongoose.model('User', userSchema);
        Query = mongoose.model('Query', querySchema);
        Task = mongoose.model('Task', taskSchema);

        useMongoDB = true;
        await createDemoUserMongo();
        return true;

    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('⚠️ Falling back to JSON file storage');
        useMongoDB = false;

        // Create demo user in JSON storage
        createDemoUserJson();
        return false;
    }
};

// MongoDB demo user
const createDemoUserMongo = async () => {
    try {
        const demoEmail = 'admin@adhd.com';
        const existingDemo = await User.findOne({ email: demoEmail });
        if (!existingDemo) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({ fullName: 'Admin User', email: demoEmail, password: hashedPassword });
            console.log('✅ Demo user created in MongoDB: admin@adhd.com / admin123');
        }
    } catch (error) {
        console.error('Error creating demo user:', error);
    }
};

// JSON demo user
const createDemoUserJson = () => {
    const demoEmail = 'admin@adhd.com';
    const existingDemo = jsonFindUserByEmail(demoEmail);
    if (!existingDemo) {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        jsonCreateUser({ fullName: 'Admin User', email: demoEmail, password: hashedPassword });
        console.log('✅ Demo user created in JSON: admin@adhd.com / admin123');
    }
};

// ============ WRAPPER FUNCTIONS (MongoDB or JSON) ============
const findUserByEmail = async (email) => {
    if (useMongoDB && mongoose.connection.readyState === 1) {
        return await User.findOne({ email });
    }
    return jsonFindUserByEmail(email);
};

const findUserById = async (id) => {
    if (useMongoDB && mongoose.connection.readyState === 1) {
        return await User.findById(id).select('-password');
    }
    return jsonFindUserById(id);
};

const createUser = async (userData) => {
    if (useMongoDB && mongoose.connection.readyState === 1) {
        const user = await User.create(userData);
        return { id: user._id, fullName: user.fullName, email: user.email, password: user.password };
    }
    return jsonCreateUser(userData);
};

const saveQuery = async (queryData) => {
    if (useMongoDB && mongoose.connection.readyState === 1) {
        const query = await Query.create(queryData);
        return { id: query._id, ...queryData };
    }
    return jsonSaveQuery(queryData);
};

const getQueriesByUser = async (userId) => {
    if (useMongoDB && mongoose.connection.readyState === 1) {
        return await Query.find({ userId }).sort({ createdAt: -1 }).limit(50);
    }
    return jsonGetQueriesByUser(userId);
};

const deleteQuery = async (id) => {
    if (useMongoDB && mongoose.connection.readyState === 1) {
        return await Query.findByIdAndDelete(id);
    }
    return jsonDeleteQuery(id);
};

// ============ TEST ROUTE ============
app.get('/', (req, res) => {
    res.json({
        message: 'ADHD App Backend is running! 🚀',
        status: 'active',
        storage: useMongoDB && mongoose.connection.readyState === 1 ? 'MongoDB Atlas' : 'JSON File',
        timestamp: new Date().toISOString()
    });
});

// ============ AUTHENTICATION ENDPOINTS ============

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await createUser({ fullName, email, password: hashedPassword });
        const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

        console.log('✅ New user created:', { id: user.id, email });

        res.json({
            success: true,
            token: token,
            user: { id: user.id, fullName: user.fullName, email: user.email }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Signup failed: ' + error.message });
    }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = Buffer.from(`${user.id || user._id}:${Date.now()}`).toString('base64');

        console.log('✅ User logged in:', { id: user.id || user._id, email });

        res.json({
            success: true,
            token: token,
            user: {
                id: user.id || user._id,
                fullName: user.fullName,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed: ' + error.message });
    }
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = Buffer.from(token, 'base64').toString();
        const userId = decoded.split(':')[0];
        const user = await findUserById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user.id || user._id,
                fullName: user.fullName,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// ============ QUERY ENDPOINTS ============

// Process natural language query
app.post('/api/query', async (req, res) => {
    const { query, userId } = req.body;

    if (!query || !userId) {
        return res.status(400).json({ error: 'Query and userId are required' });
    }

    try {
        console.log(`\n📝 Processing query: "${query}"`);
        console.log(`👤 User ID: ${userId}`);

        let response;
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('progress') || lowerQuery.includes('over time')) {
            response = {
                text: "📊 Here's your progress over the last 7 days! You've completed 59 tasks with 85% average productivity.",
                table: {
                    headers: ['Day', 'Tasks Completed', 'Focus Score', 'Productivity'],
                    rows: [
                        ['Monday', 8, 85, '80%'],
                        ['Tuesday', 10, 90, '85%'],
                        ['Wednesday', 12, 95, '92%'],
                        ['Thursday', 11, 92, '88%'],
                        ['Friday', 9, 88, '82%'],
                        ['Saturday', 5, 75, '70%'],
                        ['Sunday', 4, 70, '65%']
                    ]
                },
                type: 'progress'
            };
        }
        else if (lowerQuery.includes('tasks') || lowerQuery.includes('this week')) {
            response = {
                text: `✅ Here's your task breakdown by category:`,
                table: {
                    headers: ['Category', 'Completed', 'Pending', 'Total'],
                    rows: [
                        ['Work', 25, 8, 33],
                        ['Personal', 18, 5, 23],
                        ['Health', 10, 3, 13],
                        ['Learning', 6, 4, 10]
                    ]
                },
                type: 'tasks'
            };
        }
        else if (lowerQuery.includes('focus')) {
            response = {
                text: "🎯 Focus Analysis: Your focus score is 85/100. Peak productivity hours: 9 AM - 12 PM. Most productive day: Wednesday. Keep up the great work!",
                type: 'focus'
            };
        }
        else if (lowerQuery.includes('report')) {
            response = {
                text: "📈 Weekly Productivity Report:\n• Total tasks: 59\n• Completion rate: 84%\n• Focus score average: 82/100\n• Most productive day: Wednesday\n• Best time: Morning (9 AM - 12 PM)",
                type: 'report'
            };
        }
        else {
            response = {
                text: `💡 I understand you're asking about "${query}". Here are some things you can ask me:\n\n• "Show my progress"\n• "Show my tasks"\n• "Focus analysis"\n• "Generate report"`,
                type: 'general'
            };
        }

        // Save query to storage
        await saveQuery({
            userId: userId,
            queryText: query,
            responseText: response.text,
            tableData: response.table || null,
            chartData: response.chart || null,
            queryType: response.type
        });

        console.log('✅ Query saved to', useMongoDB ? 'MongoDB' : 'JSON file');

        res.json(response);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

// Get user's query history
app.get('/api/history/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const history = await getQueriesByUser(userId);
        console.log(`📚 Retrieved ${history.length} queries for user ${userId}`);
        res.json(history);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Delete a query
app.delete('/api/query/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await deleteQuery(id);
        res.json({ message: 'Query deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to delete query' });
    }
});

// ============ START SERVER ============
const server = app.listen(PORT, async () => {
    console.log(`\n🚀 ========================================`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🚀 ========================================`);

    await connectToMongoDB();

    console.log(`\n📁 Storage Mode: ${useMongoDB && mongoose.connection.readyState === 1 ? 'MongoDB Atlas ✅' : 'JSON File 📄'}`);
    console.log(`\n📝 Auth Endpoints:`);
    console.log(`   POST http://localhost:${PORT}/api/auth/signup`);
    console.log(`   POST http://localhost:${PORT}/api/auth/login`);
    console.log(`   GET  http://localhost:${PORT}/api/auth/me`);
    console.log(`\n📝 Query Endpoints:`);
    console.log(`   POST http://localhost:${PORT}/api/query`);
    console.log(`   GET  http://localhost:${PORT}/api/history/:userId`);
    console.log(`\n✨ Ready to accept requests!\n`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server...');
    server.close(() => {
        if (useMongoDB) mongoose.connection.close();
        console.log('✅ Server stopped');
        process.exit(0);
    });
});