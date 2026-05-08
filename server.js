const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(express.static(__dirname));

app.get('/health', (req, res) => res.json({ ok: true }));

const groups = {};

app.post('/group/create', (req, res) => {
  const { code, groupName } = req.body;
  if (!code || !groupName) return res.status(400).json({ error: 'Missing fields' });
  if (!groups[code]) groups[code] = { name: groupName, members: {} };
  res.json({ ok: true, code, groupName });
});

app.post('/group/join', (req, res) => {
  const { code, memberName, subscription } = req.body;
  if (!code || !memberName) return res.status(400).json({ error: 'Missing fields' });
  if (!groups[code]) groups[code] = { name: code, members: {} };
  groups[code].members[memberName] = { subscription, joinedAt: Date.now() };
  const members = Object.keys(groups[code].members);
  res.json({ ok: true, groupName: groups[code].name, memberCount: members.length, members });
});

app.get('/group/:code', (req, res) => {
  const g = groups[req.params.code];
  if (!g) return res.status(404).json({ error: 'Group not found' });
  res.json({ name: g.name, members: Object.keys(g.members) });
});

app.post('/group/leave', (req, res) => {
  const { code, memberName } = req.body;
  if (groups[code] && groups[code].members[memberName]) delete groups[code].members[memberName];
  res.json({ ok: true });
});

app.post('/alert', async (req, res) => {
  const { code, fromName } = req.body;
  if (!code || !fromName) return res.status(400).json({ error: 'Missing fields' });
  const group = groups[code];
  if (!group) return res.status(404).json({ error: 'Group not found' });
  res.json({ ok: true, sent: 0 });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🍺 Banged Up Alarm running on port ${PORT}`);
});
