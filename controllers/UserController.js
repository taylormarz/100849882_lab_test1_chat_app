const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.createAccount = async (req, res) => {
    const { firstname, lastname, username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'This username is taken, please try another.' });
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

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password.' });
        }

        res.status(200).json({ message: 'Login successful!', user: { username } });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in.', error: error.message });
    }
};