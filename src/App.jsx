import React, { useMemo, useState, useEffect, useRef } from "react";
// Tailwind styling is available by default.
// Mobile + Dark Mode (Notion-like): soft dark surfaces, subtle borders, calm contrast.

// ────────────────────────────────────────────────────────────────────────────────
// Helper Components
// ────────────────────────────────────────────────────────────────────────────────

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function formatSeconds(total) {
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(total % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function Timer({ defaultSeconds = 0, label = "Wartezeit" }) {
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  useEffect(() => {
    if (seconds === 0 && running) setRunning(false);
  }, [seconds, running]);

  // Light haptic feedback when timer completes (mobile)
  useEffect(() => {
    if (seconds === 0) {
      if (typeof window !== 'undefined' && navigator?.vibrate) {
        navigator.vibrate(40);
      }
    }
  }, [seconds]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <span className="inline-flex items-center gap-2 text-base sm:text-sm text-gray-700 dark:text-gray-300">
        ⏱️ {label}:
        <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
          {formatSeconds(seconds)}
        </span>
      </span>
      <div className="flex gap-2 w-full sm:w-auto">
        <button
          className={classNames(
            "flex-1 sm:flex-none px-4 py-3 sm:py-2 rounded-xl text-base sm:text-sm",
            running ? "bg-gray-200 dark:bg-[#222]" : "bg-black text-white"
          )}
          onClick={() => setRunning((r) => !r)}
          aria-label={running ? "Timer pausieren" : "Timer starten"}
        >
          {running ? "Pause" : "Start"}
        </button>
        <button
          className="flex-1 sm:flex-none px-4 py-3 sm:py-2 rounded-xl text-base sm:text-sm bg-gray-100 dark:bg-[#1f1f1f] dark:text-gray-200 border dark:border-[#2a2a2a]"
          onClick={() => {
            setRunning(false);
            setSeconds(defaultSeconds);
          }}
          aria-label="Timer zurücksetzen"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function StepCard({ step, onNext, onBack, isFirst, isLast, onSkip }) {
  // Auto-scroll to top when the step changes (helpful on mobile)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step?.id]);

  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl border border-gray-200 dark:border-[#2a2a2a] shadow-sm bg-white dark:bg-[#1a1a1a]">
      <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-[#2a2a2a]">
        <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">{step.section}</div>
        <h2 className="text-lg sm:text-xl font-semibold mt-1 text-gray-900 dark:text-gray-100">{step.title}</h2>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {step.product && (
          <div className="text-base sm:text-sm text-gray-900 dark:text-gray-100">
            <span className="font-semibold">Produkt:</span> {step.product}
          </div>
        )}
        {step.where && (
          <div className="text-base sm:text-sm text-gray-900 dark:text-gray-100">
            <span className="font-semibold">Wo auftragen:</span> {step.where}
          </div>
        )}
        {step.how && (
          <div className="text-base sm:text-sm text-gray-900 dark:text-gray-100">
            <span className="font-semibold">Anwendung:</span> {step.how}
          </div>
        )}
        {step.note && (
          <div className="text-base sm:text-sm text-gray-600 dark:text-gray-300">
            <span className="font-semibold">Hinweis:</span> {step.note}
          </div>
        )}

        {step.waitSeconds ? (
          <Timer defaultSeconds={step.waitSeconds} label={step.waitLabel || "Wartezeit"} />
        ) : null}
      </div>

      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-gray-50 dark:bg-[#151515] rounded-b-2xl border-t border-gray-200 dark:border-[#2a2a2a]">
        <div className="flex gap-2 w-full sm:w-auto">
          {!isFirst && (
            <button
              className="flex-1 sm:flex-none px-4 py-3 sm:py-2 rounded-xl border bg-white hover:bg-gray-100 dark:bg-[#161616] dark:hover:bg-[#1f1f1f] dark:text-gray-100 dark:border-[#2a2a2a]"
              onClick={onBack}
            >
              Zurück
            </button>
          )}
          {onSkip && (
            <button
              className="flex-1 sm:flex-none px-4 py-3 sm:py-2 rounded-xl border bg-white hover:bg-gray-100 dark:bg-[#161616] dark:hover:bg-[#1f1f1f] dark:text-gray-100 dark:border-[#2a2a2a]"
              onClick={onSkip}
            >
              Schritt überspringen
            </button>
          )}
        </div>
        <button
          className="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-xl bg-black text-white hover:bg-gray-800"
          onClick={onNext}
        >
          {isLast ? "Fertig" : "Weiter"}
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Data: Steps
// ────────────────────────────────────────────────────────────────────────────────

function buildMorningSteps({ goingOut, saturday }) {
  const steps = [];

  steps.push({
    id: "shower-body",
    section: "Morgen",
    title: "Duschen (nur Körper)",
    product: "Rituals Duschschaum (Oud) – optional",
    how: "Körper duschen. Gesicht separat später am Waschbecken pflegen.",
    note: saturday
      ? "Heute ist Samstag: Haare werden gleich extra gewaschen & gestylt."
      : undefined,
  });

  if (saturday) {
    steps.push(
      {
        id: "hair-wash",
        section: "Morgen • Haare (nur Samstag)",
        title: "Haare waschen",
        how: "Shampoo + Conditioner nach Lockenmethode verwenden.",
      },
      {
        id: "hair-airdry",
        section: "Morgen • Haare (nur Samstag)",
        title: "Lufttrocknen",
        how: "Haare kurz an der Luft antrocknen lassen, bis sie nur noch leicht feucht sind.",
      },
      {
        id: "hair-product",
        section: "Morgen • Haare (nur Samstag)",
        title: "Haarprodukt einarbeiten",
        how: "Dein Locken-Produkt/Leave-in gleichmäßig in die Längen verteilen.",
      },
      {
        id: "hair-diffuse",
        section: "Morgen • Haare (nur Samstag)",
        title: "Diffuser verwenden",
        how: "Mit Diffusor bis fast trocken föhnen.",
      },
      {
        id: "hair-pony",
        section: "Morgen • Haare (nur Samstag)",
        title: "Pony glätten & Gel",
        how: "Pony ggf. mit Glätteisen glätten und etwas Gel für Halt einarbeiten.",
      }
    );
  }

  if (goingOut) {
    steps.push(
      {
        id: "shave",
        section: "Morgen • Rasur",
        title: "Rasieren (Seiten glatt)",
        product: "NIVEA Men Sensitive Shaving Gel + Philips Wet&Dry",
        where: "Nur die Rasurflächen (Wangen/Hals). Goatee + Schnurrbart stehen lassen.",
        how: "Gel auftragen, in kreisenden Bewegungen mit dem Philips rasieren, dann kalt abspülen.",
      },
      {
        id: "aftershave",
        section: "Morgen • Rasur",
        title: "After Shave Balm",
        product: "Baxter of California After Shave Balm",
        where: "Auf die frisch rasierten Stellen.",
        how: "Haselnussgroße Menge sanft einmassieren.",
        waitSeconds: 300,
        waitLabel: "Warten nach After Shave (5 Min)",
      }
    );
  }

  // Face wash (always – user wants face not under shower)
  steps.push({
    id: "cleanser",
    section: "Morgen • Reinigung",
    title: "Reinigung",
    product: "COSRX Low pH Good Morning Gel Cleanser",
    where: "Ganzes Gesicht (nicht in den Augenbereich).",
    how: "Erbsengroße Menge, 20 Sek. sanft einmassieren, abspülen.",
  });

  steps.push(
    {
      id: "eyes",
      section: "Morgen • Augen",
      title: "Augenserum",
      product: "Beauty of Joseon Revive Eye Serum (Ginseng + Retinal)",
      where: "Unter beide Augen (nicht zu nah ans Auge).",
      how: "1 Pump, mit dem Ringfinger einklopfen.",
      waitSeconds: 30,
      waitLabel: "Einziehen lassen (30 Sek)",
    },
    {
      id: "serum",
      section: "Morgen • Pflege",
      title: "Serum",
      product: "Beauty of Joseon Glow Serum (Propolis + Niacinamid)",
      where: "Stirn, Wangen, Nase, Kinn.",
      how: "2–3 Tropfen, sanft einklopfen.",
      waitSeconds: 30,
      waitLabel: "Einziehen lassen (30 Sek)",
    },
    {
      id: "moisturizer",
      section: "Morgen • Pflege",
      title: "Moisturizer",
      product: "COSRX Advanced Snail 92 All In One Cream",
      where: "Gesicht & Hals.",
      how: "Haselnussgroße Menge, gleichmäßig verteilen.",
      waitSeconds: 90,
      waitLabel: "Einziehen lassen (1–2 Min)",
    }
  );

  if (goingOut) {
    steps.push({
      id: "spf",
      section: "Morgen • Schutz",
      title: "Sonnenschutz",
      product: "Beauty of Joseon Relief Sun SPF50+",
      where: "Gesicht & Hals (auch unter den Augen großzügig, nicht in die Augen).",
      how: "2 Finger-Längen, gleichmäßig verteilen.",
    });
  }

  steps.push(
    {
      id: "wait-minox",
      section: "Morgen • Haare",
      title: "Wartezeit vor Minoxidil",
      where: "—",
      how: "Warte nach der Gesichtspflege, damit nichts verschmiert.",
      waitSeconds: 600,
      waitLabel: "Warten vor Minoxidil (10 Min)",
      note: "Minoxidil immer nach der Gesichtspflege auftragen.",
    },
    {
      id: "minoxidil",
      section: "Morgen • Haare",
      title: "Minoxidil auftragen",
      product: "Minoxidil (Kopfhaut)",
      where: "Nur auf die Kopfhaut, nicht ins Gesicht.",
      how: "Mit Pipette direkt auf Scheitel/Zonen, sanft einmassieren. Hände waschen.",
    }
  );

  return steps;
}

function buildEveningSteps({ usedSpfToday, doBhaTonight, minoxidilTwice }) {
  const steps = [];

  steps.push({
    id: "evening-cleanse",
    section: "Abend • Reinigung",
    title: usedSpfToday ? "Double Cleansing" : "Reinigung",
    product: usedSpfToday
      ? "Banila Co Clean It Zero Balm → danach COSRX Low pH Cleanser"
      : "COSRX Low pH Good Morning Gel Cleanser",
    where: "Ganzes Gesicht.",
    how: usedSpfToday
      ? "Auf trockener Haut Balm in Kreisbewegungen massieren, abspülen. Danach mit COSRX Cleanser waschen."
      : "Erbsengroße Menge, 20 Sek. massieren, abspülen.",
  });

  if (doBhaTonight) {
    steps.push({
      id: "bha",
      section: "Abend • Treatment",
      title: "COSRX BHA Blackhead Power Liquid auftragen",
      product: "COSRX BHA Blackhead Power Liquid",
      where: "Nase, Stirn, Wangen (T-Zone).",
      how: "Wenige Tropfen auf die Hände oder Wattepad, dünn auftragen.",
      waitSeconds: 1200,
      waitLabel: "Einwirken lassen (20 Min)",
      note: "An Abenden mit COSRX BHA das Glow Serum weglassen, dann direkt weiter mit Augen/Creme.",
    });
  }

  const eveningAdds = [
    {
      id: "eyes-pm",
      section: "Abend • Augen",
      title: "Augenserum",
      product: "Beauty of Joseon Revive Eye Serum",
      where: "Unter die Augen.",
      how: "1 Pump, einklopfen.",
      waitSeconds: 30,
      waitLabel: "Einziehen lassen (30 Sek)",
    },
    !doBhaTonight
      ? {
          id: "serum-pm",
          section: "Abend • Pflege",
          title: "Serum",
          product: "Beauty of Joseon Glow Serum",
          where: "Gesicht.",
          how: "2–3 Tropfen einklopfen.",
          waitSeconds: 30,
          waitLabel: "Einziehen lassen (30 Sek)",
        }
      : null,
    {
      id: "moisturizer-pm",
      section: "Abend • Pflege",
      title: "Moisturizer",
      product: "COSRX Advanced Snail 92 All In One Cream",
      where: "Gesicht & Hals.",
      how: "Dünn auftragen.",
    },
  ].filter(Boolean);

  steps.push(...eveningAdds);

  if (minoxidilTwice) {
    steps.push(
      {
        id: "wait-minox-pm",
        section: "Abend • Haare",
        title: "Wartezeit vor Minoxidil",
        waitSeconds: 600,
        waitLabel: "Warten vor Minoxidil (10 Min)",
        how: "Nach der Gesichtspflege kurz warten.",
      },
      {
        id: "minoxidil-pm",
        section: "Abend • Haare",
        title: "Minoxidil auftragen",
        product: "Minoxidil (Kopfhaut)",
        where: "Kopfhaut.",
        how: "Pipette, sanft einmassieren, Hände waschen.",
      }
    );
  }

  return steps;
}

// ────────────────────────────────────────────────────────────────────────────────
// Simple Self-Tests (for debugging)
// ────────────────────────────────────────────────────────────────────────────────
function runSelfTests() {
  const results = [];
  [false, true].forEach((goingOut) => {
    [false, true].forEach((saturday) => {
      const arr = buildMorningSteps({ goingOut, saturday });
      results.push({
        name: `Morning goingOut=${goingOut} saturday=${saturday}`,
        ok:
          Array.isArray(arr) &&
          arr.length > 0 &&
          arr.every((x) => x && typeof x === "object") &&
          new Set(arr.map((x) => x.id)).size === arr.length,
      });
    });
  });
  [false, true].forEach((usedSpfToday) => {
    [false, true].forEach((doBhaTonight) => {
      [false, true].forEach((minoxidilTwice) => {
        const arr = buildEveningSteps({ usedSpfToday, doBhaTonight, minoxidilTwice });
        results.push({
          name: `Evening spf=${usedSpfToday} bha=${doBhaTonight} minox2=${minoxidilTwice}`,
          ok:
            Array.isArray(arr) &&
            arr.length > 0 &&
            arr.every((x) => x && typeof x === "object") &&
            new Set(arr.map((x) => x.id)).size === arr.length,
        });
      });
    });
  });
  return results;
}

function TestPanel() {
  const [tests, setTests] = useState([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setTests(runSelfTests());
  }, []);
  const allOk = tests.length > 0 && tests.every((t) => t.ok);
  return (
    <div className="mt-6 rounded-2xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Selbsttest</div>
        <button
          className="text-xs px-3 py-1 rounded-xl border bg-white hover:bg-gray-50 dark:bg-[#161616] dark:hover:bg-[#1f1f1f] dark:text-gray-100 dark:border-[#2a2a2a]"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Schließen" : "Details"}
        </button>
      </div>
      <div className="mt-2 text-sm text-gray-800 dark:text-gray-200">
        Status: {allOk ? "✅ alle Tests bestanden" : "❌ Fehler – Details öffnen"}
      </div>
      {open && (
        <ul className="mt-2 text-xs text-gray-700 dark:text-gray-300 list-disc pl-5 space-y-1">
          {tests.map((t) => (
            <li key={t.name} className={t.ok ? "" : "text-red-500"}>
              {t.ok ? "✅" : "❌"} {t.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Main App
// ────────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [phase, setPhase] = useState("intro"); // intro → morning → evening → done
  const [goingOut, setGoingOut] = useState(() => {
    const v = localStorage.getItem("skf-goingOut");
    return v === null ? null : v === "true";
  });
  const [saturday, setSaturday] = useState(() => localStorage.getItem("skf-saturday") === "true");
  const [minoxidilTwice, setMinoxidilTwice] = useState(() => {
    const v = localStorage.getItem("skf-minoxTwice");
    return v === null ? true : v === "true";
  });
  const [doBhaTonight, setDoBhaTonight] = useState(() => localStorage.getItem("skf-bhaTonight") === "true");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [usedSpfToday, setUsedSpfToday] = useState(false);

  // Theme (dark / light) like Notion
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("skf-theme");
    if (saved === "dark" || saved === "light") return saved;
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });
  useEffect(() => {
    localStorage.setItem("skf-theme", theme);
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  const morningSteps = useMemo(
    () => buildMorningSteps({ goingOut: !!goingOut, saturday }),
    [goingOut, saturday]
  );

  const eveningSteps = useMemo(
    () => buildEveningSteps({ usedSpfToday, doBhaTonight, minoxidilTwice }),
    [usedSpfToday, doBhaTonight, minoxidilTwice]
  );

  const steps = phase === "morning" ? morningSteps : phase === "evening" ? eveningSteps : [];
  const step = steps[currentIndex];

  const restart = () => {
    setPhase("intro");
    setGoingOut(null);
    setSaturday(false);
    setMinoxidilTwice(true);
    setDoBhaTonight(false);
    setUsedSpfToday(false);
    setCurrentIndex(0);
  };

  useEffect(() => {
    if (phase === "morning") setUsedSpfToday(!!goingOut);
  }, [phase, goingOut]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#0f0f0f] dark:to-[#111111] text-gray-900 dark:text-gray-100">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/80 dark:bg-[#0f0f0f]/80 border-b border-gray-200 dark:border-[#2a2a2a] supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-[#0f0f0f]/60">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <h1 className="text-base sm:text-xl font-bold">
            Dein Skincare Flow 💧 – mit Rasur, Augen & Minoxidil
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              className="text-sm px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 dark:bg-[#161616] dark:hover:bg-[#1f1f1f] dark:border-[#2a2a2a]"
              title={theme === 'dark' ? 'Zu Hellmodus wechseln' : 'Zu Dunkelmodus wechseln'}
            >
              {theme === 'dark' ? '☀️ Hell' : '🌙 Dunkel'}
            </button>
            <button
              onClick={restart}
              className="text-sm px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 dark:bg-[#161616] dark:hover:bg-[#1f1f1f] dark:border-[#2a2a2a]"
            >
              Neustart
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-3 sm:p-6 pb-24">
        {phase === "intro" && (
          <div className="grid gap-6">
            <div className="rounded-2xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] p-4 sm:p-5 shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold mb-3">Start</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Ich führe dich Schritt für Schritt durch deine Routine – mit Wartezeiten
                und klaren Anweisungen zu <strong>wo</strong>, <strong>wie</strong> und <strong>womit</strong>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 border rounded-xl border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#161616]">
                  <div className="text-sm font-semibold mb-2">Gehst du heute raus?</div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      className={classNames(
                        "w-full sm:w-auto px-4 py-3 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]",
                        goingOut === true ? "bg-black text-white" : ""
                      )}
                      onClick={() => setGoingOut(true)}
                    >
                      Ja (mit Rasur + SPF)
                    </button>
                    <button
                      className={classNames(
                        "w-full sm:w-auto px-4 py-3 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]",
                        goingOut === false ? "bg-black text-white" : ""
                      )}
                      onClick={() => setGoingOut(false)}
                    >
                      Nein (ohne Rasur/ohne SPF)
                    </button>
                  </div>
                </div>

                <div className="p-3 sm:p-4 border rounded-xl border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#161616]">
                  <div className="text-sm font-semibold mb-2">Heute ist Samstag (Haare waschen)?</div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      className={classNames(
                        "w-full sm:w-auto px-4 py-3 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]",
                        saturday ? "bg-black text-white" : ""
                      )}
                      onClick={() => setSaturday(true)}
                    >
                      Ja
                    </button>
                    <button
                      className={classNames(
                        "w-full sm:w-auto px-4 py-3 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]",
                        !saturday ? "bg-black text-white" : ""
                      )}
                      onClick={() => setSaturday(false)}
                    >
                      Nein
                    </button>
                  </div>
                </div>

                <div className="p-3 sm:p-4 border rounded-xl border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#161616]">
                  <div className="text-sm font-semibold mb-2">Minoxidil 2× täglich?</div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      className={classNames(
                        "w-full sm:w-auto px-4 py-3 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]",
                        minoxidilTwice ? "bg-black text-white" : ""
                      )}
                      onClick={() => setMinoxidilTwice(true)}
                    >
                      Ja (morgens & abends)
                    </button>
                    <button
                      className={classNames(
                        "w-full sm:w-auto px-4 py-3 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]",
                        !minoxidilTwice ? "bg-black text-white" : ""
                      )}
                      onClick={() => setMinoxidilTwice(false)}
                    >
                      Nur morgens
                    </button>
                  </div>
                </div>

                <div className="p-3 sm:p-4 border rounded-xl border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#161616]">
                  <div className="text-sm font-semibold mb-2">Plan für den Abend (COSRX BHA heute)?</div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      className={classNames(
                        "w-full sm:w-auto px-4 py-3 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]",
                        doBhaTonight ? "bg-black text-white" : ""
                      )}
                      onClick={() => setDoBhaTonight(true)}
                    >
                      Ja, COSRX BHA anwenden
                    </button>
                    <button
                      className={classNames(
                        "w-full sm:w-auto px-4 py-3 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]",
                        !doBhaTonight ? "bg-black text-white" : ""
                      )}
                      onClick={() => setDoBhaTonight(false)}
                    >
                      Nein, ohne BHA
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-black text-white"
                  onClick={() => {
                    setPhase("morning");
                    setCurrentIndex(0);
                  }}
                  disabled={goingOut === null}
                  title={goingOut === null ? "Bitte wähle erst: rausgehen ja/nein" : "Weiter"}
                >
                  Morgenroutine starten
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] p-4 sm:p-5 shadow-sm">
              <h3 className="font-semibold mb-2">Hinweise</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>Gesicht <strong>nicht</strong> direkt unter die Dusche halten – immer separat reinigen.</li>
                <li>SPF nur, wenn du rausgehst oder länger im Tageslicht am Fenster sitzt.</li>
                <li>Minoxidil immer nach der Gesichtspflege; warte vorher ca. 10 Minuten.</li>
                <li>An Abenden mit COSRX BHA das Glow Serum auslassen.</li>
              </ul>
              <div className="mt-4 grid gap-2 text-xs text-gray-600 dark:text-gray-400">
                <div>📲 Tipp: Füge diese Seite als <strong>App zum Startbildschirm</strong> hinzu (Browser-Menü → „Zum Home-Bildschirm“), dann startet sie im Vollbild.</div>
                <div>💾 Deine Auswahl (rausgehen/Samstag/BHA/Minoxidil) wird lokal gespeichert.</div>
              </div>
              <TestPanel />
            </div>
          </div>
        )}

        {phase === "morning" && step && (
          <div className="grid gap-4">
            <ProgressBar index={currentIndex} total={steps.length} label="Morgenroutine" />
            <StepCard
              step={step}
              isFirst={currentIndex === 0}
              isLast={currentIndex === steps.length - 1}
              onBack={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              onSkip={() => setCurrentIndex((i) => Math.min(steps.length - 1, i + 1))}
              onNext={() => {
                const last = currentIndex === steps.length - 1;
                if (last) {
                  setPhase("evening");
                  setCurrentIndex(0);
                } else {
                  setCurrentIndex((i) => i + 1);
                }
              }}
            />
          </div>
        )}

        {phase === "evening" && step && (
          <div className="grid gap-4">
            <div className="rounded-2xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-sm">
                <div className="font-semibold">Abend-Optionen</div>
                <div className="text-gray-700 dark:text-gray-300">Warst du heute in der Sonne/SPF getragen?</div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  className={classNames(
                    "w-full sm:w-auto px-4 py-3 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]",
                    usedSpfToday ? "bg-black text-white" : ""
                  )}
                  onClick={() => setUsedSpfToday(true)}
                >
                  Ja, SPF getragen
                </button>
                <button
                  className={classNames(
                    "w-full sm:w-auto px-4 py-3 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]",
                    !usedSpfToday ? "bg-black text-white" : ""
                  )}
                  onClick={() => setUsedSpfToday(false)}
                >
                  Nein, kein SPF
                </button>
              </div>
            </div>

            <ProgressBar index={currentIndex} total={steps.length} label="Abendroutine" />
            <StepCard
              step={step}
              isFirst={currentIndex === 0}
              isLast={currentIndex === steps.length - 1}
              onBack={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              onSkip={() => setCurrentIndex((i) => Math.min(steps.length - 1, i + 1))}
              onNext={() => {
                const last = currentIndex === steps.length - 1;
                if (last) {
                  setPhase("done");
                } else {
                  setCurrentIndex((i) => i + 1);
                }
              }}
            />
          </div>
        )}

        {phase === "done" && (
          <div className="rounded-2xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] p-8 text-center shadow-sm">
            <div className="text-2xl font-bold mb-2">Fertig für heute ✨</div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Deine Morgen- und Abendroutine ist abgeschlossen. Du kannst oben auf
              <strong> Neustart</strong> tippen, um morgen wieder zu beginnen.
            </p>
            <div className="inline-flex gap-2">
              <button
                onClick={() => {
                  setPhase("intro");
                  setCurrentIndex(0);
                }}
                className="px-4 py-3 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white hover:bg-gray-50 dark:bg-[#161616] dark:hover:bg-[#1f1f1f]"
              >
                Zurück zum Start
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-5xl mx-auto p-6 text-center text-xs text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} – Skincare Flow für Simon • Produkte: COSRX, Beauty of Joseon, Banila Co, NIVEA, Baxter • Hinweise ersetzen keine medizinische Beratung.
      </footer>
    </div>
  );
}

function ProgressBar({ index, total, label }) {
  const pct = Math.round(((index + 1) / total) * 100);
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-gray-600 dark:text-gray-300">
          Schritt {index + 1} / {total}
        </div>
      </div>
      <div className="w-full h-2 bg-gray-100 dark:bg-[#222] rounded-full overflow-hidden">
        <div
          className="h-2 bg-black dark:bg-white transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
