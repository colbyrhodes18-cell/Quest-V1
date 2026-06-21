import React, { useMemo, useState } from "react";

type Mode = "Solo" | "Friends" | "Family" | "Date";
type Setting = "Indoor" | "Outdoor" | "City" | "Country";
type TimeOfDay = "Morning" | "Afternoon" | "Evening" | "Night" | "Anytime";

type QuestTemplate = {
  title: string;
  xp: number;
  task: string;
  flavor: string;
  unlockTitle: string;
};

type Quest = QuestTemplate & {
  mode: Mode;
  setting: Setting;
  time: TimeOfDay;
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

const questLibrary: Record<string, QuestTemplate[]> = {
  "Solo-Indoor-Morning": [
    { title: "Morning Reset", xp: 10, task: "Make your bed, drink water, and plan one useful thing for today.", flavor: "A tiny civilization has begun.", unlockTitle: "Morning Operator" },
    { title: "Kitchen Recon", xp: 10, task: "Prepare breakfast without touching your phone.", flavor: "The eggs demand your full attention.", unlockTitle: "Breakfast Ranger" },
    { title: "Sunrise Reader", xp: 10, task: "Read for 10 minutes before scrolling.", flavor: "Your brain has requested better breakfast.", unlockTitle: "Sunrise Scholar" },
    { title: "Stretch Protocol", xp: 10, task: "Stretch for 10 minutes.", flavor: "Your joints have submitted formal complaints.", unlockTitle: "Flex Keeper" },
    { title: "Window Watcher", xp: 10, task: "Spend 5 minutes observing the outside world.", flavor: "Free nature documentary. No subscription required.", unlockTitle: "Window Watcher" },
  ],

  "Solo-Indoor-Afternoon": [
    { title: "Drawer Archaeologist", xp: 15, task: "Clean one drawer, shelf, or messy corner.", flavor: "Ancient receipts await.", unlockTitle: "Drawer Archaeologist" },
    { title: "Skill Spark", xp: 20, task: "Practice or learn something useful for 20 minutes.", flavor: "Tiny reps. Big future.", unlockTitle: "Skill Tinkerer" },
    { title: "Paper Slayer", xp: 15, task: "Throw away 20 pieces of clutter.", flavor: "The kingdom grows cleaner.", unlockTitle: "Paper Slayer" },
    { title: "Mini Builder", xp: 15, task: "Create something small with your hands.", flavor: "Creation is magic with fewer robes.", unlockTitle: "Maker" },
    { title: "Desk Commander", xp: 15, task: "Clear one workspace or table.", flavor: "Order has entered the chat.", unlockTitle: "Desk Commander" },
  ],

  "Solo-Indoor-Evening": [
    { title: "Room Tamer", xp: 15, task: "Reset one small area of your home.", flavor: "Chaos retreats. For now.", unlockTitle: "Room Tamer" },
    { title: "Kitchen Alchemist", xp: 20, task: "Make a snack or meal using only what you already have.", flavor: "The pantry has chosen you.", unlockTitle: "Kitchen Alchemist" },
    { title: "Lore Keeper", xp: 20, task: "Write one paragraph about an idea, memory, story, or goal.", flavor: "Your internal wizard needed documentation.", unlockTitle: "Lore Keeper" },
    { title: "Music Pilgrim", xp: 10, task: "Listen to one song from a genre you usually ignore.", flavor: "Your ears are going on a field trip.", unlockTitle: "Music Pilgrim" },
    { title: "Evening Builder", xp: 20, task: "Work on one personal project for 20 minutes.", flavor: "The dream requires tools.", unlockTitle: "Evening Builder" },
  ],

  "Solo-Indoor-Night": [
    { title: "Couch Philosopher", xp: 15, task: "Write down 5 things you want to do before you die.", flavor: "Deep thoughts count, even in gym shorts.", unlockTitle: "Couch Philosopher" },
    { title: "Sleep Prep", xp: 10, task: "Set up one thing tonight that tomorrow-you will appreciate.", flavor: "Tomorrow-you owes tonight-you a handshake.", unlockTitle: "Tomorrow Scout" },
    { title: "Midnight Journal", xp: 15, task: "Write 5 sentences about how today actually went.", flavor: "Congratulations, you became your own narrator.", unlockTitle: "Midnight Scribe" },
    { title: "Screen Exile", xp: 20, task: "Spend 20 minutes without scrolling.", flavor: "The rectangle will survive without you.", unlockTitle: "Screen Exile" },
    { title: "Quiet Room", xp: 10, task: "Sit in silence for 5 minutes.", flavor: "The brain goblins may speak. Do not elect them king.", unlockTitle: "Quiet Keeper" },
  ],

  "Solo-Indoor-Anytime": [
    { title: "Book Hunter", xp: 10, task: "Read 10 pages of anything.", flavor: "You touched paper and survived.", unlockTitle: "Book Hunter" },
    { title: "Tiny Fix", xp: 20, task: "Fix one small annoying thing you keep ignoring.", flavor: "The squeaky wheel has lost its campaign.", unlockTitle: "Tiny Fixer" },
    { title: "Snack Wizard", xp: 15, task: "Make the weirdest acceptable snack you can with what you have.", flavor: "Acceptable is doing a lot of work here.", unlockTitle: "Snack Wizard" },
    { title: "Memory Vault", xp: 15, task: "Write down one memory you do not want to forget.", flavor: "Save file created.", unlockTitle: "Memory Keeper" },
    { title: "Clutter Duel", xp: 15, task: "Find 5 things you can throw away immediately.", flavor: "The drawer has grown too powerful.", unlockTitle: "Clutter Duelist" },
  ],

  "Friends-Outdoor-Night": [
    { title: "Night Owl Council", xp: 20, task: "Sit outside for 15 minutes and everyone shares one story.", flavor: "Friendship is just campfire lore without the campfire.", unlockTitle: "Night Owl" },
    { title: "Constellation Liars", xp: 15, task: "Find stars and invent fake constellations.", flavor: "NASA will not be notified.", unlockTitle: "Star Forger" },
    { title: "Flashlight Expedition", xp: 20, task: "Take a safe flashlight walk and find the weirdest object.", flavor: "The group chat demands proof.", unlockTitle: "Night Scout" },
    { title: "Moonlight Jury", xp: 20, task: "Debate a ridiculous topic until a winner is declared.", flavor: "Justice has never looked this dumb.", unlockTitle: "Moon Judge" },
    { title: "Porch Prophets", xp: 20, task: "Everyone predicts where they’ll be in 10 years.", flavor: "Bad predictions become excellent memories.", unlockTitle: "Porch Prophet" },
  ],
};

function getQuestPool(mode: Mode, setting: Setting, time: TimeOfDay): Quest[] {
  const key = `${mode}-${setting}-${time}`;
  const templates = questLibrary[key] || [];

  return templates.map((q) => ({
    ...q,
    mode,
    setting,
    time,
  }));
}

function getRank(xp: number) {
  if (xp >= 10000) return "Legend";
  if (xp >= 5000) return "Adventurer";
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
  if (xp < 5000) return 5000;
  if (xp < 10000) return 10000;
  return xp;
}

export default function App() {
  const [mode, setMode] = useState<Mode>("Solo");
  const [setting, setSetting] = useState<Setting>("Indoor");
  const [time, setTime] = useState<TimeOfDay>(detectTimeOfDay());
  const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);
  const [lastQuestTitle, setLastQuestTitle] = useState("");
  const [xp, setXp] = useState(0);
  const [titles, setTitles] = useState<string[]>([]);
  const [completedCounts, setCompletedCounts] = useState<Record<string, number>>({});
  const [message, setMessage] = useState("");

  const rank = getRank(xp);
  const nextXp = nextRankXp(xp);
  const progress = nextXp === xp ? 100 : Math.min((xp / nextXp) * 100, 100);

  const availableQuests = useMemo(
    () => getQuestPool(mode, setting, time),
    [mode, setting, time]
  );

  function generateQuest() {
    if (availableQuests.length === 0) {
      setCurrentQuest(null);
      setMessage("No quests written for this combo yet. Add quests to this bucket.");
      return;
    }

    let pool = availableQuests;

    if (availableQuests.length > 1) {
      pool = availableQuests.filter((q) => q.title !== lastQuestTitle);
    }

    const randomQuest = pool[Math.floor(Math.random() * pool.length)];

    setCurrentQuest(randomQuest);
    setLastQuestTitle(randomQuest.title);
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

    if (count >= 3 && !titles.includes(currentQuest.unlockTitle)) {
      setTitles([...titles, currentQuest.unlockTitle]);
      setMessage(`🏆 New Title Unlocked: ${currentQuest.unlockTitle}`);
    } else {
      setMessage(
        `+${currentQuest.xp} XP earned. Complete this quest ${Math.max(
          0,
          3 - count
        )} more time(s) to unlock the title.`
      );
    }
  }

  function shareQuest() {
    if (!currentQuest) return;

    const text = `I got a quest: "${currentQuest.title}" — ${currentQuest.task} Reward: ${currentQuest.xp} XP.`;
    window.location.href = `sms:?&body=${encodeURIComponent(text)}`;
  }

  function changeMode(newMode: Mode) {
    setMode(newMode);
    setCurrentQuest(null);
    setMessage("");
  }

  function changeSetting(newSetting: Setting) {
    setSetting(newSetting);
    setCurrentQuest(null);
    setMessage("");
  }

  function changeTime(newTime: TimeOfDay) {
    setTime(newTime);
    setCurrentQuest(null);
    setMessage("");
  }

  return (
    <div style={styles.page}>
      <div style={styles.app}>
        <h1 style={styles.logo}>QUEST</h1>
        <p style={styles.subtitle}>
          Real-life adventures. Weird titles. Mildly questionable motivation.
        </p>

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
              <button
                key={m}
                onClick={() => changeMode(m)}
                style={mode === m ? styles.selectedButton : styles.button}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h3>Where?</h3>
          <div style={styles.buttonGrid}>
            {settings.map((s) => (
              <button
                key={s}
                onClick={() => changeSetting(s)}
                style={setting === s ? styles.selectedButton : styles.button}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h3>When?</h3>
          <p style={styles.small}>
            Auto-detected as {detectTimeOfDay()}, but you can override it.
          </p>
          <div style={styles.timeGrid}>
            {times.map((t) => (
              <button
                key={t}
                onClick={() => changeTime(t)}
                style={time === t ? styles.selectedButton : styles.button}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <p style={styles.small}>
          {availableQuests.length} quest option(s) available for this combo.
        </p>

        <button style={styles.bigButton} onClick={generateQuest}>
          Begin Quest
        </button>

        {currentQuest && (
          <div style={styles.questCard}>
            <p style={styles.difficulty}>
              {currentQuest.mode} • {currentQuest.setting} • {currentQuest.time}
            </p>
            <p style={styles.difficulty}>{currentQuest.xp} XP</p>
            <h2>{currentQuest.title}</h2>
            <p>{currentQuest.task}</p>
            <p style={styles.flavor}>“{currentQuest.flavor}”</p>
            <p style={styles.smallDark}>Title unlock: complete this quest 3 times.</p>

            <div style={styles.actionRow}>
              <button style={styles.completeButton} onClick={completeQuest}>
                Complete Quest
              </button>
              <button style={styles.shareButton} onClick={shareQuest}>
                Text Quest
              </button>
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
              {titles.map((t) => (
                <span key={t} style={styles.titleBadge}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #132a13, #31572c)",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
    padding: "24px",
  },
  app: { maxWidth: "650px", margin: "0 auto" },
  logo: {
    textAlign: "center",
    fontSize: "48px",
    letterSpacing: "6px",
    marginBottom: "8px",
  },
  subtitle: {
    textAlign: "center",
    color: "#d9ed92",
    marginBottom: "24px",
  },
  profile: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "18px",
    padding: "18px",
    marginBottom: "20px",
  },
  progressOuter: {
    height: "12px",
    background: "rgba(255,255,255,0.2)",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressInner: { height: "100%", background: "#f9c74f" },
  small: { color: "#d8f3dc", fontSize: "14px" },
  smallDark: { color: "#31572c", fontSize: "14px" },
  section: { marginBottom: "18px" },
  buttonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
  },
  timeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
  },
  button: {
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "#90a955",
    color: "#132a13",
    fontWeight: "bold",
    cursor: "pointer",
  },
  selectedButton: {
    padding: "14px",
    borderRadius: "12px",
    border: "2px solid #f9c74f",
    background: "#f9c74f",
    color: "#132a13",
    fontWeight: "bold",
    cursor: "pointer",
  },
  bigButton: {
    width: "100%",
    padding: "18px",
    borderRadius: "16px",
    border: "none",
    background: "#f9844a",
    color: "#fff",
    fontSize: "20px",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: "20px",
  },
  questCard: {
    background: "#fff",
    color: "#132a13",
    borderRadius: "20px",
    padding: "22px",
    marginBottom: "18px",
  },
  difficulty: { color: "#bc6c25", fontWeight: "bold" },
  flavor: { fontStyle: "italic", color: "#31572c" },
  actionRow: { display: "flex", gap: "10px", marginTop: "18px" },
  completeButton: {
    flex: 1,
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "#31572c",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  shareButton: {
    flex: 1,
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "#577590",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  message: {
    background: "#f9c74f",
    color: "#132a13",
    padding: "14px",
    borderRadius: "12px",
    fontWeight: "bold",
    marginBottom: "18px",
  },
  titles: {
    background: "rgba(255,255,255,0.1)",
    borderRadius: "18px",
    padding: "18px",
  },
  titleList: { display: "flex", flexWrap: "wrap", gap: "10px" },
  titleBadge: {
    background: "#f9c74f",
    color: "#132a13",
    padding: "8px 12px",
    borderRadius: "999px",
    fontWeight: "bold",
  },
};
