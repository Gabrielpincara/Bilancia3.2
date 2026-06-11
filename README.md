# 🐝 Smart Hive Dashboard - PWA

Monitoraggio Intelligente delle Arnie con Progressive Web App

## 📱 Installazione

### Android (Chrome)
1. Apri Chrome
2. Vai a: **https://gabrielpincara.github.io/Bilancia3.2/**
3. Clicca il menu ⋮ → **Installa app**
4. Conferma l'installazione

### iOS (Safari)
1. Apri Safari
2. Vai a: **https://gabrielpincara.github.io/Bilancia3.2/**
3. Clicca **Condividi** → **Aggiungi alla schermata home**
4. Scegli il nome e conferma

## 🔐 Accesso

- **Email utente**: Inserisci la tua email registrata
- **Master Key**: Digita `alluser` per accesso amministratore

## ✨ Funzionalità

✅ **Offline Support** - Funziona anche senza internet  
✅ **Auto-Update** - Aggiornamenti automatici della nuova versione  
✅ **PWA Nativa** - Installabile come app vera  
✅ **Multi-dispositivo** - Gestisci più arnie  
✅ **Grafici Real-time** - Andamenti peso, temperatura, umidità  
✅ **Storage Locale** - I dati rimangono nel telefono  
✅ **Codice Protetto** - Interface minificata e offuscata  

## 📊 Dashboard

### Sezioni principali
- **KPI**: Cambio peso 24h, 7gg, 15gg, ultima manutenzione
- **Grafici**: Andamento peso e parametri ambientali con zoom
- **Logs**: Storico manutenzioni
- **Range**: Selezione intervalli temporali (6H, 1D, 1W, 2W, 1M, 3M, 6M, 1Y, 5Y, SET)

## ⚙️ Configurazione

La PWA utilizza una **Google Apps Script** per i dati. L'URL è salvato in `config.json`.

Per cambiare l'URL:
1. Modifica il file `config.json`
2. Cambia il valore di `scriptUrl` con il tuo Apps Script
3. I dati si sincronizzano automaticamente

## 🏗️ Struttura del Progetto

```
Bilancia3.2/
├── index.html              # Pagina principale (loader minimalista)
├── manifest.json           # Configurazione PWA
├── service-worker.js       # Cache offline + auto-update
├── config.json             # Configurazione dinamica
├── assets/
│   ├── app.js             # Logica principale (minificata)
│   └── styles.css         # Stili (minificati)
└── README.md              # Questo file
```

## 🚀 Deployment

La PWA è automaticamente deployata su GitHub Pages:
- URL: `https://gabrielpincara.github.io/Bilancia3.2/`
- Aggiornamenti automatici ad ogni push sul branch `main`

## 🔄 Auto-Update

Quando modifichi l'HTML o il codice:
1. Fai il push su GitHub
2. GitHub Actions deploya automaticamente
3. Tutti gli utenti riceveranno la nuova versione al prossimo accesso

## 🛡️ Sicurezza

- ✅ Codice minificato e offuscato
- ✅ API Key nascosta in config.json
- ✅ Service Worker per offline
- ✅ HTTPS obbligatorio (GitHub Pages)

## 📞 Supporto
gabrielpincara@gmail.com

Per problemi o suggerimenti, contatta il team di sviluppo.

---
service-worker.js
const CACHE_NAME = 'arnia-dashboard-v1.1'; // <-- Numero cambiato 11/06/26

**Versione**: 3.2.0  
**Ultimo aggiornamento**: Giugno 2026  
**Repository**: https://github.com/Gabrielpincara/Bilancia3.2
