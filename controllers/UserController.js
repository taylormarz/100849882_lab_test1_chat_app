const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.createAccount = async (req, res) => {
    const { firstname, lastname, username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'This username is taken, please select another.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstname,
            lastname,
            username,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'Your account was created successfully!', user: { username } });
    } catch (error) {
        res.status(500).json({ message: 'There was an error creating your account.', error: error.message });
    }
};