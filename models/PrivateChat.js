const mongoose = require('mongoose')

const PrivateChatSchema = new mongoose.Schema({
    from_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to_user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message:   { type: String, required: true },
    date_sent: { type: String, default: () => new Date().toLocaleString() }
})

module.exports = mongoose.model('PrivateChat', PrivateChatSchema)