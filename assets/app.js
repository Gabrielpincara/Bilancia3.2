// ============================================================
// CONFIGURAZIONE DINAMICA E VARIABILI
// ============================================================
let scriptUrl = '';
let SECRET_KEY = '';
let DYNAMIC_URL_SHEET = '';

let charts = {};
let allData = [];
let currentRange = '1W';
let customStart = null;
let customEnd = null;

const ranges = ['6H','1D','1W','2W','1M','3M','6M','1Y','5Y', 'SET'];

const loginPage = document.getElementById('login-page');
const dashboardPage = document.getElementById('dashboard-page');
const manualPage = document.getElementById('manual-page');
const loader = document.getElementById('loader-overlay');
const loaderText = document.getElementById('loader-text');
const modal = document.getElementById('customRangeModal');

// ============================================================
// AVVIO DELLA PAGINA
// ============================================================
window.onload = async function() {
    await loadConfig(); // Carica prima il config
    await syncDynamicUrl();
    initRanges();
    checkAutoLogin();
    caricaConfigurazioneRemota();
    checkIosInstall();
};

// Funzione per caricare il file config.json
async function loadConfig() {
    try {
        const res = await fetch('./config.json');
        const config = await res.json();
        scriptUrl = config.scriptUrl;
        SECRET_KEY = config.secretKey;
        DYNAMIC_URL_SHEET = config.dynamicUrlSheet;
    } catch(e) {
        console.error("Impossibile caricare config.json, uso fallback hardcodato");
        // Fallback di sicurezza nel caso il json non caricasse
        scriptUrl = 'https://script.google.com/macros/s/AKfycbxNWHUTDUXFLKzozByIe21F2i87eDjcALIDVMLoLBsxOtREGHnmERbTiVb6Qwp-HRQe/exec';
        SECRET_KEY = "alluser";
        DYNAMIC_URL_SHEET = "https://docs.google.com/spreadsheets/d/1v2QYh6ZYvMKCxBI0mt7nHSS2btbmDRtP018k8Yj0Lfg/export?format=csv&gid=1773702506&range=B1";
    }
}

// Aggiorna la scriptUrl in base al Google Sheet in tempo reale
async function syncDynamicUrl() {
    try {
        const res = await fetch(DYNAMIC_URL_SHEET);
        if (!res.ok) throw new Error("Risposta network non ok");
        const text = await res.text();
        const fetchedUrl = text.trim();
        if (fetchedUrl.startsWith('http')) {
            scriptUrl = fetchedUrl;
            console.log("🌐 URL dell'App Script aggiornato dal Foglio Google!");
        } else {
            console.warn("La cella B1 non contiene un URL valido.");
        }
    } catch(e) {
        console.warn("⚠️ Impossibile raggiungere il foglio, uso l'URL locale.", e);
    }
}

// ... INCOLLA QUI TUTTO IL RESTO DEL TUO JAVASCRIPT (checkIosInstall, IndexedDB, Login, ecc.) ...

// ============================================================
// REGISTRA SERVICE WORKER (SPOSTATO QUI DALL'HTML)
// ============================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('✅ Service Worker registrato'))
            .catch(err => console.warn('⚠️ Service Worker registration fallito:', err));
    });
}
