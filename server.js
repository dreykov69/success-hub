const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Mock Database
const db = {
  users: {}, // e.g., { 'phone': { name, phone, password, balance, referralCode, referrersCount, rank } }
  referralLinks: {}, // e.g., { 'refCode': 'phone' }
};

// API: Register
app.post('/api/register', (req, res) => {
  const { fullName, phone, password, referrerCode } = req.body;
  
  if (db.users[phone]) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  // Generate unique referral code for this user
  const myRefCode = 'MILKII' + Math.random().toString(36).substring(2, 8).toUpperCase();
  
  db.users[phone] = {
    fullName,
    phone,
    password,
    balance: 0,
    referralCode: myRefCode,
    referrersCount: 0,
    rank: 'Starter',
    pendingRewards: 0
  };
  
  db.referralLinks[myRefCode] = phone;

  // Handle Referrer
  if (referrerCode && db.referralLinks[referrerCode]) {
    const inviterPhone = db.referralLinks[referrerCode];
    if (db.users[inviterPhone]) {
      db.users[inviterPhone].referrersCount += 1;
      db.users[inviterPhone].balance += 50; // Give 50 ETB per invite
      
      // Update Rank
      const refs = db.users[inviterPhone].referrersCount;
      if (refs >= 5) db.users[inviterPhone].rank = 'VIP Bronze';
      if (refs >= 20) db.users[inviterPhone].rank = 'VIP Silver';
      if (refs >= 50) db.users[inviterPhone].rank = 'VIP Gold';
    }
  }

  res.json({ success: true, user: db.users[phone] });
});

// API: Login
app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;
  const user = db.users[phone];
  
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  
  res.json({ success: true, user });
});

// API: Deposit parsing logic
app.post('/api/deposit', (req, res) => {
  const { phone, smsText } = req.body;
  
  const user = db.users[phone];
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  // Strictly match: "You have transferred ETB <amount> to ashim shenko (2519****6250)"
  const regex = /You have transferred ETB\s+(\d+(\.\d+)?)\s+to ashim shenko \(2519\*\*\*\*6250\)/i;
  const match = smsText.match(regex);

  if (match) {
    const amount = parseFloat(match[1]);
    user.balance += amount;
    return res.json({ success: true, amount, balance: user.balance });
  } else {
    return res.status(400).json({ success: false, message: 'Verification failed. Invalid transaction message or wrong recipient.' });
  }
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
