const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// MongoDB Connection (Railway environment variable ya local URI)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hiya_photography';

mongoose.connect(MONGO_URI)
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => console.error('MongoDB Connection Error:', err));

const bookingSchema = new mongoose.Schema({
    city: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    eventDate: { type: String, required: true },
    eventType: { type: String, required: true },
    createdAt: { 
        type: Date, 
        default: Date.now, 
        expires: 2592000 // 30 Days TTL Index (Auto delete after 30 days)
    }
});

const Booking = mongoose.model('Booking', bookingSchema);

app.post('/api/book', async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        await newBooking.save();
        res.status(201).json({ success: true, message: 'Booking saved successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin panel route redirection
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

