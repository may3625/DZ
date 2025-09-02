function updateResponse(content) {
  const el = document.getElementById('api-response');
  if (el) {
    el.textContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  }
}

function setServerStatus(text, colorClass) {
  const statusEl = document.getElementById('server-status');
  if (statusEl) {
    statusEl.textContent = text;
    statusEl.className = `text-sm ${colorClass || 'text-blue-400'}`;
  }
}

async function checkHealth() {
  try {
    setServerStatus('Vérification...', 'text-blue-400');
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    setServerStatus('OK', 'text-green-400');
    updateResponse(json);
  } catch (e) {
    setServerStatus('Erreur', 'text-red-400');
    updateResponse({ error: 'Impossible de joindre /api/health', details: String(e) });
  }
}

async function getInfo() {
  try {
    const res = await fetch('/api/info');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    updateResponse(json);
  } catch (e) {
    updateResponse({ error: 'Impossible de joindre /api/info', details: String(e) });
  }
}

// Mise à jour auto du statut serveur à l’ouverture de la page
window.addEventListener('DOMContentLoaded', () => {
  checkHealth().catch(() => {});
});