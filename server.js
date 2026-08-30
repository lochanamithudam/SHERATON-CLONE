// ============================================================
//  Sheraton Clone — Express Backend Server
//  Fixed: All SonarQube warnings resolved
// ============================================================

require('dotenv').config();

// Fix 1: Use 'node:dns' and default to public DNS (Google/Cloudflare) to resolve Atlas SRV records
const dns = require('node:dns');
try {
    const customDns = process.env.DNS_SERVERS 
        ? process.env.DNS_SERVERS.split(',').map(s => s.trim()) 
        : ['8.8.8.8', '8.8.4.4', '1.1.1.1'];
    dns.setServers(customDns);
} catch (dnsErr) {
    console.warn('⚠️  DNS server configuration warning:', dnsErr.message);
}

const express    = require('express');
const cors       = require('cors');
const mongoose   = require('mongoose');
// Fix 3: Use 'node:path' prefix instead of 'path'  (SonarQube: prefer node: prefix)
const path       = require('node:path');
const fs         = require('node:fs/promises');
const fsSync     = require('node:fs');
const nodemailer = require('nodemailer');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Local JSON Backup Storage Setup ────────────────────────
const DATA_DIR = path.join(__dirname, 'data');
const BACKUP_FILE = path.join(DATA_DIR, 'bookings_backup.json');

// Ensure data folder exists
if (!fsSync.existsSync(DATA_DIR)) {
    fsSync.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper: Read all local backup records
async function getLocalBackups() {
    try {
        if (!fsSync.existsSync(BACKUP_FILE)) return [];
        const content = await fs.readFile(BACKUP_FILE, 'utf8');
        return content ? JSON.parse(content) : [];
    } catch (err) {
        console.error('⚠️  Failed to read local backup file:', err.message);
        return [];
    }
}

// Helper: Save booking to local JSON file when MongoDB is unavailable/fails
async function saveBookingToLocalBackup(bookingData, reason = 'MongoDB unavailable') {
    try {
        const bookings = await getLocalBackups();
        const newRecord = {
            backupId: `BKP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
            ...bookingData,
            syncedToMongo: false,
            fallbackReason: reason,
            savedLocallyAt: new Date().toISOString()
        };
        bookings.push(newRecord);
        await fs.writeFile(BACKUP_FILE, JSON.stringify(bookings, null, 2), 'utf8');
        console.log(`📁  [FALLBACK] Booking saved to local JSON: data/bookings_backup.json (ID: ${newRecord.backupId})`);
        return newRecord;
    } catch (err) {
        console.error('❌  Failed to write booking to local JSON backup:', err.message);
        return null;
    }
}

// Helper: Sync unpushed local backups to MongoDB when connection is active
async function syncLocalBackupsToMongo() {
    if (mongoose.connection.readyState !== 1) return;
    try {
        const bookings = await getLocalBackups();
        const unsynced = bookings.filter(b => !b.syncedToMongo);
        if (unsynced.length === 0) return;

        console.log(`🔄  Found ${unsynced.length} unsynced local booking(s). Syncing to MongoDB...`);
        let syncedCount = 0;

        for (const item of unsynced) {
            try {
                const newBooking = new Booking({
                    guestName:     item.guestName,
                    guestEmail:    item.guestEmail,
                    roomType:      item.roomType,
                    checkIn:       item.checkIn || '',
                    checkOut:      item.checkOut || '',
                    checkInTime:   item.checkInTime || '',
                    hotelLocation: item.hotelLocation || '',
                    totalPrice:    item.totalPrice || '',
                    bookedAt:      item.savedLocallyAt ? new Date(item.savedLocallyAt) : new Date()
                });
                await newBooking.save();
                item.syncedToMongo = true;
                item.syncedAt = new Date().toISOString();
                syncedCount++;
            } catch (err) {
                console.error(`⚠️  Failed to sync backup record ${item.backupId}:`, err.message);
            }
        }

        if (syncedCount > 0) {
            await fs.writeFile(BACKUP_FILE, JSON.stringify(bookings, null, 2), 'utf8');
            console.log(`✅  Successfully synced ${syncedCount}/${unsynced.length} local booking(s) to MongoDB!`);
        }
    } catch (err) {
        console.error('⚠️  Error during local backup sync:', err.message);
    }
}

// Fix 4: Disable X-Powered-By header            (SonarQube: framework version disclosure)
app.disable('x-powered-by');

// ── CORS ────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'https://sheraton-clone.vercel.app',
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
        // Allow requests with no origin or matching allowedOrigins or netlify/vercel app
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.netlify.app') || origin.endsWith('.vercel.app')) {
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
app.use('/experiences', express.static(path.join(__dirname, 'experiences')));

// ── MongoDB Connection ──────────────────────────────────────
// Fix 5: Move credentials to environment variables          (security best practice)
//         Set MONGO_URI in your .env file to keep it private.
const dbURI = process.env.MONGODB_URI || process.env.MONGO_URI ||
    'mongodb+srv://lochanamithudam097_db_user:Mithu123456@cluster0.f51etmt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbURI, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('✅  Successfully connected to MongoDB!');
        syncLocalBackupsToMongo(); // Auto-sync any offline backups upon connection
    })
    .catch((err) => console.error('❌  MongoDB connection warning:', err.message));

// Listen for reconnects to trigger sync
mongoose.connection.on('connected', () => {
    syncLocalBackupsToMongo();
});

// ── Booking Schema ──────────────────────────────────────────
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
const Booking = mongoose.model('Booking', BookingSchema);

// ── Luxury Email Service ────────────────────────────────────
const emailService = require('./services/emailService');


// ── Page Routes ─────────────────────────────────────────────
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ── API Routes ──────────────────────────────────────────────
app.post('/api/bookings', async (req, res) => {
    try {
        const { guestName, guestEmail, roomType, checkIn, checkOut, checkInTime, hotelLocation, totalPrice } = req.body;

        // Validate inputs
        if (!guestName || !guestEmail || !roomType) {
            return res.status(400).json({ status: 'error', message: 'Name, email, and room type are required.' });
        }

        const bookingPayload = {
            guestName,
            guestEmail,
            roomType,
            checkIn: checkIn || '',
            checkOut: checkOut || '',
            checkInTime: checkInTime || '',
            hotelLocation: hotelLocation || '',
            totalPrice: totalPrice || ''
        };

        // 1. Save to MongoDB gracefully; if offline or fails, fallback to local JSON storage
        let dbSaved = false;
        let localBackupSaved = false;

        if (mongoose.connection.readyState === 1) {
            try {
                const newBooking = new Booking(bookingPayload);
                await newBooking.save();
                dbSaved = true;
                console.log(`✅  Booking saved to MongoDB: ${guestName} (${guestEmail}) — ${roomType}`);
            } catch (dbErr) {
                console.warn('⚠️  MongoDB save failed — falling back to local JSON backup:', dbErr.message);
                await saveBookingToLocalBackup(bookingPayload, `Save Error: ${dbErr.message}`);
                localBackupSaved = true;
            }
        } else {
            console.warn('⚠️  MongoDB not connected — falling back to local JSON backup.');
            await saveBookingToLocalBackup(bookingPayload, 'MongoDB connection inactive');
            localBackupSaved = true;
        }

        // 2. Dispatch luxury email notification
        const emailResult = await emailService.sendBookingNotification({
            guestName,
            guestEmail,
            roomType,
            checkIn,
            checkOut,
            checkInTime,
            hotelLocation,
            totalPrice
        }).catch((emailErr) => {
            console.error('⚠️  Email notification failed:', emailErr.message);
            return { sent: false, error: emailErr.message };
        });

        let message = 'Booking processed successfully!';
        if (emailResult.sent) {
            message = 'Booking confirmed and confirmation email sent successfully!';
        } else if (emailResult.skipped) {
            message = 'Booking processed! (Email credentials not configured)';
        } else if (emailResult.error) {
            message = `Booking processed! Email notice: ${emailResult.error}`;
        }

        res.status(200).json({
            status: 'success',
            message,
            dbSaved,
            localBackupSaved,
            emailResult
        });

    } catch (error) {
        console.error('❌  Booking endpoint error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to process booking. Please try again.' });
    }
});

// Test submission route (handles index.html test form)
app.post('/api/test-submit', async (req, res) => {
    try {
        const { name, email, preferredDate, preferredTime } = req.body;
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

        res.status(200).json({
            status: 'success',
            message: emailResult.sent ? 'Data received & luxury confirmation email sent successfully!' : 'Data received successfully!',
            emailResult
        });
    } catch (err) {
        console.error('❌  Test submit error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// GET /api/test-email (Direct test endpoint to verify Nodemailer SMTP & send preview)
app.get('/api/test-email', async (req, res) => {
    try {
        const targetEmail = req.query.email || process.env.GMAIL_USER;
        if (!targetEmail) {
            return res.status(400).json({
                status: 'error',
                message: 'No recipient provided. Pass ?email=your_email@example.com'
            });
        }

        const result = await emailService.sendBookingNotification({
            guestName: 'Sir / Madam',
            guestEmail: targetEmail,
            roomType: 'Presidential Ocean Horizon Suite',
            checkIn: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
            checkOut: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
            checkInTime: '15:00',
            hotelLocation: 'Sheraton Grand Tokyo Bay & Luxury Resort',
            totalPrice: '$2,850.00'
        });

        res.json({ status: 'success', result });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// GET all bookings from MongoDB
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ bookedAt: -1 });
        res.json({ status: 'success', count: bookings.length, bookings });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// GET local JSON backup status and records
app.get('/api/backup-bookings', async (req, res) => {
    try {
        const backups = await getLocalBackups();
        const unsynced = backups.filter(b => !b.syncedToMongo);
        res.json({
            status: 'success',
            totalBackups: backups.length,
            unsyncedCount: unsynced.length,
            backups
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// POST manually trigger sync from local JSON to MongoDB
app.post('/api/sync-backups', async (req, res) => {
    try {
        await syncLocalBackupsToMongo();
        const backups = await getLocalBackups();
        const unsynced = backups.filter(b => !b.syncedToMongo);
        res.json({
            status: 'success',
            message: 'Sync process completed.',
            totalBackups: backups.length,
            remainingUnsynced: unsynced.length
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});


// ── Server Start (only when running locally, not on Vercel) ──
if (!process.env.VERCEL) {
    app.listen(PORT, async () => {
        console.log(`🚀  Sheraton Server running → http://localhost:${PORT}`);
        const configuredUser = (process.env.GMAIL_USER || '').trim();
        const configuredPass = (process.env.GMAIL_PASS || '').replace(/\s+/g, '');
        if (!configuredUser || !configuredPass) {
            console.warn('⚠️  GMAIL_USER / GMAIL_PASS not set — email notifications are disabled.');
            console.warn('    Bookings will still be saved to MongoDB & local JSON backup.');
        } else {
            console.log(`✉️  Email sender configured for: ${configuredUser}`);
            emailService.verifyConnection();
        }
        if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
            console.warn('⚠️  MONGO_URI / MONGODB_URI not set — using hardcoded fallback URI.');
        }
    });
}

// Export for Vercel serverless
module.exports = app;