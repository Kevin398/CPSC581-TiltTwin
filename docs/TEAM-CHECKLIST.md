# What's left before Wed Oct 21, 10 PM

The code is done and tested in a browser with simulated sensors. These steps need people,
accounts or real phones. They're in order, with rough times.

## 1. Hosting: done

- [x] Firebase is done: project `tilttwin-581-3cv9z`, rules deployed, and sync tested end-to-end.
- [x] Vercel is done: **https://tilttwin.vercel.app** (verified end-to-end over HTTPS). To redeploy, run `npx vercel deploy --prod` from `webapp/`.
- [ ] Optional: in the Firebase console, add teammates under Project settings → Users and permissions.

## 2. Real-phone check (≈20 min)

Open https://tilttwin.vercel.app as the expert on a laptop, and as the beginner on an **iPhone** and an **Android** phone. Use different networks, e.g. phone on cellular.

- [ ] iPhone: the "Allow motion" prompt appears and the part follows the phone.
- [ ] Each axis turns the right way. Send Y +45 (turn left), X +45 (tilt top toward you) and Z +90 (counter-clockwise).
- [ ] ✓ appears on both screens; chime plays; Android vibrates.
- [ ] Corrections arrive on the phone; End lesson clears it.
- [ ] If a direction is reversed on a real phone: tell whoever owns the code. The fix is one sign in `AXIS_HINTS` or `deviceQuaternion`, with a matching change in `tests/rotationMath.test.ts`.
- [ ] If the part is too jittery or too laggy, tune `SMOOTHING` in `webapp/src/hooks/usePhoneTilt.ts`. If matching is too hard or too easy, tune `TOLERANCE` in `webapp/src/utils/rotationMath.ts`.
- [ ] Write the phones and browsers you tested in write-up §7.1 ("Real devices").

## 3. Usability test A vs B (≈45 min, 3–5 participants)

The protocol is in write-up §7.2. Per participant:

1. Do the conditions in counterbalanced order: half start with **A (drag)**, half with **B (tilt)**. The beginner switches using the **Use drag / Use tilt** button.
2. In each condition, the expert sends Y +45°, X −90° and Z +90°.
3. Expert: press **Copy CSV** after each participant and paste it into a sheet. It records times automatically.
4. Write down by hand: wrong-direction starts, corrections sent, the 1–5 rating for "I understood which way to rotate", the preferred condition, and quotes.

Then fill in the table and the "Observations" / "Changes made" lines in §7.2. **Only real numbers.**

## 4. Finish the write-up (≈30 min)

Edit `docs/design-process/design-process.html`. Every orange `[…]` is a placeholder:
- team names (page 1 and §9)
- confirm or adjust the Table 1 scores
- an extra reason for dropping transparency, if you had one
- real devices tested, test results, AI-use wording

Then regenerate the PDF:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer --print-to-pdf=docs/TiltTwin-Design-Process.pdf "file://$PWD/docs/design-process/design-process.html"
```

(Run it from the repo root. You can also open the HTML in Chrome → Print → Save as PDF with headers/footers off.)

## 5. Demo video (≤ 2:00, no music)

Film the laptop and the phone in one frame, or split screen. Add text captions.

| Time | Shot | Caption |
|---|---|---|
| 0:00–0:10 | Title + both devices | "TiltTwin: an expert teaches 3D rotation; the beginner learns it with their hands" |
| 0:10–0:25 | Expert starts a lesson, reads the code; beginner joins on the phone and taps Start | "Join with a 4-letter room code" |
| 0:25–0:40 | Expert picks Y, +45°, the demo loops, presses Send; the phone buzzes | "Expert demonstrates the rotation" |
| 0:40–1:05 | **Hands turning the phone** (key shot); the part follows; hint + arrow + yellow gauge | "The phone *is* the part: turn it to turn the model" |
| 1:05–1:15 | Expert's screen mirrors live; expert taps "Keep going" | "Expert watches live and corrects" |
| 1:15–1:25 | ✓ Matched on both screens; chime | "Hold on target → confirmed on both ends" |
| 1:25–1:45 | X −90° lesson: tilt the top away, axes overlay visible | "Any axis: tilt, turn, or rotate" |
| 1:45–2:00 | Session results table; quick fallback-to-drag mention | "Logs results for teaching and testing" |

## 6. Critique prep (Oct 22 / 26)

- [ ] Bring: a charged phone with rotation lock on, a backup phone, a laptop, and a hotspot in case campus Wi-Fi blocks Firebase. Have the video file offline.
- [ ] Backup demo if there's no internet: run locally with no Firebase URL, using two tabs on the laptop with drag mode.
- [ ] Everyone should be able to answer:
  - Why phone tilt and not mouse or video?
  - Why one axis?
  - Why did you drop transparency?
  - What did testing change?
  - What would you build next? (Compound rotations as lesson sequences, extrude by pushing the phone forward, multiple beginners.)

## 7. Submit

- [ ] PDF: `docs/TiltTwin-Design-Process.pdf`
- [ ] Video
- [ ] Repo link (make sure it's public)
- [ ] Live URL + README instructions
