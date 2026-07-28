require('dotenv').config();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

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

async function sendBookingEmail(guestName, guestEmail, roomType, checkIn = '', checkOut = '', hotelLocation = '', totalPrice = '', checkInTime = '') {
    const gmailUser = process.env.GMAIL_USER || '';
    const gmailPass = process.env.GMAIL_PASS || '';

    if (!gmailUser || !gmailPass) {
        console.warn('⚠️ Email skipped: GMAIL_USER / GMAIL_PASS not set.');
        return { skipped: true };
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailPass },
        tls: { rejectUnauthorized: false }
    });

    const recipientList = [guestEmail, gmailUser].filter(Boolean).join(',');
    const reservationRef = `SHR-${Math.floor(100000 + Math.random() * 900000)}`;

    const formattedBookedTime = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium',
        hour12: true
    });

    const detailsRows = [
        `<tr><td style="padding:10px 0;color:#888;width:160px;">Reservation Ref</td><td style="padding:10px 0;font-weight:700;color:#1a2b4c;">${reservationRef}</td></tr>`,
        `<tr style="border-top:1px solid #f0ece4;"><td style="padding:10px 0;color:#888;">Guest Name</td><td style="padding:10px 0;font-weight:600;color:#222;">${guestName}</td></tr>`,
        `<tr style="border-top:1px solid #f0ece4;"><td style="padding:10px 0;color:#888;">Guest Email</td><td style="padding:10px 0;font-weight:600;color:#222;">${guestEmail}</td></tr>`,
        `<tr style="border-top:1px solid #f0ece4;"><td style="padding:10px 0;color:#888;">Hotel Location</td><td style="padding:10px 0;font-weight:600;color:#222;">${hotelLocation || 'Sheraton Hotels & Resorts'}</td></tr>`,
        `<tr style="border-top:1px solid #f0ece4;"><td style="padding:10px 0;color:#888;">Room / Package</td><td style="padding:10px 0;font-weight:600;color:#222;">${roomType}</td></tr>`
    ];

    if (checkIn && checkOut) {
        const timeFormatted = checkInTime ? ` (Check-In Time: ${checkInTime})` : '';
        detailsRows.push(`<tr style="border-top:1px solid #f0ece4;"><td style="padding:10px 0;color:#888;">Dates of Stay</td><td style="padding:10px 0;font-weight:600;color:#222;">${checkIn}${timeFormatted} &rarr; ${checkOut}</td></tr>`);
    } else if (checkIn) {
        const timeFormatted = checkInTime ? ` at ${checkInTime}` : '';
        detailsRows.push(`<tr style="border-top:1px solid #f0ece4;"><td style="padding:10px 0;color:#888;">Reservation Date/Time</td><td style="padding:10px 0;font-weight:600;color:#222;">${checkIn}${timeFormatted}</td></tr>`);
    } else if (checkInTime) {
        detailsRows.push(`<tr style="border-top:1px solid #f0ece4;"><td style="padding:10px 0;color:#888;">Preferred Time</td><td style="padding:10px 0;font-weight:600;color:#222;">${checkInTime}</td></tr>`);
    }

    if (totalPrice) {
        detailsRows.push(`<tr style="border-top:1px solid #f0ece4;"><td style="padding:10px 0;color:#888;">Total Amount</td><td style="padding:10px 0;font-weight:700;color:#c5a059;">${totalPrice}</td></tr>`);
    }
    detailsRows.push(`<tr style="border-top:1px solid #f0ece4;"><td style="padding:10px 0;color:#888;">Booked Date & Time</td><td style="padding:10px 0;font-weight:600;color:#222;">${formattedBookedTime}</td></tr>`);

    const mailOptions = {
        from:    `"Sheraton Hotels & Resorts" <${gmailUser}>`,
        to:      recipientList,
        subject: `🏨 Sheraton Reservation Confirmed: ${reservationRef}`,
        html: `
            <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:580px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
                <div style="background:#1a2b4c;padding:28px 32px;text-align:center;">
                    <h1 style="color:#c5a059;margin:0;font-size:1.6rem;letter-spacing:1px;">SHERATON</h1>
                    <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:0.85rem;letter-spacing:3px;text-transform:uppercase;">Official Reservation Confirmation</p>
                </div>
                <div style="padding:32px;background:#ffffff;">
                    <h3 style="color:#1a2b4c;margin-top:0;font-size:1.2rem;">Dear ${guestName},</h3>
                    <p style="color:#4a5568;line-height:1.6;font-size:0.95rem;">
                        We are delighted to confirm your reservation with Sheraton. Your details have been registered in our system and are summarized below:
                    </p>
                    <table style="width:100%;border-collapse:collapse;font-size:0.95rem;margin-top:20px;">
                        ${detailsRows.join('\n')}
                    </table>
                    <div style="margin-top:28px;padding:16px;background:#f8fafc;border-left:4px solid #c5a059;border-radius:4px;">
                        <p style="margin:0;color:#2d3748;font-size:0.88rem;line-height:1.5;">
                            <strong>Need to modify your reservation?</strong> Reply to this email or visit our website anytime.
                        </p>
                    </div>
                </div>
                <div style="background:#f1f5f9;padding:18px 32px;text-align:center;font-size:0.78rem;color:#64748b;">
                    Sheraton Hotels & Resorts &copy; ${new Date().getFullYear()} · Automated Reservation System
                </div>
            </div>
        `
    };

    const info = await transporter.sendMail(mailOptions);
    return { sent: true, response: info.response };
}

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

        const emailResult = await sendBookingEmail(guestName, guestEmail, roomType, checkIn, checkOut, hotelLocation, totalPrice, checkInTime)
            .catch(err => ({ error: err.message }));

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
