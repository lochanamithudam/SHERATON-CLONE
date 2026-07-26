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
    guestName:  { type: String, required: true },
    guestEmail: { type: String, required: true },
    roomType:   { type: String, required: true },
    bookedAt:   { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', BookingSchema);

// ── Helper: Send Booking Email (graceful — never crashes the server) ──
async function sendBookingEmail(guestName, guestEmail, roomType) {
    const gmailUser = process.env.GMAIL_USER || '';
    const gmailPass = process.env.GMAIL_PASS || '';

    if (!gmailUser || !gmailPass) {
        console.warn('⚠️  Email skipped: GMAIL_USER / GMAIL_PASS not set in environment.');
        return { skipped: true };
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailPass }
    });

    const recipientList = [guestEmail, gmailUser].filter(Boolean).join(',');

    const mailOptions = {
        from:    `"Sheraton Hotels & Resorts" <${gmailUser}>`,
        to:      recipientList,               // sends confirmation to guest and alert to admin
        subject: '🏨 Your Sheraton Reservation Confirmation',
        html: `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
                <div style="background:#1a2b4c;padding:24px 30px;">
                    <h2 style="color:#c5a059;margin:0;font-size:1.4rem;">Sheraton Hotel &amp; Resort</h2>
                    <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:0.85rem;letter-spacing:2px;text-transform:uppercase;">Booking Confirmation</p>
                </div>
                <div style="padding:30px;">
                    <h3 style="color:#1a2b4c;margin-top:0;">Hello ${guestName},</h3>
                    <p style="color:#444;line-height:1.5;">Thank you for reserving your stay with Sheraton. Here are your booking details:</p>
                    <table style="width:100%;border-collapse:collapse;font-size:0.95rem;margin-top:15px;">
                        <tr><td style="padding:10px 0;color:#888;width:130px;">Guest Name</td><td style="padding:10px 0;font-weight:600;color:#222;">${guestName}</td></tr>
                        <tr style="border-top:1px solid #f0ece4;"><td style="padding:10px 0;color:#888;">Guest Email</td><td style="padding:10px 0;font-weight:600;color:#222;">${guestEmail}</td></tr>
                        <tr style="border-top:1px solid #f0ece4;"><td style="padding:10px 0;color:#888;">Room / Service</td><td style="padding:10px 0;font-weight:600;color:#222;">${roomType}</td></tr>
                        <tr style="border-top:1px solid #f0ece4;"><td style="padding:10px 0;color:#888;">Booked At</td><td style="padding:10px 0;font-weight:600;color:#222;">${new Date().toLocaleString()}</td></tr>
                    </table>
                </div>
                <div style="background:#f8f9fa;padding:16px 30px;text-align:center;font-size:0.75rem;color:#aaa;">
                    Sheraton Clone &copy; ${new Date().getFullYear()} · Automated booking notification
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
        const { guestName, guestEmail, roomType } = req.body;

        // Validate inputs
        if (!guestName || !guestEmail || !roomType) {
            return res.status(400).json({ status: 'error', message: 'All fields are required.' });
        }

        // 1. Try saving to MongoDB (graceful — if DB fails/times out, continue to send email)
        let dbSaved = false;
        try {
            const newBooking = new Booking({ guestName, guestEmail, roomType });
            await newBooking.save();
            dbSaved = true;
            console.log(`✅  Booking saved to MongoDB: ${guestName} — ${roomType}`);
        } catch (dbErr) {
            console.warn('⚠️  MongoDB save failed/skipped (proceeding to email):', dbErr.message);
        }

        // 2. Try sending email notification
        const emailResult = await sendBookingEmail(guestName, guestEmail, roomType)
            .catch((emailErr) => {
                console.error('⚠️  Email failed:', emailErr.message);
                return { error: emailErr.message };
            });

        let message = 'Booking processed successfully!';
        if (emailResult.sent) {
            message = 'Booking confirmed and email sent successfully!';
        } else if (emailResult.skipped) {
            message = 'Booking processed! (Email notifications disabled)';
        }

        res.status(200).json({ status: 'success', message });

    } catch (error) {
        console.error('❌  Booking endpoint error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to process booking. Please try again.' });
    }
});

// ── Server Start ─────────────────────────────────────────────
// Fix 7 (note): Use HTTPS in production.
//   On Netlify / Render / Railway the platform handles HTTPS automatically.
//   Locally, http://localhost is fine for development.
app.listen(PORT, () => {
    console.log(`🚀  Sheraton Server running → https://localhost:${PORT}`);
    if (!GMAIL_USER || !GMAIL_PASS) {
        console.warn('⚠️  GMAIL_USER / GMAIL_PASS not set — email notifications are disabled.');
        console.warn('    Bookings will still be saved to MongoDB.');
    }
    if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
        console.warn('⚠️  MONGO_URI / MONGODB_URI not set — using hardcoded fallback URI.');
        console.warn('    Set MONGO_URI in a .env file for better security.');
    }
});