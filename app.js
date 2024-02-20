const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path'); // Import the path module
const nodemailer = require('nodemailer');
const fs = require('fs'); // Import the file system module
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb+srv://vinothg0618:vinoth112003@cluster0.fiy26nf.mongodb.net/myapp', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

const db = mongoose.connection;

// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// db.once('open', function() {
//     console.log('MongoDB connected successfully');
// });

// Define a user schema
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    isVerified: { type: Boolean, default: false }, // Add a field for verification status
    verificationToken: String // Add a field for storing verification token (e.g., user ID)
});

const User = mongoose.model('User', userSchema);

// Handle form submission

app.post('/register', async (req, res) => {
    // Check if the email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
        return res.status(400).send('Email already exists. Please use a different email address.');
    }

    // Hash the password
    // const hashedPassword = await bcrypt.hash(req.body.password, 10); // 10 is the saltRounds

    // Create a new user
    const user = new User({
        firstName: req.body.fname,
        lastName: req.body.lname,
        email: req.body.email,
        password: req.body.password
    });

    try {
        // Save the user to the database
        const savedUser = await user.save();

        // Send verification email
        sendVerificationEmail(savedUser);

        res.send('Registration successful. Please check your email for verification.');
    } catch (error) {
        res.status(400).send(error);
    }
});




// Send verification email
function sendVerificationEmail(user) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: '2021pecit223@gmail.com', // Enter your Gmail address
            pass: 'ljeh zzlv fdmd efuz' // Enter your Gmail password
        }
    });

    // Read the email template file
    fs.readFile(path.join(__dirname, 'public', 'emailTemplate.html'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading email template:', err);
            return;
        }

        // Replace placeholders with actual user data
        const emailBody = data
            .replace('<span class="username">username</span>', `<span class="username">${user.firstName} ${user.lastName}</span>`)
            .replace('<a href="" class="verify-btn">Verify Email</a>', `<a href="https://verify-email.vercel.app/verify/${user._id}" class="verify-btn">Verify Email</a>`);

        // Send email with the customized HTML body
        const mailOptions = {
            from: '2021pecit223@gmail.com', // Enter your Gmail address
            to: user.email,
            subject: 'Email Verification',
            html: emailBody
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
    });
}


// Handle verification link clicks
app.get('/verify/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).send('User not found.');
            return;
        }

        // Update user's verification status
        user.isVerified = true;
        await user.save();

        res.send('Email verification successful. You can now log in.');
    } catch (error) {
        res.status(500).send('Internal server error.');
    }
});

// Serve the index.html file from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
