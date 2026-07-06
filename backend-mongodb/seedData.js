const mongoose = require('mongoose');
const User = require('./models/User');
const Task = require('./models/Task');
const QueryHistory = require('./models/QueryHistory');
require('dotenv').config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding');

        // Clear existing data
        await User.deleteMany({});
        await Task.deleteMany({});
        await QueryHistory.deleteMany({});

        // Create demo user
        const demoUser = new User({
            username: 'demo_user',
            email: 'demo@example.com',
            password: 'demo123' // In production, hash this!
        });
        await demoUser.save();
        console.log('Demo user created');

        // Create sample tasks
        const tasks = [
            {
                userId: demoUser._id,
                title: 'Complete project report',
                category: 'Work',
                priority: 'high',
                status: 'completed',
                dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            },
            {
                userId: demoUser._id,
                title: 'Morning meditation',
                category: 'Health',
                priority: 'medium',
                status: 'completed',
                dueDate: new Date()
            },
            {
                userId: demoUser._id,
                title: 'Learn React hooks',
                category: 'Learning',
                priority: 'high',
                status: 'pending',
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
            },
            {
                userId: demoUser._id,
                title: 'Grocery shopping',
                category: 'Personal',
                priority: 'low',
                status: 'pending',
                dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
            },
            {
                userId: demoUser._id,
                title: 'Team meeting',
                category: 'Work',
                priority: 'high',
                status: 'completed',
                dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            }
        ];

        await Task.insertMany(tasks);
        console.log('Sample tasks created');

        // Create sample query history
        const queries = [
            {
                userId: demoUser._id,
                queryText: 'Show my progress over time',
                responseText: 'Here is your progress for the last 7 days!',
                queryType: 'progress',
                tableData: {
                    headers: ['Day', 'Tasks Completed', 'Focus Score'],
                    rows: [
                        ['Monday', 8, 85],
                        ['Tuesday', 10, 90],
                        ['Wednesday', 12, 95]
                    ]
                }
            },
            {
                userId: demoUser._id,
                queryText: 'What tasks did I complete this week?',
                responseText: 'You completed 3 tasks this week!',
                queryType: 'tasks'
            }
        ];

        await QueryHistory.insertMany(queries);
        console.log('Sample queries created');

        console.log('✅ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();