import React, { useMemo, useState } from "react";

type Mode = "Solo" | "Friends" | "Family" | "Date";
type Setting = "Indoor" | "Outdoor" | "City" | "Country";
type TimeOfDay = "Morning" | "Afternoon" | "Evening" | "Night" | "Anytime";

type Quest = {
  title: string;
  mode: Mode;
  setting: Setting;
  time: TimeOfDay;
  xp: number;
  task: string;
  flavor: string;
  unlockTitle: string;
};

const modes: Mode[] = ["Solo", "Friends", "Family", "Date"];
const settings: Setting[] = ["Indoor", "Outdoor", "City", "Country"];
const times: TimeOfDay[] = ["Morning", "Afternoon", "Evening", "Night", "Anytime"];

function detectTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 21) return "Evening";
  return "Night";
}

function makeQuest(mode: Mode, setting: Setting, time: TimeOfDay): Quest {
  const key = `${mode}-${setting}-${time}`;

  const questData: Record<string, Omit<Quest, "mode" | "setting" | "time">> = {
    "Solo-Indoor-Morning": { title: "Morning Reset", xp: 10, task: "Make your bed, drink water, and plan one thing worth doing today.", flavor: "A tiny civilization has begun.", unlockTitle: "Morning Operator" },
    "Solo-Indoor-Afternoon": { title: "Drawer Archaeologist", xp: 15, task: "Clean one drawer, shelf, or random disaster zone.", flavor: "You may find batteries, receipts, or ancient shame.", unlockTitle: "Drawer Archaeologist" },
    "Solo-Indoor-Evening": { title: "Skill Spark", xp: 20, task: "Spend 20 minutes learning something useful.", flavor: "Your brain demands tribute.", unlockTitle: "Skill Tinkerer" },
    "Solo-Indoor-Night": { title: "Couch Philosopher", xp: 15, task: "Write down 5 things you want to do before you die.", flavor: "Deep thoughts count, even in gym shorts.", unlockTitle: "Couch Philosopher" },
    "Solo-Indoor-Anytime": { title: "Book Hunter", xp: 10, task: "Read 10 pages of anything that makes your brain less feral.", flavor: "You touched paper and survived.", unlockTitle: "Book Hunter" },

    "Solo-Outdoor-Morning": { title: "Morning Scout", xp: 10, task: "Take a 20-minute walk before the day gets its claws into you.", flavor: "Your ancestors crossed rivers before breakfast.", unlockTitle: "Morning Scout" },
    "Solo-Outdoor-Afternoon": { title: "Trail Scout", xp: 20, task: "Walk one mile and photograph the weirdest thing you find.", flavor: "If you find Bigfoot, document him responsibly.", unlockTitle: "Trail Scout" },
    "Solo-Outdoor-Evening": { title: "Sunset Witness", xp: 15, task: "Watch the sunset without scrolling your phone.", flavor: "Nature has free graphics.", unlockTitle: "Sunset Witness" },
    "Solo-Outdoor-Night": { title: "Night Air Patrol", xp: 15, task: "Step outside for 10 minutes and listen to the night.", flavor: "The darkness is mostly bugs and mystery.", unlockTitle: "Night Air Patrol" },
    "Solo-Outdoor-Anytime": { title: "Perimeter Check", xp: 10, task: "Walk around your block, yard, or nearby area and notice 3 things.", flavor: "You are now security for absolutely no one.", unlockTitle: "Perimeter Walker" },

    "Solo-City-Morning": { title: "Coffee Recon", xp: 10, task: "Try coffee from somewhere you normally ignore.", flavor: "Every hero needs a questionable potion.", unlockTitle: "Coffee Wanderer" },
    "Solo-City-Afternoon": { title: "Urban Wanderer", xp: 20, task: "Walk around a part of town you usually pass by.", flavor: "Low-budget explorer mode activated.", unlockTitle: "Urban Wanderer" },
    "Solo-City-Evening": { title: "Gas Station Philosopher", xp: 20, task: "Find the strangest snack at a gas station.", flavor: "Civilization peaked between jerky and blue soda.", unlockTitle: "Gas Station Philosopher" },
    "Solo-City-Night": { title: "Neon Pilgrim", xp: 20, task: "Safely visit one well-lit place you have never been at night.", flavor: "Batman had a budget. You have curiosity.", unlockTitle: "Neon Pilgrim" },
    "Solo-City-Anytime": { title: "Sidewalk Scout", xp: 10, task: "Walk a new sidewalk, street, or shopping strip.", flavor: "Adventure, but with parking lots.", unlockTitle: "Sidewalk Scout" },

    "Solo-Country-Morning": { title: "Fence Line Scout", xp: 10, task: "Find the quietest outdoor spot nearby.", flavor: "The world is loud. Go find the quiet patch.", unlockTitle: "Fence Line Scout" },
    "Solo-Country-Afternoon": { title: "Old Road Seeker", xp: 20, task: "Take a road or path you normally ignore.", flavor: "Getting mildly lost builds character. Bring gas.", unlockTitle: "Old Road Seeker" },
    "Solo-Country-Evening": { title: "Dusk Watcher", xp: 15, task: "Watch the sky change for 10 minutes.", flavor: "Free cinema. Limited seating.", unlockTitle: "Dusk Watcher" },
    "Solo-Country-Night": { title: "Porch Goblin Watch", xp: 15, task: "Sit outside and listen for wildlife.", flavor: "Do not negotiate with raccoons. They have lawyers.", unlockTitle: "Possum Diplomat" },
    "Solo-Country-Anytime": { title: "Country Marker", xp: 10, task: "Find one natural thing worth remembering.", flavor: "A rock can be a landmark if you believe hard enough.", unlockTitle: "Country Marker" },
  };

  const fallbackTitle = `${mode} ${setting} ${time} Quest`;

  return {
    mode,
    setting,
    time,
    title: questData[key]?.title || fallbackTitle,
    xp: questData[key]?.xp || 10,
    task:
      questData[key]?.task ||
      `Complete a ${mode.toLowerCase()} ${setting.toLowerCase()} quest during the ${time.toLowerCase()}.`,
    flavor:
      questData[key]?.flavor ||
      "The quest board has spoken. Try not to embarrass the kingdom.",
    unlockTitle:
      questData[key]?.unlockTitle ||
      `${setting} ${mode} Adventurer`,
  };
}

const quests: Quest[] = modes.flatMap((mode) =>
  settings.flatMap((setting) =>
    times.map((time) => makeQuest(mode, setting, time))
  )
);

function getRank(xp: number) {
  if (xp >= 3000) return "Ranger";
  if (xp >= 1500) return "Explorer";
  if (xp >= 750) return "Trailblazer";
  if (xp >= 250) return "Pathfinder";
  return "Wanderer";
}

function nextRankXp(xp: number) {
  if (xp < 250) return 250;
  if (xp < 750) return 750;
  if (xp < 1500) return 1500;
  if (xp < 3000) return 3000;
  return xp;
}

export default function App() {
  const [mode, setMode] = useState<Mode>("Solo");
  const [setting, setSetting] = useState<Setting>("Outdoor");
  const [time, setTime] = useState<TimeOfDay>(detectTimeOfDay());
  const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);
  const [xp, setXp] = useState(0);
  const [titles, setTitles] = useState<string[]>([]);
  const [completedCounts, setCompletedCounts] = useState<Record<string, number>>({});
  const [message, setMessage] = useState("");

  const rank = getRank(xp);
  const nextXp = nextRankXp(xp);
  const progress = nextXp === xp ? 100 : Math.min((xp / nextXp) * 100, 100);

  const availableQuests = useMemo(() => {
    if (time === "Anytime") {
      return quests.filter((q) => q.mode === mode && q.setting === setting);
    }

    return quests.filter(
      (q) =>
        q.mode === mode &&
        q.setting === setting &&
        (q.time === time || q.time === "Anytime")
    );
  }, [mode, setting, time]);

  function generateQuest() {
    const randomQuest = availableQuests[Math.floor(Math.random() * availableQuests.length)];
    setCurrentQuest(randomQuest);
    setMessage("");
  }

  function completeQuest() {
    if (!currentQuest) return;

    const newXp = xp + currentQuest.xp;
    const newCounts = {
      ...completedCounts,
      [currentQuest.title]: (completedCounts[currentQuest.title] || 0) + 1,
    };

    setXp(newXp);
    setCompletedCounts(newCounts);

    const count = newCounts[currentQuest.title];

    if (count >= 2 && !titles.includes(currentQuest.unlockTitle)) {
      setTitles([...titles, currentQuest.unlockTitle]);
      setMessage(`🏆 New Title Unlocked: ${currentQuest.unlockTitle}`);
    } else {
      setMessage(`+${currentQuest.xp} XP earned. Complete this quest ${Math.max(0, 2 - count)} more time(s) to unlock the title.`);
    }
  }

  function shareQuest() {
    if (!currentQuest) return;
    const text = `I got a quest: "${currentQuest.title}" — ${currentQuest.task} Reward: ${currentQuest.xp} XP.`;
    window.location.href = `sms:?&body=${encodeURIComponent(text)}`;
  }

  return (
    <div style={styles.page}>
      <div style={styles.app}>
        <h1 style={styles.logo}>QUEST</h1>
        <p style={styles.subtitle}>Real-life adventures. Weird titles. Mildly questionable motivation.</p>

        <div style={styles.profile}>
          <h2>{rank}</h2>
          <p>{xp} XP</p>
          <div style={styles.progressOuter}>
            <div style={{ ...styles.progressInner, width: `${progress}%` }} />
          </div>
          <p style={styles.small}>Next rank at {nextXp} XP</p>
        </div>

        <div style={styles.section}>
          <h3>Who’s playing?</h3>
          <div style={styles.buttonGrid}>
            {modes.map((m) => (
              <button key={m} onClick={() => setMode(m)} style={mode === m ? styles.selectedButton : styles.button}>
                {m}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h3>Where?</h3>
          <div style={styles.buttonGrid}>
            {settings.map((s) => (
              <button key={s} onClick={() => setSetting(s)} style={setting === s ? styles.selectedButton : styles.button}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h3>When?</h3>
          <p style={styles.small}>Auto-detected as {detectTimeOfDay()}, but you can override it.</p>
          <div style={styles.timeGrid}>
            {times.map((t) => (
              <button key={t} onClick={() => setTime(t)} style={time === t ? styles.selectedButton : styles.button}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <button style={styles.bigButton} onClick={generateQuest}>Begin Quest</button>

        {currentQuest && (
          <div style={styles.questCard}>
            <p style={styles.difficulty}>{currentQuest.mode} • {currentQuest.setting} • {currentQuest.time}</p>
            <p style={styles.difficulty}>{currentQuest.xp} XP</p>
            <h2>{currentQuest.title}</h2>
            <p>{currentQuest.task}</p>
            <p style={styles.flavor}>“{currentQuest.flavor}”</p>
            <p style={styles.smallDark}>Title unlock: complete this quest 2 times.</p>

            <div style={styles.actionRow}>
              <button style={styles.completeButton} onClick={completeQuest}>Complete Quest</button>
              <button style={styles.shareButton} onClick={shareQuest}>Text Quest</button>
            </div>
          </div>
        )}

        {message && <div style={styles.message}>{message}</div>}

        <div style={styles.titles}>
          <h3>Your Titles</h3>
          {titles.length === 0 ? (
            <p style={styles.small}>No titles yet. The possums remain unimpressed.</p>
          ) : (
            <div style={styles.titleList}>
              {titles.map((t) => <span key={t} style={styles.titleBadge}>{t}</span>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "linear-gradient(180deg, #132a13, #31572c)", color: "#fff", fontFamily: "Arial, sans-serif", padding: "24px" },
  app: { maxWidth: "650px", margin: "0 auto" },
  logo: { textAlign: "center", fontSize: "48px", letterSpacing: "6px", marginBottom: "8px" },
  subtitle: { textAlign: "center", color: "#d9ed92", marginBottom: "24px" },
  profile: { background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "18px", padding: "18px", marginBottom: "20px" },
  progressOuter: { height: "12px", background: "rgba(255,255,255,0.2)", borderRadius: "999px", overflow: "hidden" },
  progressInner: { height: "100%", background: "#f9c74f" },
  small: { color: "#d8f3dc", fontSize: "14px" },
  smallDark: { color: "#31572c", fontSize: "14px" },
  section: { marginBottom: "18px" },
  buttonGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" },
  timeGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" },
  button: { padding: "14px", borderRadius: "12px", border: "none", background: "#90a955", color: "#132a13", fontWeight: "bold", cursor: "pointer" },
  selectedButton: { padding: "14px", borderRadius: "12px", border: "2px solid #f9c74f", background: "#f9c74f", color: "#132a13", fontWeight: "bold", cursor: "pointer" },
  bigButton: { width: "100%", padding: "18px", borderRadius: "16px", border: "none", background: "#f9844a", color: "#fff", fontSize: "20px", fontWeight: "bold", cursor: "pointer", marginBottom: "20px" },
  questCard: { background: "#fff", color: "#132a13", borderRadius: "20px", padding: "22px", marginBottom: "18px" },
  difficulty: { color: "#bc6c25", fontWeight: "bold" },
  flavor: { fontStyle: "italic", color: "#31572c" },
  actionRow: { display: "flex", gap: "10px", marginTop: "18px" },
  completeButton: { flex: 1, padding: "14px", borderRadius: "12px", border: "none", background: "#31572c", color: "#fff", fontWeight: "bold", cursor: "pointer" },
  shareButton: { flex: 1, padding: "14px", borderRadius: "12px", border: "none", background: "#577590", color: "#fff", fontWeight: "bold", cursor: "pointer" },
  message: { background: "#f9c74f", color: "#132a13", padding: "14px", borderRadius: "12px", fontWeight: "bold", marginBottom: "18px" },
  titles: { background: "rgba(255,255,255,0.1)", borderRadius: "18px", padding: "18px" },
  titleList: { display: "flex", flexWrap: "wrap", gap: "10px" },
  titleBadge: { background: "#f9c74f", color: "#132a13", padding: "8px 12px", borderRadius: "999px", fontWeight: "bold" },
};
