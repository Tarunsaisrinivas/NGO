const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://tarun:tarunsai2341@cluster0.tbd0fbb.mongodb.net/madhuri?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define a schema for your data
const DataSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String, // Renamed from dropdownSelection
  imageUrl: String, // New field for image URL
});

// Create a model based on the schema
const DataModel = mongoose.model('Data', DataSchema);

// Define a schema for user registration
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String, // Password stored without hashing (insecure)
});

// Create a model based on the user schema
const UserModel = mongoose.model('User', UserSchema);

// Middleware for parsing JSON request bodies
app.use(bodyParser.json());

// Setup Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Ensure uploads directory exists
const fs = require('fs');
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// API endpoint for saving data to the database
app.post('/api/data', upload.single('image'), async (req, res) => {
  try {
    const { title, description, location } = req.body;
    const newData = new DataModel({
      title,
      description,
      location,
      imageUrl: req.file ? req.file.path : null, // Save the image path if file is uploaded
    });
    await newData.save();
    res.status(201).json({ message: 'Data saved successfully' });
  } catch (err) {
    console.error('Error saving data:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API endpoint for fetching data from the database
app.get('/api/data', async (req, res) => {
  try {
    const dataList = await DataModel.find();
    res.status(200).json(dataList);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API endpoint for user registration
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new UserModel({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API endpoint for user login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username, password });
    if (user) {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route handler
app.get('/', (req, res) => {
  res.send('Hello from Express server!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
