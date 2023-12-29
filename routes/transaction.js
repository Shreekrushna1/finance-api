var express = require("express");
var router = require("./index");
const userModel = require("./users");

// router.post("/make-transaction", async (req, res) => {
//   const { email, send_to, amount, card_number, category } = req.body;
//   try {
//     const sender = await userModel.findOne({ email: email });
//     const receiver = await userModel.findOne({ email: send_to });
//     if (!sender) {
//       return res.status(200).json({ message: "User Not Found" });
//     }

//     const existingDetails = sender.details.find(
//       (detail) => detail.cards && detail.cards.length > 0
//     );

//     const senderCard = existingDetails.cards.find(
//       (item) => item.card_number === card_number
//     );

//     if (!senderCard) {
//       return res.status(200).json({ message: "Card Not Found" });
//     }

//     const transaction = {
//       date: new Date(),
//       send_to: send_to,
//       receiver_name:receiver.firstName + ' ' + receiver.lastName,
//       payment_mode:card_number,
//       amount: amount,
//       category: category || "",
//     };
//     senderCard.transactions.push(transaction);
//     senderCard.card_amount -= amount;

//     //receiver code

//     try {
//       if (!receiver) {
//         return res.status(200).json({ message: "Receiver Not Found" });
//       }
//       const existingDetails = receiver.details.find(
//         (detail) => detail.wallet && detail.wallet.length > 0
//       );
//       if (!existingDetails) {
//         receiver.details.push({
//           wallet: [{ amount: 0 }],
//         });
//       }
//       const receiverWallet = receiver.details.find(
//         (detail) => detail.wallet && detail.wallet.length > 0
//       );

//       const transaction = {
//         date: new Date(),
//         received_from: email,
//         sender_name:sender.firstName + ' ' + sender.lastname,
//         amount: amount,
//         category: category || "",
//       };
//       receiverWallet.wallet.push(transaction);
//       receiverWallet.wallet[0].amount += amount;
//       await receiver.save();
//       await sender.save();
//       return res.status(200).json({ message: "Transaction Successful",receiver:receiver });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ message: "Internal Server Error" });
//     }
//   } catch {
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// });


router.post("/make-transaction", async (req, res) => {
  const { email, send_to, amount, card_number, category } = req.body;

  try {
    const sender = await userModel.findOne({ email: email });
    const receiver = await userModel.findOne({ email: send_to });

    if (!sender) {
      return res.status(404).json({ message: "Sender Not Found" });
    }

    const senderDetails = sender.details.find(
      (detail) => detail.cards && detail.cards.length > 0
    );

    const senderCard = senderDetails.cards.find(
      (item) => item.card_number === card_number
    );

    if (!senderCard) {
      return res.status(404).json({ message: "Card Not Found" });
    }

    const transaction = {
      date: new Date(),
      send_to: send_to,
      receiver_name: receiver ? receiver.firstName + ' ' + receiver.lastName : "Unknown",
      payment_mode: card_number,
      amount: amount,
      category: category || "",
    };

    senderCard.transactions.push(transaction);
    senderCard.card_amount -= amount;

    // Receiver code

    try {
      if (!receiver) {
        return res.status(404).json({ message: "Receiver Not Found" });
      }

      const receiverDetails = receiver.details.find(
        (detail) => detail.wallet && detail.wallet.length > 0
      );

      if (!receiverDetails) {
        receiver.details.push({
          wallet: [{ amount: 0 }],
        });
      }

      const receiverWallet = receiver.details.find(
        (detail) => detail.wallet && detail.wallet.length > 0
      );

      const receiverTransaction = {
        date: new Date(),
        received_from: email,
        sender_name: sender.firstName + ' ' + sender.lastName,
        amount: amount,
        category: category || "",
      };

      receiverWallet.wallet.push(receiverTransaction);
      receiverWallet.wallet[0].amount += amount;

      await receiver.save();
      await sender.save();

      return res.status(200).json({ message: "Transaction Successful", receiver: receiver });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error (Receiver)" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error (Sender)" });
  }
});

module.exports = router;
