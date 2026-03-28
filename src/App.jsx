import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const GOAL = 20;
const PINK = "#FA8FD4";
const CYAN = "#27D3F5";
const GOOD_ITEMS = ["👸", "👸", "👸", "🧚", "🌟", "💫", "⭐", "🌸", "❤️", "❤️", "💖", "💝"];
const BAD_ITEMS  = ["💔", "❌", "💩"];
const PARTY_ITEMS = ["👸", "🪿", "🌈", "✨", "🦄", "💖", "🌸", "⭐", "🎊", "🎉", "🪿", "🌈", "🪿"];

const HEART_PATH = "M200 278 C200 278 50 188 50 104 C50 54 84 20 130 20 C161 20 183 37 200 57 C217 37 239 20 270 20 C316 20 350 54 350 104 C350 188 200 278 200 278Z";

function rand(a, b) { return Math.random() * (b - a) + a; }

function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const play = (freq, startTime, duration, vol = 0.28, wave = "sine") => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = wave; osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };
    if (type === "good") {
      play(660, 0,    0.12);
      play(880, 0.09, 0.18);
      play(1100,0.2,  0.22);
    } else if (type === "bad") {
      play(220, 0, 0.25, 0.18, "triangle");
      play(180, 0.12, 0.22, 0.12, "triangle");
    } else if (type === "win") {
      [523, 659, 784, 1047, 1319].forEach((f, i) => play(f, i * 0.13, 0.35, 0.3));
    }
  } catch (_) {}
}

function HeartMeter({ count }) {
  const pct = Math.min(1, count / GOAL);
  const HEART_BOT = 278;
  const HEART_H = 258;
  const fillY = HEART_BOT - pct * HEART_H;
  const textCol = pct > 0.55 ? "white" : PINK;
  const subCol  = pct > 0.65 ? "rgba(255,255,255,0.75)" : `${PINK}bb`;

  return (
    <svg viewBox="0 0 400 298" width="100%" style={{ display: "block", filter: `drop-shadow(0 0 18px ${PINK}44)` }}>
      <defs>
        <clipPath id="hc"><path d={HEART_PATH} /></clipPath>
      </defs>
      <path d={HEART_PATH} fill={`${PINK}14`} stroke={PINK} strokeWidth="5" strokeLinejoin="round" />
      {pct > 0 && (
        <rect x="0" y={fillY} width="400" height={HEART_BOT - fillY + 30}
          fill={PINK} clipPath="url(#hc)" opacity="0.9" />
      )}
      {pct > 0 && pct < 0.99 && (
        <rect x="0" y={fillY - 3} width="400" height="6"
          fill="white" clipPath="url(#hc)" opacity="0.28" />
      )}
      <text x="200" y="152" textAnchor="middle" fontSize="54" fontWeight="700"
        fontFamily="'Fredoka One', cursive" fill={textCol}>{count}</text>
      <text x="200" y="186" textAnchor="middle" fontSize="17"
        fontFamily="'Fredoka One', cursive" fill={subCol}>/ {GOAL} 👸</text>
      <text x="200" y="68" textAnchor="middle" fontSize="22"
        fontFamily="inherit" opacity={pct > 0.82 ? 1 : 0.25}>👑</text>
    </svg>
  );
}

function Item({ item, onCatch, gameH }) {
  const { id, x, speed, emoji, kind } = item;
  const [y, setY] = useState(-65);

  useEffect(() => {
    let alive = true;
    let cy = -65;
    const tick = () => {
      if (!alive) return;
      cy += speed;
      setY(cy);
      if (cy > gameH + 80) { onCatch(id, "miss"); return; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => { alive = false; };
  }, []);

  return (
    <div onClick={() => onCatch(id, kind)} style={{
      position: "absolute", left: x, top: y,
      transform: "translateX(-50%)", fontSize: "69px",
      cursor: "pointer", userSelect: "none", WebkitUserSelect: "none",
      zIndex: 30, WebkitTapHighlightColor: "transparent",
      filter: kind === "good"
        ? `drop-shadow(0 3px 10px ${PINK}80)`
        : "drop-shadow(0 3px 10px rgba(180,0,0,0.25))",
    }}>
      {emoji}
    </div>
  );
}

function FloatLabel({ label, x, y, good }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y, pointerEvents: "none", zIndex: 100,
      fontSize: "26px", fontWeight: 700, fontFamily: "'Fredoka One', cursive",
      color: good ? PINK : "#EF4444",
      textShadow: "0 2px 6px rgba(0,0,0,0.15)",
      animation: "floatUp 1s ease-out forwards",
    }}>{label}</div>
  );
}

function Celebration({ onPlayAgain }) {
  const bits = useMemo(() => Array.from({ length: 45 }, (_, i) => ({
    id: i, x: rand(1, 96), size: rand(20, 42),
    dur: rand(1.8, 4.8), del: rand(0, 3.2),
    e: PARTY_ITEMS[i % PARTY_ITEMS.length],
  })), []);

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 500,
      background: `linear-gradient(160deg, #fff3fc 0%, #e8fbff 50%, #fff3fc 100%)`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.7s ease-out",
    }}>
      <div style={{ textAlign: "center", zIndex: 10, padding: "0 28px" }}>
        <div style={{ fontSize: 68 }}>👸🏰👸</div>
        <div style={{ fontSize: 46, margin: "4px 0 -4px", letterSpacing: 4 }}>🪿🪿🪿</div>
        <h1 style={{
          fontFamily: "'Fredoka One', cursive", fontWeight: 400,
          fontSize: "clamp(28px, 8vw, 50px)", margin: "16px 0 8px",
          background: `linear-gradient(135deg, ${PINK} 0%, ${CYAN} 100%)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>20 Princesses Saved!</h1>
        <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: 20, color: CYAN, margin: "0 0 8px" }}>
          🌈 You're the greatest royal hero! 🌈
        </p>
        <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: 15, color: `${PINK}cc`, margin: "0 0 28px" }}>
          🪿 Even the geese are celebrating! 🪿
        </p>
        <button onClick={onPlayAgain} style={{
          fontFamily: "'Fredoka One', cursive", fontWeight: 400, fontSize: 20,
          background: `linear-gradient(135deg, ${PINK}, ${CYAN})`, color: "white",
          border: "none", borderRadius: 18, padding: "14px 38px", cursor: "pointer",
          boxShadow: `0 4px 24px ${PINK}55`,
        }}>Play Again! 💖</button>
      </div>
      {bits.map(b => (
        <div key={b.id} style={{
          position: "absolute", left: `${b.x}%`, top: "-55px", fontSize: b.size,
          animation: `rain ${b.dur}s ${b.del}s linear infinite`,
          pointerEvents: "none",
        }}>{b.e}</div>
      ))}
    </div>
  );
}

function Bg() {
  const blobs = useMemo(() => Array.from({ length: 7 }, (_, i) => ({
    id: i, x: rand(5, 88), y: rand(5, 88),
    w: rand(80, 200), h: rand(80, 180),
    col: i % 2 ? PINK : CYAN, dur: rand(5, 11),
  })), []);
  return (
    <>
      {blobs.map(b => (
        <div key={b.id} style={{
          position: "absolute", left: `${b.x}%`, top: `${b.y}%`,
          width: b.w, height: b.h, borderRadius: "50%",
          background: b.col, opacity: 0.055,
          animation: `pulse ${b.dur}s ease-in-out infinite`,
          pointerEvents: "none", zIndex: 0,
          transform: "translate(-50%, -50%)",
        }} />
      ))}
    </>
  );
}

export default function PrincessCatcher() {
  const [items, setItems] = useState([]);
  const [floats, setFloats] = useState([]);
  const [count, setCount] = useState(0);
  const [won, setWon] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [gameArea, setGameArea] = useState({ w: 390, h: 700 });
  const containerRef = useRef(null);
  const itemId  = useRef(0);
  const floatId = useRef(0);
  const countRef = useRef(0);

  useEffect(() => {
    const m = () => {
      if (containerRef.current)
        setGameArea({ w: containerRef.current.offsetWidth, h: containerRef.current.offsetHeight });
    };
    m();
    window.addEventListener("resize", m);
    return () => window.removeEventListener("resize", m);
  }, []);

  useEffect(() => {
    if (won) return;
    let timeout;
    const spawn = () => {
      const lv = Math.min(10, Math.floor(countRef.current / 10) + 1);
      const isGood = Math.random() > 0.28;
      const pool = isGood ? GOOD_ITEMS : BAD_ITEMS;
      const emoji = pool[Math.floor(Math.random() * pool.length)];
      setItems(p => [...p.slice(-4), {
        id: itemId.current++,
        x: rand(45, gameArea.w - 45),
        speed: rand(0.8 + lv * 0.08, 1.6 + lv * 0.10),
        emoji, kind: isGood ? "good" : "bad",
      }]);
      const delay = rand(Math.max(900, 2200 - lv * 80), Math.max(1400, 3200 - lv * 100));
      timeout = setTimeout(spawn, delay);
    };
    timeout = setTimeout(spawn, 250);
    return () => clearTimeout(timeout);
  }, [won, gameArea]);

  useEffect(() => {
    if (count >= GOAL && !won) { setWon(true); playSound("win"); }
    countRef.current = count;
  }, [count, won]);

  const handleCatch = useCallback((id, kind) => {
    setItems(p => p.filter(i => i.id !== id));
    if (kind === "miss") return;
    const fid = floatId.current++;
    const fx = rand(60, gameArea.w - 80);
    const fy = gameArea.h * 0.36;
    if (kind === "good") {
      setCount(c => Math.min(GOAL, c + 1));
      setFloats(p => [...p, { id: fid, label: "+1 👸", x: fx, y: fy, good: true }]);
      playSound("good");
    } else {
      setFloats(p => [...p, { id: fid, label: "💨 nope!", x: fx, y: fy, good: false }]);
      playSound("bad");
    }
    setTimeout(() => setFloats(p => p.filter(f => f.id !== fid)), 1000);
  }, [gameArea]);

  const handlePlayAgain = useCallback(() => {
    setItems([]); setFloats([]); setCount(0); setWon(false); setShaking(false);
    countRef.current = 0;
  }, []);

  return (
    <div ref={containerRef} style={{
      width: "100%", height: "100vh", minHeight: 580,
      position: "relative", overflow: "hidden",
      fontFamily: "'Fredoka One', cursive",
      background: `linear-gradient(160deg, #fff5fb 0%, #f0fbff 55%, #fff5fb 100%)`,
      animation: shaking ? "shake 0.4s ease-out" : "none",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');
        @keyframes floatUp{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-90px);opacity:0}}
        @keyframes rain{0%{transform:translateY(-60px) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(400deg);opacity:0.4}}
        @keyframes pulse{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.18)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
        @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes shimmer{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
      `}</style>

      <Bg />

      {/* ELSA title */}
      <div style={{ position: "relative", zIndex: 60, textAlign: "center", paddingTop: 14 }}>
        <h1 style={{
          margin: "0 0 2px",
          fontSize: "clamp(36px, 12vw, 64px)",
          fontFamily: "'Fredoka One', cursive",
          fontWeight: 400,
          letterSpacing: "0.12em",
          background: `linear-gradient(135deg, ${PINK} 0%, ${CYAN} 50%, ${PINK} 100%)`,
          backgroundSize: "200% 200%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "bob 2.5s ease-in-out infinite, shimmer 3s ease-in-out infinite",
        }}>✨ ELSA ✨</h1>
        <p style={{ margin: "0 0 2px", fontSize: 14, color: `${PINK}cc`, fontFamily: "'Fredoka One', cursive" }}>
          Otter's First Game
        </p>
        <p style={{ margin: 0, fontSize: 12, color: `${CYAN}dd`, fontFamily: "'Fredoka One', cursive" }}>
          Tap princesses! Avoid 💔 ❌ 💩 — they cost 3 points!
        </p>
      </div>

      <div style={{ position: "relative", zIndex: 10, padding: "4px 28px 0", maxWidth: 340, margin: "0 auto" }}>
        <HeartMeter count={count} />
      </div>

      {items.map(item => (
        <Item key={item.id} item={item} onCatch={handleCatch} gameH={gameArea.h} />
      ))}

      {floats.map(f => (
        <FloatLabel key={f.id} label={f.label} x={f.x} y={f.y} good={f.good} />
      ))}

      {won && <Celebration onPlayAgain={handlePlayAgain} />}

      <div style={{
        position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
        zIndex: 60, display: "flex", gap: 14, alignItems: "center",
        background: "rgba(255,255,255,0.72)", backdropFilter: "blur(8px)",
        borderRadius: 14, padding: "5px 18px",
        border: `1.5px solid ${PINK}35`, whiteSpace: "nowrap",
        fontFamily: "'Fredoka One', cursive", fontSize: 13, color: "#bbb",
      }}>
        <span style={{ color: PINK }}>👸 +1</span>
        <span style={{ color: "#eee" }}>|</span>
        <span style={{ color: "#bbb" }}>💔 ❌ 💩 avoid!</span>
      </div>
    </div>
  );
}
