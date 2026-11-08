# AniHub Phase 2 — Firebase Setup (step by step)

You need a Google account and a Firebase project. The web app can remain hosted on GitHub Pages; Firebase provides authentication and the database.

## A. Create Firebase project

1. Open https://console.firebase.google.com/ and choose **Add project**.
2. Give it a project name such as `anihub-catalog` and finish the setup.
3. In Project Overview, choose **Add app** → Web (`</>`).
4. Register the app as `AniHub Web`. Firebase will show a web configuration object.
5. Copy the values into `firebase/firebase-config.js`, replacing every `YOUR_...` placeholder. Keep the property names as they are. The Firebase Web config is not a service-account private key.

## B. Enable admin sign-in

1. Firebase Console → **Build → Authentication → Get started**.
2. Open **Sign-in method** and enable **Email/Password**.
3. Open **Users → Add user** and create your own admin email/password.
4. Copy the new user's **UID**. Do not share the password.

There is intentionally no public sign-up form in the dashboard.

## C. Create Firestore and install the rules

1. Firebase Console → **Build → Firestore Database → Create database**.
2. Choose a location near your audience where available. Start in production mode.
3. Open the **Rules** tab.
4. Replace the editor contents with `firebase/firestore.rules` from this project and click **Publish**.

These rules allow anyone to read the anime catalog and nested season/episode metadata. Only authenticated users with the trusted `admin: true` custom claim can create, edit, or delete records. Never replace these with unrestricted test rules.

## D. Grant your account the admin claim (owner-only step)

Custom claims must be granted from a trusted environment using the Firebase Admin SDK. This cannot safely be done from the public website.

1. On your own computer, install Node.js (LTS).
2. In Firebase Console → Project settings → Service accounts, generate a **private key** for the Admin SDK. Save the downloaded JSON somewhere private OUTSIDE your GitHub repository. Never upload it to GitHub or send it in chat.
3. In a terminal, set the environment variable to the full local path of that JSON file:
   - macOS/Linux: `export GOOGLE_APPLICATION_CREDENTIALS="/private/path/service-account.json"`
   - Windows PowerShell: `$env:GOOGLE_APPLICATION_CREDENTIALS="C:\private\service-account.json"`
4. In a temporary working folder, run `npm install firebase-admin`.
5. Copy `firebase/set-admin-claim.cjs` into that folder (or run it from this project folder after installing the package there).
6. Run `node set-admin-claim.cjs YOUR_AUTH_USER_UID`.
7. The script should confirm that the admin claim was granted. Sign out of the dashboard and sign in again so the refreshed ID token includes the claim.
8. Keep the JSON private. When finished, remove the local key if you no longer need it, or disable/delete the key in Google Cloud IAM.

**Important:** Do not put the service-account JSON, private key, or Admin SDK credentials in the AniHub GitHub repository, GitHub Pages, `firebase-config.js`, or browser JavaScript.

## E. Publish on GitHub Pages

1. Upload/commit all files and folders from the `AniHub` folder to the root of your existing `zizzverse.github.io/AniHub` repository. Keep the folder structure unchanged.
2. In GitHub repository → **Settings → Pages**, ensure the correct branch and root folder are selected.
3. Wait for the Pages deployment to finish.
4. Open the public website: `https://zizzverse.github.io/AniHub/`.
5. Open the dashboard: `https://zizzverse.github.io/AniHub/admin/`.

Because the project uses relative paths, it is intended to work from the `/AniHub/` GitHub Pages project path.

## F. Add and manage catalog entries

1. Sign in at `/AniHub/admin/` with the Firebase admin account.
2. Fill in the anime title, description, comma-separated genres, year, rating, poster/banner URLs, audio languages and subtitle languages.
3. Add a rights note to help document why you may publish the content.
4. Save. The title should appear in the admin catalog and public homepage after refresh.
5. Use **Seasons** beside a title to select it, add season numbers/titles, then add episodes and language metadata.
6. Deleting an anime from the dashboard also deletes its nested seasons and episodes. This cannot be undone.

## Troubleshooting

- **Firebase is not configured:** Check that every placeholder in `firebase/firebase-config.js` has been replaced with the matching web-app value, then redeploy.
- **auth/unauthorized-domain:** Authentication → Settings → Authorized domains; add `zizzverse.github.io` if it is not already listed.
- **Permission denied:** Confirm the Firestore rules are published and your user has the `admin: true` custom claim. Sign out/in after claim changes.
- **Catalog empty:** Add an anime in the dashboard. Until a Firestore title exists, the homepage uses demo entries.
- **Dashboard cannot sign in:** Confirm Email/Password provider is enabled and the user exists in Authentication.
- **Images do not appear:** Use direct HTTPS image URLs from sources you have permission to display; some hosts block hotlinking.

## Cost and limits

Firebase Spark/free quotas and product availability can change. Check the current Firebase pricing and usage page before launch. Set budget/usage alerts where available. Firestore reads increase with visitors, so keep catalog queries efficient. GitHub Pages is static hosting and does not host the actual video streams.
