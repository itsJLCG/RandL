const User = require('../models/User');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(require('../config/serviceAccountKey.json'))
});


// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, password, address, image } = req.body;
    console.log('Received image data:', image);

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }
    // Create user with image object structure
    const user = await User.create({
      name,
      email,
      password,
      address,
      image: {
        public_id: image.public_id,
        url: image.url
      },
      role: 'user'
    });

    if (user) {
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          address: user.address,
          image: user.image, // This will now return the object with public_id and url
          role: user.role,
          token: generateToken(user._id)
        }
      });
    }
  } catch (error) {
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        address: user.address,
        email: user.email,
        role: user.role,
        token // Include token in user object
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, address, image } = req.body;

    const updateData = {
      name,
      email,
      address,
      ...(image && { image })
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    // Get user from auth middleware
    const user = await User.findById(req.user.id)
      .select('-password')
      .lean(); // Use lean() for better performance
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Debug log
    console.log('Profile Request:', {
      userId: user._id,
      hasImage: !!user.image,
      imageUrl: user.image?.url
    });

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { token, name, email, image } = req.body;
    
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (user) {
      // User exists, update if needed
      user = await User.findByIdAndUpdate(
        user._id,
        { 
          name: name || user.name,
          image: image || user.image
        },
        { new: true }
      );
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        password: uid + process.env.JWT_SECRET, // Generate a random secure password
        address: 'empty',  // You might want to ask for this later
        image: {
          public_id: image.public_id,
          url: image.url
        },
        role: 'user'
      });
    }
    
    // Generate JWT token
    const jwtToken = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        address: user.address || '',
        image: user.image,
        role: user.role,
        token: jwtToken
      }
    });
    
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token or authentication failed'
    });
  }
};