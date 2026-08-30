// ============================================================
//  Sheraton Clone — Luxury Email Notification Service
//  Engineered with Nodemailer and Cross-Client HTML Styling
// ============================================================

require('dotenv').config();
const nodemailer = require('nodemailer');

/**
 * Configure and return a Nodemailer Transporter instance
 * Reads GMAIL_USER and GMAIL_PASS (or App Password) from process.env
 */
function createTransporter() {
    const user = (process.env.GMAIL_USER || '').trim();
    const pass = (process.env.GMAIL_PASS || '').replace(/\s+/g, '');

    if (!user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user,
            pass
        },
        tls: {
            rejectUnauthorized: false
        }
    });
}

/**
 * Verifies Nodemailer SMTP connectivity
 */
async function verifyConnection() {
    const transporter = createTransporter();
    if (!transporter) {
        console.warn('⚠️ [EMAIL SERVICE] SMTP Verification skipped: GMAIL_USER or GMAIL_PASS is not configured.');
        return { connected: false, reason: 'Credentials not configured' };
    }

    try {
        await transporter.verify();
        console.log('✅ [EMAIL SERVICE] SMTP Transporter connection successfully verified!');
        return { connected: true };
    } catch (error) {
        console.error('❌ [EMAIL SERVICE] SMTP Transporter verification failed:', error.message);
        return { connected: false, error: error.message };
    }
}

/**
 * Formats a currency number or string to a clean currency display
 */
function formatCurrency(price) {
    if (!price) return '$0.00';
    if (typeof price === 'string') {
        const cleaned = price.replace(/[^\d.,]/g, '').trim();
        if (price.includes('$') || price.includes('¥') || price.includes('€') || price.includes('£')) {
            return price;
        }
        if (cleaned) {
            const num = parseFloat(cleaned);
            return isNaN(num) ? price : `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        return price;
    }
    if (typeof price === 'number') {
        return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return String(price);
}

/**
 * Calculates itemized billing breakdown from raw booking parameters
 */
function calculateBillingBreakdown(totalPriceStr, checkIn, checkOut) {
    let rawTotal = 0;
    if (typeof totalPriceStr === 'number') {
        rawTotal = totalPriceStr;
    } else if (typeof totalPriceStr === 'string') {
        const clean = totalPriceStr.replace(/[^\d.]/g, '');
        rawTotal = parseFloat(clean) || 0;
    }

    // Determine number of nights
    let nights = 1;
    if (checkIn && checkOut) {
        const d1 = new Date(checkIn);
        const d2 = new Date(checkOut);
        const diffDays = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
        if (diffDays > 0) nights = diffDays;
    }

    // Calculate subtotal, luxury tax/service charges
    let baseRate = rawTotal > 0 ? (rawTotal * 0.85).toFixed(2) : '0.00';
    let taxesAndFees = rawTotal > 0 ? (rawTotal * 0.15).toFixed(2) : '0.00';
    let formattedTotal = rawTotal > 0 ? `$${rawTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : (totalPriceStr || '$0.00');

    return {
        nights,
        baseRate: `$${parseFloat(baseRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        taxesAndFees: `$${parseFloat(taxesAndFees).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        formattedTotal
    };
}

/**
 * Generates the Luxury Dark & Warm Gold HTML Email Template
 * Color scheme:
 * - Rich Dark Background: #0B192C
 * - Warm Gold Accents: #D4AF37 & #F3E5AB
 * - Card Surface: #12233C & #1A2F4C
 * - Clean Inline CSS for Gmail, Apple Mail, Outlook
 */
function generateLuxuryBookingEmailHTML(data) {
    const {
        guestName = 'Valued Guest',
        guestEmail = '',
        roomType = 'Sheraton Signature Suite',
        checkIn = '',
        checkOut = '',
        checkInTime = '15:00',
        hotelLocation = 'Sheraton Hotels & Resorts',
        totalPrice = '',
        reservationRef = `SHR-${Math.floor(100000 + Math.random() * 900000)}`,
        bookedAt = new Date()
    } = data;

    const formattedBookedDate = new Date(bookedAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        hour12: true
    });

    const billing = calculateBillingBreakdown(totalPrice, checkIn, checkOut);

    // High resolution banner image (Luxury Hotel Architecture / Suite)
    const heroImage = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop';

    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="dark light" />
    <meta name="supported-color-schemes" content="dark light" />
    <title>Sheraton Reservation Confirmation</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
        
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        
        body {
            margin: 0;
            padding: 0;
            width: 100% !important;
            min-width: 100%;
            background-color: #07101C;
            font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #E2E8F0;
        }

        @media only screen and (max-width: 620px) {
            .mobile-container { width: 100% !important; padding: 12px !important; }
            .mobile-stack { display: block !important; width: 100% !important; box-sizing: border-box !important; }
            .mobile-pad { padding: 20px 16px !important; }
            .mobile-title { font-size: 24px !important; }
            .hero-img { height: 180px !important; }
        }
    </style>
</head>
<body style="margin:0;padding:0;background-color:#07101C;font-family:'Montserrat',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
    
    <!-- Outer Wrapper -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:#07101C;width:100%;min-width:100%;">
        <tr>
            <td align="center" style="padding: 30px 10px;">
                
                <!-- Main Container (Max 620px) -->
                <table role="presentation" class="mobile-container" width="620" border="0" cellpadding="0" cellspacing="0" style="width:620px;max-width:620px;background-color:#0B192C;border-radius:16px;overflow:hidden;border:1px solid #1E3A5F;box-shadow:0 20px 50px rgba(0,0,0,0.5);">
                    
                    <!-- BRAND HEADER & CREST -->
                    <tr>
                        <td align="center" style="background: linear-gradient(180deg, #060E18 0%, #0B192C 100%); padding: 32px 20px 24px; border-bottom: 1px solid rgba(212, 175, 55, 0.2);">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <!-- Gold Sheraton Emblem -->
                                        <div style="display:inline-block;width:44px;height:44px;line-height:44px;border:1.5px solid #D4AF37;border-radius:50%;color:#D4AF37;font-size:22px;font-family:'Cormorant Garamond',Georgia,serif;font-weight:700;text-align:center;margin-bottom:8px;background:rgba(212,175,55,0.08);box-shadow:0 0 15px rgba(212,175,55,0.2);">
                                            S
                                        </div>
                                        <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:4px;color:#D4AF37;text-transform:uppercase;margin-top:4px;">
                                            SHERATON
                                        </div>
                                        <div style="font-size:9px;letter-spacing:3px;color:#94A3B8;text-transform:uppercase;margin-top:2px;">
                                            HOTELS & RESORTS &bull; LUXURY COLLECTION
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- HERO BANNER WITH OVERLAY -->
                    <tr>
                        <td style="padding:0;position:relative;background-color:#0B192C;">
                            <img src="${heroImage}" alt="Sheraton Luxury Hotel" width="620" class="hero-img" style="width:100%;max-width:620px;height:240px;object-fit:cover;display:block;" />
                        </td>
                    </tr>

                    <!-- CONFIRMATION STATUS BADGE & WELCOME -->
                    <tr>
                        <td class="mobile-pad" style="padding:32px 36px 20px;background-color:#0B192C;">
                            
                            <!-- Status Pill -->
                            <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="left">
                                        <div style="display:inline-block;padding:6px 14px;background:rgba(212,175,55,0.12);border:1px solid #D4AF37;border-radius:20px;color:#D4AF37;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;">
                                            &#10003; Reservation Confirmed
                                        </div>
                                    </td>
                                    <td align="right">
                                        <span style="font-size:12px;color:#64748B;">Ref: <strong style="color:#D4AF37;letter-spacing:0.5px;">${reservationRef}</strong></span>
                                    </td>
                                </tr>
                            </table>

                            <!-- Greeting -->
                            <h1 class="mobile-title" style="margin:22px 0 10px;font-family:'Cormorant Garamond',Georgia,serif;font-size:28px;font-weight:600;color:#F8FAFC;line-height:1.2;">
                                Experience the Extraordinary, <span style="color:#D4AF37;">${guestName}</span>
                            </h1>
                            <p style="margin:0 0 24px;font-size:13.5px;line-height:1.6;color:#94A3B8;">
                                We are truly honored to welcome you to <strong>${hotelLocation}</strong>. Your reservation is fully confirmed and our concierge team is preparing every detail to ensure an unforgettable stay.
                            </p>
                        </td>
                    </tr>

                    <!-- SECTION 1: GUEST & RESERVATION SNAPSHOT CARD -->
                    <tr>
                        <td style="padding: 0 36px 20px;" class="mobile-pad">
                            <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:#12233C;border-radius:12px;border:1px solid #1E3A5F;overflow:hidden;">
                                <tr>
                                    <td style="padding:14px 20px;background:#0E1B2E;border-bottom:1px solid #1E3A5F;">
                                        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="font-size:12px;font-weight:700;letter-spacing:1.5px;color:#D4AF37;text-transform:uppercase;">
                                                    &#128100; Guest Profile & Reference
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:16px 20px;">
                                        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size:13px;">
                                            <tr>
                                                <td width="38%" style="padding:6px 0;color:#64748B;font-weight:500;">Primary Guest</td>
                                                <td width="62%" style="padding:6px 0;color:#F1F5F9;font-weight:600;">${guestName}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:6px 0;color:#64748B;font-weight:500;">Email Address</td>
                                                <td style="padding:6px 0;color:#93C5FD;font-weight:500;">${guestEmail}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:6px 0;color:#64748B;font-weight:500;">Booking Reference</td>
                                                <td style="padding:6px 0;color:#D4AF37;font-weight:700;letter-spacing:0.5px;">${reservationRef}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:6px 0;color:#64748B;font-weight:500;">Booked Date & Time</td>
                                                <td style="padding:6px 0;color:#94A3B8;">${formattedBookedDate}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- SECTION 2: STAY DETAILS CARD -->
                    <tr>
                        <td style="padding: 0 36px 20px;" class="mobile-pad">
                            <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:#12233C;border-radius:12px;border:1px solid #1E3A5F;overflow:hidden;">
                                <tr>
                                    <td style="padding:14px 20px;background:#0E1B2E;border-bottom:1px solid #1E3A5F;">
                                        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="font-size:12px;font-weight:700;letter-spacing:1.5px;color:#D4AF37;text-transform:uppercase;">
                                                    &#127976; Stay & Accommodation Details
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:16px 20px;">
                                        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size:13px;">
                                            <tr>
                                                <td width="38%" style="padding:7px 0;color:#64748B;font-weight:500;">Property / Location</td>
                                                <td width="62%" style="padding:7px 0;color:#F1F5F9;font-weight:600;">${hotelLocation}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:7px 0;color:#64748B;font-weight:500;">Accommodation / Package</td>
                                                <td style="padding:7px 0;color:#F3E5AB;font-weight:600;">${roomType}</td>
                                            </tr>
                                            ${checkIn ? `
                                            <tr>
                                                <td style="padding:7px 0;color:#64748B;font-weight:500;">Check-In Date</td>
                                                <td style="padding:7px 0;color:#F1F5F9;font-weight:600;">
                                                    ${checkIn} ${checkInTime ? `<span style="color:#94A3B8;font-weight:400;">(${checkInTime})</span>` : ''}
                                                </td>
                                            </tr>` : ''}
                                            ${checkOut ? `
                                            <tr>
                                                <td style="padding:7px 0;color:#64748B;font-weight:500;">Check-Out Date</td>
                                                <td style="padding:7px 0;color:#F1F5F9;font-weight:600;">
                                                    ${checkOut} <span style="color:#94A3B8;font-weight:400;">(12:00 PM)</span>
                                                </td>
                                            </tr>` : ''}
                                            ${checkIn && checkOut ? `
                                            <tr>
                                                <td style="padding:7px 0;color:#64748B;font-weight:500;">Duration of Stay</td>
                                                <td style="padding:7px 0;color:#D4AF37;font-weight:600;">${billing.nights} Night${billing.nights > 1 ? 's' : ''}</td>
                                            </tr>` : ''}
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- SECTION 3: ITEMIZED BILLING SUMMARY & EYE-CATCHING TOTAL BOX -->
                    <tr>
                        <td style="padding: 0 36px 24px;" class="mobile-pad">
                            <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:#12233C;border-radius:12px;border:1px solid #1E3A5F;overflow:hidden;">
                                <tr>
                                    <td style="padding:14px 20px;background:#0E1B2E;border-bottom:1px solid #1E3A5F;">
                                        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="font-size:12px;font-weight:700;letter-spacing:1.5px;color:#D4AF37;text-transform:uppercase;">
                                                    &#128179; Itemized Billing Summary
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:20px;">
                                        <!-- Itemized Lines -->
                                        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size:13px;margin-bottom:16px;">
                                            <tr>
                                                <td style="padding:6px 0;color:#94A3B8;">Base Accommodation & Services (${billing.nights} Night${billing.nights > 1 ? 's' : ''})</td>
                                                <td align="right" style="padding:6px 0;color:#F1F5F9;font-weight:600;">${billing.baseRate}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:6px 0;color:#94A3B8;">Taxes & Luxury Resort Amenities Fee</td>
                                                <td align="right" style="padding:6px 0;color:#F1F5F9;font-weight:600;">${billing.taxesAndFees}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:6px 0;color:#94A3B8;">High-Speed Concierge Wi-Fi & Valet</td>
                                                <td align="right" style="padding:6px 0;color:#10B981;font-weight:600;">COMPLIMENTARY</td>
                                            </tr>
                                        </table>

                                        <!-- EYE-CATCHING TOTAL AMOUNT BOX -->
                                        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg, #1A2F4C 0%, #0F1E33 100%);border:1.5px solid #D4AF37;border-radius:10px;box-shadow:0 4px 20px rgba(212,175,55,0.15);">
                                            <tr>
                                                <td style="padding:16px 20px;">
                                                    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td valign="middle">
                                                                <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:#D4AF37;text-transform:uppercase;">
                                                                    Total Amount Due / Paid
                                                                </div>
                                                                <div style="font-size:11px;color:#94A3B8;margin-top:2px;">
                                                                    All applicable taxes and service fees included
                                                                </div>
                                                            </td>
                                                            <td align="right" valign="middle">
                                                                <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:28px;font-weight:700;color:#D4AF37;letter-spacing:0.5px;">
                                                                    ${billing.formattedTotal}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- VIP PERKS & PRIVILEGES -->
                    <tr>
                        <td style="padding: 0 36px 24px;" class="mobile-pad">
                            <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background:rgba(212,175,55,0.05);border:1px dashed rgba(212,175,55,0.4);border-radius:12px;padding:16px 20px;">
                                <tr>
                                    <td>
                                        <div style="font-size:11.5px;font-weight:700;letter-spacing:1.5px;color:#D4AF37;text-transform:uppercase;margin-bottom:8px;">
                                            &#10024; Your Sheraton Guest Privileges
                                        </div>
                                        <div style="font-size:12.5px;line-height:1.6;color:#CBD5E1;">
                                            &bull; <strong>24/7 Concierge:</strong> Customized dining, spa, and itinerary curation.<br />
                                            &bull; <strong>Express Check-in:</strong> Present your booking reference <strong>${reservationRef}</strong> at the VIP desk.<br />
                                            &bull; <strong>Complimentary Wellness:</strong> Access to the Thermal Spa and Fitness Sanctuary.
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- ASSISTANCE & POLICIES -->
                    <tr>
                        <td style="padding: 0 36px 30px;" class="mobile-pad">
                            <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding:16px;background-color:#0D1A2D;border-radius:10px;border:1px solid #1E3A5F;">
                                        <p style="margin:0 0 6px;font-size:12.5px;color:#F1F5F9;font-weight:600;">
                                            Need assistance or special arrangements?
                                        </p>
                                        <p style="margin:0;font-size:12px;color:#94A3B8;line-height:1.5;">
                                            Our dedicated guest relation specialists are available around the clock.<br />
                                            Simply reply directly to this email or reach us at <a href="mailto:${process.env.GMAIL_USER || 'concierge@sheraton.com'}" style="color:#D4AF37;text-decoration:none;font-weight:600;">${process.env.GMAIL_USER || 'concierge@sheraton.com'}</a>.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- LUXURY FOOTER -->
                    <tr>
                        <td align="center" style="background-color:#060E18;padding:28px 24px;border-top:1px solid rgba(212, 175, 55, 0.15);">
                            <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;font-weight:700;letter-spacing:3px;color:#D4AF37;text-transform:uppercase;">
                                SHERATON
                            </div>
                            <div style="font-size:9.5px;letter-spacing:2px;color:#64748B;text-transform:uppercase;margin:4px 0 14px;">
                                Tokyo Bay &bull; Maui &bull; Paris &bull; New York &bull; Sydney
                            </div>
                            <div style="font-size:11px;color:#475569;line-height:1.6;max-width:440px;">
                                This is an automated reservation notice dispatched from the Sheraton Reservation System.<br />
                                &copy; ${new Date().getFullYear()} Sheraton Hotels & Resorts. All Rights Reserved.
                            </div>
                        </td>
                    </tr>

                </table>
                <!-- End Main Container -->

            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

/**
 * Sends booking confirmation email to guest and hotel management
 * Handles skipped credentials and errors gracefully without throwing
 */
async function sendBookingNotification(bookingData) {
    const {
        guestName,
        guestEmail,
        roomType,
        checkIn = '',
        checkOut = '',
        checkInTime = '',
        hotelLocation = '',
        totalPrice = ''
    } = bookingData;

    const gmailUser = (process.env.GMAIL_USER || '').trim();
    const transporter = createTransporter();

    if (!transporter) {
        console.warn('⚠️ [EMAIL SERVICE] Email skipped: GMAIL_USER or GMAIL_PASS environment variables are not configured.');
        return {
            sent: false,
            skipped: true,
            reason: 'GMAIL_USER / GMAIL_PASS not configured in environment.'
        };
    }

    const reservationRef = `SHR-${Math.floor(100000 + Math.random() * 900000)}`;
    const recipientList = [guestEmail, gmailUser].filter(Boolean).join(',');

    const htmlContent = generateLuxuryBookingEmailHTML({
        guestName,
        guestEmail,
        roomType,
        checkIn,
        checkOut,
        checkInTime,
        hotelLocation: hotelLocation || 'Sheraton Hotels & Resorts',
        totalPrice,
        reservationRef,
        bookedAt: new Date()
    });

    const mailOptions = {
        from: `"Sheraton Hotels & Resorts" <${gmailUser}>`,
        to: recipientList,
        subject: `🏨 Sheraton Reservation Confirmed: ${reservationRef} (${guestName})`,
        text: `Dear ${guestName},\n\nYour reservation for ${roomType} at ${hotelLocation || 'Sheraton'} is confirmed.\nReference: ${reservationRef}\nTotal: ${totalPrice || 'Confirmed'}\n\nThank you for choosing Sheraton Hotels & Resorts.`,
        html: htmlContent
    };

    try {
        console.log(`✉️ [EMAIL SERVICE] Sending luxury reservation confirmation to: ${recipientList} (Ref: ${reservationRef})...`);
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ [EMAIL SERVICE] Email successfully dispatched via Nodemailer:', info.messageId || info.response);
        return {
            sent: true,
            skipped: false,
            messageId: info.messageId,
            response: info.response,
            reservationRef
        };
    } catch (error) {
        console.error('❌ [EMAIL SERVICE] Failed to send email via Nodemailer:', error.message);
        return {
            sent: false,
            skipped: false,
            error: error.message,
            reservationRef
        };
    }
}

module.exports = {
    createTransporter,
    verifyConnection,
    generateLuxuryBookingEmailHTML,
    sendBookingNotification,
    formatCurrency,
    calculateBillingBreakdown
};
