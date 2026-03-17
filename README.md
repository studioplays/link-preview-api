🌐 Link Preview API – Developer Guide / Guida per Sviluppatori
1️⃣ Introduzione / Introduction

🇮🇹 Italiano:
Questa API permette di ottenere title, description, immagini principali, favicon e dominio di qualsiasi pagina web. Puoi offrire questa funzionalità ai tuoi utenti o integrarla nelle tue app.

🇬🇧 English:
This API allows you to retrieve title, description, main images, favicon, and domain from any webpage. You can integrate it into your apps or offer it to your users.

2️⃣ Ottenere la chiave API / Get Your API Key

Endpoint:

GET https://link-preview-api-7twz.onrender.com/get-key?email=YOUR_EMAIL&plan=free

Parametri / Parameters:

Param	Tipo / Type	Obbligatorio / Required	Descrizione / Description
email	string	sì / yes	Email per ricevere la chiave / Email to get the API key
plan	string	no / no	"free" o "premium" (default free) / "free" or "premium" (default free)

Esempio / Example (curl):

curl "https://link-preview-api-7twz.onrender.com/get-key?email=developer@example.com"

Risposta / Response JSON:

{
  "apiKey": "ffb4c9a9-c883-4892-9c95-1af7a2662e58",
  "plan": "free"
}
3️⃣ Endpoint /preview – Preview di una pagina

Endpoint:

GET https://link-preview-api-7twz.onrender.com/preview?url=TARGET_URL&api_key=YOUR_KEY

Parametri / Parameters:

Param	Tipo / Type	Obbligatorio / Required	Descrizione / Description
url	string	sì / yes	URL della pagina / Page URL
api_key	string	sì / yes	Chiave API ricevuta / Your API key

Esempio risposta / Example Response:

{
  "title": "Example Domain",
  "description": null,
  "image": null,
  "favicon": "https://example.com/favicon.ico",
  "domain": "example.com"
}
4️⃣ Esempi di integrazione / Integration Examples
JavaScript (Node.js / Browser)
const axios = require('axios');
const API_KEY = 'ffb4c9a9-c883-4892-9c95-1af7a2662e58';
const urlToPreview = 'https://example.com';

axios.get('https://link-preview-api-7twz.onrender.com/preview', {
  params: { url: urlToPreview, api_key: API_KEY }
})
.then(res => console.log(res.data))
.catch(err => console.error(err.response?.data || err.message));
Python
import requests

API_KEY = 'ffb4c9a9-c883-4892-9c95-1af7a2662e58'
url_to_preview = 'https://example.com'

response = requests.get('https://link-preview-api-7twz.onrender.com/preview', params={
    'url': url_to_preview,
    'api_key': API_KEY
})

print(response.json())
PHP
<?php
$apiKey = 'ffb4c9a9-c883-4892-9c95-1af7a2662e58';
$url = 'https://example.com';

$response = file_get_contents("https://link-preview-api-7twz.onrender.com/preview?url=".urlencode($url)."&api_key=".$apiKey);
$data = json_decode($response, true);
print_r($data);
?>
cURL (CLI)
curl "https://link-preview-api-7twz.onrender.com/preview?url=https://example.com&api_key=ffb4c9a9-c883-4892-9c95-1af7a2662e58"
Altri linguaggi: Ruby, Go, Java, C#

Ruby: net/http + JSON.parse

Go: net/http + encoding/json

Java: HttpURLConnection + org.json

C#: HttpClient + JsonDocument

Tutti funzionano allo stesso modo: basta fare una GET a /preview con url e api_key.

5️⃣ Rate limit e piani
Piano / Plan	Limite / Limit
Free	10 richieste/minuto
Premium	100 richieste/minuto

Chiave non valida → 401 Unauthorized
Troppe richieste → 429 Too Many Requests

6️⃣ Upgrade a Premium / Upgrade to Premium
GET https://link-preview-api-7twz.onrender.com/get-key?email=YOUR_EMAIL&plan=premium

La chiave rimane la stessa. Solo il limite di richieste aumenta.