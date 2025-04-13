const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const workerApplicationRoutes = require('./routes/workerApplications');
require('dotenv').config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/profiles', require('./routes/profiles'));
const contractorJobPostsRouter = require('./routes/contractorJobPosts');
app.use('/api/contractor-job-posts', contractorJobPostsRouter);
app.use('/api/worker-applications', require('./routes/workerApplications'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 