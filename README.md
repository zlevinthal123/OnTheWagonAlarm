# 🍺 Banged Up Alarm

Alert your crew the second you're getting banged up. They get a real push notification — even when the app is closed.

---

## How it works

1. One person creates a crew and shares the code
2. Everyone joins using the code
3. Hit the big button → everyone in the crew gets a push notification

---

## Deploy in 5 minutes (FREE)

### Option 1: Railway (easiest)

1. Push this folder to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select your repo — it auto-detects Node.js
4. Done! Railway gives you a public URL

### Option 2: Render

1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo
4. Build command: `npm install`
5. Start command: `node server.js`

### Option 3: Run locally

```bash
npm install
node server.js
# Open http://localhost:3000
```

---

## Push Notifications

Push notifications work when:
- Users open the app and tap **Enable Notifications**
- The app is served over **HTTPS** (all the deploy options above do this)
- Users are on Chrome, Edge, Firefox, or Android Chrome

> ⚠️ **iOS Safari**: Apple only supports Web Push on iOS 16.4+ when the site is "Added to Home Screen" as a PWA. Tap Share → Add to Home Screen first.

---

## Files

| File | What it does |
|------|-------------|
| `server.js` | Node.js backend — stores groups, sends push notifications |
| `index.html` | The mobile web app |
| `sw.js` | Service worker — receives push notifications |
| `package.json` | Dependencies |

---

## VAPID Keys

Pre-generated keys are included. If you want your own:
```bash
npm install web-push -g
web-push generate-vapid-keys
```
Then update both `server.js` and `index.html` with the new keys.
