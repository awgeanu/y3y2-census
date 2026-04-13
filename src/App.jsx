import { useState, useEffect, useCallback, useRef } from "react";
import { loadStore, saveStore, loadCompReviews, saveCompReview, updateReviewStatus, loadAllAvailability, savePlayerAvailability, loadDraft, saveDraft, clearDraft } from "./supabase.js";
import { ICONS } from "./icons.js";

const FONT = "'SF Pro Display', 'SF Pro Text', -apple-system, 'Helvetica Neue', sans-serif";

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
  { name: "Punisher",          role: "Duelist",     img: ICONS["The_Punisher"]     },
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(76px, 1fr))", gap: 6 }}>
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


// ── Share Button ─────────────────────────────────────────────────────────────
function ShareButton() {
  const [copied, setCopied] = useState(false);
  const share = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };
  return (
    <button onClick={share} style={{
      marginTop: 24,
      background: copied ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.07)",
      border: "1px solid " + (copied ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)"),
      color: copied ? "#4ade80" : "rgba(255,255,255,0.6)",
      borderRadius: 12, padding: "10px 24px", fontSize: 13, fontWeight: 500,
      cursor: "pointer", fontFamily: FONT, transition: "all .2s",
      display: "flex", alignItems: "center", gap: 7, margin: "24px auto 0",
    }}>
      {copied ? "✓ Link copied!" : "🔗 Share this form"}
    </button>
  );
}

// ── Player Dropdown ───────────────────────────────────────────────────────────
function PlayerDropdown({ roster, submittedNames, onSelect, onRedo }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const availableCount = roster.filter(p => !submittedNames.includes(p.toLowerCase())).length;
  const handleSelect = (player) => {
    if (submittedNames.includes(player.toLowerCase())) return;
    setSelected(player); setOpen(false); onSelect(player);
  };
  const handleRedo = (player) => {
    setOpen(false);
    onRedo(player);
  };
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", background: "rgba(255,255,255,0.07)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14,
        padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between",
        cursor: "pointer", fontFamily: FONT, transition: "all .15s",
        color: selected ? "#fff" : "rgba(255,255,255,0.35)",
      }}>
        <span style={{ fontSize: 16, fontWeight: selected ? 600 : 400 }}>{selected || "Select your name"}</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s", display: "inline-block" }}>▾</span>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 100,
            background: "rgba(18,18,18,0.88)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden",
            boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.05)",
          }}>
            {availableCount === 0 && (
              <div style={{ padding: "16px 18px", fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", fontFamily: FONT }}>Everyone has submitted</div>
            )}
            {roster.map((player, i) => {
              const done = submittedNames.includes(player.toLowerCase());
              return (
                <div key={player} style={{
                  padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between",
                  borderBottom: i < roster.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}>
                  {/* Left: avatar + name */}
                  <div
                    onClick={() => !done && handleSelect(player)}
                    style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, cursor: done ? "default" : "pointer" }}
                    onMouseEnter={e => { if (!done) e.currentTarget.closest("div[style]").style.background = "rgba(255,255,255,0.06)"; }}
                    onMouseLeave={e => { e.currentTarget.closest("div[style]").style.background = "transparent"; }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? "rgba(74,222,128,0.1)" : "linear-gradient(135deg,rgba(248,113,113,0.5),rgba(96,165,250,0.5))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: done ? "#4ade80" : "#fff", flexShrink: 0 }}>
                      {done ? "🔒" : player[0].toUpperCase()}
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 500, color: done ? "rgba(255,255,255,0.3)" : "#fff", fontFamily: FONT, textDecoration: done ? "none" : "none" }}>{player}</span>
                    {done && <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 500, fontFamily: FONT }}>✓</span>}
                  </div>
                  {/* Right: redo button if done, chevron if not */}
                  {done ? (
                    <button
                      onClick={() => handleRedo(player)}
                      style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: FONT, flexShrink: 0, transition: "all .15s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.22)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; }}
                    >
                      Re-do
                    </button>
                  ) : (
                    <span style={{ fontSize: 16, color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>›</span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
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
  // ── State ──────────────────────────────────────────────────────────────────
  const [step, setStep]           = useState("name");  // name | portal | pick | comps | draft | calendar | done
  const [name, setName]           = useState("");
  const [selected, setSelected]   = useState([]);
  const [saving, setSaving]       = useState(false);
  const [saveErr, setSaveErr]     = useState("");
  const [funny]                   = useState(() => FUNNY_MESSAGES[Math.floor(Math.random() * FUNNY_MESSAGES.length)]);
  const [roster, setRoster]       = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [submittedNames, setSubmittedNames] = useState([]);
  const [draftActive, setDraftActive] = useState(false);

  useEffect(() => {
    loadStore().then(s => {
      setRoster(s.roster || []);
      setSubmittedNames((s.responses || []).map(r => r.name.toLowerCase()));
      setLoadingRoster(false);
    });
    loadDraft().then(d => setDraftActive(!!(d && d.active)));
  }, []);

  const toggle = useCallback(hero => {
    setSelected(s => {
      const isDP = hero.name === "Deadpool";
      const exists = s.find(h => isDP ? (h.name === hero.name && h.role === hero.role) : h.name === hero.name);
      return exists
        ? s.filter(h => isDP ? !(h.name === hero.name && h.role === hero.role) : h.name !== hero.name)
        : [...s, hero];
    });
  }, []);

  const submit = async () => {
    if (!name || selected.length === 0) return;
    setSaving(true); setSaveErr("");
    const store = await loadStore();
    store.responses = [
      ...store.responses.filter(e => e.name.toLowerCase() !== name.toLowerCase()),
      { name, heroes: selected, submittedAt: Date.now() },
    ];
    const ok = await saveStore(store);
    setSaving(false);
    if (ok) { setSubmittedNames(store.responses.map(r => r.name.toLowerCase())); setStep("done"); }
    else setSaveErr("Save failed — try again.");
  };

  // ── Step: done ─────────────────────────────────────────────────────────────
  if (step === "done") return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <div style={{ fontSize: 60, marginBottom: 14 }}>✅</div>
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>You're locked in.</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>
          {selected.length} heroes for <span style={{ color: "#fff", fontWeight: 600 }}>{name}</span>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.22)", marginTop: 6, fontStyle: "italic" }}>{funny}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 18 }}>
          {selected.map(h => <HeroPortrait key={h.name + h.role} hero={h} size={40} selected />)}
        </div>
        <ShareButton />
        <div style={{ marginTop: 14 }}>
          <button onClick={() => setStep("portal")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: 12, cursor: "pointer", fontFamily: FONT }}>← Back to menu</button>
        </div>
      </div>
    </div>
  );

  // ── Step: pick ─────────────────────────────────────────────────────────────
  if (step === "pick") return (
    <div style={{ height: "100vh", background: "#000", fontFamily: FONT, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button onClick={() => setStep("portal")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 22, cursor: "pointer", fontFamily: FONT, lineHeight: 1, padding: "0 4px 0 0" }}>‹</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>Picking for</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
        </div>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", flexShrink: 0 }}><span style={{ color: "#60a5fa", fontWeight: 700 }}>{selected.length}</span> selected</span>
        <button onClick={submit} disabled={selected.length === 0 || saving}
          style={{ background: selected.length > 0 ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.07)", color: selected.length > 0 ? "#000" : "rgba(255,255,255,0.2)", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: selected.length > 0 ? "pointer" : "default", fontFamily: FONT, flexShrink: 0 }}>
          {saving ? "Saving…" : "Submit"}
        </button>
      </div>
      {saveErr && <div style={{ padding: "8px 16px", background: "rgba(239,68,68,0.1)", fontSize: 11, color: "#f87171", flexShrink: 0 }}>{saveErr}</div>}
      <HeroPicker selected={selected} onToggle={toggle} />
    </div>
  );

  // ── Step: comps ────────────────────────────────────────────────────────────
  if (step === "comps") return <PlayerCompReview playerName={name} onBack={() => setStep("portal")} />;

  // ── Step: calendar ─────────────────────────────────────────────────────────
  if (step === "calendar") return <PlayerAvailability playerName={name} onBack={() => setStep("portal")} />;

  // ── Step: draft ────────────────────────────────────────────────────────────
  if (step === "draft") return (
    <div style={{ height: "100vh", background: "#000", fontFamily: FONT, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button onClick={() => setStep("portal")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 22, cursor: "pointer", fontFamily: FONT, lineHeight: 1 }}>‹</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>Draft Board</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Playing as {name}</div>
        </div>
        {draftActive && <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} />
          <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 600 }}>Live</span>
        </div>}
      </div>
      <div style={{ flex: 1, overflow: "hidden", padding: 14 }}>
        <DraftDashboard roster={roster} responses={[]} playerName={name} isCaptain={false} />
      </div>
    </div>
  );

  // ── Step: portal ───────────────────────────────────────────────────────────
  if (step === "portal") {
    const hasSubmitted = submittedNames.includes(name.toLowerCase());
    const options = [
      { icon: "⚔️", label: "Hero Pool",   desc: hasSubmitted ? "✓ Pool submitted — update anytime" : "Submit your hero pool", step: "pick",     done: hasSubmitted },
      { icon: "📋", label: "Review Comps", desc: "View captain comps & give feedback",                                         step: "comps",    done: false },
      { icon: "🎯", label: draftActive ? "Live Draft 🔴" : "Draft Board", desc: draftActive ? "Draft is active — join now!" : "View the current draft", step: "draft", live: draftActive },
      { icon: "📅", label: "Availability", desc: "Mark the days you can play",                                                 step: "calendar", done: false },
    ];
    return (
      <div style={{ minHeight: "100vh", background: "#000", fontFamily: FONT, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28,
        backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,255,255,0.1), transparent)" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", marginBottom: 6, textTransform: "uppercase" }}>Y3Y2</div>
            <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff", lineHeight: 1 }}>Hey, {name} 👋</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>What do you want to do?</div>
          </div>
          <div style={{ ...glass({ borderRadius: 20, overflow: "hidden", padding: 0 }) }}>
            {options.map((opt, i) => (
              <button key={opt.label} onClick={() => setStep(opt.step)} style={{
                width: "100%", background: opt.live ? "rgba(248,113,113,0.06)" : "transparent",
                border: "none", borderBottom: i < options.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                padding: "16px 20px", display: "flex", alignItems: "center", gap: 14,
                cursor: "pointer", fontFamily: FONT, textAlign: "left", transition: "background .12s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = opt.live ? "rgba(248,113,113,0.12)" : "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = opt.live ? "rgba(248,113,113,0.06)" : "transparent"; }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: opt.live ? "rgba(248,113,113,0.15)" : "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{opt.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: opt.live ? "#f87171" : "#fff" }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: opt.done ? "#4ade80" : "rgba(255,255,255,0.35)", marginTop: 2 }}>{opt.desc}</div>
                </div>
                <span style={{ fontSize: 18, color: "rgba(255,255,255,0.2)" }}>›</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <button onClick={() => { setName(""); setSelected([]); setStep("name"); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", fontSize: 12, cursor: "pointer", fontFamily: FONT }}>← Not you?</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step: name (default/landing) ───────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, padding: 28,
      backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,255,255,0.13), transparent)" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", marginBottom: 10, textTransform: "uppercase" }}>Y3Y2</div>
          <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1 }}>Hero Pool</div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", marginTop: 10 }}>Who are you?</div>
        </div>

        {loadingRoster ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 13, padding: "24px 0" }}>Loading…</div>
        ) : roster.length === 0 ? (
          <div style={{ ...glass({ borderRadius: 14, padding: "24px" }), textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>⏳</div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Roster not set up yet</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 6 }}>Ask your captain to add players</div>
          </div>
        ) : (
          <div style={{ ...glass({ borderRadius: 16, overflow: "hidden", padding: 0 }) }}>
            {roster.map((player, i) => (
              <button key={player} onClick={() => { setName(player); setStep("portal"); }}
                style={{
                  width: "100%", background: "transparent", border: "none",
                  borderBottom: i < roster.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  padding: "14px 18px", display: "flex", alignItems: "center", gap: 12,
                  cursor: "pointer", fontFamily: FONT, textAlign: "left", transition: "background .12s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,rgba(248,113,113,0.6),rgba(96,165,250,0.6))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {player[0].toUpperCase()}
                </div>
                <span style={{ fontSize: 16, fontWeight: 500, color: "#fff", flex: 1 }}>{player}</span>
                <span style={{ fontSize: 18, color: "rgba(255,255,255,0.2)" }}>›</span>
              </button>
            ))}
          </div>
        )}

        <div style={{ marginTop: 40, textAlign: "center" }}>
          <button onClick={onCaptainAccess} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.08)", fontSize: 10, letterSpacing: "0.08em", cursor: "pointer", fontFamily: FONT, textTransform: "uppercase" }}>
            Captain Access
          </button>
        </div>
        <div style={{ marginTop: 28, textAlign: "center", opacity: 0.7 }}>
          <img src="https://media1.tenor.com/m/c4r46CfpfR8AAAAd/jeff-jeff-the-land-shark.gif" alt="Jeff"
            style={{ width: 80, height: 80, objectFit: "contain", borderRadius: "50%", display: "inline-block" }} />
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", marginTop: 4, fontStyle: "italic" }}>jeff approves this message</div>
        </div>
      </div>
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
              <button onClick={e => { e.stopPropagation(); const updated = comps.map((ci,ii) => ii === idx ? {...ci, published: !ci.published} : ci); saveComps(updated); }} style={{ background: "none", border: "none", color: c.published ? "#4ade80" : "rgba(255,255,255,0.25)", fontSize: 10, cursor: "pointer", padding: "0 4px", flexShrink: 0, fontFamily: FONT, fontWeight: 600 }}>{c.published ? "● live" : "○ share"}</button>
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
  const [compsForReview, setCompsForReview] = useState([]);
  const loadCompsForReview = async () => { try { const s = await loadStore(); setCompsForReview(s.comps || []); } catch(e) { console.error("loadCompsForReview error:", e); } };
  useEffect(() => { loadCompsForReview(); }, []);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const s = await loadStore();
      setResponses(s.responses || []);
      setRefreshed(new Date());
    } catch(e) {
      console.error("Dashboard load error:", e);
    }
    setLoading(false);
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
          <div style={{ display: "flex", gap: 4, overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 2 }}>
            {[["responses","Responses"],["builder","Comps"],["reviews","Reviews"],["draft","Draft"],["calendar","Calendar"],["roster","Roster"]].map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? "rgba(255,255,255,0.1)" : "transparent", border: "1px solid " + (tab === t ? "rgba(255,255,255,0.15)" : "transparent"), color: tab === t ? "#fff" : "rgba(255,255,255,0.4)", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: FONT, transition: "all .12s", whiteSpace: "nowrap", flexShrink: 0 }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={shareFormLink} style={{ background: copied ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.05)", border: "1px solid " + (copied ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.08)"), color: copied ? "#4ade80" : "rgba(255,255,255,0.5)", borderRadius: 8, padding: "6px 10px", fontSize: 13, cursor: "pointer", fontFamily: FONT, transition: "all .2s", flexShrink: 0 }} title="Share Form">
          {copied ? "✓" : "🔗"}
        </button>
        <button onClick={load} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", borderRadius: 8, padding: "6px 10px", fontSize: 13, cursor: "pointer", fontFamily: FONT, flexShrink: 0 }} title="Refresh">↺</button>
        {responses.length > 0 && <button onClick={clearAll} style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: FONT, flexShrink: 0 }}>Clear</button>}
        <button onClick={onLock} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.3)", borderRadius: 8, padding: "6px 10px", fontSize: 13, cursor: "pointer", fontFamily: FONT, flexShrink: 0 }} title="Lock">🔒</button>
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
        ) : tab === "reviews" ? (
          <ReviewsDashboard comps={compsForReview} onRefreshComps={loadCompsForReview} />
        ) : tab === "draft" ? (
          <DraftDashboard roster={responses.map(r => r.name)} responses={responses} playerName="captain" isCaptain={true} />
        ) : tab === "calendar" ? (
          <CalendarDashboard />
        ) : (
          <CompBuilder responses={responses} />
        )}
      </div>
    </div>
  );
}


// ── Utilities ─────────────────────────────────────────────────────────────────
function relativeTime(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

function generateDays(count = 35) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDay(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return { day: DAY_LABELS[d.getDay()], date: d.getDate(), month: MONTH_LABELS[d.getMonth()] };
}


// ── Player Portal Wrapper (loads live status) ─────────────────────────────────
function PlayerPortalWrapper({ name, submittedInSession, submittedNames, draftActive, onHeroes, onReview, onAvailability, onDraft, onBack }) {
  const [hasAvailability, setHasAvailability] = useState(false);
  const [heroCount, setHeroCount] = useState(submittedInSession);

  useEffect(() => {
    loadAllAvailability().then(rows => {
      const mine = rows.find(r => r.player_name === name);
      setHasAvailability(!!(mine && mine.available_dates && mine.available_dates.length > 0));
    });
    // Hero count from responses
    loadStore().then(s => {
      const resp = (s.responses || []).find(r => r.name.toLowerCase() === name.toLowerCase());
      if (resp) setHeroCount(resp.heroes.length);
    });
  }, []);

  return (
    <PlayerPortal
      name={name}
      submittedHeroes={heroCount}
      hasAvailability={hasAvailability}
      draftActive={draftActive}
      onHeroes={onHeroes}
      onReview={onReview}
      onAvailability={onAvailability}
      onDraft={onDraft}
      onBack={onBack}
    />
  );
}

// ── Player Portal ─────────────────────────────────────────────────────────────
function PlayerPortal({ name, submittedHeroes, hasAvailability, draftActive, onHeroes, onReview, onAvailability, onDraft, onBack }) {
  const options = [
    { key: 'heroes', icon: '⚔️', label: 'Hero Pool', desc: submittedHeroes > 0 ? submittedHeroes + ' heroes submitted' : 'Not submitted yet', done: submittedHeroes > 0, action: onHeroes },
    { key: 'review', icon: '📋', label: 'Review Comps', desc: 'View & comment on captain comps', done: false, action: onReview },
    { key: 'draft', icon: '🎯', label: draftActive ? 'Live Draft' : 'Draft Board', desc: draftActive ? 'Draft is active — join now!' : 'View the current draft', done: false, action: onDraft, live: draftActive },
    { key: 'availability', icon: '📅', label: 'Availability', desc: hasAvailability ? 'Schedule updated ✓' : 'Mark your available days', done: hasAvailability, action: onAvailability },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#000', fontFamily: FONT, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28,
      backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,255,255,0.1), transparent)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)', marginBottom: 6, textTransform: 'uppercase' }}>Y3Y2</div>
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1 }}>Hey, {name} 👋</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>What do you want to do?</div>
        </div>
        <div style={{ ...glass({ borderRadius: 20, overflow: 'hidden', padding: 0 }) }}>
          {options.map((opt, i) => (
            <button key={opt.key} onClick={opt.action} style={{
              width: '100%', background: opt.live ? 'rgba(248,113,113,0.06)' : 'transparent',
              border: 'none', borderBottom: i < options.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer', fontFamily: FONT, transition: 'background .12s', textAlign: 'left',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = opt.live ? 'rgba(248,113,113,0.12)' : 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = opt.live ? 'rgba(248,113,113,0.06)' : 'transparent'; }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: opt.live ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{opt.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: opt.live ? '#f87171' : '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {opt.label}
                  {opt.live && <span style={{ fontSize: 9, background: '#ef4444', color: '#fff', borderRadius: 4, padding: '2px 5px', fontWeight: 700, letterSpacing: '0.06em' }}>LIVE</span>}
                </div>
                <div style={{ fontSize: 12, color: opt.done ? '#4ade80' : 'rgba(255,255,255,0.3)', marginTop: 2 }}>{opt.done ? '✓ ' : ''}{opt.desc}</div>
              </div>
              <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.2)' }}>›</span>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: 12, cursor: 'pointer', fontFamily: FONT }}>← Not you?</button>
        </div>
      </div>
    </div>
  );
}

// ── Player Comp Review ────────────────────────────────────────────────────────
function PlayerCompReview({ playerName, onBack }) {
  const [comps, setComps] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [comment, setComment] = useState('');
  const [suggestSlot, setSuggestSlot] = useState(null);
  const [suggestSearch, setSuggestSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState({});

  useEffect(() => {
    loadStore().then(s => setComps((s.comps || []).filter(c => c.published)));
  }, []);

  const handleComment = async (compId) => {
    if (!comment.trim()) return;
    setSubmitting(true);
    await saveCompReview({ compId, playerName, comment: comment.trim() });
    setComment('');
    setSubmitted(p => ({ ...p, [compId + '_comment']: true }));
    setSubmitting(false);
  };

  const handleSuggest = async (compId, slotIndex, hero) => {
    setSubmitting(true);
    await saveCompReview({ compId, playerName, slotIndex, suggestedHero: hero });
    setSuggestSlot(null);
    setSuggestSearch('');
    setSubmitted(p => ({ ...p, [compId + '_' + slotIndex]: true }));
    setSubmitting(false);
  };

  const suggestHeroes = HEROES.filter(h => h.name.toLowerCase().includes(suggestSearch.toLowerCase()));

  }

  if (step === 'availability') return <PlayerAvailability playerName={name} onBack={() => setStep('portal')} />;
  if (step === 'draft_player') return (
    <div style={{ height: '100vh', background: '#000', fontFamily: FONT, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button onClick={() => setStep('portal')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 18, cursor: 'pointer', fontFamily: FONT }}>‹</button>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Live Draft</div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', padding: 16 }}>
        <DraftDashboard roster={[]} responses={[]} playerName={name} isCaptain={false} />
      </div>
    </div>
  );

  return (
    <div style={{ height: '100vh', background: '#000', fontFamily: FONT, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 18, cursor: 'pointer', fontFamily: FONT }}>‹</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>Review Comps</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{comps.length} published comp{comps.length !== 1 ? 's' : ''}</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
        {comps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>No comps published yet</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Your captain hasn't shared any comps</div>
          </div>
        ) : comps.map(comp => {
          const isOpen = expandedId === comp.id;
          return (
            <div key={comp.id} style={{ ...glass({ borderRadius: 16, marginBottom: 10, overflow: 'hidden', padding: 0 }) }}>
              <button onClick={() => setExpandedId(isOpen ? null : comp.id)} style={{
                width: '100%', background: 'transparent', border: 'none', padding: '14px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontFamily: FONT,
              }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{comp.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                    {comp.slots.filter(Boolean).length}/6 heroes · tap to {isOpen ? 'collapse' : 'review'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {comp.slots.slice(0, 4).filter(Boolean).map((h, i) => <HeroPortrait key={i} hero={h} size={28} />)}
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.25)', marginLeft: 4 }}>{isOpen ? '▴' : '▾'}</span>
                </div>
              </button>

              {isOpen && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px' }}>
                  {/* 6 slots */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                    {comp.slots.map((slot, si) => {
                      const hasSuggested = submitted[comp.id + '_' + si];
                      return (
                        <div key={si} style={{ textAlign: 'center' }}>
                          <div style={{ ...glass({ borderRadius: 12, padding: '10px 6px', border: '1px solid rgba(255,255,255,0.07)' }) }}>
                            {slot ? (
                              <>
                                <HeroPortrait hero={slot} size={48} selected />
                                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginTop: 4, fontWeight: 600 }}>{slot.name.split(' ').pop().toUpperCase()}</div>
                              </>
                            ) : (
                              <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)', fontSize: 20 }}>+</div>
                            )}
                            <button onClick={() => { setSuggestSlot({ compId: comp.id, slotIndex: si, current: slot }); setSuggestSearch(''); }}
                              style={{ marginTop: 6, width: '100%', background: hasSuggested ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)', border: '1px solid ' + (hasSuggested ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)'), color: hasSuggested ? '#4ade80' : 'rgba(255,255,255,0.4)', borderRadius: 6, padding: '4px 0', fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
                              {hasSuggested ? '✓ sent' : '💬 suggest'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Comment */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.25)', marginBottom: 8, textTransform: 'uppercase' }}>Leave a comment</div>
                    {submitted[comp.id + '_comment'] ? (
                      <div style={{ fontSize: 13, color: '#4ade80', textAlign: 'center', padding: '8px 0' }}>✓ Comment sent</div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Your thoughts on this comp..."
                          style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '9px 12px', color: '#fff', fontSize: 13, fontFamily: FONT, outline: 'none' }} />
                        <button onClick={() => handleComment(comp.id)} disabled={!comment.trim() || submitting}
                          style={{ background: comment.trim() ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 10, padding: '9px 14px', color: comment.trim() ? '#000' : 'rgba(255,255,255,0.2)', fontSize: 13, fontWeight: 600, cursor: comment.trim() ? 'pointer' : 'default', fontFamily: FONT }}>
                          Send
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hero suggest modal */}
      {suggestSlot && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end' }} onClick={() => setSuggestSlot(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: 'rgba(12,12,16,0.97)', backdropFilter: 'blur(40px)', borderRadius: '20px 20px 0 0', border: '1px solid rgba(255,255,255,0.08)', padding: 20, maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Suggest replacement for slot {suggestSlot.slotIndex + 1}</div>
            <input autoFocus value={suggestSearch} onChange={e => setSuggestSearch(e.target.value)} placeholder="Search hero..."
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, fontFamily: FONT, outline: 'none', marginBottom: 10 }} />
            <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {suggestHeroes.map(hero => (
                <button key={hero.name} onClick={() => handleSuggest(suggestSlot.compId, suggestSlot.slotIndex, hero)}
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '8px 4px', cursor: 'pointer', fontFamily: FONT, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <HeroPortrait hero={hero} size={44} />
                  <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textAlign: 'center' }}>{hero.name.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Player Availability ───────────────────────────────────────────────────────
function PlayerAvailability({ playerName, onBack }) {
  const [marked, setMarked] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [allAvail, setAllAvail] = useState([]);
  const days = generateDays(35);

  useEffect(() => {
    savePlayerAvailability(playerName, []).catch(() => {}); // ensure row exists
    loadAllAvailability().then(rows => {
      const mine = rows.find(r => r.player_name === playerName);
      if (mine) setMarked(mine.available_dates || []);
      setAllAvail(rows);
    });
  }, []);

  const toggle = (d) => setMarked(m => m.includes(d) ? m.filter(x => x !== d) : [...m, d]);

  const save = async () => {
    setSaving(true);
    await savePlayerAvailability(playerName, marked);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Count other players available per day
  const countMap = {};
  allAvail.filter(r => r.player_name !== playerName).forEach(r => {
    (r.available_dates || []).forEach(d => { countMap[d] = (countMap[d] || 0) + 1; });
  });

  // Group days into weeks
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div style={{ height: '100vh', background: '#000', fontFamily: FONT, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 18, cursor: 'pointer', fontFamily: FONT }}>‹</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>Availability</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>CT · ET +1 · PT −2 · tap days you can play</div>
        </div>
        <button onClick={save} disabled={saving}
          style={{ background: saved ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.9)', border: saved ? '1px solid rgba(74,222,128,0.3)' : 'none', borderRadius: 10, padding: '8px 16px', color: saved ? '#4ade80' : '#000', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT, transition: 'all .2s' }}>
          {saving ? '…' : saved ? '✓ Saved' : 'Save'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
        {/* Day labels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
          {DAY_LABELS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.2)', padding: '4px 0' }}>{d}</div>)}
        </div>
        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
            {week.map(day => {
              const { day: dayName, date, month } = formatDay(day);
              const isMine = marked.includes(day);
              const othersCount = countMap[day] || 0;
              const isToday = day === new Date().toISOString().split('T')[0];
              return (
                <button key={day} onClick={() => toggle(day)} style={{
                  background: isMine ? 'rgba(74,222,128,0.18)' : othersCount > 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                  border: isMine ? '1px solid rgba(74,222,128,0.4)' : isToday ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 10, padding: '8px 4px', cursor: 'pointer', fontFamily: FONT, textAlign: 'center', transition: 'all .12s',
                }}>
                  {wi === 0 && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', marginBottom: 2 }}>{month}</div>}
                  <div style={{ fontSize: 15, fontWeight: 600, color: isMine ? '#4ade80' : isToday ? '#fff' : 'rgba(255,255,255,0.5)' }}>{date}</div>
                  {othersCount > 0 && (
                    <div style={{ marginTop: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                      {Array.from({ length: Math.min(othersCount, 4) }).map((_, i) => (
                        <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(96,165,250,0.6)' }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
        <div style={{ padding: '12px 0', display: 'flex', gap: 16, justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(74,222,128,0.3)', border: '1px solid rgba(74,222,128,0.5)' }} /> You
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(96,165,250,0.6)' }} /> Teammates
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reviews Dashboard (captain) ───────────────────────────────────────────────
function ReviewsDashboard({ comps, onRefreshComps }) {
  const [reviews, setReviews] = useState({});
  const [expanded, setExpanded] = useState(null);
  const publishedComps = comps.filter(c => c.published);

  const loadReviews = async (compId) => {
    const data = await loadCompReviews(compId);
    setReviews(r => ({ ...r, [compId]: data }));
  };

  useEffect(() => {
    publishedComps.forEach(c => loadReviews(c.id));
  }, [comps.length]);

  const handleApprove = async (review, comp) => {
    if (review.suggested_hero && review.slot_index !== null) {
      const hero = typeof review.suggested_hero === 'string' ? JSON.parse(review.suggested_hero) : review.suggested_hero;
      const store = await loadStore();
      store.comps = store.comps.map(c => {
        if (String(c.id) !== String(comp.id)) return c;
        const slots = [...c.slots];
        slots[review.slot_index] = hero;
        return { ...c, slots };
      });
      await saveStore(store);
      onRefreshComps();
    }
    await updateReviewStatus(review.id, 'approved');
    loadReviews(comp.id);
  };

  const handleDismiss = async (review) => {
    await updateReviewStatus(review.id, 'dismissed');
    loadReviews(review.comp_id);
  };

  if (publishedComps.length === 0) return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.2)', fontFamily: FONT }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>No published comps</div>
      <div style={{ fontSize: 12, marginTop: 4 }}>Publish comps from the Comp Builder tab</div>
    </div>
  );

  return (
    <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 20 }}>
      {publishedComps.map(comp => {
        const compReviews = reviews[comp.id] || [];
        const pending = compReviews.filter(r => r.status === 'pending');
        const isOpen = expanded === comp.id;
        return (
          <div key={comp.id} style={{ ...glass({ borderRadius: 14, marginBottom: 10, overflow: 'hidden', padding: 0 }) }}>
            <button onClick={() => setExpanded(isOpen ? null : comp.id)} style={{ width: '100%', background: 'transparent', border: 'none', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontFamily: FONT }}>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{comp.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{compReviews.length} feedback · {pending.length} pending</div>
              </div>
              {pending.length > 0 && <div style={{ background: '#ef4444', color: '#fff', borderRadius: 10, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{pending.length}</div>}
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.25)' }}>{isOpen ? '▴' : '▾'}</span>
            </button>

            {isOpen && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px' }}>
                {compReviews.length === 0 ? (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '12px 0' }}>No feedback yet</div>
                ) : compReviews.map(r => {
                  const hero = r.suggested_hero ? (typeof r.suggested_hero === 'string' ? JSON.parse(r.suggested_hero) : r.suggested_hero) : null;
                  return (
                    <div key={r.id} style={{ ...glass({ borderRadius: 10, padding: '12px 14px', marginBottom: 8, background: r.status === 'pending' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)', opacity: r.status !== 'pending' ? 0.5 : 1 }) }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(248,113,113,0.5),rgba(96,165,250,0.5))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>{r.player_name[0].toUpperCase()}</div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{r.player_name}</span>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{relativeTime(r.created_at)}</span>
                        </div>
                        {r.status !== 'pending' && <span style={{ fontSize: 10, color: r.status === 'approved' ? '#4ade80' : 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{r.status === 'approved' ? '✓ Approved' : 'Dismissed'}</span>}
                      </div>
                      {r.comment && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6, lineHeight: 1.5 }}>"{r.comment}"</div>}
                      {hero && r.slot_index !== null && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Slot {r.slot_index + 1}:</div>
                          {comp.slots[r.slot_index] && <HeroPortrait hero={comp.slots[r.slot_index]} size={32} />}
                          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)' }}>→</span>
                          <HeroPortrait hero={hero} size={32} selected />
                          <span style={{ fontSize: 11, color: '#60a5fa' }}>{hero.name}</span>
                        </div>
                      )}
                      {r.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => handleApprove(r, comp)} style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80', borderRadius: 7, padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>Approve</button>
                          <button onClick={() => handleDismiss(r)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', borderRadius: 7, padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>Dismiss</button>
                        </div>
                      )}
                    </div>
                  );
                })}
                <button onClick={() => loadReviews(comp.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 11, cursor: 'pointer', fontFamily: FONT, padding: '4px 0' }}>↺ Refresh</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Draft Dashboard (captain + players) ──────────────────────────────────────
function DraftDashboard({ roster, responses, playerName, isCaptain }) {
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pickingSlot, setPickingSlot] = useState(null);
  const [search, setSearch] = useState('');
  const intervalRef = useRef(null);
  const savingRef = useRef(false);

  const poll = async () => {
    if (savingRef.current) return; // don't overwrite during save
    const d = await loadDraft();
    setDraft(d);
    setLoading(false);
  };

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, 3000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const startDraft = async (mode) => {
    savingRef.current = true;
    const state = {
      active: true, mode, startedAt: Date.now(),
      slots: Array(6).fill(null).map((_, i) => ({ playerName: roster[i] || null, hero: null })),
    };
    setDraft(state); // set local state immediately
    await saveDraft(state);
    await new Promise(r => setTimeout(r, 500)); // let Supabase settle
    savingRef.current = false;
  };

  const updateSlotHero = async (slotIdx, hero) => {
    if (!draft) return;
    savingRef.current = true;
    const updated = { ...draft, slots: draft.slots.map((s, i) => i === slotIdx ? { ...s, hero } : s) };
    setDraft(updated);
    await saveDraft(updated);
    savingRef.current = false;
    setPickingSlot(null);
    setSearch('');
  };

  const updateSlotPlayer = async (slotIdx, pName) => {
    if (!draft) return;
    savingRef.current = true;
    const updated = { ...draft, slots: draft.slots.map((s, i) => i === slotIdx ? { ...s, playerName: pName } : s) };
    setDraft(updated);
    await saveDraft(updated);
    savingRef.current = false;
  };

  const toggleMode = async () => {
    if (!draft) return;
    savingRef.current = true;
    const updated = { ...draft, mode: draft.mode === 'captain' ? 'team' : 'captain' };
    setDraft(updated);
    await saveDraft(updated);
    savingRef.current = false;
  };

  const endSession = async () => {
    savingRef.current = true;
    await clearDraft();
    setDraft(null);
    savingRef.current = false;
  };

  const mySlotIdx = draft ? draft.slots.findIndex(s => s.playerName === playerName) : -1;
  const canPickSlot = (slotIdx) => {
    if (!draft || !draft.active) return false;
    if (isCaptain) return true;
    if (draft.mode === 'team' && mySlotIdx === slotIdx) return true;
    return false;
  };

  // Pool: use submitted heroes if team mode, full roster if captain mode
  const heroPool = draft?.mode === 'team' && !isCaptain
    ? (responses.find(r => r.name === playerName)?.heroes || HEROES)
    : HEROES;

  const filtered = heroPool.filter(h => h.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.2)', fontFamily: FONT }}>Loading…</div>;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Session header */}
      <div style={{ ...glass({ borderRadius: 14, padding: '14px 16px', marginBottom: 12, flexShrink: 0 }) }}>
        {draft?.active ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', fontFamily: FONT }}>Draft Active</span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{draft.slots.filter(s => s.hero).length}/6 picks made</div>
            </div>
            {isCaptain && (
              <>
                <button onClick={toggleMode} style={{ ...glass({ borderRadius: 8, padding: '6px 12px' }), color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
                  {draft.mode === 'captain' ? '🎯 Captain Pick' : '👥 Team Pick'}
                </button>
                <button onClick={endSession} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>End</button>
              </>
            )}
          </div>
        ) : isCaptain ? (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 10, fontFamily: FONT }}>Start a Draft Session</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => startDraft('captain')} style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
                🎯 Captain Pick<div style={{ fontSize: 10, fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>You pick all heroes</div>
              </button>
              <button onClick={() => startDraft('team')} style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
                👥 Team Pick<div style={{ fontSize: 10, fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Each player picks</div>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '8px 0', color: 'rgba(255,255,255,0.3)', fontSize: 13, fontFamily: FONT }}>Waiting for captain to start a draft…</div>
        )}
      </div>

      {/* Draft board */}
      {draft?.active && (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, marginBottom: 12 }}>
            {draft.slots.map((slot, si) => {
              const canPick = canPickSlot(si);
              const isMySlot = mySlotIdx === si;
              const r = slot.hero ? ROLES[slot.hero.role] : null;
              return (
                <div key={si} onClick={() => canPick && setPickingSlot(si)}
                  style={{ ...glass({ borderRadius: 14, padding: '12px 10px', cursor: canPick ? 'pointer' : 'default', border: '1px solid ' + (isMySlot && !isCaptain ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.07)'), background: isMySlot && !isCaptain ? 'rgba(96,165,250,0.05)' : 'rgba(255,255,255,0.03)' }), textAlign: 'center', transition: 'all .12s' }}
                  onMouseEnter={e => { if (canPick) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isMySlot && !isCaptain ? 'rgba(96,165,250,0.05)' : 'rgba(255,255,255,0.03)'; }}>
                  {/* Player name */}
                  {isCaptain ? (
                    <select value={slot.playerName || ''} onChange={e => { e.stopPropagation(); updateSlotPlayer(si, e.target.value || null); }}
                      onClick={e => e.stopPropagation()}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '4px 6px', color: slot.playerName ? '#fff' : 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: FONT, marginBottom: 8, outline: 'none', cursor: 'pointer' }}>
                      <option value="">Slot {si + 1}</option>
                      {roster.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  ) : (
                    <div style={{ fontSize: 10, fontWeight: 600, color: isMySlot ? '#60a5fa' : 'rgba(255,255,255,0.3)', marginBottom: 8, letterSpacing: '0.05em' }}>{slot.playerName || 'Slot ' + (si + 1)}</div>
                  )}
                  {/* Hero */}
                  {slot.hero ? (
                    <>
                      <HeroPortrait hero={slot.hero} size={52} selected />
                      <div style={{ fontSize: 8, fontWeight: 700, color: r.color, marginTop: 5, letterSpacing: '0.04em' }}>{slot.hero.name.toUpperCase()}</div>
                    </>
                  ) : (
                    <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', color: canPick ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)', fontSize: 22, border: '1.5px dashed rgba(255,255,255,0.1)', borderRadius: 10 }}>
                      {canPick ? '+' : '—'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hero picker for draft slot */}
      {pickingSlot !== null && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end' }} onClick={() => setPickingSlot(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: 'rgba(10,10,14,0.97)', backdropFilter: 'blur(40px)', borderRadius: '20px 20px 0 0', border: '1px solid rgba(255,255,255,0.08)', padding: 20, maxHeight: '65vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginBottom: 10, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: FONT }}>Pick hero for slot {pickingSlot + 1}</div>
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 14px', color: '#fff', fontSize: 14, fontFamily: FONT, outline: 'none', marginBottom: 10 }} />
            <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {filtered.map(hero => (
                <button key={hero.name} onClick={() => updateSlotHero(pickingSlot, hero)}
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '8px 4px', cursor: 'pointer', fontFamily: FONT, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <HeroPortrait hero={hero} size={46} />
                  <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textAlign: 'center' }}>{hero.name.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Calendar Dashboard ────────────────────────────────────────────────────────
function CalendarDashboard() {
  const [avail, setAvail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState(null);
  const days = generateDays(35);

  useEffect(() => {
    loadAllAvailability().then(d => { setAvail(d); setLoading(false); });
  }, []);

  const reload = () => loadAllAvailability().then(setAvail);

  // Build map: date → array of player names
  const dayMap = {};
  avail.forEach(r => {
    (r.available_dates || []).forEach(d => {
      if (!dayMap[d]) dayMap[d] = [];
      dayMap[d].push(r.player_name);
    });
  });

  const maxCount = Math.max(1, ...Object.values(dayMap).map(v => v.length));
  const getIntensity = (count) => Math.min(count / maxCount, 1);

  // Group into weeks
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  // Activity feed
  const activityFeed = avail.slice(0, 12).map(r => ({
    player: r.player_name,
    count: (r.available_dates || []).length,
    time: r.updated_at,
  }));

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.2)', fontFamily: FONT }}>Loading…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%', overflowY: 'auto' }}>
      {/* Calendar */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: FONT }}>Team Availability</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: FONT }}>Central Time · Eastern +1 · Pacific −2</div>
          </div>
          <button onClick={reload} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', borderRadius: 8, padding: '5px 10px', fontSize: 11, cursor: 'pointer', fontFamily: FONT }}>↺</button>
        </div>
        {/* Day labels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
          {DAY_LABELS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.2)', padding: '4px 0', fontFamily: FONT }}>{d}</div>)}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
            {week.map(day => {
              const players = dayMap[day] || [];
              const count = players.length;
              const intensity = getIntensity(count);
              const isToday = day === new Date().toISOString().split('T')[0];
              const { date, month } = formatDay(day);
              const isHovered = hoveredDay === day;
              return (
                <div key={day} onMouseEnter={() => setHoveredDay(day)} onMouseLeave={() => setHoveredDay(null)}
                  style={{ position: 'relative', borderRadius: 10, padding: '8px 4px', textAlign: 'center', cursor: count > 0 ? 'pointer' : 'default', transition: 'all .12s',
                    background: count > 0 ? `rgba(74,222,128,${0.04 + intensity * 0.18})` : 'rgba(255,255,255,0.02)',
                    border: isToday ? '1px solid rgba(255,255,255,0.25)' : count > 0 ? `1px solid rgba(74,222,128,${0.15 + intensity * 0.3})` : '1px solid rgba(255,255,255,0.04)',
                  }}>
                  {wi === 0 && <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', marginBottom: 1, fontFamily: FONT }}>{month}</div>}
                  <div style={{ fontSize: 14, fontWeight: 600, color: count > 0 ? `rgba(74,222,128,${0.5 + intensity * 0.5})` : isToday ? '#fff' : 'rgba(255,255,255,0.3)', fontFamily: FONT }}>{date}</div>
                  {count > 0 && <div style={{ fontSize: 10, fontWeight: 700, color: `rgba(74,222,128,${0.5 + intensity * 0.5})`, marginTop: 2, fontFamily: FONT }}>{count}</div>}
                  {/* Tooltip */}
                  {isHovered && count > 0 && (
                    <div style={{ position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', background: 'rgba(10,10,16,0.96)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 10px', zIndex: 50, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                      {players.map(p => <div key={p} style={{ fontSize: 11, color: '#fff', fontWeight: 500, fontFamily: FONT }}>{p}</div>)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {[0, 1, 2, 3, 4].map(n => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: FONT }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: n === 0 ? 'rgba(255,255,255,0.04)' : `rgba(74,222,128,${0.1 + n * 0.08})`, border: `1px solid ${n === 0 ? 'rgba(255,255,255,0.06)' : `rgba(74,222,128,${0.2 + n * 0.12})`}` }} />
              {n === 0 ? '0' : n === 4 ? '4+' : n}
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', paddingBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, fontFamily: FONT }}>Recent Activity</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {activityFeed.length === 0 ? (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.15)', textAlign: 'center', padding: '20px 0', fontFamily: FONT }}>No activity yet</div>
          ) : activityFeed.map((a, i) => (
            <div key={i} style={{ ...glass({ borderRadius: 10, padding: '10px 12px' }) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(248,113,113,0.5),rgba(96,165,250,0.5))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{a.player[0].toUpperCase()}</div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: FONT }}>{a.player}</span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: FONT }}>
                {a.count > 0 ? `Marked ${a.count} day${a.count !== 1 ? 's' : ''} available` : 'Cleared availability'}
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 3, fontFamily: FONT }}>{relativeTime(a.time)}</div>
            </div>
          ))}
        </div>
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
        ::-webkit-scrollbar { width: 4px; height: 0px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        select { -webkit-appearance: none; appearance: none; }
        button { -webkit-tap-highlight-color: transparent; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
      {screen === "form"                           && <FormView onCaptainAccess={handleCaptainAccess} />}
      {(screen === "setup" || screen === "unlock") && <CaptainGate onEnter={() => setScreen("dashboard")} onCancel={() => setScreen("form")} />}
      {screen === "dashboard"                      && <Dashboard onLock={() => setScreen("form")} />}
    </>
  );
}// ── Form View ─────────────────────────────────────────────────────────────────
const FUNNY_MESSAGES = [
  "now stop doomscrolling and go warm up",
  "don't instalock and then leave. we know who you are",
  "if you picked 3 duelists we're going to have a talk",
  "please actually use your ult this time",
  "we believe in you. mostly.",
  "don't forget to charge your controller",
  "yes, we can see your ping",
];

// Steps: name → portal → pick | comps | draft | calendar → done
