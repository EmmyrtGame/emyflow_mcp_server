
const fs = require('fs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_123'; // Logic from auth.controller/index.ts

const token = jwt.sign(
    { id: '1', username: 'admin', email: 'admin@test.com' },
    JWT_SECRET,
    { expiresIn: '1h' }
);
console.log(token);
