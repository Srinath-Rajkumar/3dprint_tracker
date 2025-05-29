// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import connectDB from './config/db.js';
// import { notFound, errorHandler } from './middleware/errorMiddleware.js';
// import path from 'path'; // For serving static files if needed for printer images
// import { createDefaultAdmin } from './controllers/authController.js';
// import fs from 'fs';

// // Import routes
// import authRoutes from './routes/authRoutes.js';
// import userRoutes from './routes/userRoutes.js';
// import printerRoutes from './routes/printerRoutes.js';
// import projectRoutes from './routes/projectRoutes.js';
// import trackingRoutes from './routes/trackingRoutes.js';
// import costRoutes from './routes/costRoutes.js';
// import dashboardRoutes from './routes/dashboardRoutes.js';

// dotenv.config();
// connectDB();

// const app = express();
// connectDB().then(() => { // Ensure DB is connected before creating admin
//     createDefaultAdmin();
// });
// app.use(cors()); // Enable CORS for all routes
// app.use(express.json()); // To parse JSON bodies
// app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

// // Serve static files for printer images (if you store them locally)
// const __dirname = path.resolve();
// app.use('/uploads', express.static(path.join(__dirname, '/uploads')));


// // API Routes
// app.get('/api', (req, res) => res.send('API is running...'));
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/printers', printerRoutes);
// app.use('/api/projects', projectRoutes);
// app.use('/api/tracking', trackingRoutes); // e.g., /api/tracking/project/:projectId/parts
// app.use('/api/cost', costRoutes);

// // Error Handling Middleware
// app.use(notFound);
// app.use(errorHandler);

// const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
// ------------------------//
// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import connectDB from './config/db.js';
// import { notFound, errorHandler } from './middleware/errorMiddleware.js';
// import path from 'path'; // For serving static files if needed for printer images
// import { createDefaultAdmin } from './controllers/authController.js';
// import fs from 'fs';

// // Import routes
// import authRoutes from './routes/authRoutes.js';
// import userRoutes from './routes/userRoutes.js';
// import printerRoutes from './routes/printerRoutes.js';
// import projectRoutes from './routes/projectRoutes.js';
// import trackingRoutes from './routes/trackingRoutes.js';
// import costRoutes from './routes/costRoutes.js';
// import dashboardRoutes from './routes/dashboardRoutes.js';

// dotenv.config();
// connectDB();

// const app = express();
// connectDB().then(() => { // Ensure DB is connected before creating admin
//     createDefaultAdmin();
// });
// app.use(cors()); // Enable CORS for all routes
// app.use(express.json()); // To parse JSON bodies
// app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

// // Serve static files for printer images (if you store them locally)
// const __dirname = path.resolve();
// app.use('/uploads', express.static(path.join(__dirname, '/uploads')));


// // API Routes
// app.get('/api', (req, res) => res.send('API is running...'));
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/printers', printerRoutes);
// app.use('/api/projects', projectRoutes);
// app.use('/api/tracking', trackingRoutes); // e.g., /api/tracking/project/:projectId/parts
// app.use('/api/cost', costRoutes);
// app.use('/api/dashboard', dashboardRoutes);
// // Error Handling Middleware
// app.use(notFound);
// app.use(errorHandler);

// const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import path from 'path';
import fs from 'fs'; // Import the Node.js File System module
// import config from './config/index.js'; // If you are using the centralized config

// Import controllers that might have startup logic (like createDefaultAdmin)
import { createDefaultAdmin } from './controllers/authController.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import printerRoutes from './routes/printerRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import costRoutes from './routes/costRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js'; // Make sure this was added

// Load environment variables
dotenv.config(); // If not using config/index.js to call this

// Connect to Database and then perform startup actions
connectDB().then(() => {
    createDefaultAdmin(); // Create default admin if not exists
});

const app = express();

// CORS Middleware
app.use(cors()); // Enable CORS for all routes

// Body Parser Middleware
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

// --- Ensure 'uploads' directory exists ---
const __dirname = path.resolve(); // Gets the current working directory of the Node.js process (should be 'backend')
const uploadsDir = path.join(__dirname, 'uploads'); // Creates a path like '.../backend/uploads'

if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true }); // recursive: true creates parent dirs if needed
    console.log("Created 'uploads' directory successfully at:", uploadsDir);
  } catch (err) {
    console.error("Error creating 'uploads' directory:", err);
    // You might want to decide if the server should exit if this critical directory can't be made
    // process.exit(1);
  }
} else {
    console.log("'uploads' directory already exists at:", uploadsDir);
}
// --- End of directory creation ---

// Serve static files for printer images (from the ensured 'uploads' directory)
app.use('/uploads', express.static(uploadsDir));


// API Test Route
app.get('/api', (req, res) => res.send('API is running...'));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/printers', printerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/cost', costRoutes);
app.use('/api/dashboard', dashboardRoutes); // Make sure this is present

// Error Handling Middleware (should be last after routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001; // Or config.port
app.listen(PORT, () =>
  console.log(
    `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}` // Or config.nodeEnv
  )
);