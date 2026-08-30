require('dotenv').config();
const emailService = require('../services/emailService');

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
        const { name, email, preferredDate, preferredTime } = req.body || {};
        if (!name || !email) {
            return res.status(400).json({ status: 'error', message: 'Name and email are required.' });
        }

        const emailResult = await emailService.sendBookingNotification({
            guestName: name,
            guestEmail: email,
            roomType: 'Sheraton Experience & Dining Reservation',
            checkIn: preferredDate || '',
            checkInTime: preferredTime || '',
            hotelLocation: 'Sheraton Hotels & Resorts',
            totalPrice: '$150.00'
        }).catch(err => ({ sent: false, error: err.message }));

        return res.status(200).json({
            status: 'success',
            message: emailResult.sent ? 'Data received & luxury confirmation email sent successfully!' : 'Data received successfully!',
            emailResult
        });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};
