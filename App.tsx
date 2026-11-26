import { useEffect, useState } from "react";
import { hero, spots, type Spot } from "./data";

function AudioPlayer({ text }: { text: string[] }) {
  const [playing, setPlaying] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  useEffect(() => () => { if (supported) speechSynthesis.cancel(); }, [supported]);
  const toggle = () => {
    if (!supported) return;
    if (playing) { speechSynthesis.cancel(); setPlaying(false); return; }
    const u = new SpeechSynthesisUtterance(text.join(" "));
    u.lang = "ru-RU"; u.rate = 0.9;
    const ru = speechSynthesis.getVoices().find((v) => v.lang.startsWith("ru"));
    if (ru) u.voice = ru;
    u.onend = () => setPlaying(false);
    speechSynthesis.speak(u);
    setPlaying(true);
  };
  return (
    <div>
      <button onClick={toggle} disabled={!supported}
        className="mb-4 flex w-full items-center gap-4 rounded-xl bg-gradient-to-r from-red-800 to-amber-700 p-4 text-left text-white shadow-lg transition hover:brightness-110 disabled:opacity-50">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl">{playing ? "⏸" : "▶"}</span>
        <span>
          <span className="block font-semibold">{playing ? "Идёт воспроизведение…" : "Слушать рассказ"}</span>
          <span className="text-xs text-white/70">{supported ? "Голосовое озвучивание" : "Браузер не поддерживает озвучку"}</span>
        </span>
        {playing && (
          <span className="ml-auto flex h-6 items-end gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="w-1 animate-bounce rounded bg-white" style={{ height: `${40 + i * 12}%`, animationDelay: `${i * 0.1}s` }} />
            ))}
          </span>
        )}
      </button>
      <div className="space-y-2 text-sm italic text-stone-400">{text.map((t, i) => <p key={i}>{t}</p>)}</div>
    </div>
  );
}

function Content({ s }: { s: Spot }) {
  if (s.kind === "audio") return <AudioPlayer text={s.paragraphs!} />;
  if (s.kind === "timeline" || s.kind === "awards")
    return (
      <ol className="relative space-y-4 border-l-2 border-amber-600/40 pl-6">
        {s.items!.map((it, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-amber-400 bg-stone-900" />
            <div className="font-mono text-sm font-bold text-amber-300">{s.kind === "awards" ? "🏅 " : ""}{it.date}</div>
            <p className="text-sm leading-relaxed text-stone-300">{it.text}</p>
          </li>
        ))}
      </ol>
    );
  return (
    <div className="space-y-3">
      {s.paragraphs?.map((p, i) => <p key={i} className="leading-relaxed text-stone-300">{p}</p>)}
      {s.quote && <blockquote className="border-l-4 border-red-600 bg-red-950/30 p-4 font-serif italic text-amber-100">{s.quote}</blockquote>}
      {s.links && (
        <ul className="space-y-2 pt-1">
          {s.links.map((l) => (
            <li key={l.label}>
              {l.url === "#" ? (
                <span className="block rounded-lg bg-stone-800/60 p-3 text-sm text-stone-400">ℹ️ {l.label}</span>
              ) : (
                <a href={l.url} target="_blank" rel="noreferrer"
                  className="flex items-center justify-between gap-3 rounded-lg bg-stone-800/60 p-3 text-sm text-amber-200 transition hover:bg-stone-700">
                  <span>{s.kind === "video" ? "▶ " : "📎 "}{l.label}</span><span>↗</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState<number | null>(null);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [intro, setIntro] = useState(true);

  const open = (i: number) => {
    setActive(i);
    setSeen((p) => new Set(p).add(spots[i].id));
  };
  const close = () => { setActive(null); if ("speechSynthesis" in window) speechSynthesis.cancel(); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (active === null) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") open((active + 1) % spots.length);
      if (e.key === "ArrowLeft") open((active - 1 + spots.length) % spots.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const s = active !== null ? spots[active] : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_center,#292524,#0c0a09)] p-3 md:p-6">
      <style>{`
        @keyframes pop{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:none}}
        @keyframes ring{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.2);opacity:0}}
        @keyframes kb{from{transform:scale(1.08)}to{transform:scale(1)}}
      `}</style>

      {/* Poster */}
      <div className="relative w-full max-w-[560px] overflow-hidden rounded-xl border-4 border-stone-800 shadow-[0_30px_80px_rgba(0,0,0,.8)]" style={{ aspectRatio: "2 / 3" }}>
        <img src="/poster-bg.jpg" alt="Воин-десантник в горах Афганистана" className="absolute inset-0 h-full w-full object-cover" style={{ animation: "kb 12s ease-out forwards" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/80" />

        {/* Title */}
        <div className="absolute inset-x-0 top-0 p-5 text-center md:p-7">
          <p className="text-[9px] font-semibold uppercase tracking-[0.35em] text-amber-200/80 md:text-[11px]">У каждого времени свои герои</p>
          <h1 className="mt-2 font-serif text-2xl font-black uppercase leading-tight text-white drop-shadow-lg md:text-4xl">
            Николай <span className="text-amber-300">Чепик</span>
          </h1>
          <p className="mt-1 font-mono text-xs text-amber-100/90 md:text-sm">{hero.years}</p>
          <p className="mx-auto mt-2 max-w-xs text-[10px] leading-snug text-stone-200/80 md:text-xs">{hero.rank}</p>
        </div>

        {/* Star */}
        <div className="absolute right-5 top-[22%] flex flex-col items-center md:right-7">
          <svg viewBox="0 0 24 24" className="h-10 w-10 drop-shadow-[0_0_10px_rgba(251,191,36,.8)] md:h-12 md:w-12"><path fill="#fbbf24" d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7.3L12 17.8 5.8 21.5l1.6-7.3L2 9.5l7.1-.6z" /></svg>
          <div className="h-6 w-4 bg-gradient-to-b from-red-600 to-red-800" />
        </div>

        {/* Motto */}
        <div className="absolute inset-x-0 bottom-0 p-5 text-center">
          <p className="font-serif text-lg italic text-amber-100 drop-shadow md:text-2xl">«{hero.motto}»</p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.3em] text-stone-400 md:text-[10px]">Пуховичский район · Афганистан 1979–1989</p>
        </div>

        {/* Hotspots */}
        {spots.map((sp, i) => {
          const was = seen.has(sp.id);
          return (
            <button key={sp.id} onClick={() => open(i)} title={sp.title}
              style={{ left: `${sp.x}%`, top: `${sp.y}%` }}
              className="group absolute z-10 -translate-x-1/2 -translate-y-1/2">
              {!was && <span className="absolute inset-0 rounded-full bg-amber-400" style={{ animation: "ring 1.8s ease-out infinite" }} />}
              <span className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg shadow-lg backdrop-blur transition group-hover:scale-125 md:h-12 md:w-12 md:text-xl ${
                was ? "border-amber-200/60 bg-black/60" : "border-amber-300 bg-amber-500/90"}`}>
                {sp.icon}
              </span>
              <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-0.5 text-[10px] font-semibold text-amber-100 opacity-0 transition group-hover:opacity-100 md:text-xs">
                {sp.title}
              </span>
            </button>
          );
        })}

        {/* Progress */}
        <div className="absolute left-3 top-3 z-10 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-amber-200 backdrop-blur">
          {seen.size}/{spots.length}
        </div>

        {/* Intro */}
        {intro && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
            <div className="max-w-xs text-center" style={{ animation: "pop .4s ease" }}>
              <div className="mb-3 text-4xl">⭐</div>
              <h2 className="font-serif text-2xl font-bold text-amber-200">Интерактивный плакат</h2>
              <p className="mt-3 text-sm text-stone-300">История первого Героя Советского Союза за Афганистан — нашего земляка.</p>
              <p className="mt-2 text-xs text-stone-400">Нажимайте на мерцающие значки, чтобы открыть биографию, подвиг, награды, аудио, видео и источники.</p>
              <button onClick={() => setIntro(false)} className="mt-5 rounded-lg bg-red-700 px-6 py-2.5 font-semibold text-white transition hover:bg-red-600">Начать</button>
            </div>
          </div>
        )}

        {/* Modal */}
        {s && (
          <div className="absolute inset-0 z-20 flex items-end bg-black/60 backdrop-blur-[2px] md:items-center md:p-6" onClick={close}>
            <div onClick={(e) => e.stopPropagation()} key={s.id}
              className="flex max-h-[85%] w-full flex-col overflow-hidden rounded-t-2xl border border-amber-700/40 bg-stone-900/95 shadow-2xl md:rounded-2xl"
              style={{ animation: "pop .3s ease" }}>
              <div className="flex items-start gap-3 border-b border-stone-700/70 bg-gradient-to-r from-red-950/80 to-stone-900 p-4">
                <span className="text-3xl">{s.icon}</span>
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-bold text-amber-200">{s.title}</h3>
                  {s.subtitle && <p className="text-xs text-stone-400">{s.subtitle}</p>}
                </div>
                <button onClick={close} className="rounded-full p-1 text-xl text-stone-400 hover:text-white">✕</button>
              </div>
              <div className="overflow-y-auto p-5"><Content s={s} /></div>
              <div className="flex items-center justify-between border-t border-stone-700/70 p-3 text-sm">
                <button onClick={() => open((active! - 1 + spots.length) % spots.length)} className="rounded px-3 py-1 text-stone-300 hover:bg-stone-800">← Назад</button>
                <span className="text-xs text-stone-500">{active! + 1} / {spots.length}</span>
                <button onClick={() => open((active! + 1) % spots.length)} className="rounded px-3 py-1 text-stone-300 hover:bg-stone-800">Далее →</button>
              </div>
            </div>
          </div>
        )}

        {/* Completion */}
        {seen.size === spots.length && active === null && (
          <div className="absolute inset-x-4 bottom-20 z-10 rounded-lg bg-black/70 p-2 text-center text-xs text-amber-200 backdrop-blur" style={{ animation: "pop .4s ease" }}>
            🕯️ Вы узнали всю историю героя. Помним. Гордимся.
          </div>
        )}
      </div>
    </div>
  );
}
