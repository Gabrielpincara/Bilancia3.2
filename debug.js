// ============================================================
// DEBUG CONSOLE - Per diagnosticare perché i dati non caricano
// ============================================================

console.log("🔍 INIZIO DEBUG - Smart Hive Dashboard");

// Test 1: Verifica Script URL
console.group("📌 TEST 1: Google Apps Script URL");
console.log("Script URL configurato:", scriptUrl);

// Test 2: Verifica se IndexedDB è disponibile
console.group("📌 TEST 2: IndexedDB Disponibilità");
if ('indexedDB' in window) {
    console.log("✅ IndexedDB disponibile");
} else {
    console.error("❌ IndexedDB NON disponibile - cache locale disabilitata");
}

// Test 3: Controlla la connessione a Google Sheets
console.group("📌 TEST 3: Connessione a Google Sheets");
fetch(DYNAMIC_URL_SHEET)
    .then(res => {
        console.log("Status:", res.status);
        return res.text();
    })
    .then(text => {
        console.log("✅ URL dinamico raggiungibile:", text);
    })
    .catch(err => {
        console.error("❌ Impossibile raggiungere URL dinamico:", err.message);
    });

// Test 4: Verifica il caricamento dei dati
console.group("📌 TEST 4: Tentativo di caricamento dati");
window.addEventListener('dataLoaded', () => {
    console.log("✅ Dati caricati correttamente");
    console.log("Numero record:", allData.length);
});

window.addEventListener('dataError', (e) => {
    console.error("❌ Errore durante caricamento dati:", e.detail);
});

// Test 5: Verifica manifesto PWA
console.group("📌 TEST 5: PWA Manifest");
fetch('/Bilancia3.2/manifest.json')
    .then(res => res.json())
    .then(manifest => {
        console.log("✅ Manifest PWA caricato:", manifest.name);
    })
    .catch(err => {
        console.error("❌ Errore manifest PWA:", err.message);
    });

console.groupEnd();
