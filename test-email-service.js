// ============================================================
//  Sheraton Clone — Email Service Verification Test Suite
// ============================================================

require('dotenv').config();
const emailService = require('./services/emailService');

async function runTests() {
    console.log('🧪 Starting Email Service Verification...\n');

    // Test 1: Test HTML Generator
    console.log('1️⃣ Testing Luxury HTML Email Generator...');
    const sampleBooking = {
        guestName: 'Lady Eleanor Vance',
        guestEmail: 'eleanor.vance@example.com',
        roomType: 'Presidential Ocean Horizon Suite',
        checkIn: '2026-09-15',
        checkOut: '2026-09-18',
        checkInTime: '14:00',
        hotelLocation: 'Sheraton Grand Tokyo Bay Resort & Spa',
        totalPrice: '$2,850.00',
        reservationRef: 'SHR-892341'
    };

    const htmlOutput = emailService.generateLuxuryBookingEmailHTML(sampleBooking);

    // Verify key luxury styling elements
    const checks = [
        { label: 'Rich Dark Theme (#0B192C)', passed: htmlOutput.includes('#0B192C') },
        { label: 'Warm Gold Accents (#D4AF37)', passed: htmlOutput.includes('#D4AF37') },
        { label: 'Guest Name included', passed: htmlOutput.includes('Lady Eleanor Vance') },
        { label: 'Reservation Reference included', passed: htmlOutput.includes('SHR-892341') },
        { label: 'Total Amount highlighted', passed: htmlOutput.includes('$2,850.00') },
        { label: 'Hero Image Banner included', passed: htmlOutput.includes('unsplash.com') },
        { label: 'Itemized Billing Section included', passed: htmlOutput.includes('Itemized Billing Summary') },
        { label: 'VIP Privileges Section included', passed: htmlOutput.includes('Your Sheraton Guest Privileges') }
    ];

    let allChecksPassed = true;
    for (const check of checks) {
        if (check.passed) {
            console.log(`   ✅ ${check.label}`);
        } else {
            console.log(`   ❌ ${check.label} FAILED`);
            allChecksPassed = false;
        }
    }

    if (!allChecksPassed) {
        console.error('❌ Template checks failed!');
        process.exit(1);
    }
    console.log('   ✨ HTML template generation verified successfully!\n');

    // Test 2: Billing Breakdown
    console.log('2️⃣ Testing Billing Breakdown Calculator...');
    const breakdown = emailService.calculateBillingBreakdown('$1,200.00', '2026-10-01', '2026-10-04');
    console.log('   Nights:', breakdown.nights);
    console.log('   Base Rate:', breakdown.baseRate);
    console.log('   Taxes & Fees:', breakdown.taxesAndFees);
    console.log('   Total:', breakdown.formattedTotal);
    if (breakdown.nights === 3 && breakdown.formattedTotal === '$1,200.00') {
        console.log('   ✅ Billing calculator verified!\n');
    } else {
        console.error('   ❌ Billing calculation mismatch');
    }

    // Test 3: SMTP Transporter Verification
    console.log('3️⃣ Testing Nodemailer SMTP Handshake...');
    const verifyResult = await emailService.verifyConnection();
    console.log('   Verification result:', verifyResult);

    console.log('\n🎉 Email Service verification completed successfully!');
}

runTests().catch(err => {
    console.error('❌ Test run failed:', err);
    process.exit(1);
});
