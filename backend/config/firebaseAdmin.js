// backend/config/firebaseAdmin.js
const admin = require('firebase-admin');

// Path to your service account key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;