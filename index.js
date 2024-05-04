// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://tarun:tarunsai2341@cluster0.tbd0fbb.mongodb.net/madhuri?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Define a schema for your data
const DataSchema = new mongoose.Schema({
  title: String,
  description: String,
  dropdownSelection: String
});

// Create a model based on the schema
const DataModel = mongoose.model('Data', DataSchema);

// Middleware for parsing JSON request bodies
app.use(bodyParser.json());

// API endpoint for saving data to the database
app.post('/api/data', async (req, res) => {
 
  try {
    const { title, description, dropdownSelection } = req.body;
    const newData = new DataModel({ title, description, dropdownSelection });
    await newData.save();
    res.status(201).json({ message: 'Data saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.use("/",(req,res)=>{
  res.send("hello");
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
