const mongoose = require('mongoose');

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

// Define a schema for the "users" collection
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    isVerified: { type: Boolean, default: false }, // Add a field for verification status
    verificationToken: String // Add a field for storing verification token (e.g., user ID)
});

// Define a model based on the schema, specifying the "users" collection
const User = mongoose.model('User', userSchema, 'users');

// Function to fetch data from the "users" collection
async function fetchData() {
    try {
        // Find all documents in the "users" collection
        const users = await User.find();
        console.log('All users:', users);
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        // Close the MongoDB connection
        mongoose.connection.close();
    }
}
