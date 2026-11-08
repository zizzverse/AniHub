// Run locally after installing firebase-admin and downloading a service-account key.
// NEVER upload the service-account JSON or this script's environment to GitHub Pages.
const admin = require('firebase-admin');
const uid = process.argv[2];
if (!uid) {
  console.error('Usage: node set-admin-claim.cjs FIREBASE_AUTH_USER_UID');
  process.exit(1);
}
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to your service-account JSON path first.');
  process.exit(1);
}
admin.initializeApp({ credential: admin.credential.applicationDefault() });
admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => { console.log(`Admin claim granted to UID ${uid}. Sign out and sign in again.`); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
