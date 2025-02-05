const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username:  { type: String, required: true },
    firstname: { type: String, required: true },
    lastname:  { type: String, required: true },
    password:  { type: String, required: true },
    createdon: { type: String, default: () => new Date().toLocaleString() }
})

module.exports = mongoose.model('User', UserSchema)