import { useState, useEffect, useCallback } from "react";
import { loadStore, saveStore } from "./supabase.js";
import { ICONS } from "./icons.js";

const FONT = "'SF Pro Display', 'SF Pro Text', -apple-system, 'Helvetica Neue', sans-serif";
const STORE_KEY = "rivals-census-y3y2-v1";

const ROLES = {
  Vanguard:   { color: "#60a5fa", bg: "rgba(96,165,250,0.08)",  glow: "rgba(96,165,250,0.25)",  icon: "🛡️", label: "VANGUARD"   },
  Duelist:    { color: "#f87171", bg: "rgba(248,113,113,0.08)", glow: "rgba(248,113,113,0.25)", icon: "⚔️", label: "DUELIST"    },
  Strategist: { color: "#4ade80", bg: "rgba(74,222,128,0.08)",  glow: "rgba(74,222,128,0.25)",  icon: "💚", label: "STRATEGIST" },
  "Multi-Role": { color: "#e879f9", bg: "rgba(232,121,249,0.08)", glow: "rgba(232,121,249,0.25)", icon: "✦",  label: "FLEX"  },
};


const HEROES = [
  // ── Vanguards (12) ─────────────────────────────────────────────────────────
  { name: "Angela",           role: "Vanguard",    img: ICONS["Angela"]           },
  { name: "Captain America",  role: "Vanguard",    img: ICONS["Captain_America"]  },
  { name: "Doctor Strange",   role: "Vanguard",    img: ICONS["Doctor_Strange"]   },
  { name: "Emma Frost",       role: "Vanguard",    img: ICONS["Emma_Frost"]       },
  { name: "Groot",            role: "Vanguard",    img: ICONS["Groot"]            },
  { name: "Hulk",             role: "Vanguard",    img: ICONS["Hero_Hulk"]        },
  { name: "Magneto",          role: "Vanguard",    img: ICONS["Magneto"]          },
  { name: "Peni Parker",      role: "Vanguard",    img: ICONS["Peni_Parker"]      },
  { name: "Rogue",            role: "Vanguard",    img: ICONS["Rogue"]            },
  { name: "The Thing",        role: "Vanguard",    img: ICONS["The_Thing"]        },
  { name: "Thor",             role: "Vanguard",    img: ICONS["Thor"]             },
  { name: "Venom",            role: "Vanguard",    img: ICONS["Venom"]            },
  // ── Duelists (24) ──────────────────────────────────────────────────────────
  { name: "Black Panther",    role: "Duelist",     img: ICONS["Black_Panther"]    },
  { name: "Black Widow",      role: "Duelist",     img: ICONS["Black_Widow"]      },
  { name: "Blade",            role: "Duelist",     img: ICONS["Blade"]            },
  { name: "Daredevil",        role: "Duelist",     img: ICONS["Daredevil"]        },
  { name: "Elsa Bloodstone",  role: "Duelist",     img: ICONS["Elsa_Bloodstone"]  },
  { name: "Hawkeye",          role: "Duelist",     img: ICONS["Hawkeye"]          },
  { name: "Hela",             role: "Duelist",     img: ICONS["Hela"]             },
  { name: "Human Torch",      role: "Duelist",     img: ICONS["Human_Torch"]      },
  { name: "Iron Fist",        role: "Duelist",     img: ICONS["Iron_Fist"]        },
  { name: "Iron Man",         role: "Duelist",     img: ICONS["Iron_Man"]         },
  { name: "Magik",            role: "Duelist",     img: ICONS["Magik"]            },
  { name: "Mister Fantastic", role: "Duelist",     img: ICONS["Mister_Fantastic"] },
  { name: "Moon Knight",      role: "Duelist",     img: ICONS["Moon_Knight"]      },
  { name: "Namor",            role: "Duelist",     img: ICONS["Namor"]            },
  { name: "Phoenix",          role: "Duelist",     img: ICONS["Phoenix"]          },
  { name: "Psylocke",         role: "Duelist",     img: ICONS["Psylocke"]         },
  { name: "Scarlet Witch",    role: "Duelist",     img: ICONS["Scarlet_Witch"]    },
  { name: "Spider-Man",       role: "Duelist",     img: ICONS["Spider-Man"]       },
  { name: "Squirrel Girl",    role: "Duelist",     img: ICONS["Squirrel_Girl"]    },
  { name: "Star-Lord",        role: "Duelist",     img: ICONS["Star-Lord"]        },
  { name: "Storm",            role: "Duelist",     img: ICONS["Storm"]            },
  { name: "Winter Soldier",   role: "Duelist",     img: ICONS["Winter_Soldier"]   },
  { name: "Wolverine",        role: "Duelist",     img: ICONS["Wolverine"]        },
  // ── Strategists (11) ───────────────────────────────────────────────────────
  { name: "Adam Warlock",        role: "Strategist", img: ICONS["Adam_Warlock"]        },
  { name: "Cloak & Dagger",      role: "Strategist", img: ICONS["Cloak_&_Dagger"]      },
  { name: "Gambit",              role: "Strategist", img: ICONS["Gambit"]              },
  { name: "Invisible Woman",     role: "Strategist", img: ICONS["Invisible_Woman"]     },
  { name: "Jeff the Land Shark", role: "Strategist", img: ICONS["Jeff_the_Land_Shark"] },
  { name: "Loki",                role: "Strategist", img: ICONS["Loki"]                },
  { name: "Luna Snow",           role: "Strategist", img: ICONS["Luna_Snow"]           },
  { name: "Mantis",              role: "Strategist", img: ICONS["Mantis"]              },
  { name: "Rocket Raccoon",      role: "Strategist", img: ICONS["Rocket_Raccoon"]      },
  { name: "Ultron",              role: "Strategist", img: ICONS["Ultron"]              },
  { name: "White Fox",           role: "Strategist", img: ICONS["White_Fox"]           },
  // ── Multi-Role ─────────────────────────────────────────────────────────────
  { name: "Deadpool",            role: "Multi-Role", img: ICONS["Deadpool"]            },
];


// ── Glass card style helper ───────────────────────────────────────────────────
const glass = (extra = {}) => ({
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  ...extra,
});

// ── Hero Portrait ─────────────────────────────────────────────────────────────
function HeroPortrait({ hero, size = 64, selected = false, dimmed = false }) {
  const [failed, setFailed] = useState(false);
  const r = ROLES[hero.role];
  const containerStyle = {
    width: size, height: size, borderRadius: size * 0.18, flexShrink: 0, overflow: "hidden",
    border: selected ? "2px solid " + r.color : "2px solid rgba(255,255,255,0.06)",
    background: r.bg,
    boxShadow: selected ? "0 0 16px " + r.glow : "none",
    transition: "all .15s",
    opacity: dimmed ? 0.35 : 1,
    position: "relative",
  };
  if (failed || !hero.img) return (
    <div style={{ ...containerStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: size * 0.4, fontWeight: 700, color: r.color, fontFamily: FONT }}>{hero.name[0]}</span>
    </div>
  );
  return (
    <div style={containerStyle}>
      <img src={hero.img} alt={hero.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={() => setFailed(true)} />
    </div>
  );
}

// ── Hero Picker ───────────────────────────────────────────────────────────────
function HeroPicker({ selected, onToggle, maxSelect = null }) {
  const [roleFilter, setRoleFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = HEROES.filter(h =>
    (roleFilter === "All" || h.role === roleFilter) &&
    h.name.toLowerCase().includes(search.toLowerCase())
  );
  const roleKeys = [...Object.keys(ROLES)];
  // Deadpool appears in every role group (he's multi-role)
  const deadpool = HEROES.find(h => h.name === "Deadpool");
  const injectDeadpool = (heroes, role) => {
    if (!deadpool) return heroes;
    if (heroes.find(h => h.name === "Deadpool")) return heroes;
    const matchesSearch = deadpool.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return heroes;
    return [...heroes, { ...deadpool, _injectedAs: role }];
  };
  const groups = roleFilter === "All"
    ? roleKeys.filter(r => r !== "Multi-Role").map(role => ({
        role,
        heroes: injectDeadpool(filtered.filter(h => h.role === role), role)
      }))
    : roleFilter === "Multi-Role"
      ? [{ role: "Multi-Role", heroes: filtered.filter(h => h.role === "Multi-Role") }]
      : [{ role: roleFilter, heroes: injectDeadpool(filtered.filter(h => h.role === roleFilter), roleFilter) }];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {/* Filter bar */}
      <div style={{ padding: "10px 16px 8px", display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
          style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 12px", color: "#fff", fontSize: 13, fontFamily: FONT, outline: "none" }} />
        {["All", ...roleKeys].map(r => {
          const active = roleFilter === r; const rd = ROLES[r];
          return (
            <button key={r} onClick={() => setRoleFilter(r)} style={{
              padding: "7px 11px", fontSize: 11, fontWeight: 600,
              background: active ? (rd ? rd.bg : "rgba(255,255,255,0.1)") : "transparent",
              color: active ? (rd ? rd.color : "#fff") : "rgba(255,255,255,0.3)",
              border: "1px solid " + (active ? (rd ? rd.color + "55" : "rgba(255,255,255,0.3)") : "rgba(255,255,255,0.06)"),
              borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap", transition: "all .12s",
            }}>{r === "All" ? "All" : rd.icon}</button>
          );
        })}
      </div>

      {/* Selected strip */}
      {selected.length > 0 && (
        <div style={{ padding: "6px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)", display: "flex", gap: 5, flexWrap: "wrap", flexShrink: 0, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.05em", marginRight: 4 }}>{selected.length}{maxSelect ? "/" + maxSelect : ""}</span>
          {selected.map(h => (
            <div key={h.name === "Deadpool" ? h.name + "|" + h.role : h.name} onClick={() => onToggle(h)} style={{ position: "relative", cursor: "pointer" }}>
              <HeroPortrait hero={h} size={30} selected />
              <div style={{ position: "absolute", top: -3, right: -3, width: 12, height: 12, borderRadius: "50%", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 700, color: "#fff" }}>✕</div>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 24px" }}>
        {groups.map(({ role, heroes: gh }) => gh.length === 0 ? null : (
          <div key={role} style={{ marginBottom: 22 }}>
            {roleFilter === "All" && (
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: ROLES[role].color, marginBottom: 10, display: "flex", alignItems: "center", gap: 8, opacity: 0.8 }}>
                {ROLES[role].icon} {ROLES[role].label}
                <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg," + ROLES[role].color + "33, transparent)" }} />
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(86px, 1fr))", gap: 8 }}>
              {gh.map(hero => {
                const sel = hero.name === "Deadpool"
                  ? !!selected.find(h => h.name === "Deadpool" && h.role === hero.role)
                  : !!selected.find(h => h.name === hero.name);
                const r = ROLES[hero.role];
                const locked = maxSelect && !sel && selected.length >= maxSelect;
                return (
                  <div key={hero.name === "Deadpool" ? hero.name + "|" + hero.role : hero.name} onClick={() => !locked && onToggle(hero)} style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                    padding: "9px 4px 8px", borderRadius: 12, cursor: locked ? "not-allowed" : "pointer",
                    background: sel ? r.bg : "rgba(255,255,255,0.03)",
                    border: "1px solid " + (sel ? r.color + "55" : "rgba(255,255,255,0.06)"),
                    transition: "all .12s", position: "relative",
                    opacity: locked ? 0.35 : 1,
                  }}>
                    <HeroPortrait hero={hero} size={58} selected={sel} />
                    {hero.name === "Deadpool" && (
                      <div style={{ display: "flex", gap: 2, justifyContent: "center", marginTop: -2, marginBottom: -2 }}>
                        {["🛡️","⚔️","💚"].map(icon => (
                          <span key={icon} style={{ fontSize: 8, opacity: 0.7 }}>{icon}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: "0.03em", textAlign: "center", lineHeight: 1.3, color: sel ? r.color : "rgba(255,255,255,0.4)", maxWidth: 80, wordBreak: "break-word" }}>
                      {hero.name.toUpperCase()}
                    </div>
                    {sel && <div style={{ position: "absolute", top: 5, right: 5, width: 15, height: 15, borderRadius: "50%", background: r.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: "#000" }}>✓</div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Form View ─────────────────────────────────────────────────────────────────
const FUNNY_MESSAGES = [
  "now stop doomscrolling and go warm up",
  "don't instalock and then leave. we know who you are",
  "if you picked 3 duelists we're going to have a talk",
  "please actually use your ult this time",
  "we believe in you. mostly.",
  "don't forget to charge your controller",
  "yes, we can see your ping",
];

function FormView({ onCaptainAccess }) {
  const [step, setStep] = useState("name");
  const [name, setName] = useState("");
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [funny] = useState(() => FUNNY_MESSAGES[Math.floor(Math.random() * FUNNY_MESSAGES.length)]);
  const [roster, setRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(true);

  useEffect(() => {
    loadStore().then(s => {
      setRoster(s.roster || []);
      setLoadingRoster(false);
    });
  }, []);
  const toggle = useCallback(hero => {
    setSelected(s => {
      // Deadpool is tracked by name+role so he can be in multiple categories
      const isDeadpool = hero.name === "Deadpool";
      const key = isDeadpool ? hero.name + "|" + hero.role : hero.name;
      const existing = s.find(h => isDeadpool ? (h.name === hero.name && h.role === hero.role) : h.name === hero.name);
      return existing ? s.filter(h => isDeadpool ? !(h.name === hero.name && h.role === hero.role) : h.name !== hero.name) : [...s, hero];
    });
  }, []);

  const submit = async () => {
    if (!name.trim() || selected.length === 0) return;
    setSaving(true); setSaveErr("");
    const store = await loadStore();
    store.responses = [...store.responses.filter(e => e.name.toLowerCase() !== name.trim().toLowerCase()),
      { name: name.trim(), heroes: selected, submittedAt: Date.now() }];
    const ok = await saveStore(store);
    setSaving(false);
    if (ok) setStep("done"); else setSaveErr("Storage unavailable — try on desktop at claude.ai.");
  };

  if (step === "done") return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>You're locked in.</div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 8, fontWeight: 400 }}>
          {selected.length} heroes submitted for <span style={{ color: "#fff", fontWeight: 600 }}>{name}</span>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", marginTop: 6, fontStyle: "italic" }}>{funny}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 20 }}>
          {selected.map(h => <HeroPortrait key={h.name} hero={h} size={42} selected />)}
        </div>
        <button onClick={() => { setStep("name"); setName(""); setSelected([]); setSaveErr(""); }}
          style={{ marginTop: 24, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", borderRadius: 12, padding: "10px 24px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: FONT }}>
          Submit another player
        </button>
        <div style={{ marginTop: 12 }}>
          <button onClick={() => { setStep("name"); setName(""); setSelected([]); setSaveErr(""); }}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", fontSize: 11, cursor: "pointer", fontFamily: FONT }}>
            ← Back to start
          </button>
        </div>
      </div>
    </div>
  );

  if (step === "name") {
    // Check which players have already submitted
    const [submittedNames, setSubmittedNames] = useState([]);
    useEffect(() => {
      loadStore().then(s => setSubmittedNames((s.responses || []).map(r => r.name.toLowerCase())));
    }, []);

    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, padding: 32,
        backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,255,255,0.13), transparent)" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", marginBottom: 10, textTransform: "uppercase" }}>Y3Y2</div>
            <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1 }}>Hero Pool</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginTop: 10, fontWeight: 400 }}>Who are you?</div>
          </div>

          {loadingRoster ? (
            <div style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 13, padding: "20px 0" }}>Loading…</div>
          ) : roster.length === 0 ? (
            <div style={{ ...glass({ borderRadius: 14, padding: "20px" }), textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Roster not set up yet</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 6 }}>Ask your captain to add players in the dashboard</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {roster.map(player => {
                const alreadySubmitted = submittedNames.includes(player.toLowerCase());
                return (
                  <button key={player}
                    onClick={() => { if (!alreadySubmitted) { setName(player); setStep("pick"); } }}
                    disabled={alreadySubmitted}
                    style={{
                      ...glass({ borderRadius: 12, padding: "14px 18px" }),
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      cursor: alreadySubmitted ? "default" : "pointer",
                      opacity: alreadySubmitted ? 0.4 : 1,
                      transition: "all .15s",
                      background: alreadySubmitted ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
                    }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: alreadySubmitted ? "rgba(255,255,255,0.4)" : "#fff" }}>{player}</span>
                    {alreadySubmitted
                      ? <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 500 }}>✓ submitted</span>
                      : <span style={{ fontSize: 14, color: "rgba(255,255,255,0.25)" }}>›</span>
                    }
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: 48, textAlign: "center" }}>
            <button onClick={onCaptainAccess} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.08)", fontSize: 10, letterSpacing: "0.08em", cursor: "pointer", fontFamily: FONT, textTransform: "uppercase" }}>
              Captain Access
            </button>
          </div>
          <div style={{ marginTop: 36, textAlign: "center", opacity: 0.7 }}>
            <img src="https://media.tenor.com/aMzFAr6Ke4kAAAAi/jeff-the-land-shark-marvel.gif" alt="Jeff the Land Shark"
              style={{ width: 72, height: 72, objectFit: "contain", borderRadius: "50%", display: "inline-block" }}
              onError={e => { e.target.src = "https://media1.tenor.com/m/aMzFAr6Ke4kAAAAd/jeff-the-land-shark-marvel.gif"; }} />
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", marginTop: 4, fontStyle: "italic" }}>jeff approves this message</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", background: "#000", fontFamily: FONT, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button onClick={() => setStep("name")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 18, cursor: "pointer", padding: "0 4px 0 0", lineHeight: 1, fontFamily: FONT }} title="Back">‹</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 500, letterSpacing: "0.05em" }}>Picking for</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.01em" }}>{name}</div>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}><span style={{ color: "#60a5fa", fontWeight: 700 }}>{selected.length}</span> selected</div>
        <button onClick={submit} disabled={selected.length === 0 || saving}
          style={{ background: selected.length > 0 ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.07)", color: selected.length > 0 ? "#000" : "rgba(255,255,255,0.2)", border: "none", borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: selected.length > 0 ? "pointer" : "default", fontFamily: FONT, transition: "all .15s" }}>
          {saving ? "Saving…" : "Submit"}
        </button>
      </div>
      {saveErr && <div style={{ padding: "8px 16px", background: "rgba(239,68,68,0.1)", borderBottom: "1px solid rgba(239,68,68,0.2)", fontSize: 11, color: "#f87171", fontWeight: 500 }}>{saveErr}</div>}
      <HeroPicker selected={selected} onToggle={toggle} />
    </div>
  );
}

// ── Captain Gate ──────────────────────────────────────────────────────────────
function CaptainGate({ onEnter, onCancel }) {
  const [mode, setMode] = useState("checking");
  const [input, setInput] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { loadStore().then(s => setMode(s.captainCode ? "unlock" : "setup")); }, []);

  const handleSetup = async () => {
    if (input.trim().length < 3) return setErr("At least 3 characters.");
    if (input !== confirm) return setErr("Codes don't match.");
    setBusy(true);
    const store = await loadStore(); store.captainCode = input.trim();
    const ok = await saveStore(store); setBusy(false);
    if (ok) onEnter(); else setErr("Storage unavailable — use claude.ai on desktop.");
  };
  const handleUnlock = async () => {
    if (!input.trim()) return; setBusy(true);
    const store = await loadStore(); setBusy(false);
    if (!store.captainCode) return setErr("No code found.");
    if (store.captainCode === input.trim()) onEnter();
    else { setErr("Wrong code."); setInput(""); }
  };

  if (mode === "checking") return <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "rgba(255,255,255,0.1)", fontSize: 12 }}>...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, padding: 24,
      backgroundImage: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,255,255,0.07), transparent)" }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{mode === "setup" ? "🔐" : "🔒"}</div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>
            {mode === "setup" ? "Set captain code" : "Captain access"}
          </div>
          {mode === "setup" && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 8, fontWeight: 400 }}>Teammates will never see this screen.</div>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input autoFocus type="password" value={input} onChange={e => { setInput(e.target.value); setErr(""); }}
            onKeyDown={e => e.key === "Enter" && (mode === "unlock" ? handleUnlock() : null)}
            placeholder={mode === "setup" ? "Choose a code" : "Enter code"}
            style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid " + (err ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)"), borderRadius: 12, padding: "14px 16px", color: "#fff", fontSize: 16, fontFamily: FONT, outline: "none", textAlign: "center", letterSpacing: "0.15em" }} />
          {mode === "setup" && (
            <input type="password" value={confirm} onChange={e => { setConfirm(e.target.value); setErr(""); }}
              onKeyDown={e => e.key === "Enter" && handleSetup()} placeholder="Confirm code"
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid " + (err ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)"), borderRadius: 12, padding: "14px 16px", color: "#fff", fontSize: 16, fontFamily: FONT, outline: "none", textAlign: "center", letterSpacing: "0.15em" }} />
          )}
          {err && <div style={{ fontSize: 12, color: "#f87171", textAlign: "center", fontWeight: 500 }}>{err}</div>}
          <button onClick={mode === "setup" ? handleSetup : handleUnlock} disabled={busy || !input.trim()}
            style={{ background: input.trim() ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.06)", border: "none", borderRadius: 12, padding: "14px", color: input.trim() ? "#000" : "rgba(255,255,255,0.2)", fontSize: 15, fontWeight: 600, cursor: input.trim() ? "pointer" : "default", fontFamily: FONT, transition: "all .15s" }}>
            {busy ? "…" : mode === "setup" ? "Create & open dashboard" : "Unlock"}
          </button>
          <button onClick={onCancel} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.15)", fontSize: 11, cursor: "pointer", fontFamily: FONT, padding: 4, textAlign: "center" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Comp Builder ──────────────────────────────────────────────────────────────
function CompBuilder({ responses }) {
  const [comps, setComps] = useState([]);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editName, setEditName] = useState("");
  const [pickingSlot, setPickingSlot] = useState(null); // { compIdx, slotIdx }
  const COMP_SIZE = 6;

  // Load comps from store on mount
  useEffect(() => {
    loadStore().then(s => setComps(s.comps || []));
  }, []);

  const saveComps = async (updated) => {
    setComps(updated);
    const store = await loadStore();
    store.comps = updated;
    await saveStore(store);
  };

  const addComp = async () => {
    const newComp = { id: Date.now(), name: "Comp " + (comps.length + 1), slots: Array(COMP_SIZE).fill(null) };
    await saveComps([...comps, newComp]);
    setEditingIdx(comps.length);
    setEditName(newComp.name);
  };

  const deleteComp = async (idx) => {
    await saveComps(comps.filter((_, i) => i !== idx));
    if (editingIdx === idx) setEditingIdx(null);
  };

  const renameComp = async (idx, name) => {
    const updated = comps.map((c, i) => i === idx ? { ...c, name } : c);
    await saveComps(updated);
  };

  const setSlot = async (compIdx, slotIdx, hero) => {
    const updated = comps.map((c, i) => {
      if (i !== compIdx) return c;
      const slots = [...c.slots];
      // If hero already in another slot, remove it
      const existing = slots.findIndex(s => s && s.name === hero.name);
      if (existing !== -1) slots[existing] = null;
      slots[slotIdx] = hero;
      return { ...c, slots };
    });
    await saveComps(updated);
    setPickingSlot(null);
  };

  const clearSlot = async (compIdx, slotIdx) => {
    const updated = comps.map((c, i) => {
      if (i !== compIdx) return c;
      const slots = [...c.slots];
      slots[slotIdx] = null;
      return { ...c, slots };
    });
    await saveComps(updated);
  };

  // All heroes available across all players
  const poolHeroes = responses.length > 0
    ? responses.flatMap(r => r.heroes).filter((h, i, arr) => arr.findIndex(x => x.name === h.name) === i)
    : HEROES;

  const comp = editingIdx !== null ? comps[editingIdx] : null;

  return (
    <div style={{ display: "flex", gap: 14, height: "100%", minHeight: 0 }}>
      {/* Comp list */}
      <div style={{ width: 200, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={addComp}
          style={{ ...glass({ borderRadius: 12, padding: "10px", textAlign: "center" }), background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: FONT }}>
          + New Comp
        </button>
        {comps.map((c, idx) => (
          <div key={c.id} onClick={() => { setEditingIdx(idx); setEditName(c.name); setPickingSlot(null); }}
            style={{ ...glass({ borderRadius: 12, padding: "10px 12px" }), cursor: "pointer", background: editingIdx === idx ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)", borderColor: editingIdx === idx ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)", transition: "all .12s" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: editingIdx === idx ? "#fff" : "rgba(255,255,255,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{c.name}</div>
              <button onClick={e => { e.stopPropagation(); deleteComp(idx); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", fontSize: 11, cursor: "pointer", padding: "0 2px", flexShrink: 0 }}>✕</button>
            </div>
            <div style={{ display: "flex", gap: 3 }}>
              {c.slots.map((slot, si) => (
                <div key={si} style={{ width: 26, height: 26, borderRadius: 6, overflow: "hidden", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
                  {slot && <img src={slot.img} alt={slot.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display="none"} />}
                </div>
              ))}
            </div>
          </div>
        ))}
        {comps.length === 0 && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", padding: "12px 8px", lineHeight: 1.6 }}>No comps yet. Create one to start drafting.</div>
        )}
      </div>

      {/* Comp editor */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {!comp ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.15)", fontSize: 14, fontWeight: 400 }}>
            Select or create a comp
          </div>
        ) : (
          <>
            {/* Comp name + role summary */}
            <div style={{ ...glass({ borderRadius: 14, padding: "14px 16px" }), flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  onBlur={() => renameComp(editingIdx, editName)}
                  onKeyDown={e => e.key === "Enter" && renameComp(editingIdx, editName)}
                  style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontSize: 18, fontWeight: 700, fontFamily: FONT, outline: "none", letterSpacing: "-0.01em" }} />
                <div style={{ display: "flex", gap: 6 }}>
                  {Object.entries(ROLES).map(([role, r]) => {
                    const n = comp.slots.filter(s => s && s.role === role).length;
                    return n > 0 ? <span key={role} style={{ fontSize: 11, color: r.color, fontWeight: 600 }}>{r.icon}{n}</span> : null;
                  })}
                </div>
              </div>
              {/* 6 slots */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
                {comp.slots.map((slot, si) => {
                  const isPicking = pickingSlot?.compIdx === editingIdx && pickingSlot?.slotIdx === si;
                  const r = slot ? ROLES[slot.role] : null;
                  return (
                    <div key={si}>
                      <div onClick={() => setPickingSlot(isPicking ? null : { compIdx: editingIdx, slotIdx: si })}
                        style={{ aspectRatio: "1", borderRadius: 12, overflow: "hidden", cursor: "pointer", border: "2px solid " + (isPicking ? "rgba(255,255,255,0.4)" : slot ? r.color + "66" : "rgba(255,255,255,0.1)"), background: slot ? r.bg : "rgba(255,255,255,0.03)", position: "relative", transition: "all .12s", boxShadow: isPicking ? "0 0 0 3px rgba(255,255,255,0.1)" : "none" }}>
                        {slot
                          ? <img src={slot.img} alt={slot.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display="none"} />
                          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "rgba(255,255,255,0.1)" }}>+</div>
                        }
                        {slot && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.7))", padding: "8px 4px 3px", fontSize: 7, fontWeight: 700, textAlign: "center", color: r.color, letterSpacing: "0.03em" }}>{slot.name.split(" ").pop().toUpperCase()}</div>}
                      </div>
                      {slot && <button onClick={() => clearSlot(editingIdx, si)} style={{ width: "100%", background: "none", border: "none", color: "rgba(255,255,255,0.15)", fontSize: 9, cursor: "pointer", padding: "3px 0", fontFamily: FONT }}>clear</button>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hero picker for slot */}
            {pickingSlot && pickingSlot.compIdx === editingIdx && (
              <div style={{ ...glass({ borderRadius: 14 }), flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ padding: "10px 16px 0", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>
                  PICK FOR SLOT {pickingSlot.slotIdx + 1}
                  <span style={{ marginLeft: 8, color: "rgba(255,255,255,0.2)", fontWeight: 400 }}>— {responses.length > 0 ? "showing your team's pool" : "showing full roster"}</span>
                </div>
                <HeroPicker
                  selected={comp.slots.filter(Boolean)}
                  onToggle={hero => setSlot(editingIdx, pickingSlot.slotIdx, hero)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

// ── Roster Manager ────────────────────────────────────────────────────────────
function RosterManager() {
  const [roster, setRoster] = useState([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { loadStore().then(s => { setRoster(s.roster || []); setLoading(false); }); }, []);
  const saveRoster = async (updated) => {
    setRoster(updated);
    const store = await loadStore();
    store.roster = updated;
    await saveStore(store);
  };
  const addPlayer = async () => {
    const n = newName.trim();
    if (!n || roster.includes(n)) return;
    await saveRoster([...roster, n]);
    setNewName("");
  };
  const removePlayer = async (name) => { await saveRoster(roster.filter(p => p !== name)); };
  if (loading) return <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.2)", fontFamily: FONT }}>Loading</div>;
  return (
    <div style={{ maxWidth: 480, height: "100%", overflowY: "auto" }}>
      <div style={{ ...glass({ borderRadius: 14, padding: "16px" }), marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", marginBottom: 12, textTransform: "uppercase" }}>Add Player</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && addPlayer()} placeholder="Player gamertag"
            style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, fontFamily: FONT, outline: "none" }} />
          <button onClick={addPlayer} disabled={!newName.trim() || roster.includes(newName.trim())}
            style={{ background: newName.trim() ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.06)", border: "none", borderRadius: 10, padding: "11px 18px", color: newName.trim() ? "#000" : "rgba(255,255,255,0.2)", fontSize: 14, fontWeight: 600, cursor: newName.trim() ? "pointer" : "default", fontFamily: FONT }}>Add</button>
        </div>
      </div>
      {roster.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.2)", fontSize: 13, fontFamily: FONT }}>No players yet. Add them above and they will appear on the form.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)", marginBottom: 4, textTransform: "uppercase" }}>{roster.length} player{roster.length !== 1 ? "s" : ""}</div>
          {roster.map(player => (
            <div key={player} style={{ ...glass({ borderRadius: 10, padding: "12px 14px" }), display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,rgba(248,113,113,0.6),rgba(96,165,250,0.6))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{player[0].toUpperCase()}</div>
                <span style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>{player}</span>
              </div>
              <button onClick={() => removePlayer(player)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: 14, padding: "2px 6px", fontFamily: FONT }}>x</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Dashboard({ onLock }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("responses"); // "responses" | "builder"
  const [refreshed, setRefreshed] = useState(null);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    const s = await loadStore(); setResponses(s.responses || []); setRefreshed(new Date()); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const removePlayer = async name => {
    const store = await loadStore(); store.responses = store.responses.filter(r => r.name !== name);
    await saveStore(store); setResponses(store.responses);
  };
  const clearAll = async () => {
    if (!confirm("Clear all responses?")) return;
    const store = await loadStore(); store.responses = []; await saveStore(store); setResponses([]);
  };
  const shareFormLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  };

  const uniquePool = responses.flatMap(r => r.heroes).filter((h, i, arr) => arr.findIndex(x => x.name === h.name) === i);
  const counts = { Vanguard: 0, Duelist: 0, Strategist: 0, "Multi-Role": 0 };
  uniquePool.forEach(h => counts[h.role]++);
  const warnings = [
    counts.Vanguard === 0 && "No tanks in pool",
    counts.Strategist < 2 && "Only " + counts.Strategist + " healer(s)",
    counts.Duelist === 0 && "No duelists in pool",
  ].filter(Boolean);

  return (
    <div style={{ height: "100vh", background: "#000", fontFamily: FONT, color: "#fff", display: "flex", flexDirection: "column", overflow: "hidden",
      backgroundImage: "radial-gradient(ellipse 100% 40% at 50% -5%, rgba(255,255,255,0.07), transparent)" }}>
      {/* Nav */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(24px)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1 }}>Y3Y2</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 500, letterSpacing: "0.06em" }}>CAPTAIN DASHBOARD</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["responses", "builder", "roster"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? "rgba(255,255,255,0.1)" : "transparent", border: "1px solid " + (tab === t ? "rgba(255,255,255,0.15)" : "transparent"), color: tab === t ? "#fff" : "rgba(255,255,255,0.4)", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: FONT, transition: "all .12s" }}>
              {t === "responses" ? "Responses" : t === "builder" ? "Comp Builder" : "Roster"}
            </button>
          ))}
        </div>
        <button onClick={shareFormLink} style={{ ...glass({ borderRadius: 8, padding: "6px 12px" }), background: copied ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.05)", borderColor: copied ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.08)", color: copied ? "#4ade80" : "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: FONT, transition: "all .2s" }}>
          {copied ? "✓ Copied!" : "🔗 Share Form"}
        </button>
        <button onClick={load} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: FONT }}>↺</button>
        {responses.length > 0 && <button onClick={clearAll} style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: FONT }}>Clear</button>}
        <button onClick={onLock} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.3)", borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer", fontFamily: FONT }}>🔒</button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "hidden", padding: "16px 20px" }}>
        {tab === "roster" ? (
          <RosterManager />
        ) : tab === "responses" ? (
          loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.15)" }}>Loading…</div>
          ) : responses.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60 }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>📋</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "-0.01em" }}>No responses yet</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.15)", marginTop: 6, marginBottom: 20 }}>Share the form link with your team</div>
              <button onClick={shareFormLink} style={{ ...glass({ borderRadius: 10, padding: "10px 20px" }), color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: FONT }}>🔗 Copy Form Link</button>
            </div>
          ) : (
            <div style={{ height: "100%", overflowY: "auto" }}>
              {/* Pool summary */}
              <div style={{ ...glass({ borderRadius: 16, padding: "16px 18px", marginBottom: 14 }) }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", marginBottom: 12, textTransform: "uppercase" }}>Team Pool · {uniquePool.length} unique heroes</div>
                <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                  {Object.entries(ROLES).filter(([r]) => r !== "Multi-Role" || counts["Multi-Role"] > 0).map(([role, r]) => (
                    <div key={role} style={{ background: r.bg, border: "1px solid " + r.color + "22", borderRadius: 10, padding: "8px 14px", textAlign: "center", minWidth: 64 }}>
                      <div style={{ fontSize: 18 }}>{r.icon}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: r.color, lineHeight: 1 }}>{counts[role]}</div>
                      <div style={{ fontSize: 8, color: r.color + "88", fontWeight: 600, letterSpacing: "0.08em", marginTop: 1 }}>{r.label.slice(0,3)}</div>
                    </div>
                  ))}
                </div>
                <div style={{ height: 4, borderRadius: 4, overflow: "hidden", background: "rgba(255,255,255,0.05)", display: "flex" }}>
                  {Object.entries(ROLES).map(([role, r]) => counts[role] > 0 && <div key={role} style={{ flex: counts[role], background: r.color, opacity: 0.7 }} />)}
                </div>
                {warnings.length > 0
                  ? <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>{warnings.map(w => <span key={w} style={{ fontSize: 10, color: "#f59e0b", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 6, padding: "3px 8px", fontWeight: 500 }}>⚠ {w}</span>)}</div>
                  : <div style={{ marginTop: 10, fontSize: 11, color: "#4ade80", fontWeight: 500 }}>✓ Balanced role pool</div>
                }
              </div>
              {/* Player cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                {responses.map(player => (
                  <div key={player.name} style={{ ...glass({ borderRadius: 14, padding: "14px" }) }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,rgba(248,113,113,0.8),rgba(96,165,250,0.8))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>{player.name[0].toUpperCase()}</div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1, color: "#fff" }}>{player.name}</div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{player.heroes.length} heroes · {new Date(player.submittedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <button onClick={() => removePlayer(player.name)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.15)", cursor: "pointer", fontSize: 12 }}>✕</button>
                    </div>
                    {Object.entries(ROLES).map(([role, r]) => {
                      const rh = player.heroes.filter(h => h.role === role);
                      if (!rh.length) return null;
                      return (
                        <div key={role} style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", color: r.color, marginBottom: 5, opacity: 0.8 }}>{r.icon} {role.toUpperCase()} · {rh.length}</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                            {rh.map(hero => (
                              <div key={hero.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                                <HeroPortrait hero={hero} size={38} selected />
                                <span style={{ fontSize: 7, color: r.color + "aa", fontWeight: 600, maxWidth: 38, textAlign: "center", lineHeight: 1.2, wordBreak: "break-word" }}>{hero.name.split(" ").pop().toUpperCase()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              {refreshed && <div style={{ textAlign: "center", marginTop: 14, fontSize: 9, color: "rgba(255,255,255,0.08)" }}>Refreshed {refreshed.toLocaleTimeString()}</div>}
            </div>
          )
        ) : (
          <CompBuilder responses={responses} />
        )}
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("form");
  const handleCaptainAccess = async () => {
    const store = await loadStore();
    setScreen(store.captainCode ? "unlock" : "setup");
  };
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #000; -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>
      {screen === "form"                           && <FormView onCaptainAccess={handleCaptainAccess} />}
      {(screen === "setup" || screen === "unlock") && <CaptainGate onEnter={() => setScreen("dashboard")} onCancel={() => setScreen("form")} />}
      {screen === "dashboard"                      && <Dashboard onLock={() => setScreen("form")} />}
    </>
  );
}
