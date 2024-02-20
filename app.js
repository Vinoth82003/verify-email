const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb+srv://vinothg0618:vinoth112003@cluster0.fiy26nf.mongodb.net/myapp?retryWrites=true&w=majority')
    .then(() => {
        console.log('MongoDB connected successfully');
        // After successful connection, proceed to fetch data
        fetchData();
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

const db = mongoose.connection;

// Define a user schema
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    isVerified: { type: Boolean, default: false },
    verificationToken: String
});

const User = mongoose.model('User', userSchema);

// Handle form submission
app.post('/register', async (req, res) => {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
        return res.status(400).send('Email already exists. Please use a different email address.');
    }

    const user = new User({
        firstName: req.body.fname,
        lastName: req.body.lname,
        email: req.body.email,
        password: req.body.password
    });

    try {
        const savedUser = await user.save();
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
            user: '2021pecit223@gmail.com',
            pass: 'ljeh zzlv fdmd efuz'
        }
    });

    fs.readFile(path.join(__dirname, 'public', 'emailTemplate.html'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading email template:', err);
            return;
        }

        const emailBody = data
            .replace('<span class="username">username</span>', `<span class="username">${user.firstName} ${user.lastName}</span>`)
            .replace('<a href="" class="verify-btn">Verify Email</a>', `<a href="https://verify-email.vercel.app/verify/${user._id}" class="verify-btn">Verify Email</a>`);

        const mailOptions = {
            from: '2021pecit223@gmail.com',
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
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).send('User not found.');
            return;
        }

        user.isVerified = true;
        await user.save();

        res.send('Email verification successful. You can now log in.');
    } catch (error) {
        res.status(500).send('Internal server error.');
    }
});

// Serve the index.html file from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Fetch data from the database
async function fetchData() {
    try {
        const users = await User.find();
        console.log('Fetched users:', users.length);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

console.log("server");