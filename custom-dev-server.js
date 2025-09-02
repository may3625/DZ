#!/usr/bin/env node

const express = require('express');
const { createServer } = require('vite');
const path = require('path');

async function startCustomServer() {
  try {
    console.log('💥 SERVEUR PERSONNALISÉ - Démarrage...');
    
    // Create Vite server in middleware mode
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
      configFile: path.resolve(__dirname, 'vite.config.ts')
    });

    // Create express app
    const app = express();
    
    // Use vite's connect instance as middleware
    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);

    const port = process.env.PORT || 8080;
    
    app.listen(port, '0.0.0.0', () => {
      console.log('🎉 SERVEUR PERSONNALISÉ DÉMARRÉ');
      console.log(`🌐 Serveur accessible sur: http://localhost:${port}`);
      console.log('🔒 Mode: Développement personnalisé');
      console.log('💀 Vite: Mode middleware (contrôlé)');
    });

  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur personnalisé:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur personnalisé...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur personnalisé...');
  process.exit(0);
});

startCustomServer();