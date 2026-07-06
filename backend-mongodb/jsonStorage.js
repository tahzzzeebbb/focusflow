const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
        users: [],
        queries: [],
        tasks: [],
        nextId: 1
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    console.log('✅ Created data.json file for storage');
}

// Read data from file
const readData = () => {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
};

// Write data to file
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// User functions
const findUserByEmail = (email) => {
    const data = readData();
    return data.users.find(u => u.email === email);
};

const createUser = (user) => {
    const data = readData();
    const newUser = {
        id: data.nextId++,
        ...user,
        createdAt: new Date().toISOString()
    };
    data.users.push(newUser);
    writeData(data);
    return newUser;
};

const findUserById = (id) => {
    const data = readData();
    return data.users.find(u => u.id === parseInt(id));
};

// Query functions
const saveQuery = (query) => {
    const data = readData();
    const newQuery = {
        id: data.nextId++,
        ...query,
        createdAt: new Date().toISOString()
    };
    data.queries.push(newQuery);
    writeData(data);
    return newQuery;
};

const getQueriesByUser = (userId) => {
    const data = readData();
    return data.queries.filter(q => q.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const deleteQueryById = (id) => {
    const data = readData();
    const index = data.queries.findIndex(q => q.id === parseInt(id));
    if (index !== -1) {
        data.queries.splice(index, 1);
        writeData(data);
        return true;
    }
    return false;
};

module.exports = {
    findUserByEmail,
    createUser,
    findUserById,
    saveQuery,
    getQueriesByUser,
    deleteQueryById
};