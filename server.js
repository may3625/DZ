const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware de sécurité avec configuration personnalisée
const helmetConfig = process.env.DISABLE_CSP === 'true' ? false : {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "'unsafe-eval'",
        "data:",
        "blob:"
      ],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: [
        "'self'", 
        "ws://localhost:*", 
        "ws://127.0.0.1:*", 
        "wss://localhost:*", 
        "wss://127.0.0.1:*",
        "http://localhost:*", 
        "http://127.0.0.1:*",
        "https://*.supabase.co",
        "wss://*.supabase.co",
        "https://bsopguyucqkmjrkxaztc.supabase.co",
        "wss://bsopguyucqkmjrkxaztc.supabase.co",
        "data:",
        "blob:"
      ],
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      workerSrc: ["'self'", "blob:", "data:"],
      childSrc: ["'self'", "blob:"],
      wasmSrc: ["'self'", "data:", "blob:"]
    }
  }
};

app.use(helmet(helmetConfig));

app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (priorité au build de production si présent)
const distDir = path.join(__dirname, 'dist');
const publicDir = path.join(__dirname, 'public');
const hasDist = require('fs').existsSync(distDir);

if (hasDist) {
  app.use(express.static(distDir));
  app.use('/assets', express.static(path.join(distDir, 'assets')));
} else {
  app.use(express.static(publicDir));
  app.use('/assets', express.static(path.join(__dirname, 'assets')));
}

// Routes API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Application LYO - Synchronisée avec lovable.dev',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    name: 'Lovable App - Branche LYO',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    ocr: {
      // Exposition légère d'indicateurs runtime si présents sur window (in-page)
      // Note: côté Node, on n'a pas accès; valeurs placeholder
      preprocessing: 'local',
      engine: 'tesseract-local',
      opencv: 'local'
    }
  });
});

// Route principale
app.get('/', (req, res) => {
  if (hasDist) {
    res.sendFile(path.join(distDir, 'index.html'));
  } else {
    res.sendFile(path.join(publicDir, 'index.html'));
  }
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Application LYO démarrée sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔗 Synchronisée avec lovable.dev`);
});