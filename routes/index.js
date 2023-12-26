var express = require('express');
var router = express.Router();
const userModel = require('./users');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const cardValidator = require('./card-validator');
const jwt = require('jsonwebtoken');
let otp;
const secretKey = 'financeApp';

router.post('/generate-otp', async (req, res) => {
    const { currentUserMail } = req.body;
    if (currentUserMail !== undefined) {
        var transport = nodemailer.createTransport({
            host: 'mail.proexelancers.com',
            port: 465,
            auth: {
                user: 'shreekrushna.shinde@proexelancers.com',
                pass: 'Shreekrushna@123',
            },
        });
        otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false, digits: true });
        var mailOptions = {
            from: 'shreekrushna.shinde@proexelancers.com',
            to: `${currentUserMail}`,
            subject: 'OTP verification | Finance App',
            html: `
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8f8f8;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .header h1 {
            color: #007bff;
        }

        .content {
            padding: 20px;
            text-align: center;
        }

        .otp {
            font-size: 36px;
            font-weight: bold;
            color: #28a745;
            border: 2px solid #28a745;
            border-radius: 8px;
            padding: 10px;
            display: inline-block;
        }

        .footer {
            margin-top: 20px;
            text-align: center;
        }

        .footer p {
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>OTP Verification | Finance App</h1>
        </div>
        <div class="content">
            <p>Your One-Time Password (OTP) is<br><span class="otp">${otp}</span></p>
        </div>
        <div class="footer">
            <p>This email is sent from Finance App. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
            `,
        };

        transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            res.send(info);
        });
    } else {
        res.status(400).json({ message: 'Internal Server Error! Please try again' });
    }
});

router.post('/verify-otp', (req, res) => {
    const { userOtp } = req.body;
    if (userOtp == otp) {
        res.status(200).json({ message: 'OTP Verified', OTP: true });
    } else {
        res.status(401).json({ message: 'Otp is incorrect' });
    }
});

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const newUser = await userModel.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
    });
    const payload = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password: newUser.password,
    };
    const token = jwt.sign(payload, secretKey);
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            console.error('JWT verification failed:', err.message);
        } else {
            console.log('Decoded JWT:', decoded);
        }
    });
    res.status(200).json({ message: 'User Succesfully Registered', userData: newUser, token: token });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const userDetails = await userModel.findOne({ email });
    if (!userDetails) {
        res.status(401).json({ message: 'User not exist' });
        return;
    }
    if (userDetails.password !== password) {
        res.status(401).json({ message: 'Email/Password is invalid' });
        return;
    }
    const payload = {
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        email: userDetails.email,
        password: userDetails.password,
    };
    const token = jwt.sign(payload, secretKey);
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            console.error('JWT verification failed:', err.message);
        } else {
            console.log('Decoded JWT:', decoded);
        }
    });
    res.status(200).json({ message: 'User login success', token: token });
});

router.get('/financeUsers', async (req, res) => {
    const allUsers = await userModel.find();
    res.send(allUsers);
});

router.post('/check-card-type', function (req, res) {
    const { cardNumber } = req.body;
    // const cardNumber = '4032036062670946';
    const cardType = cardValidator(cardNumber);
    res.send(cardType);
});

router.put('/update-profile', async function (req, res) {
    const { firstName, lastName, email, currentUserEmail } = req.body;
    let userDetails;

    try {
        if (email === currentUserEmail) {
            userDetails = await userModel.findOneAndUpdate(
                { email: email },
                {
                    $set: {
                        firstName: firstName,
                        lastName: lastName,
                    },
                },
                { new: true }
            );

            if (!userDetails) {
                return res.status(404).send('User not found');
            }
            const payload = {
                firstName: userDetails.firstName,
                lastName: userDetails.lastName,
                email: userDetails.email,
            };
            const token = jwt.sign(payload, secretKey);
            jwt.verify(token, secretKey, (err, decoded) => {
                if (err) {
                    console.error('JWT verification failed:', err.message);
                }
            });

            res.status(200).json({ userDetails, token: token });
        } else {
            userDetails = await userModel.findOne({ email: currentUserEmail });
            if (!userDetails) {
                return res.status(404).send('User not found');
            }
            userDetails = await userModel.findOneAndUpdate(
                { email: currentUserEmail },
                {
                    $set: {
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                    },
                },
                { new: true }
            );
            const payload = {
                firstName: userDetails.firstName,
                lastName: userDetails.lastName,
                email: userDetails.email,
            };
            const token = jwt.sign(payload, secretKey);
            jwt.verify(token, secretKey, (err, decoded) => {
                if (err) {
                    console.error('JWT verification failed:', err.message);
                }
            });
            res.status(200).json({ userDetails, token: token });
        }
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).send('Internal Server Error');
    }
});

router.put('/update-password', async (req, res) => {
    const { oldpassword, newpassword, email } = req.body;
    const foundUser = await userModel.findOne({ email });
    if (!foundUser) {
        return res.status(404).json({ message: 'User Not Found' });
    }
    if (oldpassword !== foundUser.password) {
        return res.status(404).json({ message: 'Old Password Not Match' });
    }
    let userDetails;
    userDetails = await userModel.findOneAndUpdate({ email: email }, { $set: { password: newpassword } }, { new: true });
    res.status(200).json({ userDetails, message: 'Password Changed Success' });
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const foundUser = await userModel.findOne({ email });
        if (!foundUser) {
            res.status(401).json({
                message: 'User Not Registered',
            });
        }
        res.status(200).json({
            message: 'User Found',
            user_details: foundUser,
        });
    } catch {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put('/new-password', async (req, res) => {
    try {
        const { email, password } = req.body;
        const updatedUser = await userModel.findOneAndUpdate(
            { email: email },
            {
                $set: {
                    password: password,
                },
            },
            { new: true }
        );
        res.status(200).json({ message: 'Password Updated Successfully', updatedUser: updatedUser });
    } catch {}
});

module.exports = router;
