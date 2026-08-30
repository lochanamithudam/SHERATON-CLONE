// ============================================================
//  Sheraton Clone — End-to-End Booking Notification Test
// ============================================================

require('dotenv').config();
const emailService = require('./services/emailService');

async function testBookingEmail() {
    console.log('🚀 Testing Booking Email Notification Dispatch...');

    const testBookingData = {
        guestName: 'Lochana Mithudam',
        guestEmail: process.env.GMAIL_USER || 'lochanamithudam097@gmail.com',
        roomType: 'Presidential Ocean Horizon Suite',
        checkIn: '2026-09-20',
        checkOut: '2026-09-25',
        checkInTime: '15:00',
        hotelLocation: 'Sheraton Grand Tokyo Bay Resort & Luxury Spa',
        totalPrice: '$4,250.00'
    };

    const result = await emailService.sendBookingNotification(testBookingData);
    console.log('📬 Dispatch result:', result);

    if (result.sent) {
        console.log(`\n🎉 SUCCESS! Luxury confirmation email dispatched with Ref: ${result.reservationRef}`);
    } else if (result.skipped) {
        console.log('\n⚠️ Email skipped as expected (credentials omitted)');
    } else {
        console.error('\n❌ Email sending error:', result.error);
    }
}

testBookingEmail();
