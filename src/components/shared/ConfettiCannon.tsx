'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'

interface Props {
  fire: boolean
}

export default function ConfettiCannon({ fire }: Props) {
  useEffect(() => {
    if (!fire) return

    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ec4899', '#f59e0b', '#a855f7', '#ffffff'],
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ec4899', '#f59e0b', '#a855f7', '#ffffff'],
      })

      if (Date.now() < end) requestAnimationFrame(frame)
    }

    frame()
  }, [fire])

  return null
}
