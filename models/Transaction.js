const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    email: {
        type: String,
        require: true
    },
    from: {
        type: String,
        require: true
    },
    to: {
        type: String,
        require: true
    },
    currency: {
        type: String,
        require: true
    },
    hash: {
        type: String,
        require: true
    },
    status: {
        type: Boolean,
        default: false,
    }
},
    {
        timestamps: true
    });

module.exports = mongoose.model('Transaction', transactionSchema)