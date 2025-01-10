// Import required modules
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv')
const User = require('./models/user')
const cors = require('cors');

const app = express();
dotenv.config();
app.use(express.json());






// MongoDB connection with error handling
mongoose.connect(process.env.MONGO_URI, {})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // Use app-specific password
  },
  tls: {
    rejectUnauthorized: false // Only for development
  }
});

// Verify email configuration
transporter.verify(function(error, success) {
  if (error) {
    console.log('Nodemailer configuration error:', error);
  } else {
    console.log('Nodemailer is ready to send emails');
  }
});


const corsOptions = {
  origin: 'https://nodejstask-front.vercel.app', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true, 
};

app.use(cors(corsOptions)); // Apply the CORS middleware


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://nodejstask-front.vercel.app'); 
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); 
  }
  next();
});
// Input validation middleware
const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }
  
  next();
};

// Registration endpoint with validation
app.post('/api/register', validateRegistration, async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: `User with this ${existingUser.email === email ? 'email' : 'username'} already exists` 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12); // Increased from 10 to 12 rounds

    const newUser = new User({ 
      username, 
      email: email.toLowerCase(), 
      password: hashedPassword 
    });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login endpoint with rate limiting
const loginAttempts = new Map();

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Simple rate limiting
    const attempts = loginAttempts.get(username) || 0;
    if (attempts >= 5) {
      return res.status(429).json({ message: 'Too many login attempts. Try again later.' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      loginAttempts.set(username, attempts + 1);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      loginAttempts.set(username, attempts + 1);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Reset attempts on successful login
    loginAttempts.delete(username);

    const token = jwt.sign(
      { id: user._id, username: user.username }, 
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ 
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Forgot password endpoint with improved security
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
  
    try {
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
  
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        return res.status(400).json({ message: 'No user exists.' });
      }
  
      // Generate a shorter, more user-friendly token
      const resetToken = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 character token
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
      user.resetToken = hashedToken;
      user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
      await user.save();
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Password Reset Code',
        html: `
          <h1>Password Reset Code</h1>
          <p>Your password reset code is: <strong>${resetToken}</strong></p>
          <p>This code will expire in 1 hour.</p>
          <p>To reset your password, make a POST request to /api/reset-password with:</p>
          <pre>
          {
            "token": "${resetToken}",
            "newPassword": "your-new-password"
          }
          </pre>
          <p>If you didn't request this, please ignore this email.</p>
        `
      };
  
      await transporter.sendMail(mailOptions);
      console.log("email sent")
  
      res.status(200).json({ 
        message: 'If an account exists, a reset code will be sent to the email.',
        expiresIn: '1 hour'
      });
    } catch (err) {
      console.error('Forgot password error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
  
  // Modified reset password endpoint
  app.post('/api/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
  
    try {
      if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
      }
  
      if (newPassword.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
      }
  
      // Convert token to uppercase to match stored format
      const hashedToken = crypto.createHash('sha256').update(token.toUpperCase()).digest('hex');
      
      const user = await User.findOne({
        resetToken: hashedToken,
        resetTokenExpiration: { $gt: Date.now() }
      });
  
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }
  
      user.password = await bcrypt.hash(newPassword, 12);
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      await user.save();
  
      // Send confirmation email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Password Reset Successful',
        html: `
          <h1>Password Reset Successful</h1>
          <p>Your password has been successfully reset.</p>
          <p>If you didn't make this change, please contact support immediately.</p>
        `
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
      console.error('Reset password error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  app.get('/',(req,res)=>{
    res.send("hello")
  })
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));