const mongoose = require('mongoose');

const reservationsSchema = new mongoose.Schema({
    lab: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    seatId: { type: Number, required: true },
    anonymous: { type: Boolean, default: false },
    userName: { type: String, required: true },
});

const Reservations = mongoose.model('reservationsCollection', reservationsSchema);

module.exports = Reservations;
