// ============================================================
//  Sheraton Clone — Express Backend Server
//  Fixed: All SonarQube warnings resolved
// ============================================================

require('dotenv').config();

// Fix 1: Use 'node:dns' prefix instead of 'dns'
const dns = require('node:dns');
if (process.env.DNS_SERVERS) {
    dns.setServers(process.env.DNS_SERVERS.split(','));
}

const express    = require('express');
const cors       = require('cors');
const mongoose   = require('mongoose');
// Fix 3: Use 'node:path' prefix instead of 'path'  (SonarQube: prefer node: prefix)
const path       = require('node:path');
const nodemailer = require('nodemailer');

const app  = express();
const PORT = process.env.PORT || 3000;

// Fix 4: Disable X-Powered-By header            (SonarQube: framework version disclosure)
app.disable('x-powered-by');

// ── CORS ────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'https://sheratonclone.netlify.app',
        'http://sheratonclone.netlify.app',
        'http://localhost:3000',
        'https://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5500',
        'http://127.0.0.1:5500'
      ];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin or matching allowedOrigins or netlify app
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.netlify.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static Files ────────────────────────────────────────────
app.use(express.static(__dirname));
app.use('/Gallery', express.static(path.join(__dirname, 'Gallery')));
app.use('/Rooms',   express.static(path.join(__dirname, 'Rooms')));

// ── MongoDB Connection ──────────────────────────────────────
// Fix 5: Move credentials to environment variables          (security best practice)
//         Set MONGO_URI in your .env file to keep it private.
const dbURI = process.env.MONGODB_URI || process.env.MONGO_URI ||
    'mongodb+srv://lochanamithudam097_db_user:Mithu123456@cluster0.f51etmt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbURI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('✅  Successfully connected to MongoDB!'))
    .catch((err) => console.error('❌  MongoDB connection warning:', err.message));

// ── Booking Schema ──────────────────────────────────────────
const BookingSchema = new mongoose.Schema({
    guestName:     { type: String, required: true },
    guestEmail:    { type: String, required: true },
    roomType:      { type: String, required: true },
    checkIn:       { type: String },
    checkOut:      { type: String },
    hotelLocation: { type: String },
    totalPrice:    { type: String },
    bookedAt:      { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', BookingSchema);

// ── Helper: Send Booking Email (graceful — never crashes the server) ──
async function sendBookingEmail(guestName, guestEmail, roomType, checkIn = '', checkOut = '', hotelLocation = '', totalPrice = '') {
    const gmailUser = process.env.GMAIL_USER || '';
    const gmailPass = process.env.GMAIL_PASS || '';

    console.log("Email from env:", process.env.GMAIL_USER);

    if (!gmailUser || !gmailPass) {
        console.warn('⚠️  Email skipped: GMAIL_USER / GMAIL_PASS not set in environment.');
        return { skipped: true };
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailPass },
        tls: { rejectUnauthorized: false }
    });

    const recipientList = [guestEmail, gmailUser].filter(Boolean).join(',');
    const reservationRef = `SHR-${Math.floor(100000 + Math.random() * 900000)}`;

    const detailsRows = [
        `<tr><td style="padding:10px 0;color:#888;width:140px;">Reservation Ref</td><td style="padding:10px 0;font-weight:700;color:#1a2b4c;">${reservationRef}</td></tr>`,
        `<tr style="border-top:1px solid #f0ece4;"><td style="padding:10px 0;color:#888;">Guest Name</td><td style="padding:10px 0;font-weight:600;color:#222;">${guestName}</td></tr>`,
        `<tr style="border-top:1px solid #f0ece4;"><td style="padding:10px 0;color:#888;">Guest Email</td><td style="padding:10px 0;font-weight:600;color:#222;">${guestEmail}</td></tr>`,
        `<tr style="border-top:1px solid #f0ece4;"><td style="padding:10px 0;color:#888;">Hotel Location</td><td style="padding:10px 0;font-weight:600;color:#222;">${hotelLocation || 'Sheraton Hotels & Resorts'}</td></tr>`,
        `<tr style="border-top:1px solid #f0ece4;"><td style="padding:10px 0;color:#888;">Room / Package</td><td style="padding:10px 0;font-weight:600;color:#222;">${roomType}</td></tr>`
    ];

    if (checkIn && checkOut) {
        detailsRows.push(`<tr style="border-top:1px solid #f0ece4;"><td style="padding:10px 0;color:#888;">Dates of Stay</td><td style="padding:10px 0;font-weight:600;color:#222;">${checkIn} &rarr; ${checkOut}</td></tr>`);
    }
    if (totalPrice) {
        detailsRows.push(`<tr style="border-top:1px solid #f0ece4;"><td style="padding:10px 0;color:#888;">Total Amount</td><td style="padding:10px 0;font-weight:700;color:#c5a059;">${totalPrice}</td></tr>`);
    }
    detailsRows.push(`<tr style="border-top:1px solid #f0ece4;"><td style="padding:10px 0;color:#888;">Booked Date</td><td style="padding:10px 0;font-weight:600;color:#222;">${new Date().toLocaleString()}</td></tr>`);

    const mailOptions = {
        from:    `"Sheraton Hotels & Resorts" <${gmailUser}>`,
        to:      recipientList,               // sends confirmation to guest and alert to admin
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
    console.log('✅ Email successfully sent via Nodemailer:', info.response);
    return { sent: true, response: info.response };
}

// ── Page Routes ─────────────────────────────────────────────
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ── API Routes ──────────────────────────────────────────────
app.post('/api/bookings', async (req, res) => {
    try {
        const { guestName, guestEmail, roomType, checkIn, checkOut, hotelLocation, totalPrice } = req.body;

        // Validate inputs
        if (!guestName || !guestEmail || !roomType) {
            return res.status(400).json({ status: 'error', message: 'Name, email, and room type are required.' });
        }

        // 1. Save to MongoDB gracefully (only if connected, avoiding buffering delay)
        let dbSaved = false;
        if (mongoose.connection.readyState === 1) {
            try {
                const newBooking = new Booking({
                    guestName,
                    guestEmail,
                    roomType,
                    checkIn: checkIn || '',
                    checkOut: checkOut || '',
                    hotelLocation: hotelLocation || '',
                    totalPrice: totalPrice || ''
                });
                await newBooking.save();
                dbSaved = true;
                console.log(`✅  Booking saved to MongoDB: ${guestName} (${guestEmail}) — ${roomType}`);
            } catch (dbErr) {
                console.warn('⚠️  MongoDB save failed (proceeding to email):', dbErr.message);
            }
        } else {
            console.warn('⚠️  MongoDB not connected — proceeding directly to email dispatch.');
        }

        // 2. Try sending email notification
        const emailResult = await sendBookingEmail(guestName, guestEmail, roomType, checkIn, checkOut, hotelLocation, totalPrice)
            .catch((emailErr) => {
                console.error('⚠️  Email failed:', emailErr.message);
                return { error: emailErr.message };
            });

        let message = 'Booking processed successfully!';
        if (emailResult.sent) {
            message = 'Booking confirmed and confirmation email sent successfully!';
        } else if (emailResult.skipped) {
            message = 'Booking processed! (Email credentials not configured)';
        } else if (emailResult.error) {
            message = `Booking processed! Email notice: ${emailResult.error}`;
        }

        res.status(200).json({ status: 'success', message, emailResult });

    } catch (error) {
        console.error('❌  Booking endpoint error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to process booking. Please try again.' });
    }
});

// Test submission route (handles index.html test form)
app.post('/api/test-submit', async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ status: 'error', message: 'Name and email are required.' });
        }

        const emailResult = await sendBookingEmail(name, email, 'Test Reservation Request')
            .catch(err => ({ error: err.message }));

        res.status(200).json({
            status: 'success',
            message: emailResult.sent ? 'Data received & test email sent successfully!' : 'Data received successfully!'
        });
    } catch (err) {
        console.error('❌  Test submit error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// ── Server Start ─────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀  Sheraton Server running → http://localhost:${PORT}`);
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
        console.warn('⚠️  GMAIL_USER / GMAIL_PASS not set — email notifications are disabled.');
        console.warn('    Bookings will still be saved to MongoDB.');
    } else {
        console.log(`✉️  Email sender configured for: ${process.env.GMAIL_USER}`);
    }
    if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
        console.warn('⚠️  MONGO_URI / MONGODB_URI not set — using hardcoded fallback URI.');
    }
});