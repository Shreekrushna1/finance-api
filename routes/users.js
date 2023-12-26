const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://krushnaproducts:Krushna11@cluster0.uvurvqw.mongodb.net/yourDatabaseName?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB successfully');
});

const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  details: Array
});

module.exports = mongoose.model('users', userSchema);
