import React, { useMemo, useState } from "react";

type Mode = "Solo" | "Friends" | "Family" | "Date";
type Setting = "Indoor" | "Outdoor" | "City" | "Country";
type TimeOfDay = "Morning" | "Afternoon" | "Evening" | "Night" | "Anytime";

type Quest = {
  title: string;
  mode: Mode;
  setting: Setting;
  time: TimeOfDay;
  difficulty: "Easy" | "Medium" | "Hard" | "Epic";
  xp: number;
  task: string;
  flavor: string;
  unlockTitle?: string;
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

const quests: Quest[] = [
  {
    title: "Book Hunter",
    mode: "Solo",
    setting: "Indoor",
    time: "Anytime",
    difficulty: "Easy",
    xp: 10,
    task: "Read 10 pages of a book, comic, article, or anything that makes your brain less feral.",
    flavor: "Congratulations. You have touched paper and survived.",
    unlockTitle: "Book Hunter",
  },
  {
    title: "Kitchen Alchemist",
    mode: "Solo",
    setting: "Indoor",
    time: "Anytime",
    difficulty: "Easy",
    xp: 10,
    task: "Make a snack using only ingredients you already have.",
    flavor: "The pantry has chosen you. Do not disappoint it.",
    unlockTitle: "Kitchen Alchemist",
  },
  {
    title: "Drawer Archaeologist",
    mode: "Solo",
    setting: "Indoor",
    time: "Anytime",
    difficulty: "Medium",
    xp: 25,
    task: "Clean one junk drawer or random messy spot.",
    flavor: "You may discover batteries, receipts, or evidence of a forgotten civilization.",
    unlockTitle: "Drawer Archaeologist",
  },
  {
    title: "Couch Philosopher",
    mode: "Solo",
    setting: "Indoor",
    time: "Night",
    difficulty: "Medium",
    xp: 25,
    task: "Write down 5 things you want to do before you die.",
    flavor: "Deep thoughts count, even if you're wearing gym shorts.",
    unlockTitle: "Couch Philosopher",
  },
  {
    title: "Morning Scout",
    mode: "Solo",
    setting: "Outdoor",
    time: "Morning",
    difficulty: "Easy",
    xp: 10,
    task: "Take a 20-minute walk before the day fully gets its claws into you.",
    flavor: "Your ancestors crossed rivers before breakfast. You can handle a sidewalk.",
    unlockTitle: "Morning Scout",
  },
  {
    title: "Trail Scout",
    mode: "Solo",
    setting: "Outdoor",
    time: "Afternoon",
    difficulty: "Medium",
    xp: 25,
    task: "Walk one mile and take a picture of the weirdest thing you find.",
    flavor: "If you find Bigfoot, document him responsibly.",
    unlockTitle: "Trail Scout",
  },
  {
    title: "Gas Station Philosopher",
    mode: "Solo",
    setting: "City",
    time: "Evening",
    difficulty: "Medium",
    xp: 25,
    task: "Go to a gas station and find the strangest snack available.",
    flavor: "Civilization peaked somewhere between beef jerky and blue soda.",
    unlockTitle: "Gas Station Philosopher",
  },
  {
    title: "Porch Goblin Watch",
    mode: "Solo",
    setting: "Country",
    time: "Night",
    difficulty: "Easy",
    xp: 10,
    task: "Sit outside for 15 minutes and listen for wildlife, wind, or suspicious raccoon activity.",
    flavor: "Do not negotiate with raccoons. They have lawyers.",
    unlockTitle: "Possum Diplomat",
  },
  {
    title: "Blanket Fortress",
    mode: "Family",
    setting: "Indoor",
    time: "Anytime",
    difficulty: "Easy",
    xp: 10,
    task: "Build a blanket fort and name the kingdom.",
    flavor: "Castles are expensive. Couch cushions are not.",
    unlockTitle: "Fort Commander",
  },
  {
    title: "Breakfast Council",
    mode: "Family",
    setting: "Indoor",
    time: "Morning",
    difficulty: "Easy",
    xp: 10,
    task: "Everyone helps make breakfast or pick the official breakfast champion.",
    flavor: "The syrup shall decide the fate of the realm.",
    unlockTitle: "Breakfast Baron",
  },
  {
    title: "Living Room Olympics",
    mode: "Family",
    setting: "Indoor",
    time: "Evening",
    difficulty: "Easy",
    xp: 10,
    task: "Create three ridiculous indoor games and crown a champion.",
    flavor: "History remembers the brave. And whoever wins sock basketball.",
    unlockTitle: "Living Room Champion",
  },
  {
    title: "Creek Explorer",
    mode: "Family",
    setting: "Country",
    time: "Afternoon",
    difficulty: "Hard",
    xp: 50,
    task: "Find water, rocks, bugs, or animal tracks. Report your findings.",
    flavor: "Congratulations, you are now a low-budget nature documentary.",
    unlockTitle: "Creek Scout",
  },
  {
    title: "Snack Tribunal",
    mode: "Friends",
    setting: "Indoor",
    time: "Anytime",
    difficulty: "Easy",
    xp: 10,
    task: "Everyone brings one snack. Vote on the champion.",
    flavor: "Democracy works best when chips are involved.",
    unlockTitle: "Snack Judge",
  },
  {
    title: "Thrift Store Relic",
    mode: "Friends",
    setting: "City",
    time: "Afternoon",
    difficulty: "Medium",
    xp: 25,
    task: "Find the weirdest item in a thrift store under $10.",
    flavor: "Some artifacts belong in museums. Others belong in your group chat.",
    unlockTitle: "Relic Hunter",
  },
  {
    title: "Parking Lot Prophets",
    mode: "Friends",
    setting: "City",
    time: "Night",
    difficulty: "Medium",
    xp: 25,
    task: "Grab cheap food, sit somewhere safe, and each person predicts where they’ll be in 5 years.",
    flavor: "Bad tacos. Big dreams. Ancient tradition.",
    unlockTitle: "Parking Lot Prophet",
  },
  {
    title: "Field Day Revival",
    mode: "Friends",
    setting: "Outdoor",
    time: "Afternoon",
    difficulty: "Medium",
    xp: 25,
    task: "Go outside and make up a competition using whatever you have nearby.",
    flavor: "The Olympics started somewhere. Probably with worse equipment.",
    unlockTitle: "Backyard Gladiator",
  },
  {
    title: "Breakfast Date",
    mode: "Date",
    setting: "City",
    time: "Morning",
    difficulty: "Easy",
    xp: 10,
    task: "Go get breakfast somewhere neither of you has tried.",
    flavor: "Love is patient. Love is kind. Love also requires hash browns.",
    unlockTitle: "Breakfast Romantic",
  },
  {
    title: "Sunset Pact",
    mode: "Date",
    setting: "Outdoor",
    time: "Evening",
    difficulty: "Medium",
    xp: 25,
    task: "Find a sunset spot and bring one drink each.",
    flavor: "Romance is just good lighting with snacks.",
    unlockTitle: "Sunset Seeker",
  },
  {
    title: "New Road Rule",
    mode: "Date",
    setting: "Country",
    time: "Evening",
    difficulty: "Medium",
    xp: 25,
    task: "Drive a road neither of you has taken before.",
    flavor: "Getting mildly lost builds character. Bring gas.",
    unlockTitle: "Backroad Romantic",
  },
  {
    title: "Couch Quest",
    mode: "Date",
    setting: "Indoor",
    time: "Night",
    difficulty: "Easy",
    xp: 10,
    task: "Pick a movie neither of you has seen and make one ridiculous prediction before it starts.",
    flavor: "If the movie is bad, congratulations. You found comedy.",
    unlockTitle: "Couch Adventurer",
  },
];

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
  const [message, setMessage] = useState("");

  const rank = getRank(xp);
  const nextXp = nextRankXp(xp);
  const progress = nextXp === xp ? 100 : Math.min((xp / nextXp) * 100, 100);

  const availableQuests = useMemo(() => {
    return quests.filter(
      (q) =>
        q.mode === mode &&
        q.setting === setting &&
        (q.time === time || q.time === "Anytime")
    );
  }, [mode, setting, time]);

  function generateQuest() {
    if (availableQuests.length === 0) {
      setCurrentQuest(null);
      setMessage("No quests found for this combo yet. Try another setting or time.");
      return;
    }

    const randomQuest = availableQuests[Math.floor(Math.random() * availableQuests.length)];
    setCurrentQuest(randomQuest);
    setMessage("");
  }

  function completeQuest() {
    if (!currentQuest) return;

    const newXp = xp + currentQuest.xp;
    setXp(newXp);

    if (currentQuest.unlockTitle && !titles.includes(currentQuest.unlockTitle)) {
      setTitles([...titles, currentQuest.unlockTitle]);
      setMessage(`🏆 New Title Unlocked: ${currentQuest.unlockTitle}`);
    } else {
      setMessage(`+${currentQuest.xp} XP earned. Keep moving, ${getRank(newXp)}.`);
    }
  }

  function shareQuest() {
    if (!currentQuest) return;

    const text = `I got a quest: "${currentQuest.title}" — ${currentQuest.task} Reward: ${currentQuest.xp} XP. Think you can beat it?`;

    window.location.href = `sms:?&body=${encodeURIComponent(text)}`;
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

        <button style={styles.bigButton} onClick={generateQuest}>
          Begin Quest
        </button>

        {currentQuest && (
          <div style={styles.questCard}>
            <p style={styles.difficulty}>
              {currentQuest.mode} • {currentQuest.setting} • {currentQuest.time}
            </p>
            <p style={styles.difficulty}>
              {currentQuest.difficulty} • {currentQuest.xp} XP
            </p>

            <h2>{currentQuest.title}</h2>
            <p>{currentQuest.task}</p>
            <p style={styles.flavor}>“{currentQuest.flavor}”</p>

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
  app: {
    maxWidth: "650px",
    margin: "0 auto",
  },
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
  progressInner: {
    height: "100%",
    background: "#f9c74f",
  },
  small: {
    color: "#d8f3dc",
    fontSize: "14px",
  },
  section: {
    marginBottom: "18px",
  },
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
  difficulty: {
    color: "#bc6c25",
    fontWeight: "bold",
  },
  flavor: {
    fontStyle: "italic",
    color: "#31572c",
  },
  actionRow: {
    display: "flex",
    gap: "10px",
    marginTop: "18px",
  },
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
  titleList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  titleBadge: {
    background: "#f9c74f",
    color: "#132a13",
    padding: "8px 12px",
    borderRadius: "999px",
    fontWeight: "bold",
  },
};
