// ==========================================
// CONFIGURAZIONE GOOGLE APPS SCRIPT
// ==========================================
const APPS_SCRIPT_URL = 'https://script.googleapis.com/macros/s/AKfycbzZpoRaUdx6iJl-8_0REesbgodL8hqUV-QgwCBEaXC0gNTEwORhErbdYX27ZdJUbVJ2/exec';

// ==========================================
// VARIABILI GLOBALI
// ==========================================
let currentUser = null;
let currentDevice = null;
let allData = {};
let charts = {};
let selectedRange = '24h';
let userRole = 'free';

// ==========================================
// INIT & DOM READY
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM Ready');
    checkUserSession();
    registerServiceWorker();
    setupEventListeners();
});

function setupEventListeners() {
    // Login
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    
    const emailInput = document.getElementById('emailInput');
    if (emailInput) emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    // Device selector
    const deviceSelector = document.getElementById('deviceSelector');
    if (deviceSelector) deviceSelector.addEventListener('change', onDeviceChanged);
    
    // Range buttons
    document.querySelectorAll('.range-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            setRange(btn.getAttribute('data-range'));
        });
    });
    
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    
    // Manual mode
    const manualBtn = document.getElementById('manualModeBtn');
    if (manualBtn) manualBtn.addEventListener('click', () => showManual());
    
    const backToDashboard = document.getElementById('backToDashboard');
    if (backToDashboard) backToDashboard.addEventListener('click', () => showDashboard());
}

// ==========================================
// AUTENTICAZIONE
// ==========================================
function checkUserSession() {
    const savedUser = localStorage.getItem('currentUser');
    userRole = localStorage.getItem('userRole') || 'free';
    
    if (savedUser) {
        currentUser = savedUser;
        console.log('👤 Utente trovato:', currentUser);
        showDashboard();
    } else {
        showLoginPage();
    }
}

function handleLogin() {
    const email = document.getElementById('emailInput').value.trim();
    const errorEl = document.getElementById('loginError');
    
    if (!email || !email.includes('@')) {
        if (errorEl) errorEl.textContent = 'Inserisci un\'email valida';
        if (errorEl) errorEl.style.display = 'block';
        return;
    }
    
    showLoader('Autenticazione in corso...');
    
    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
            action: 'authenticate',
            email: email
        })
    })
    .then(r => r.json())
    .then(data => {
        hideLoader();
        if (data.success) {
            currentUser = email;
            userRole = data.role || 'free';
            localStorage.setItem('currentUser', email);
            localStorage.setItem('userRole', userRole);
            if (errorEl) errorEl.style.display = 'none';
            console.log('✅ Login success:', data);
            showDashboard();
        } else {
            if (errorEl) errorEl.textContent = data.message || 'Accesso negato';
            if (errorEl) errorEl.style.display = 'block';
            console.warn('❌ Login failed:', data);
        }
    })
    .catch(err => {
        hideLoader();
        if (errorEl) errorEl.textContent = 'Errore di connessione: ' + err.message;
        if (errorEl) errorEl.style.display = 'block';
        console.error('🔴 Login error:', err);
    });
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    currentUser = null;
    currentDevice = null;
    Object.values(charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') chart.destroy();
    });
    showLoginPage();
    const emailInput = document.getElementById('emailInput');
    if (emailInput) emailInput.value = '';
}

// ==========================================
// UI NAVIGATION
// ==========================================
function showLoginPage() {
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('dashboard-page').classList.add('hidden');
    document.getElementById('manual-page').classList.add('hidden');
    console.log('📄 Showing login page');
}

function showDashboard() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('dashboard-page').classList.remove('hidden');
    document.getElementById('manual-page').classList.add('hidden');
    console.log('📊 Showing dashboard');
    loadDevices();
}

function showManual() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('dashboard-page').classList.add('hidden');
    document.getElementById('manual-page').classList.remove('hidden');
    console.log('⚙️ Showing manual mode');
    setupManualNavigation();
}

// ==========================================
// CARICAMENTO DISPOSITIVI
// ==========================================
function loadDevices() {
    showLoader('Caricamento dispositivi...');
    
    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
            action: 'getDevices',
            email: currentUser
        })
    })
    .then(r => r.json())
    .then(data => {
        hideLoader();
        if (data.success && data.devices && data.devices.length > 0) {
            populateDeviceSelector(data.devices);
            currentDevice = data.devices[0].id;
            console.log('✅ Devices loaded:', data.devices);
            onDeviceChanged();
        } else {
            console.warn('⚠️ No devices found');
            showLoader('Nessun dispositivo trovato');
            setTimeout(hideLoader, 2000);
        }
    })
    .catch(err => {
        hideLoader();
        console.error('🔴 Load devices error:', err);
        alert('Errore nel caricamento dispositivi: ' + err.message);
    });
}

function populateDeviceSelector(devices) {
    const selector = document.getElementById('deviceSelector');
    if (!selector) return;
    
    selector.innerHTML = '';
    devices.forEach(dev => {
        const opt = document.createElement('option');
        opt.value = dev.id || dev.name;
        opt.textContent = dev.name || `Dispositivo ${dev.id}`;
        selector.appendChild(opt);
    });
}

function onDeviceChanged() {
    const selector = document.getElementById('deviceSelector');
    if (!selector) return;
    
    currentDevice = selector.value;
    if (currentDevice) {
        console.log('🔄 Device changed to:', currentDevice);
        loadDeviceData();
    }
}

// ==========================================
// CARICAMENTO DATI
// ==========================================
function loadDeviceData() {
    showLoader('Caricamento dati...');
    
    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
            action: 'getData',
            email: currentUser,
            deviceId: currentDevice,
            range: selectedRange
        })
    })
    .then(r => r.json())
    .then(data => {
        hideLoader();
        if (data.success) {
            allData = data.data || {};
            console.log('📈 Data received:', allData);
            updateStats();
            updateCharts();
            updateLogs();
        } else {
            console.warn('⚠️ Data load failed:', data.message);
        }
    })
    .catch(err => {
        hideLoader();
        console.error('🔴 Load data error:', err);
    });
}

// ==========================================
// AGGIORNAMENTO STATISTICHE
// ==========================================
function updateStats() {
    // Delta 24h
    if (allData.delta24h) {
        const el1 = document.getElementById('delta24h_1');
        const el2 = document.getElementById('delta24h_2');
        if (el1) el1.innerHTML = formatValue(allData.delta24h.a1);
        if (el2) el2.innerHTML = formatValue(allData.delta24h.a2);
    }
    
    // Delta 7 giorni
    if (allData.delta7d) {
        const el1 = document.getElementById('delta7d_1');
        const el2 = document.getElementById('delta7d_2');
        if (el1) el1.innerHTML = formatValue(allData.delta7d.a1);
        if (el2) el2.innerHTML = formatValue(allData.delta7d.a2);
    }
    
    // Peso attuale
    if (allData.currentWeight) {
        const el1 = document.getElementById('current-weight-1');
        const el2 = document.getElementById('current-weight-2');
        if (el1) el1.textContent = allData.currentWeight.a1 + ' kg';
        if (el2) el2.textContent = allData.currentWeight.a2 + ' kg';
    }
    
    // Temperatura/Umidità
    if (allData.environment) {
        const tempEl = document.getElementById('temp-value');
        const humEl = document.getElementById('humidity-value');
        if (tempEl) tempEl.textContent = allData.environment.temp + '°C';
        if (humEl) humEl.textContent = allData.environment.humidity + '%';
    }
    
    // Aggiorna badge ruolo
    if (userRole === 'master') {
        const badge = document.getElementById('accountBadge');
        if (badge) {
            badge.classList.add('master');
            badge.textContent = 'MASTER';
        }
    }
}

function formatValue(val) {
    if (val === null || val === undefined) return '--';
    const num = parseFloat(val);
    if (isNaN(num)) return '--';
    const sign = num >= 0 ? '+' : '';
    const color = num > 0 ? 'val-pos' : (num < 0 ? 'val-neg' : 'val-neutral');
    return `<span class="${color}">${sign}${num.toFixed(1)}</span>`;
}

// ==========================================
// GRAFICI CHART.JS
// ==========================================
function updateCharts() {
    if (allData.weightTimeseries) {
        createWeightChart(allData.weightTimeseries);
    }
    if (allData.tempTimeseries) {
        createTemperatureChart(allData.tempTimeseries);
    }
    if (allData.activityData) {
        createActivityChart(allData.activityData);
    }
}

function getChartDefaults() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: '#aeaeb2',
                    font: { size: 11, weight: '600' },
                    padding: 15
                }
            },
            filler: {
                propagate: true
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                ticks: { color: '#aeaeb2', font: { size: 10 } },
                grid: { color: 'rgba(200, 200, 200, 0.1)' }
            },
            x: {
                ticks: { color: '#aeaeb2', font: { size: 9 } },
                grid: { color: 'rgba(200, 200, 200, 0.1)' }
            }
        }
    };
}

function createWeightChart(data) {
    const ctx = document.getElementById('weightChart');
    if (!ctx) return;
    
    if (charts.weight) charts.weight.destroy();
    
    const opts = getChartDefaults();
    
    charts.weight = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.timestamps || [],
            datasets: [
                {
                    label: 'Arnia A1',
                    data: data.a1 || [],
                    borderColor: '#4a90e2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#4a90e2',
                    pointBorderColor: '#fff'
                },
                {
                    label: 'Arnia A2',
                    data: data.a2 || [],
                    borderColor: '#ff9500',
                    backgroundColor: 'rgba(255, 149, 0, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#ff9500',
                    pointBorderColor: '#fff'
                }
            ]
        },
        options: opts
    });
    
    console.log('✅ Weight chart created');
}

function createTemperatureChart(data) {
    const ctx = document.getElementById('temperatureChart');
    if (!ctx) return;
    
    if (charts.temperature) charts.temperature.destroy();
    
    const opts = getChartDefaults();
    opts.plugins.legend.display = false;
    
    charts.temperature = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.timestamps || [],
            datasets: [
                {
                    label: 'Temperatura (°C)',
                    data: data.temps || [],
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#ff6b6b',
                    pointBorderColor: '#fff'
                }
            ]
        },
        options: opts
    });
    
    console.log('✅ Temperature chart created');
}

function createActivityChart(data) {
    const ctx = document.getElementById('activityChart');
    if (!ctx) return;
    
    if (charts.activity) charts.activity.destroy();
    
    const opts = getChartDefaults();
    opts.plugins.legend.display = false;
    
    charts.activity = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels || [],
            datasets: [
                {
                    label: 'Attività',
                    data: data.values || [],
                    backgroundColor: '#17c964',
                    borderRadius: 6,
                    borderSkipped: false
                }
            ]
        },
        options: opts
    });
    
    console.log('✅ Activity chart created');
}

// ==========================================
// LOG TABLES
// ==========================================
function updateLogs() {
    if (allData.eventLogs && Array.isArray(allData.eventLogs)) {
        populateEventLog(allData.eventLogs);
    }
}

function populateEventLog(logs) {
    const tbody = document.querySelector('#eventLogTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#aeaeb2;">Nessun evento</td></tr>';
        return;
    }
    
    logs.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(log.timestamp).toLocaleString('it-IT')}</td>
            <td>${log.event || '--'}</td>
            <td>${log.value || '--'}</td>
        `;
        tbody.appendChild(row);
    });
    
    console.log('✅ Event log updated:', logs.length, 'events');
}

// ==========================================
// RANGE SELECTOR
// ==========================================
function setRange(range) {
    selectedRange = range;
    document.querySelectorAll('.range-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-range="${range}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    console.log('📅 Range changed to:', range);
    loadDeviceData();
}

// ==========================================
// UTILITY
// ==========================================
function showLoader(text = 'Caricamento...') {
    const loader = document.getElementById('loader-overlay');
    const loaderText = document.getElementById('loader-text');
    if (loader) loader.classList.remove('hidden');
    if (loaderText) loaderText.textContent = text;
}

function hideLoader() {
    const loader = document.getElementById('loader-overlay');
    if (loader) loader.classList.add('hidden');
}

// ==========================================
// SERVICE WORKER
// ==========================================
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => {
                console.log('✅ Service Worker registrato:', reg);
                updateServiceWorkerIfAvailable();
            })
            .catch(err => console.log('❌ SW error:', err));
    }
}

function updateServiceWorkerIfAvailable() {
    if (!navigator.serviceWorker.controller) return;
    
    navigator.serviceWorker.oncontrollerchange = () => {
        console.log('♻️ SW update disponibile');
    };
}

// ==========================================
// MODALITÀ MANUALE
// ==========================================
function setupManualNavigation() {
    document.querySelectorAll('#manual-page .nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#manual-page .nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('#manual-page .tab-content').forEach(tab => tab.classList.remove('active'));
            
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            const tab = document.getElementById(tabId);
            if (tab) tab.classList.add('active');
        });
    });
    
    const firstBtn = document.querySelector('#manual-page .nav-btn');
    if (firstBtn) firstBtn.click();
}

// ==========================================
// AUTO-REFRESH
// ==========================================
function startAutoRefresh(intervalMinutes = 5) {
    setInterval(() => {
        if (currentDevice && currentUser) {
            console.log('🔄 Auto-refresh triggered');
            loadDeviceData();
        }
    }, intervalMinutes * 60 * 1000);
}

// Avvia auto-refresh ogni 5 minuti se loggato
document.addEventListener('DOMContentLoaded', () => {
    if (currentUser) {
        startAutoRefresh(5);
    }
});

console.log('✅ app.js caricato con successo');