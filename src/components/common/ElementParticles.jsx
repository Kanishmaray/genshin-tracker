import React, { useMemo } from 'react'

// ─── Shared keyframes injected once ──────────────────────────────────────────
const KEYFRAMES = `
@keyframes hydro-ring {
  0%   { transform: translate(-50%,-50%) scale(0.15); opacity: 0; }
  18%  { opacity: 0.55; }
  100% { transform: translate(-50%,-50%) scale(2.4);  opacity: 0; }
}
@keyframes electro-arc {
  0%   { stroke-dashoffset: 120; opacity: 0; }
  12%  { opacity: 0.85; }
  65%  { stroke-dashoffset: 0;   opacity: 0.55; }
  100% { stroke-dashoffset: 0;   opacity: 0; }
}
@keyframes electro-spark {
  0%,100% { opacity: 0;   transform: translate(0,0) scale(0.4); }
  18%     { opacity: 1;   transform: translate(var(--tx),var(--ty)) scale(1); }
  75%     { opacity: 0.4; transform: translate(var(--tx2),var(--ty2)) scale(0.7); }
}
@keyframes anemo-orbit {
  from { transform: rotate(0deg)   translateX(var(--r)) rotate(0deg); }
  to   { transform: rotate(360deg) translateX(var(--r)) rotate(-360deg); }
}
@keyframes geo-crystal {
  0%,100% { transform: translateY(0px)   rotate(var(--rot)); opacity: var(--op); }
  50%     { transform: translateY(-16px) rotate(calc(var(--rot) + 18deg)); opacity: min(1, calc(var(--op) + 0.15)); }
}
@keyframes pyro-ember {
  0%   { transform: translateY(0)     translateX(0);              opacity: 0.9; }
  50%  { transform: translateY(-55px) translateX(var(--dx));      opacity: 0.6; }
  100% { transform: translateY(-115px) translateX(calc(var(--dx) * 1.8)); opacity: 0; }
}
@keyframes cryo-flake {
  0%   { transform: translateY(-10px) translateX(0)           rotate(0deg);   opacity: 0; }
  10%  { opacity: 0.65; }
  90%  { opacity: 0.35; }
  100% { transform: translateY(110px) translateX(var(--dx))  rotate(280deg); opacity: 0; }
}
`

let stylesInjected = false
function ensureStyles() {
  if (stylesInjected) return
  const el = document.createElement('style')
  el.textContent = KEYFRAMES
  document.head.appendChild(el)
  stylesInjected = true
}

// ─── Hydro — expanding concentric rings ───────────────────────────────────────
function HydroParticles({ color }) {
  const rings = useMemo(() => Array.from({ length: 5 }, (_, i) => ({
    id: i,
    left: 25 + Math.random() * 55,
    top:  10 + Math.random() * 72,
    size: 55 + Math.random() * 90,
    dur:  2.8 + Math.random() * 2.2,
    del:  Math.random() * 5,
  })), [])

  return rings.map(r => (
    <div key={r.id} style={{
      position: 'absolute',
      left: `${r.left}%`,
      top:  `${r.top}%`,
      width:  r.size,
      height: r.size,
      borderRadius: '50%',
      border: `1.5px solid ${color}`,
      boxShadow: `0 0 8px ${color}44`,
      opacity: 0,
      animation: `hydro-ring ${r.dur}s ease-out ${r.del}s infinite`,
    }} />
  ))
}

// ─── Electro — SVG arc sparks + floating dots ─────────────────────────────────
function ElectroParticles({ color }) {
  const arcs = useMemo(() => Array.from({ length: 5 }, (_, i) => ({
    id: i,
    x1: 15 + Math.random() * 65, y1: 5 + Math.random() * 85,
    x2: 15 + Math.random() * 65, y2: 5 + Math.random() * 85,
    qx: (Math.random() - 0.5) * 30,
    qy: (Math.random() - 0.5) * 30,
    dur: 0.75 + Math.random() * 0.65,
    del: Math.random() * 3.5,
  })), [])

  const sparks = useMemo(() => Array.from({ length: 10 }, (_, i) => ({
    id: i,
    left: 8 + Math.random() * 82,
    top:  5 + Math.random() * 85,
    tx:  `${(Math.random() - 0.5) * 44}px`,
    ty:  `${(Math.random() - 0.5) * 44}px`,
    tx2: `${(Math.random() - 0.5) * 66}px`,
    ty2: `${(Math.random() - 0.5) * 66}px`,
    size: 2 + Math.random() * 3,
    dur:  0.55 + Math.random() * 0.85,
    del:  Math.random() * 5,
  })), [])

  return (
    <>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <filter id="elec-glow">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {arcs.map(a => {
          const mx = (a.x1 + a.x2) / 2 + a.qx
          const my = (a.y1 + a.y2) / 2 + a.qy
          return (
            <path key={a.id}
              d={`M ${a.x1} ${a.y1} Q ${mx} ${my} ${a.x2} ${a.y2}`}
              stroke={color} strokeWidth="0.45" fill="none"
              strokeDasharray="120" strokeDashoffset="120"
              filter="url(#elec-glow)"
              style={{ animation: `electro-arc ${a.dur}s ease-in-out ${a.del}s infinite` }}
            />
          )
        })}
      </svg>
      {sparks.map(s => (
        <div key={s.id} style={{
          position: 'absolute',
          left: `${s.left}%`,
          top:  `${s.top}%`,
          width:  s.size, height: s.size,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 7px ${color}`,
          opacity: 0,
          '--tx': s.tx, '--ty': s.ty, '--tx2': s.tx2, '--ty2': s.ty2,
          animation: `electro-spark ${s.dur}s ease-in-out ${s.del}s infinite`,
        }} />
      ))}
    </>
  )
}

// ─── Anemo — particles in circular orbits ─────────────────────────────────────
function AnemoParticles({ color }) {
  const orbs = useMemo(() => Array.from({ length: 11 }, (_, i) => ({
    id: i,
    cx: 35 + Math.random() * 35,
    cy: 25 + Math.random() * 50,
    r:  28 + Math.random() * 58,
    size: 2.5 + Math.random() * 3,
    dur:  5 + Math.random() * 8,
    del: -(Math.random() * 10),
    op:  0.28 + Math.random() * 0.45,
  })), [])

  return orbs.map(p => (
    <div key={p.id} style={{
      position: 'absolute',
      left: `${p.cx}%`,
      top:  `${p.cy}%`,
    }}>
      <div style={{
        position: 'absolute',
        width:  p.size, height: p.size,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 9px ${color}`,
        opacity: p.op,
        '--r': `${p.r}px`,
        animation: `anemo-orbit ${p.dur}s linear ${p.del}s infinite`,
      }} />
    </div>
  ))
}

// ─── Geo — drifting diamond crystals ──────────────────────────────────────────
function GeoParticles({ color }) {
  const crystals = useMemo(() => Array.from({ length: 6 }, (_, i) => ({
    id: i,
    left: 12 + Math.random() * 72,
    top:  8  + Math.random() * 75,
    size: 7 + Math.random() * 11,
    rot: Math.random() * 40,
    op:  0.18 + Math.random() * 0.28,
    dur: 3.5 + Math.random() * 4,
    del: -(Math.random() * 6),
  })), [])

  return crystals.map(c => (
    <div key={c.id} style={{
      position: 'absolute',
      left: `${c.left}%`,
      top:  `${c.top}%`,
      width:  c.size, height: c.size,
      background: color,
      clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      boxShadow: `0 0 14px ${c.size > 14 ? color + '55' : color + '33'}`,
      '--rot': `${c.rot}deg`,
      '--op': c.op,
      animation: `geo-crystal ${c.dur}s ease-in-out ${c.del}s infinite`,
    }} />
  ))
}

// ─── Pyro — rising embers ─────────────────────────────────────────────────────
function PyroParticles({ color }) {
  const embers = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    id: i,
    left: 8 + Math.random() * 82,
    bot: Math.random() * 35,
    size: 2 + Math.random() * 4,
    dx: `${(Math.random() - 0.5) * 36}px`,
    dur: 2 + Math.random() * 2.5,
    del: Math.random() * 5,
  })), [])

  return embers.map(e => (
    <div key={e.id} style={{
      position: 'absolute',
      left: `${e.left}%`,
      bottom: `${e.bot}%`,
      width:  e.size, height: e.size,
      borderRadius: '50%',
      background: color,
      boxShadow: `0 0 8px ${color}`,
      '--dx': e.dx,
      animation: `pyro-ember ${e.dur}s ease-in ${e.del}s infinite`,
    }} />
  ))
}

// ─── Cryo — drifting snowflake dots ───────────────────────────────────────────
function CryoParticles({ color }) {
  const flakes = useMemo(() => Array.from({ length: 10 }, (_, i) => ({
    id: i,
    left: 5 + Math.random() * 88,
    size: 3 + Math.random() * 5,
    dx: `${(Math.random() - 0.5) * 40}px`,
    dur: 4 + Math.random() * 4,
    del: Math.random() * 6,
  })), [])

  return flakes.map(f => (
    <div key={f.id} style={{
      position: 'absolute',
      left: `${f.left}%`,
      top: '-5%',
      width:  f.size, height: f.size,
      borderRadius: '50%',
      border: `1px solid ${color}`,
      boxShadow: `0 0 6px ${color}44`,
      opacity: 0,
      '--dx': f.dx,
      animation: `cryo-flake ${f.dur}s ease-in-out ${f.del}s infinite`,
    }} />
  ))
}

// ─── Default (Dendro etc.) — reuse Geo shape, green tint ─────────────────────
function DendroParticles({ color }) {
  return <GeoParticles color={color} />
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function ElementParticles({ element, color }) {
  ensureStyles()

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {element === 'Hydro'   && <HydroParticles   color={color} />}
      {element === 'Electro' && <ElectroParticles color={color} />}
      {element === 'Anemo'   && <AnemoParticles   color={color} />}
      {element === 'Geo'     && <GeoParticles     color={color} />}
      {element === 'Pyro'    && <PyroParticles    color={color} />}
      {element === 'Cryo'    && <CryoParticles    color={color} />}
      {element === 'Dendro'  && <DendroParticles  color={color} />}
    </div>
  )
}
