const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://tarun:tarunsai2341@cluster0.tbd0fbb.mongodb.net/madhuri?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define a schema for your data
const DataSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  image: String,
  // likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  // likesCount: { type: Number, default: 0 },
  comments: [
    {
      // user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      user:String,
      comment: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

// Create a model based on the schema
const DataModel = mongoose.model('Data', DataSchema);

// Define a schema for user registration
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Password stored without hashing (insecure)
});

// Create a model based on the user schema
const UserModel = mongoose.model('User', UserSchema);

// Middleware for parsing JSON request bodies and CORS
app.use(express.json());
app.use(cors());

// API endpoint for saving data to the database
app.post('/api/data', async (req, res) => {
  try {
    const { title, description, location, image } = req.body;
    const newData = new DataModel({ title, description, location, image});
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
    const dataList = await DataModel.find().populate('comments.user', 'username');
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
let name;
app.post('/api/login', async (req, res) => {
  try {
    
    const { username, password } = req.body;
    name = username;
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

// API endpoint for liking a post
// app.post('/api/data/:id/like', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { userId } = req.body;
//     const data = await DataModel.findById(id);
//     if (!data) {
//       return res.status(404).json({ message: 'Post not found' });
//     }

//     const index = data.likes.indexOf(userId);
//     if (index === -1) {
//       data.likes.push(userId);
//       data.likesCount = data.likes.length;
//       await data.save();
//       return res.status(200).json({ message: 'Post liked successfully' });
//     } else {
//       data.likes.splice(index, 1);
//       data.likesCount = data.likes.length;
//       await data.save();
//       return res.status(200).json({ message: 'Post unliked successfully' });
//     }
//   } catch (err) {
//     console.error('Error liking post:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// API endpoint for adding a comment to a post
app.post('/api/data/:id/comment', async (req, res) => {
  try {
    const { id } = req.params;
    const {  comment } = req.body;
    const data = await DataModel.findById(id);
    if (!data) {
      return res.status(404).json({ message: 'Post not found' });
    }
  
    const newComment = {
      user: name,
      comment: comment,
      timestamp: new Date()
    };

    data.comments.push(newComment);
    await data.save();
    res.status(201).json({ message: 'Comment added successfully' });
  } catch (err) {
    console.error('Error adding comment:', err);
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
