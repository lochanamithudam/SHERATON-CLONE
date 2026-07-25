const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

const express = require('express');
const cors = require('cors'); 
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Static Files (Images, CSS, Sub-folders) Serve කිරීම
app.use(express.static(__dirname));
app.use('/Gallery', express.static(path.join(__dirname, 'Gallery')));
app.use('/Rooms', express.static(path.join(__dirname, 'Rooms')));

// MongoDB Connection
const dbURI = 'mongodb+srv://lochanamithudam097_db_user:Mithu123456@cluster0.f51etmt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbURI)
    .then(() => console.log('Successfully connected to MongoDB Database!'))
    .catch((err) => console.log('Database connection error:', err));

// Database Schemas
const UserSchema = new mongoose.Schema({ name: String, email: String });
const User = mongoose.model('User', UserSchema);

const BookingSchema = new mongoose.Schema({
    guestName: String,
    guestEmail: String,
    roomType: String,
    bookedAt: { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', BookingSchema);

// ================= PAGE ROUTES ================= //

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/gallery.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'Gallery', 'gallery.html'));
});

app.get('/rooms.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'Rooms', 'rooms.html'));
});

app.get('/dining.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'dining.html'));
});

// ================= API ROUTES ================= //

app.post('/api/bookings', async (req, res) => {
    try {
        const newBooking = new Booking({
            guestName: req.body.guestName,
            guestEmail: req.body.guestEmail,
            roomType: req.body.roomType
        });
        await newBooking.save();
        res.status(200).json({ status: "success", message: "Booking saved successfully to MongoDB!" });
    } catch (error) {
        console.error("Booking error:", error);
        res.status(500).json({ status: "error", message: "Failed to save booking data." });
    }
});

app.post('/api/test-submit', async (req, res) => {
    try {
        const newUser = new User({
            name: req.body.name,
            email: req.body.email
        });
        await newUser.save();
        res.status(200).json({ status: "success", message: "Data saved successfully to MongoDB!" });
    } catch (error) {
        console.error("Error saving to database:", error);
        res.status(500).json({ status: "error", message: "Failed to save data." });
    }
});

// Server Start
app.listen(PORT, () => {
    console.log(`Sheraton Backend Server is running! URL: http://localhost:${PORT}`);
});