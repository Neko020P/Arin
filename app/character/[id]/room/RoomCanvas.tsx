'use client'
import { useEffect, useRef, useState } from 'react'
import { calcCurrentStats } from '@/lib/stats'
import type { Stats } from '@/lib/stats'

type Props = {
  spriteUrl: string
  bgUrl: string | null
  stats: Stats   
}

type Mood = 'happy' | 'normal' | 'sad'

function getMood(stats: Stats): Mood {
  const avg = (stats.hunger + stats.happiness + stats.energy) / 3
  if (avg >= 60) return 'happy'
  if (avg >= 30) return 'normal'
  return 'sad'
}

// กำหนดจุด A B C เป็น % จากซ้าย — ปรับได้
const WAYPOINTS = { A: 15, B: 30, C: 50, D: 65, E: 80 }
const POINTS = Object.values(WAYPOINTS)

function pickNext(current: number): number {
  // randomly pick next point not current
  const others = POINTS.filter(p => p !== current)
  return others[Math.floor(Math.random() * others.length)]
}

export default function RoomCanvas({ spriteUrl, bgUrl, stats }: Props) {
  const mood = getMood(stats)

  const [spriteLoaded, setSpriteLoaded] = useState(false)
  const [posX, setPosX] = useState(WAYPOINTS.B)          // เริ่มที่กลาง
  const [facing, setFacing] = useState<'left' | 'right'>('right')

  const posXRef  = useRef(WAYPOINTS.B)
  const targetRef = useRef(WAYPOINTS.C)                  // จุดแรกที่จะเดินไป
  const waitRef  = useRef(false)                         // กำลังหยุดพักอยู่ไหม

  useEffect(() => {
    const SPEED = 0.06   // % ต่อ frame — ปรับความเร็วที่นี่
    const MIN_WAIT = 800  // ms หยุดพักขั้นต่ำ
    const MAX_WAIT = 2500 // ms หยุดพักสูงสุด

    const interval = setInterval(() => {
      if (waitRef.current) return  // กำลังหยุดพักอยู่ → ข้าม

      const target = targetRef.current
      const current = posXRef.current
      const diff = target - current

      if (Math.abs(diff) < SPEED) {
        // ถึงจุดปลายทางแล้ว → หยุดพัก แล้วสุ่มจุดใหม่
        posXRef.current = target
        setPosX(target)
        waitRef.current = true

        const waitTime = MIN_WAIT + Math.random() * (MAX_WAIT - MIN_WAIT)
        setTimeout(() => {
          targetRef.current = pickNext(target)
          waitRef.current = false
        }, waitTime)

      } else {
        // ยังไม่ถึง → เดินต่อ
        const next = current + (diff > 0 ? SPEED : -SPEED)
        posXRef.current = next
        setPosX(next)
        setFacing(diff > 0 ? 'right' : 'left')
      }
    }, 16)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{
        maxWidth: 640,
        aspectRatio: '16/9',
        background: bgUrl
          ? undefined
          : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      {bgUrl && (
        <img src={bgUrl} alt="room background"
          className="absolute inset-0 w-full h-full object-cover" />
      )}

      {/* wrapper แยก flip กับ breathe ไม่ให้ชนกัน */}
      <div
        className="absolute"
        style={{
          bottom: '15%',
          left: `${posX}%`,
          height: '55%',
          transform: 'translateX(-50%)',
          transition: 'none',
        }}
      >
        {/* flip div */}
        <div style={{
          transform: facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
          transition: 'transform 0.15s ease',
          height: '100%',
        }}>
          <img
            src={spriteUrl}
            alt="character"
            onLoad={() => setSpriteLoaded(true)}
            draggable={false}
            className="h-full w-auto object-contain select-none"
            style={{
              animation: spriteLoaded
  ? `breathe ${mood === 'happy' ? '2.5s' : mood === 'sad' ? '5s' : '3.5s'} ease-in-out infinite`
  : 'none',
              transformOrigin: 'bottom center',
              imageRendering: 'pixelated',
              filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))',
            }}
          />
        </div>
      </div>

      {!spriteLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
        </div>
      )}

      <style>{`
        @keyframes breathe {
          0%   { transform: scaleY(1); }
          30%  { transform: scaleX(1.02) scaleY(0.98); }
          50%  { transform: scaleX(0.98) scaleY(1.02); }
          70%  { transform: scaleX(1.01) scaleY(0.99); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}
// 'use client'

// import { useEffect, useRef, useState } from 'react'

// type Props = {
//   spriteUrl: string
//   bgUrl: string | null
// }

// export default function RoomCanvas({ spriteUrl, bgUrl }: Props) {
//   const [spriteLoaded, setSpriteLoaded] = useState(false)

//   return (
//     <div
//       className="relative w-full overflow-hidden rounded-2xl"
//       style={{
//         maxWidth: 640,
//         aspectRatio: '16/9',
//         background: bgUrl ? undefined : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
//       }}
//     >
//       {/* Background */}
//       {bgUrl && (
//         <img
//           src={bgUrl}
//           alt="room background"
//           className="absolute inset-0 w-full h-full object-cover"
//         />
//       )}

//       {/* Default bg ถ้าไม่มี */}
//       {!bgUrl && (
//         <div className="absolute inset-0 flex items-end justify-center pb-8">
//           <div
//             className="w-full h-px opacity-20"
//             style={{ background: 'linear-gradient(90deg, transparent, #fff, transparent)' }}
//           />
//         </div>
//       )}

//       {/* Character sprite */}
//       <div
//         className="absolute"
//         style={{
//           bottom: '15%',
//           left: '50%',
//           transform: 'translateX(-50%)',
//           height: '55%',
//         }}
//       >
//         <img
//           src={spriteUrl}
//           alt="character"
//           onLoad={() => setSpriteLoaded(true)}
//           className="h-full w-auto object-contain select-none"
//           style={{
//             animation: spriteLoaded ? 'breathe 3.5s ease-in-out infinite' : 'none',
//             transformOrigin: 'bottom center',
//             imageRendering: 'pixelated',
//             filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))',
//           }}
//           draggable={false}
//         />
//       </div>

//       {/* กรณียังโหลดไม่เสร็จ */}
//       {!spriteLoaded && (
//         <div className="absolute inset-0 flex items-center justify-center">
//           <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
//         </div>
//       )}

//       {/* CSS animation */}
//       <style>{`
//         @keyframes breathe {
//           0%   { transform: scaleX(1)    scaleY(1);    }
//           30%  { transform: scaleX(1.02) scaleY(0.98); }
//           50%  { transform: scaleX(0.98) scaleY(1.02); }
//           70%  { transform: scaleX(1.01) scaleY(0.99); }
//           100% { transform: scaleX(1)    scaleY(1);    }
//         }
//       `}</style>
//     </div>
//   )
// }