// JavaScript pour l'application Lovable LYO

// Configuration
const API_BASE_URL = window.location.origin;

// Utilitaires
const formatJSON = (obj) => JSON.stringify(obj, null, 2);

const updateApiResponse = (data, isError = false) => {
    const responseElement = document.getElementById('api-response');
    if (responseElement) {
        responseElement.textContent = typeof data === 'string' ? data : formatJSON(data);
        responseElement.className = `bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto ${
            isError ? 'text-red-400' : 'text-green-400'
        }`;
    }
};

const updateServerStatus = (status, message = '') => {
    const statusElement = document.getElementById('server-status');
    if (statusElement) {
        statusElement.textContent = message || status;
        statusElement.className = `text-sm mt-2 ${
            status === 'online' ? 'text-green-400' : 
            status === 'error' ? 'text-red-400' : 
            'text-yellow-400'
        }`;
    }
};

// Fonctions API
const checkHealth = async () => {
    try {
        updateApiResponse('Vérification de l\'état du serveur...', false);
        updateServerStatus('loading', 'Vérification...');
        
        const response = await fetch(`${API_BASE_URL}/api/health`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        updateApiResponse(data, false);
        updateServerStatus('online', '✓ En ligne');
        
        // Animation de succès
        const button = event.target;
        button.classList.add('animate-pulse');
        setTimeout(() => button.classList.remove('animate-pulse'), 1000);
        
    } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        updateApiResponse({
            error: 'Erreur de connexion',
            message: error.message,
            timestamp: new Date().toISOString()
        }, true);
        updateServerStatus('error', '✗ Erreur');
    }
};

const getInfo = async () => {
    try {
        updateApiResponse('Récupération des informations...', false);
        
        const response = await fetch(`${API_BASE_URL}/api/info`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        updateApiResponse(data, false);
        
        // Animation de succès
        const button = event.target;
        button.classList.add('animate-pulse');
        setTimeout(() => button.classList.remove('animate-pulse'), 1000);
        
    } catch (error) {
        console.error('Erreur lors de la récupération des infos:', error);
        updateApiResponse({
            error: 'Erreur de récupération',
            message: error.message,
            timestamp: new Date().toISOString()
        }, true);
    }
};

// Vérification automatique du statut au chargement
const initializeApp = () => {
    console.log('🚀 Application Lovable LYO initialisée');
    console.log('🔗 Synchronisée avec lovable.dev');
    
    // Vérification automatique du serveur
    checkHealth();
    
    // Mise à jour périodique du statut (toutes les 30 secondes)
    setInterval(() => {
        fetch(`${API_BASE_URL}/api/health`)
            .then(response => response.ok ? 
                updateServerStatus('online', '✓ En ligne') : 
                updateServerStatus('error', '✗ Erreur')
            )
            .catch(() => updateServerStatus('error', '✗ Hors ligne'));
    }, 30000);
    
    // Animations d'entrée
    document.querySelectorAll('.bg-black').forEach((element, index) => {
        element.style.animationDelay = `${index * 0.1}s`;
        element.classList.add('animate-fadeIn');
    });
};

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
    console.error('Erreur JavaScript:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise rejetée:', event.reason);
});

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', initializeApp);

// Exposition des fonctions globalement pour les boutons HTML
window.checkHealth = checkHealth;
window.getInfo = getInfo;