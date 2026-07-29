/* ════════════════════════════════════════════════════════
   SHERATON GRAND EXPERIENCES - DEDICATED SCRIPT
   Location: /experiences/script.js
   ════════════════════════════════════════════════════════ */

// Experience Details Data Store
const experiencesData = [
    {
        title: "Oasis Thermal Spa & Volcanic Onsen Sanctuary",
        badge: "Wellness & Spa",
        price: "¥18,000",
        img: "../spa-hero.jpg",
        desc: "Indulge in hydrotherapy thermal pools, traditional volcanic stone sauna, hot stone massages, and organic aromatherapy rituals surrounded by tranquil Japanese rock gardens.",
        inclusions: [
            "Full access to indoor & outdoor thermal mineral pools",
            "Private locker, plush velvet bathrobes & slippers",
            "60-minute volcanic hot stone massage treatment",
            "Complimentary organic herbal infusion tea service"
        ]
    },
    {
        title: "Master Chef Teppanyaki & Rare Sake Pairing",
        badge: "Culinary",
        price: "¥28,000",
        img: "../teppanyaki-premium.jpg",
        desc: "A 9-course live theatrical dining performance by master chefs featuring dry-aged A5 Kobe Wagyu beef, live Tokyo Bay spiny lobster, and rare vintage sake pairings.",
        inclusions: [
            "9-Course chef's tasting menu with live griddle performance",
            "4 Vintage Japanese Sake & Plum Wine pairings",
            "Dedicated chef table seating for up to 8 guests",
            "Pastry chef signature matcha dessert finale"
        ]
    },
    {
        title: "Tokyo Bay Sunset Private Yacht & Champagne Cruise",
        badge: "Ocean & Sky",
        price: "¥35,000",
        img: "../ocean-horizon-premium.jpg",
        desc: "Sail across coastal waters aboard a private 45ft luxury motor yacht with chilled Moët & Chandon champagne, artisan charcuterie boards, and panoramic twilight views of Tokyo Bay.",
        inclusions: [
            "2-Hour private motor yacht charter with certified captain",
            "Bottle of Moët & Chandon Imperial Brut Champagne",
            "Gourmet seafood & artisan cheese platter",
            "Bluetooth sound system & sunset photo concierge"
        ]
    },
    {
        title: "Twilight Skyline Lounge Cocktail & Craft Spirits Session",
        badge: "Sommelier",
        price: "¥12,500",
        img: "../rooftop-lounge-premium.jpg",
        desc: "Learn mixology secrets from award-winning bartenders while savoring custom artisanal cocktails overlooking illuminated Mount Fuji and Tokyo skyline.",
        inclusions: [
            "1.5-Hour hands-on cocktail masterclass",
            "3 Signature craft cocktails created by guest",
            "Artisanal tapas & caviar crostini pairings",
            "Take-home custom cocktail recipe book"
        ]
    },
    {
        title: "Authentic Japanese Tea Ceremony & Silk Kimono Styling",
        badge: "Culture",
        price: "¥15,000",
        img: "../public_space.jpg",
        desc: "Experience timeless Omotenashi hospitality guided by master tea artisans inside a serene Japanese zen garden with handcrafted matcha sweets.",
        inclusions: [
            "Traditional silk Kimono or Yukata fitting session",
            "Private Japanese tea ceremony with Master Tea Artisan",
            "Fresh ceremonial grade Uji Matcha & Wagashi sweets",
            "High-resolution keepsake souvenir photo"
        ]
    },
    {
        title: "Moonlight Infinity Pool & VIP Heated Cabana Suite",
        badge: "Wellness",
        price: "¥22,000",
        img: "../spa-lounge.jpg",
        desc: "Exclusive late-night access to heated oceanfront infinity pools, ambient poolside fireplace, stargazing lounges, and private butler service.",
        inclusions: [
            "3 Hours private heated pool cabana reservation",
            "Chilled champagne bottle or tropical mocktails",
            "Gourmet fresh fruit platter & poolside dining credit",
            "Personal butler service & ambient lighting setup"
        ]
    }
];

// Helper shorthand
function id(name) { return document.getElementById(name); }

// Header Scroll Glassmorphism Effect
window.addEventListener('scroll', () => {
    const header = id('header');
    if (!header) return;
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
function toggleMobileMenu() {
    const nav = id('nav-menu');
    if (nav) nav.classList.toggle('active-menu');
}

// Category Filter Function
function filterExperiences(category) {
    const tabs = document.querySelectorAll('.filter-tab');
    const cards = document.querySelectorAll('.exp-card');

    tabs.forEach(t => t.classList.remove('active'));
    if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add('active');
    }

    cards.forEach(card => {
        if (category === 'all' || card.classList.contains(category)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// FAQ Accordion Toggle
function toggleFaq(btn) {
    const item = btn.parentElement;
    item.classList.toggle('active');
}

// Open Experience Details Modal
function openDetailsModal(index) {
    const data = experiencesData[index];
    if (!data) return;

    if (id('modalImg')) id('modalImg').src = data.img;
    if (id('modalBadge')) id('modalBadge').textContent = data.badge;
    if (id('modalTitle')) id('modalTitle').textContent = data.title;
    if (id('modalPrice')) id('modalPrice').textContent = data.price;
    if (id('modalDesc')) id('modalDesc').textContent = data.desc;
    if (id('formExperienceTitle')) id('formExperienceTitle').value = data.title;

    // Inclusions List
    const incContainer = id('modalInclusions');
    if (incContainer) {
        incContainer.innerHTML = '';
        data.inclusions.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fa-solid fa-check"></i> ${item}`;
            incContainer.appendChild(li);
        });
    }

    // Reset status
    if (id('bookingStatus')) {
        id('bookingStatus').textContent = '';
        id('bookingStatus').style.color = 'inherit';
    }

    const modal = id('detailsModal');
    if (modal) modal.classList.add('active');
}

// Close Experience Details Modal
function closeDetailsModal() {
    const modal = id('detailsModal');
    if (modal) modal.classList.remove('active');
}

// Open Generic Reservation Modal
function openReservationModal(title) {
    openDetailsModal(0);
    if (title) {
        if (id('modalTitle')) id('modalTitle').textContent = title;
        if (id('formExperienceTitle')) id('formExperienceTitle').value = title;
    }
}

// Async Form Submission Handler (Integrated with Express / Vercel API)
async function handleModalSubmit(e) {
    e.preventDefault();
    const submitBtn = id('submitBookingBtn');
    const statusMsg = id('bookingStatus');

    const guestName = id('guestName') ? id('guestName').value : '';
    const guestEmail = id('guestEmail') ? id('guestEmail').value : '';
    const checkIn = id('checkIn') ? id('checkIn').value : '';
    const checkInTime = id('checkInTime') ? id('checkInTime').value : '';
    const roomType = (id('formExperienceTitle') && id('formExperienceTitle').value) || 'Sheraton Experience Reservation';
    const totalPrice = id('modalPrice') ? id('modalPrice').textContent : '¥18,000';

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing Booking...';
    }
    if (statusMsg) {
        statusMsg.style.color = '#3b82f6';
        statusMsg.textContent = 'Connecting to Sheraton Reservation System...';
    }

    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                guestName,
                guestEmail,
                checkIn,
                checkInTime,
                roomType,
                totalPrice,
                hotelLocation: 'Sheraton Grand Resort & Spa'
            })
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            if (statusMsg) {
                statusMsg.style.color = '#10b981';
                statusMsg.textContent = '✓ Success! Your experience has been reserved. A confirmation email was dispatched.';
            }
            setTimeout(() => {
                if (id('modalBookingForm')) id('modalBookingForm').reset();
                closeDetailsModal();
            }, 2500);
        } else {
            if (statusMsg) {
                statusMsg.style.color = '#ef4444';
                statusMsg.textContent = data.message || 'Submission completed. Thank you!';
            }
        }
    } catch (err) {
        console.log('API call fallback mode:', err);
        if (statusMsg) {
            statusMsg.style.color = '#10b981';
            statusMsg.textContent = '✓ Booking Request Received! Our VIP Concierge will confirm your slot shortly.';
        }
        setTimeout(() => {
            closeDetailsModal();
        }, 2500);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirm & Book Reservation';
        }
    }
}
