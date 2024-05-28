const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the process if there's a connection error
  });

// Define a schema for your data
const DataSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true }
});

// Create a model based on the schema
const DataModel = mongoose.model('Data', DataSchema);

// Middleware for parsing JSON request bodies
app.use(bodyParser.json());
app.use(cors()); // Enable CORS

// API endpoint for saving data to the database
app.post('/api/data', async (req, res) => {
  try {
    const { title, description, location } = req.body;
    if (!title || !description || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const newData = new DataModel({ title, description, location });
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

// Root route handler
app.get('/', (req, res) => {
  res.send('Hello from Express server!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
