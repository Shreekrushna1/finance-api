var router = require('./index');
const userModel = require('./users');

router.post('/make-transaction', async (req, res) => {
    const { email, send_to, amount, card_number, category } = req.body;

    try {
        const sender = await userModel.findOne({ email: email });
        const receiver = await userModel.findOne({ email: send_to });

        if (!sender) {
            return res.status(404).json({ message: 'Sender Not Found' });
        }

        if (card_number !== 'From Wallet') {
            const senderDetails = sender.details.find((detail) => detail.cards && detail.cards.length > 0);

            const senderCard = senderDetails.cards.find((item) => item.card_number === card_number);

            if (!senderCard) {
                return res.status(404).json({ message: 'Card Not Found' });
            }
            const transaction = {
                date: new Date(),
                send_to: send_to,
                receiver_name: receiver ? receiver.firstName + ' ' + receiver.lastName : 'Unknown',
                payment_mode: card_number,
                amount: amount,
                category: category || '',
            };
            senderCard.transactions.push(transaction);
            senderCard.card_amount -= amount;
        } else if (card_number == 'From Wallet') {
            const senderWallet = sender.details.find((detail) => detail.wallet && detail.wallet.length > 0);
            const senderTransaction = {
                date: new Date(),
                send_to: send_to,
                receiver_name: receiver ? receiver.firstName + ' ' + receiver.lastName : 'Unknown',
                amount: amount,
                payment_mode: card_number,
                category: category || '',
            };

            senderWallet.wallet.push(senderTransaction);
            senderWallet.wallet[0].amount -= amount;
        }
        // Receiver code

        if (!receiver) {
            return res.status(404).json({ message: 'Receiver Not Found' });
        }

        const receiverDetails = receiver.details.find((detail) => detail.wallet && detail.wallet.length > 0);

        if (!receiverDetails) {
            receiver.details.push({
                wallet: [{ amount: 0 }],
            });
        }

        const receiverWallet = receiver.details.find((detail) => detail.wallet && detail.wallet.length > 0);

        const receiverTransaction = {
            date: new Date(),
            received_from: email,
            sender_name: sender.firstName + ' ' + sender.lastName,
            payment_mode: card_number,
            amount: amount,
            category: category || '',
        };

        receiverWallet.wallet.push(receiverTransaction);
        receiverWallet.wallet[0].amount += amount;

        await sender.save();
        await receiver.save();

        return res.status(200).json({ message: 'Transaction Successful', receiver: receiver });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error (Sender)' });
    }
});

router.get('/getAllTransactions', async (req, res) => {
    const email = req.query.email;
    const foundUser = await userModel.findOne({ email: email });
    if (!foundUser) {
        return res.status(404).json({ message: 'User Not Found' });
    }
    const wallet_transactions = foundUser.details.filter((res) => res.wallet && res.wallet.length);
    const cards_transactions = foundUser.details.filter((res) =>
        res.cards.filter((transaction) => {
            if (transaction.transactions.length) {
                return transaction.transactions;
            }
        })
    );

    return res.status(200).json({
        message: 'All Transactions',
        cards_transactions: cards_transactions,
        wallet_transactions: wallet_transactions,
    });
});

router.post('/make-transaction-to-category', async (req, res) => {
    const { email, send_to, amount, card_number, category } = req.body;
    console.log();
    try {
        const foundUser = await userModel.findOne({ email: email });
        if (!foundUser) {
            return res.status(200).json({ message: 'User Not Found' });
        }
        if (card_number !== 'From Wallet') {
          const senderDetails = foundUser.details.find((detail) => detail.cards && detail.cards.length > 0);

          const senderCard = senderDetails.cards.find((item) => item.card_number === card_number);

          if (!senderCard) {
              return res.status(404).json({ message: 'Card Not Found' });
          }
          const transaction = {
              date: new Date(),
              send_to: send_to,
              payment_mode: card_number,
              amount: amount,
              category: category || '',
          };
          senderCard.transactions.push(transaction);
          senderCard.card_amount -= amount;
      } else if (card_number == 'From Wallet') {
          const senderWallet = sender.details.find((detail) => detail.wallet && detail.wallet.length > 0);
          const senderTransaction = {
              date: new Date(),
              send_to: send_to,
              receiver_name: receiver ? receiver.firstName + ' ' + receiver.lastName : 'Unknown',
              amount: amount,
              payment_mode: card_number,
              category: category || '',
          };

          senderWallet.wallet.push(senderTransaction);
          senderWallet.wallet[0].amount -= amount;
      }
      await foundUser.save();
      return res.status(200).json({ message: 'Transaction Successful to category' });
    } catch (error) {
        console.error(error);
    }
});

module.exports = router;
