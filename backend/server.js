const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const workerApplicationRoutes = require('./routes/workerApplications');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/worker-applications', workerApplicationRoutes); 