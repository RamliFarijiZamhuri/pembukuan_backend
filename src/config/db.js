const mongoose = require('mongoose');
require('dotenv').config(); // Memuat variabel lingkungan

const connectDB = async () => {
    try {
        // Menggunakan URI dari variabel lingkungan MONGO_URI
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Opsi ini sudah tidak diperlukan di Mongoose versi 6 ke atas,
            // tetapi tidak ada salahnya untuk tetap ada.
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        // Keluar dari proses dengan kode kegagalan jika koneksi database gagal
        process.exit(1);
    }
};

module.exports = connectDB;
