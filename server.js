// server.js — Run with: node server.js
// Install deps: npm install express web-push cors

const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('.'));

// ---- VAPID KEYS (pre-generated — keep private key secret!) ----
const VAPID_PUBLIC  = 'BDum4QWv0OFl4X-zAEu5I1_rF3B_GxQ7f7mx0BEkULmcznlA6FlsF3L9qNHvXn29HXU5cuAyzOXh_qCZJflqraY';
const VAPID_PRIVATE = '0WwCyXpGo9OR4zr2JG3kf8lob28wBHaGLMS0x8jNBLQ';

webpush.setVapidDetails('mailto:admin@bangedupalarm.com', VAPID_PUBLIC, VAPID_PRIVATE);

// ---- IN-MEMORY STORE (swap for a DB in production) ----
// groups[code] = { name, members: { memberName: { subscription, joinedAt } } }
const groups = {};

// ---- ROUTES ----

// Get VAPID public key
app.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC });
});

// Create a group
app.post('/group/create', (req, res) => {
  const { code, groupName } = req.body;
  if (!code || !groupName) return res.status(400).json({ error: 'Missing code or groupName' });
  if (!groups[code]) {
    groups[code] = { name: groupName, members: {} };
  }
  res.json({ ok: true, code, groupName });
});

// Join a group (register push subscription)
app.post('/group/join', (req, res) => {
  const { code, memberName, subscription } = req.body;
  if (!code || !memberName) return res.status(400).json({ error: 'Missing fields' });
  if (!groups[code]) {
    groups[code] = { name: code, members: {} };
  }
  groups[code].members[memberName] = {
    subscription,
    joinedAt: Date.now()
  };
  const memberList = Object.keys(groups[code].members);
  res.json({ ok: true, groupName: groups[code].name, memberCount: memberList.length, members: memberList });
});

// Get group info
app.get('/group/:code', (req, res) => {
  const g = groups[req.params.code];
  if (!g) return res.status(404).json({ error: 'Group not found' });
  res.json({ name: g.name, members: Object.keys(g.members) });
});

// Leave a group
app.post('/group/leave', (req, res) => {
  const { code, memberName } = req.body;
  if (groups[code] && groups[code].members[memberName]) {
    delete groups[code].members[memberName];
  }
  res.json({ ok: true });
});

// 🍺 FIRE THE ALARM — send push to all other members
app.post('/alert', async (req, res) => {
  const { code, fromName } = req.body;
  if (!code || !fromName) return res.status(400).json({ error: 'Missing fields' });

  const group = groups[code];
  if (!group) return res.status(404).json({ error: 'Group not found' });

  const payload = JSON.stringify({
    title: '🍺 BANGED UP ALARM!',
    body: `${fromName} is getting banged up... Time to get on the wagon! 🛒`,
    icon: '/icon.png'
  });

  const results = { sent: 0, failed: 0, errors: [] };

  const sendPromises = Object.entries(group.members)
    .filter(([name]) => name !== fromName)
    .map(async ([name, member]) => {
      if (!member.subscription) return;
      try {
        await webpush.sendNotification(member.subscription, payload);
        results.sent++;
      } catch (err) {
        results.failed++;
        results.errors.push({ name, error: err.message });
        // Remove dead subscriptions
        if (err.statusCode === 410 || err.statusCode === 404) {
          delete group.members[name];
        }
      }
    });

  await Promise.all(sendPromises);
  res.json({ ok: true, ...results });
});

// ---- START ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🍺 Banged Up Alarm server running on http://localhost:${PORT}`);
});
