# TiltTwin

**CPSC 581 · Fall 2026 · Group Project 2: Expertise Sharing**

TiltTwin lets a CAD expert teach a beginner 3D rotations remotely, through physical motion.
The expert picks an axis and an angle and sends it. The beginner reproduces the rotation by
**physically turning their phone**: the part on screen turns with the phone. Both sides see
live feedback: a turn arrow, an angle gauge and colour changes. When the part is held on target, both
screens show ✓, the phone chimes and vibrates, and the expert's session log records the time.

- **Live app:** _add Vercel URL here_
- **Demo video:** _add link here_
- **Design process write-up:** [`docs/TiltTwin-Design-Process.pdf`](docs/TiltTwin-Design-Process.pdf)

| Expert (laptop) | Beginner (phone) |
|---|---|
| ![Expert view](docs/design/screenshots/v2-expert-matched.png) | ![Beginner view](docs/design/screenshots/v2-beginner-turning.png) |

## How to use it

1. **Expert** opens the app on a laptop → **Start a lesson**. Note the 4-letter room code.
2. **Beginner** opens the app on a phone → enters the code → **Start with phone motion**
   (on iPhone, tap **Allow** when asked for motion access).
3. Beginner holds the phone sideways in front of them, as if holding the part.
4. Expert picks an **axis** (X/Y/Z) and an **angle** and presses **Send instruction**.
   The phone buzzes, recalibrates to 0°, and shows the expert's looping demo in the corner.
5. Beginner turns the phone. Follow the hint (e.g. *“Turn the phone to the left”*), the arrow
   and the gauge. Hold on target for ~1 s → **✓ Matched!** on both screens.
6. Expert can send quick corrections (*Other way!*, *Keep going*…) or type a tip at any time.

No motion sensor (or a laptop)? Choose **Use touch / mouse drag** instead.

### Phone requirements

- Must be served over **HTTPS** (Vercel does this). Browsers block motion sensors on plain HTTP.
- iPhone: Safari or Chrome; motion permission is requested on tap.
- Android: Chrome. Vibration only works on Android (iOS has no web vibration API).
- Turn on **rotation lock**, so the screen doesn't flip when you turn the phone around Z.

## Run locally

```bash
cd webapp
npm install
npm run dev
```

Open the printed URL in **two tabs**: one as expert, one as beginner. Without a Firebase URL
the app runs in **local mode**, where the tabs sync through `localStorage`. Local mode only works
between tabs of the same browser. Use it for development or as a backup demo.

To test on a real phone you need HTTPS, so deploy (below) or use a tunnel.

```bash
npm test        # rotation-maths unit tests (node:test)
npm run lint
npm run build
```

## Real-time sync (Firebase): one-time setup

1. <https://console.firebase.google.com> → **Add project** (Analytics not needed).
2. **Build → Realtime Database → Create database** → any location → **Start in test mode**.
3. Replace the rules with [`firebase/database.rules.json`](firebase/database.rules.json)
   (Rules tab → paste → Publish).
4. Copy the database URL (e.g. `https://tilttwin-xxxx-default-rtdb.firebaseio.com`) and put it in
   `webapp/.env.local`:

   ```bash
   VITE_FIREBASE_DATABASE_URL=https://tilttwin-xxxx-default-rtdb.firebaseio.com
   ```

That one URL is all the app needs. It isn't a secret, because the rules decide what can be written.

## Deploy (Vercel)

1. <https://vercel.com/new> → import this GitHub repo.
2. **Root Directory:** `webapp` (framework auto-detects as Vite).
3. **Environment Variables:** `VITE_FIREBASE_DATABASE_URL` = your database URL.
4. Deploy, then put the URL at the top of this README.

## Code map

| File | What it does |
|---|---|
| `webapp/src/hooks/usePhoneTilt.ts` | DeviceOrientation → angle around one axis; calibration, iOS permission, smoothing |
| `webapp/src/utils/rotationMath.ts` | Phone pose quaternion, swing-twist angle, wrap-around, match thresholds |
| `webapp/src/sync.ts` | `useRoom()`: Firebase Realtime Database room, or `localStorage` fallback |
| `webapp/src/views/ExpertView.tsx` | Lesson controls, live mirror of the beginner, corrections, results log |
| `webapp/src/views/BeginnerView.tsx` | Full-screen phone HUD: instruction, hint, gauge, demo, ✓ |
| `webapp/src/components/CadScene.tsx` | Three.js scene: part, axis line, turn arrow |
| `webapp/tests/rotationMath.test.ts` | Checks that the physical phone motions map to the right sign and axis |

## Known limitations

See the "Known limitations" section of the design-process PDF. In short:
- One rotation axis per lesson, by design.
- One expert and one beginner per room.
- Rooms are open to anyone who has the code.
- The Y axis (turning left/right) can drift slowly on phones with weak compass or gyro sensors. Press **Calibrate** to fix it.

## Credits

Built by the CPSC 581 TiltTwin team. AI assistance (Claude) was used for parts of the
implementation and for drafting documentation. See the write-up for details.
