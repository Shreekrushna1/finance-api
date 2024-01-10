var express = require("express");
var router = require("./index");
const userModel = require("./users");

router.post("/add-new-card", async (req, res) => {
  const {
    card_number,
    card_holder,
    card_cvv,
    expiry_date,
    card_amount,
    currentUserEmail,
    cardType,
  } = req.body;
  const cardExistsInAnyUser = await userModel.exists({
    'details.cards.card_number': card_number,
  });

  if (cardExistsInAnyUser) {
    return res.status(400).json({ message: "Card number already exists in another user's cards",cardAlreadyExits:true });
  }
  try {
    const foundUser = await userModel.findOne({ email: currentUserEmail });
    if (!foundUser) {
      return res.status(400).json({ message: "User Not Found" });
    }
    const existingDetails = foundUser.details.find(
      (detail) => detail.cards && detail.cards.length > 0
    );

    if (existingDetails) {
      existingDetails.cards.push({
        card_number: card_number,
        card_holder: card_holder,
        card_cvv: card_cvv,
        expiry_date: expiry_date,
        card_amount: card_amount,
        card_type: cardType,
      });
    } else {
      const newDetails = {
        cards: [
          {
            card_number: card_number,
            card_holder: card_holder,
            card_cvv: card_cvv,
            expiry_date: expiry_date,
            card_amount: card_amount,
            card_type: cardType,
          },
        ],
      };
      foundUser.details.push(newDetails);
    }

    const updatedUser = await foundUser.save();
    return res
      .status(200)
      .json({ message: "Card added successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/getAllCards", async (req, res) => {
  const email = req.query.email;
  const foundUser = await userModel.findOne({ email: email });
  if (!foundUser) {
    return res.status(400).json({ message: "User Not Found" });
  }
  const existingDetails = foundUser.details.find(
    (detail) => detail.cards && detail.cards.length > 0
  );
  if (!existingDetails) {
    return res.status(200).json({ message: "User Cards Not Found" });
  }
  res.status(200).json({ message: "Cards Found", cards: existingDetails || [] });
});

router.get('/getWallet', async (req,res) => {
  const email = req.query.email;
  const foundUser = await userModel.findOne({ email: email });
  if (!foundUser) {
    return res.status(400).json({ message: "User Not Found" });
  }
  const existingDetails = foundUser.details.find(
    (detail) => detail.wallet && detail.wallet.length > 0
  );
  if (!existingDetails) {
    return res.status(200).json({ message: "User Wallet Not Found" });
  }
  res.status(200).json({ message: "Wallet Found", cards: existingDetails });
})

router.put("/add-amount", async (req, res) => {
  const { currentUserEmail, card_number, amount } = req.body;
  try {
    const foundUser = await userModel.findOne({ email: currentUserEmail });
    if (!foundUser) {
      return res.status(400).json({ message: "User Not Found" });
    }
    if (!foundUser.details || foundUser.details.length === 0) {
      return res.status(400).json({ message: "User has no details" });
    }
    const userDetails = foundUser.details.find(res=> res.cards && res.cards.length);
    if (!userDetails.cards || userDetails.cards.length === 0) {
      return res.status(400).json({ message: "User has no cards" });
    }
    const cardIndex = userDetails.cards.findIndex(
      (card) => card.card_number === card_number
    );
    if (cardIndex === -1) {
      return res.status(400).json({ message: "Card Not Found" });
    }
    userDetails.cards[cardIndex].card_amount += amount;
    const addedAmount = {
      amount: amount,
      date:new Date(),
      added_to_card:'Added Amount'
    }
    userDetails.cards[cardIndex].transactions.push(addedAmount);
    await foundUser.save();
    return res
      .status(200)
      .json({ message: "Amount added successfully", user: foundUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
