const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // To accept JSON data in the body

app.use('/api/requests', require('./routes/requests'));

// Define Routes
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/auth', require('./routes/authRoutes')); // <-- ADD THIS LINE

// Basic route for testing
app.get('/', (req, res) => res.send('API is running...'));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
