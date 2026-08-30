// Script to generate preview HTML file
require('dotenv').config();
const fs = require('fs');
const emailService = require('./services/emailService');

const html = emailService.generateLuxuryBookingEmailHTML({
    guestName: 'Lochana Mithudam',
    guestEmail: 'lochanamithudam097@gmail.com',
    roomType: 'Presidential Ocean Horizon Suite',
    checkIn: '2026-09-20',
    checkOut: '2026-09-25',
    checkInTime: '15:00',
    hotelLocation: 'Sheraton Grand Tokyo Bay Resort & Luxury Spa',
    totalPrice: '$4,250.00',
    reservationRef: 'SHR-416232',
    bookedAt: new Date()
});

fs.writeFileSync('./preview-luxury-email.html', html, 'utf8');
console.log('✅ Generated preview-luxury-email.html successfully!');
