require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.googletagmanager.com", "https://cdn.jsdelivr.net", "https://cdn.skypack.dev"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "blob:", "https:", "https://cdn-icons-png.flaticon.com"],
            mediaSrc: ["'self'", "blob:"],
            connectSrc: ["'self'", "https://www.google-analytics.com", "https://analytics.google.com", "https://obsshvmadmfmqigivjkb.supabase.co", "https://api.ipify.org", "https://snapwidget.com"],
            frameSrc: ["'self'", "https://www.google.com", "https://www.facebook.com", "https://snapwidget.com"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"]
        }
    },
    crossOriginEmbedderPolicy: false,
    frameguard: { action: 'sameorigin' }
}));

// CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:4000',
            'https://renacermascotas.com',
            'https://www.renacermascotas.com'
        ];
        
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP cada 15 minutos
    message: {
        error: 'Demasiadas solicitudes desde esta IP, intente más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10, // máximo 10 uploads por hora
    message: {
        error: 'Límite de subidas alcanzado, intente más tarde.'
    }
});

app.use(limiter);

// Body parsing con límites de tamaño
app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
        // Verificar que el JSON es válido
        try {
            JSON.parse(buf);
        } catch (e) {
            res.status(400).json({ error: 'JSON inválido' });
            return;
        }
    }
}));

app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
}));

// Configuración segura de almacenamiento para multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedName = file.originalname
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .replace(/\.+/g, '.')
            .toLowerCase();
        cb(null, uniqueSuffix + '-' + sanitizedName);
    }
});

// Filtro de archivos para seguridad
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|pdf|doc|docx/;
    const allowedMimes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/quicktime', 'video/x-msvideo',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimes.includes(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido'));
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB máximo
        files: 1 // Solo 1 archivo por request
    }
});

// Middleware de validación de entrada
const validateInput = (req, res, next) => {
    // Sanitizar todas las entradas de texto
    for (let key in req.body) {
        if (typeof req.body[key] === 'string') {
            req.body[key] = validator.escape(req.body[key]);
        }
    }
    next();
};

// Endpoint seguro para subir archivos
app.post('/api/upload', uploadLimiter, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: 'No se subió ningún archivo' 
            });
        }
        
        // Verificación adicional del tipo de archivo
        const fileExtension = path.extname(req.file.filename).toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.avi', '.pdf', '.doc', '.docx'];
        
        if (!allowedExtensions.includes(fileExtension)) {
            // Eliminar archivo no válido
            const fs = require('fs');
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Tipo de archivo no permitido'
            });
        }
        
        res.json({ 
            success: true,
            url: `/uploads/${req.file.filename}`,
            filename: req.file.filename,
            size: req.file.size
        });
    } catch (error) {
        console.error('Error en upload:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Servir archivos estáticos subidos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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