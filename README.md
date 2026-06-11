# 🐝 Smart Hive Dashboard - PWA

**Monitoraggio Intelligente delle Arnie con Progressive Web App**

* **Versione PWA:** v1.1 - 11/06/2026
* **Versione FW ESP32:** v1.9.3 - 11/06/2026
* **Ultimo aggiornamento:** Giugno 2026
* **Repository Software:** [Bilancia 3.2 su GitHub](https://github.com/Gabrielpincara/Bilancia3.2)
* **Progetto Hardware (PCB):** [Schema e Layout su OSHWLab](https://oshwlab.com/gabrielpincara/bilancia3-2)


## 📱 Installazione

Essendo una PWA (Progressive Web App), puoi installarla direttamente sul tuo smartphone come un'app nativa, senza passare dagli store ufficiali.

### Android (tramite Chrome)
1. Apri Chrome e vai a: `https://gabrielpincara.github.io/Bilancia3.2/`
2. Clicca il menu con i tre puntini (⋮) in alto a destra.
3. Seleziona **Installa app** (o "Aggiungi a schermata Home").
4. Conferma l'installazione.

### iOS (tramite Safari)
1. Apri Safari e vai a: `https://gabrielpincara.github.io/Bilancia3.2/`
2. Clicca sull'icona **Condividi** (il quadrato con la freccia verso l'alto).
3. Scorri e seleziona **Aggiungi alla schermata home**.
4. Scegli il nome e conferma.
   
## 🔐 Accesso
* **Email utente:** Inserisci la tua email registrata per accedere alla tua dashboard personale.

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
- I dati si sincronizzano automaticamente

## 🚀 Deployment e Auto-Update

Come funzionano gli aggiornamenti per gli utenti?
Quando modifichi il codice e fai un push su GitHub, i browser degli utenti non se ne accorgono subito a causa della cache. 

## 🚀 Deployment e Auto-Update

**Come funzionano gli aggiornamenti per gli utenti?** 
Il sistema è progettato per essere "zero-manutenzione" anche dal punto di vista software, aggiornandosi in totale autonomia in entrambe le sue componenti:

* **Dashboard (PWA):** Grazie alla struttura PWA e ai Service Worker, l'app aggira i classici problemi di cache del browser. Controlla in background la presenza di nuove versioni e si aggiorna automaticamente, garantendo all'utente di avere sempre l'ultima release disponibile senza alcun intervento manuale.
  
* **Hardware (ESP32):** Anche la bilancia stessa si aggiorna da sola! Tramite la tecnologia OTA (Over-The-Air), il microcontrollore ESP32 verifica, scarica e installa automaticamente i nuovi aggiornamenti del firmware sfruttando la connessione Wi-Fi. Questo permette di ricevere le ultime ottimizzazioni senza dover mai collegare cavi o aprire il box della scheda in apiario.

## 📞 Supporto

Per problemi, suggerimenti o per richiedere l'accesso completo al sistema:
* **Email:** gabrielpincara [chiocciola] gmail [punto] com
