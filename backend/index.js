// Configuración base de Express y conexión a MongoDB
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');          v
const cors = require('cors');


const multer = require('multer');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});
const upload = multer({ storage });

// Endpoint para subir archivos
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No se subió ningún archivo' });
    // Devolver la URL relativa para usarla en la galería/blog/testimonios
    res.json({ url: `/uploads/${req.file.filename}` });
});

// Servir archivos estáticos subidos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Conectado a MongoDB'))
    .catch((err) => console.error('Error de conexión a MongoDB:', err));



// Rutas de autenticación y recursos
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blog');
const testimonialRoutes = require('./routes/testimonial');
const galleryRoutes = require('./routes/gallery');

const analyticsRoutes = require('./analytics');
const analyticsExtendedRoutes = require('./analytics-extended');

app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/analytics-extended', analyticsExtendedRoutes);

// Ruta base
app.get('/', (req, res) => {
    res.send('API de administración funcionando');
});

// Puerto
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en puerto ${PORT}`);
});
