const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

const express = require('express');
const cors = require('cors'); 
const mongoose = require('mongoose');
const path = require('path');
const nodemailer = require('nodemailer'); // 1. Import Nodemailer for sending emails
const app = express();
const PORT = 3000;

app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Files (Images, CSS, Sub-folders)
app.use(express.static(__dirname));
app.use('/Gallery', express.static(path.join(__dirname, 'Gallery')));
app.use('/Rooms', express.static(path.join(__dirname, 'Rooms')));

// MongoDB Connection
const dbURI = 'mongodb+srv://lochanamithudam097_db_user:Mithu123456@cluster0.f51etmt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbURI)
    .then(() => console.log('Successfully connected to MongoDB Database!'))
    .catch((err) => console.log('Database connection error:', err));

// Database Schemas
const BookingSchema = new mongoose.Schema({
    guestName: String,
    guestEmail: String,
    roomType: String,
    bookedAt: { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', BookingSchema);

// 2. Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'lochanamithudam097@gmail.com',     // <-- Replace with your Gmail address
        pass: 'oniltrbdehxfubmj'         // <-- Replace with your Google App Password
    }
});

// ================= PAGE ROUTES ================= //

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ================= API ROUTES ================= //

app.post('/api/bookings', async (req, res) => {
    try {
        const { guestName, guestEmail, roomType } = req.body;

        // 1. Save the booking data to MongoDB
        const newBooking = new Booking({
            guestName,
            guestEmail,
            roomType
        });
        await newBooking.save();

        // 2. Send an email notification to your Gmail
        const mailOptions = {
            from: 'YOUR_EMAIL@gmail.com',
            to: 'lochanamithudam097@gmail.com', // <-- The Gmail address where you want to receive the booking alerts
            subject: 'New Hotel Room Booking Received!',
            html: `
                <h3>New Booking Details:</h3>
                <p><b>Guest Name:</b> ${guestName}</p>
                <p><b>Guest Email:</b> ${guestEmail}</p>
                <p><b>Room Type:</b> ${roomType}</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ status: "success", message: "Booking saved and email sent successfully!" });
    } catch (error) {
        console.error("Booking or Email error:", error);
        res.status(500).json({ status: "error", message: "Failed to process booking." });
    }
});

// Server Start
app.listen(PORT, () => {
    console.log(`Sheraton Backend Server is running! URL: http://localhost:${PORT}`);
});