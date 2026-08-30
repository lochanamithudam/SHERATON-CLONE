require('dotenv').config();
const mongoose = require('mongoose');
const emailService = require('../services/emailService');

const dbURI = process.env.MONGODB_URI || process.env.MONGO_URI ||
    'mongodb+srv://lochanamithudam097_db_user:Mithu123456@cluster0.f51etmt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

let isConnected = false;
async function connectDB() {
    if (isConnected) return;
    try {
        await mongoose.connect(dbURI, { serverSelectionTimeoutMS: 5000 });
        isConnected = true;
    } catch (err) {
        console.warn('MongoDB connection warning:', err.message);
    }
}

const BookingSchema = new mongoose.Schema({
    guestName:     { type: String, required: true },
    guestEmail:    { type: String, required: true },
    roomType:      { type: String, required: true },
    checkIn:       { type: String },
    checkOut:      { type: String },
    checkInTime:   { type: String },
    hotelLocation: { type: String },
    totalPrice:    { type: String },
    bookedAt:      { type: Date, default: Date.now }
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ status: 'error', message: 'Method not allowed' });
    }

    try {
        const { guestName, guestEmail, roomType, checkIn, checkOut, checkInTime, hotelLocation, totalPrice } = req.body || {};

        if (!guestName || !guestEmail || !roomType) {
            return res.status(400).json({ status: 'error', message: 'Name, email, and room type are required.' });
        }

        await connectDB();

        if (isConnected) {
            try {
                const newBooking = new Booking({
                    guestName, guestEmail, roomType,
                    checkIn: checkIn || '', checkOut: checkOut || '',
                    checkInTime: checkInTime || '', hotelLocation: hotelLocation || '',
                    totalPrice: totalPrice || ''
                });
                await newBooking.save();
            } catch (dbErr) {
                console.warn('MongoDB save warning:', dbErr.message);
            }
        }

        const emailResult = await emailService.sendBookingNotification({
            guestName,
            guestEmail,
            roomType,
            checkIn,
            checkOut,
            checkInTime,
            hotelLocation,
            totalPrice
        }).catch(err => ({ sent: false, error: err.message }));

        let message = 'Booking processed successfully!';
        if (emailResult.sent) {
            message = 'Booking confirmed and confirmation email sent successfully!';
        } else if (emailResult.skipped) {
            message = 'Booking processed! (Email credentials not configured)';
        } else if (emailResult.error) {
            message = `Booking processed! Email notice: ${emailResult.error}`;
        }

        return res.status(200).json({ status: 'success', message, emailResult });
    } catch (error) {
        console.error('Booking endpoint error:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to process booking.' });
    }
};
