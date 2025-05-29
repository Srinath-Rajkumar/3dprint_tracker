// backend/controllers/authController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (user.role === 'admin' && !user.isInitialAdminSetupComplete) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        requiresInitialSetup: true,
      });
    } else {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        token: generateToken(user._id),
        requiresInitialSetup: false,
      });
    }
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Initial admin setup or Update admin profile
// @route   PUT /api/auth/admin-setup
// @access  Private/Admin (after first login with default creds)
const setupAdminProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id); // req.user from protect middleware

  if (user && user.role === 'admin') {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    if (req.body.password) {
      user.password = req.body.password; // Mongoose pre-save hook will hash it
    }
    user.isInitialAdminSetupComplete = true;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      token: generateToken(updatedUser._id),
      requiresInitialSetup: false,
    });
  } else {
    res.status(404);
    throw new Error('User not found or not an admin');
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password'); // req.user is set by 'protect' middleware
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile (only password for now, can be extended)
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // For regular users, only allow password change
    // Admin can change more details via userController
    if (req.body.name) user.name = req.body.name; // Allow name change too
    if (req.body.phone) user.phone = req.body.phone; // Allow phone change too

    if (req.body.password) {
      user.password = req.body.password; // Mongoose pre-save hook will hash it
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      token: generateToken(updatedUser._id), // Re-issue token if password changes
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});


// Check if admin exists and create default if not
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        phone: '0000000000', // Default phone
        isInitialAdminSetupComplete: false,
      });
      console.log('Default admin user created. Email: admin@example.com, Pass: admin123. PLEASE CHANGE ON FIRST LOGIN.');
    }
  } catch (error) {
      console.error('Error creating default admin:', error.message);
  }
};
// Call this on server start, ideally after DB connection
// connectDB().then(() => createDefaultAdmin()); // Ensure DB is connected before this
// Or call it directly in server.js after connectDB()
// For now, let's assume it's called in server.js
// createDefaultAdmin(); // This was in the previous version, can be moved to server.js

export { loginUser, setupAdminProfile, getUserProfile, updateUserProfile, createDefaultAdmin };