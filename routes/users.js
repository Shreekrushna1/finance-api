const mongoose = require("mongoose");

// mongoose.connect("mongodb://localhost:27017/finance");
mongoose.connect("mongodb+srv://shreekrushnashinde:Shreekrushna11@cluster0.wtyqvhl.mongodb.net/?retryWrites=true&w=majority");

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  details: [
    {
      wallet: [{ amount: Number,received_from: String,send_to:String,date:Date,sender_name: String,added:String,category_name:String,receiver_name:String,payment_mode:String, }],
      category: [{ category_name: String, }],
      cards: [
        {
          card_number: String,
          card_holder: String,
          card_cvv: String,
          expiry_date: String,
          card_amount: Number,
          card_type: String,
          transactions: [
            {
              date: String,
              send_to: String,
              amount: Number,
              category: String,
              received_from: String,
              receiver_name: String,
              payment_mode:String,
              added_to_card:String
            },
          ],
        },
      ],
    },
  ],
});

module.exports = mongoose.model("users", userSchema);
