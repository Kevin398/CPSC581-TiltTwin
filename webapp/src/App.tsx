import { useState } from 'react'
import { db } from './sync'
import ExpertView from './views/ExpertView'
import BeginnerView from './views/BeginnerView'
import './App.css'

// Room codes go into a database path, so keep them to a safe alphabet.
const cleanRoom = (value: string | null) =>
  (value ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)

// No 0/O or 1/I, so codes are easy to read aloud.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const newRoomCode = () =>
  Array.from({ length: 4 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join('')

export default function App() {
  const params = new URLSearchParams(location.search)
  const room = cleanRoom(params.get('room'))
  const role = params.get('role')

  if (room && role === 'expert') return <ExpertView roomId={room} />
  if (room && role === 'beginner') return <BeginnerView roomId={room} />
  return <Home />
}

function Home() {
  const [code] = useState(newRoomCode)

  return (
    <main className="home">
      <h1>TiltTwin</h1>
      <p className="lede">
        Teach CAD rotations remotely. The expert demonstrates a rotation; the beginner
        reproduces it by physically turning their phone, with live feedback on both ends.
      </p>

      <div className="home-cards">
        <section className="panel">
          <h2>I'm the expert</h2>
          <p className="muted">Use a laptop. You'll get a room code to share.</p>
          <a className="button primary" href={`?role=expert&room=${code}`}>
            Start a lesson
          </a>
        </section>

        <section className="panel">
          <h2>I'm the beginner</h2>
          <p className="muted">Use a phone. Enter the code from your expert.</p>
          <form className="row" method="get">
            <input type="hidden" name="role" value="beginner" />
            <input
              name="room"
              aria-label="Room code"
              placeholder="ROOM CODE"
              required
              pattern="[A-Za-z0-9]{4,8}"
              autoCapitalize="characters"
              autoComplete="off"
            />
            <button type="submit" className="primary">Join</button>
          </form>
        </section>
      </div>

      {!db && (
        <p className="warn">
          Local mode (no Firebase URL configured): open the expert and beginner in two
          tabs of this same browser.
        </p>
      )}
    </main>
  )
}
