import { useCallback, useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { getDatabase, onValue, ref, update } from 'firebase/database'
import type { Axis } from './utils/rotationMath'

export type Lesson = { id: number; axis: Axis; angle: number }

export type BeginnerState = {
  angle: number
  mode: 'tilt' | 'drag'
  lessonId: number
  done: boolean
  seconds: number
  beat: number
}

export type Room = {
  lesson?: Lesson | null
  message?: { id: number; text: string } | null
  beginner?: BeginnerState | null
}

// Not a secret: access is controlled by firebase/database.rules.json.
// Set VITE_FIREBASE_DATABASE_URL= (empty) in .env.local to use local mode.
const databaseURL: string =
  import.meta.env.VITE_FIREBASE_DATABASE_URL ?? 'https://tilttwin-581-3cv9z-default-rtdb.firebaseio.com'

// Without a Firebase URL, rooms live in localStorage so two tabs of the same
// browser can still talk (handy for offline dev and as a demo backup).
export const db = databaseURL ? getDatabase(initializeApp({ databaseURL })) : null

const storageKey = (roomId: string) => `tilttwin:${roomId}`

function readLocal(roomId: string): Room {
  try {
    return JSON.parse(localStorage.getItem(storageKey(roomId)) ?? '{}')
  } catch {
    return {}
  }
}

export function useRoom(roomId: string) {
  const [room, setRoom] = useState<Room>(() => (db ? {} : readLocal(roomId)))

  useEffect(() => {
    if (db) {
      return onValue(ref(db, `rooms/${roomId}`), (snapshot) =>
        setRoom(snapshot.val() ?? {})
      )
    }

    // The storage event only fires in *other* tabs, which is exactly what we want.
    const onStorage = () => setRoom(readLocal(roomId))
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [roomId])

  const patch = useCallback(
    (changes: Room) => {
      if (db) {
        update(ref(db, `rooms/${roomId}`), changes).catch((error) =>
          console.error('TiltTwin sync failed', error)
        )
        return
      }

      const next = { ...readLocal(roomId), ...changes }
      localStorage.setItem(storageKey(roomId), JSON.stringify(next))
      setRoom(next)
    },
    [roomId]
  )

  return [room, patch] as const
}
