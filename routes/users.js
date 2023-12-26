const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://krushnaproducts:Krushna11@cluster0.uvurvqw.mongodb.net/?retryWrites=true&w=majority');

const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  details:Array
});
module.exports = mongoose.model('users',userSchema);