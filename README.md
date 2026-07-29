# 🏨 Sheraton Hotels & Resorts — Full-Stack Web Application

An ultra-luxury, full-stack web application clone inspired by **Sheraton Hotels & Resorts**. Built with a modern responsive frontend and a Node.js / Express backend with MongoDB database integration.

---

## 🛠️ Technology Stack

### 🌐 1. Frontend (User Interface)
* **Languages:** HTML5, CSS3 (Vanilla CSS with design system tokens & variables), JavaScript (ES6+)
* **Typography & Icons:** Google Fonts (*Cormorant Garamond*, *Montserrat*) & Font Awesome 6
* **UI & Aesthetics:** Custom dark navy (`#1a2b4c`) & champagne gold (`#c5a059`) palette, Glassmorphism, smooth parallax scrolling, hero video loops, and lightbox modals.

### 🚀 2. Backend (Server)
* **Runtime:** Node.js
* **Web Framework:** Express.js (`server.js`)
* **Email Gateway:** Nodemailer (handles reservation notifications & contact forms)
* **Security & CORS:** Configured CORS policies & environment variable protection (`dotenv`)

### 🍃 3. Database
* **Database:** MongoDB
* **Object Data Modeling (ODM):** Mongoose (`mongoose`) — models reservation records, room availability, and user inquiries.

### ☁️ 4. Deployment & Hosting
* **Hosting:** Vercel (`vercel.json`) & Netlify
* **Environment Management:** `dotenv` (`.env`) for storing MongoDB URI (`MONGO_URI`), server ports, and SMTP secrets.

---

## 🏛️ Pages & Key Features

* **Home (`index.html`):** Main landing experience featuring background video loops, brand heritage, and property highlights.
* **Accommodations & Suites (`Rooms/rooms.html`):** Premium luxury catalog featuring 6 room/suite tiers, specs grid, nightly rate badges, and direct reservation modal hooks.
* **Deluxe King Bedroom (`deluxe-king-bedroom.html`):** Dedicated luxury suite showcase with parallax hero, 3D photo mosaic, interactive lightbox, and amenity highlights.
* **Restaurants & Dining (`dining.html`):** Michelin-calibre culinary page featuring live teppanyaki, fine dining, skyline rooftop lounge, signature food mosaic, and table reservation manager.
* **Gallery (`gallery.html`):** High-definition visual media showcase.
* **Booking System (`booking.html`):** Interactive room reservation interface powered by Node.js, Express & MongoDB.

---

## ⚙️ How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/lochanamithudam/SHERATON-CLONE.git
cd SHERATON-CLONE
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
ALLOWED_ORIGINS=http://localhost:3000,https://sheraton-clone.vercel.app
```

### 4. Start the application
```bash
# Start backend server
npm start
```
Open `http://localhost:3000` in your web browser.

---

## 📄 License
This project is created for educational and portfolio presentation purposes. All hotel brand names, trademarks, and original media belong to Marriott International / Sheraton Hotels & Resorts.
