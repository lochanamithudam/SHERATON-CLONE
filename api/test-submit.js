require('dotenv').config();
const nodemailer = require('nodemailer');

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

        const gmailUser = process.env.GMAIL_USER || '';
        const gmailPass = process.env.GMAIL_PASS || '';

        let emailResult = { skipped: true };
        if (gmailUser && gmailPass) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: gmailUser, pass: gmailPass },
                tls: { rejectUnauthorized: false }
            });

            try {
                const info = await transporter.sendMail({
                    from: `"Sheraton Hotels" <${gmailUser}>`,
                    to: [email, gmailUser].filter(Boolean).join(','),
                    subject: 'Test Submission Confirmation',
                    text: `Hello ${name}, your request for ${preferredDate || 'today'} ${preferredTime || ''} was received!`
                });
                emailResult = { sent: true, response: info.response };
            } catch (err) {
                emailResult = { error: err.message };
            }
        }

        return res.status(200).json({
            status: 'success',
            message: emailResult.sent ? 'Data received & test email sent successfully!' : 'Data received successfully!',
            emailResult
        });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};
