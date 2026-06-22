import React, { useEffect, useMemo, useState } from "react";
import { questLibrary } from "./data/quests";
import type { Mode, Quest, Setting, TimeOfDay } from "./types";

const modes: Mode[] = ["Solo", "Friends", "Family", "Date"];
const settings: Setting[] = ["Indoor", "Outdoor", "City", "Country"];
const times: TimeOfDay[] = ["Morning", "Afternoon", "Evening", "Night", "Anytime"];

type CompletionStats = {
  totalCompleted: number;
  byMode: Record<string, number>;
  bySetting: Record<string, number>;
  byTime: Record<string, number>;
};

type StreakData = {
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string;
};

type Achievement = {
  name: string;
  description: string;
  unlocked: boolean;
};

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function getYesterdayString() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
}

function detectTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 21) return "Evening";
  return "Night";
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

function getFavorite(record: Record<string, number>) {
  const entries = Object.entries(record);
  if (entries.length === 0) return "None yet";
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

function getQuestPool(mode: Mode, setting: Setting, time: TimeOfDay): Quest[] {
  const key = `${mode}-${setting}-${time}`;
  const templates = questLibrary[key] || [];

  return templates.map((quest) => ({
    ...quest,
    mode,
    setting,
    time,
  }));
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function getAchievements(
  completionStats: CompletionStats,
  streakData: StreakData,
  titles: string[]
): Achievement[] {
  return [
    {
      name: "First Steps",
      description: "Complete 1 quest.",
      unlocked: completionStats.totalCompleted >= 1,
    },
    {
      name: "Wanderer",
      description: "Complete 10 quests.",
      unlocked: completionStats.totalCompleted >= 10,
    },
    {
      name: "Pathfinder",
      description: "Complete 25 quests.",
      unlocked: completionStats.totalCompleted >= 25,
    },
    {
      name: "Explorer",
      description: "Complete 50 quests.",
      unlocked: completionStats.totalCompleted >= 50,
    },
    {
      name: "Adventurer",
      description: "Complete 100 quests.",
      unlocked: completionStats.totalCompleted >= 100,
    },
    {
      name: "Homebody",
      description: "Complete 10 Indoor quests.",
      unlocked: (completionStats.bySetting["Indoor"] || 0) >= 10,
    },
    {
      name: "Trail Walker",
      description: "Complete 10 Outdoor quests.",
      unlocked: (completionStats.bySetting["Outdoor"] || 0) >= 10,
    },
    {
      name: "City Roamer",
      description: "Complete 10 City quests.",
      unlocked: (completionStats.bySetting["City"] || 0) >= 10,
    },
    {
      name: "Country Soul",
      description: "Complete 10 Country quests.",
      unlocked: (completionStats.bySetting["Country"] || 0) >= 10,
    },
    {
      name: "Night Owl",
      description: "Complete 10 Night quests.",
      unlocked: (completionStats.byTime["Night"] || 0) >= 10,
    },
    {
      name: "Streak Starter",
      description: "Reach a 3-day streak.",
      unlocked: streakData.bestStreak >= 3,
    },
    {
      name: "Dedicated",
      description: "Reach a 7-day streak.",
      unlocked: streakData.bestStreak >= 7,
    },
    {
      name: "Title Collector",
      description: "Unlock 5 titles.",
      unlocked: titles.length >= 5,
    },
  ];
}

export default function App() {
  const [mode, setMode] = useState<Mode>("Solo");
  const [setting, setSetting] = useState<Setting>("Indoor");
  const [time, setTime] = useState<TimeOfDay>(detectTimeOfDay());
  const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);
  const [lastQuestTitle, setLastQuestTitle] = useState("");

  const [xp, setXp] = useState(() => loadFromStorage<number>("quest-xp", 0));
  const [titles, setTitles] = useState<string[]>(() =>
    loadFromStorage<string[]>("quest-titles", [])
  );
  const [completedCounts, setCompletedCounts] = useState<Record<string, number>>(() =>
    loadFromStorage<Record<string, number>>("quest-completed-counts", {})
  );
  const [completionStats, setCompletionStats] = useState<CompletionStats>(() =>
    loadFromStorage<CompletionStats>("quest-completion-stats", {
      totalCompleted: 0,
      byMode: {},
      bySetting: {},
      byTime: {},
    })
  );
  const [streakData, setStreakData] = useState<StreakData>(() =>
    loadFromStorage<StreakData>("quest-streak-data", {
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedDate: "",
    })
  );

  const [message, setMessage] = useState("");

  useEffect(() => localStorage.setItem("quest-xp", JSON.stringify(xp)), [xp]);
  useEffect(() => localStorage.setItem("quest-titles", JSON.stringify(titles)), [titles]);
  useEffect(() => localStorage.setItem("quest-completed-counts", JSON.stringify(completedCounts)), [completedCounts]);
  useEffect(() => localStorage.setItem("quest-completion-stats", JSON.stringify(completionStats)), [completionStats]);
  useEffect(() => localStorage.setItem("quest-streak-data", JSON.stringify(streakData)), [streakData]);

  const rank = getRank(xp);
  const nextXp = nextRankXp(xp);
  const progress = nextXp === xp ? 100 : Math.min((xp / nextXp) * 100, 100);
  const achievements = getAchievements(completionStats, streakData, titles);
  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked);

  const availableQuests = useMemo(
    () => getQuestPool(mode, setting, time),
    [mode, setting, time]
  );

  function updateStreak() {
    const today = getTodayString();
    const yesterday = getYesterdayString();

    if (streakData.lastCompletedDate === today) {
      return streakData;
    }

    let newCurrentStreak = 1;

    if (streakData.lastCompletedDate === yesterday) {
      newCurrentStreak = streakData.currentStreak + 1;
    }

    const updatedStreak = {
      currentStreak: newCurrentStreak,
      bestStreak: Math.max(streakData.bestStreak, newCurrentStreak),
      lastCompletedDate: today,
    };

    setStreakData(updatedStreak);
    return updatedStreak;
  }

  function generateQuest() {
    if (availableQuests.length === 0) {
      setCurrentQuest(null);
      setMessage("No quests written for this combo yet. Add quests to the quest file.");
      return;
    }

    let pool = availableQuests;

    if (availableQuests.length > 1) {
      pool = availableQuests.filter((quest) => quest.title !== lastQuestTitle);
    }

    const randomQuest = pool[Math.floor(Math.random() * pool.length)];
    setCurrentQuest(randomQuest);
    setLastQuestTitle(randomQuest.title);
    setMessage("");
  }

  function completeQuest() {
    if (!currentQuest) return;

    const oldAchievements = getAchievements(completionStats, streakData, titles).filter(
      (achievement) => achievement.unlocked
    ).length;

    const newXp = xp + currentQuest.xp;
    const updatedStreak = updateStreak();

    const newCounts = {
      ...completedCounts,
      [currentQuest.title]: (completedCounts[currentQuest.title] || 0) + 1,
    };

    const newStats: CompletionStats = {
      totalCompleted: completionStats.totalCompleted + 1,
      byMode: {
        ...completionStats.byMode,
        [currentQuest.mode]: (completionStats.byMode[currentQuest.mode] || 0) + 1,
      },
      bySetting: {
        ...completionStats.bySetting,
        [currentQuest.setting]: (completionStats.bySetting[currentQuest.setting] || 0) + 1,
      },
      byTime: {
        ...completionStats.byTime,
        [currentQuest.time]: (completionStats.byTime[currentQuest.time] || 0) + 1,
      },
    };

    const count = newCounts[currentQuest.title];
    let newTitles = titles;
    let titleMessage = "";

    if (count >= 3 && !titles.includes(currentQuest.unlockTitle)) {
      newTitles = [...titles, currentQuest.unlockTitle];
      titleMessage = ` 🏆 New Title: ${currentQuest.unlockTitle}.`;
    }

    const newAchievementCount = getAchievements(newStats, updatedStreak, newTitles).filter(
      (achievement) => achievement.unlocked
    ).length;

    const achievementMessage =
      newAchievementCount > oldAchievements ? " 🎖️ New achievement unlocked!" : "";

    setXp(newXp);
    setCompletedCounts(newCounts);
    setCompletionStats(newStats);
    setTitles(newTitles);

    setMessage(
      `+${currentQuest.xp} XP earned. 🔥 Streak: ${updatedStreak.currentStreak} day(s).${titleMessage}${achievementMessage}`
    );
  }

  function shareQuest() {
    if (!currentQuest) return;

    const text = `I got a quest: "${currentQuest.title}" — ${currentQuest.task} Reward: ${currentQuest.xp} XP.`;
    window.location.href = `sms:?&body=${encodeURIComponent(text)}`;
  }

  function resetProgress() {
    const confirmed = window.confirm("Reset XP, titles, achievements, streaks, and completed quest progress?");
    if (!confirmed) return;

    setXp(0);
    setTitles([]);
    setCompletedCounts({});
    setCompletionStats({ totalCompleted: 0, byMode: {}, bySetting: {}, byTime: {} });
    setStreakData({ currentStreak: 0, bestStreak: 0, lastCompletedDate: "" });
    setCurrentQuest(null);
    setMessage("Progress reset.");
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
        <p style={styles.subtitle}>Real-life adventures. Weird titles. Mildly questionable motivation.</p>

        <div style={styles.profile}>
          <h2>{rank}</h2>
          <p>{xp} XP</p>
          <div style={styles.progressOuter}>
            <div style={{ ...styles.progressInner, width: `${progress}%` }} />
          </div>
          <p style={styles.small}>Next rank at {nextXp} XP</p>
        </div>

        <div style={styles.statsCard}>
          <h3>Adventure Stats</h3>
          <p>Total quests completed: {completionStats.totalCompleted}</p>
          <p>Total XP earned: {xp}</p>
          <p>Titles unlocked: {titles.length}</p>
          <p>Achievements unlocked: {unlockedAchievements.length} / {achievements.length}</p>
          <p>Favorite mode: {getFavorite(completionStats.byMode)}</p>
          <p>Favorite setting: {getFavorite(completionStats.bySetting)}</p>
          <p>Current streak: 🔥 {streakData.currentStreak} day(s)</p>
          <p>Best streak: 🏆 {streakData.bestStreak} day(s)</p>
        </div>

        <div style={styles.achievementCard}>
          <h3>Achievements</h3>
          <div style={styles.achievementList}>
            {achievements.map((achievement) => (
              <div
                key={achievement.name}
                style={achievement.unlocked ? styles.achievementUnlocked : styles.achievementLocked}
              >
                <strong>{achievement.unlocked ? "🏆" : "🔒"} {achievement.name}</strong>
                <p style={achievement.unlocked ? styles.achievementText : styles.lockedText}>
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h3>Who’s playing?</h3>
          <div style={styles.buttonGrid}>
            {modes.map((item) => (
              <button key={item} onClick={() => changeMode(item)} style={mode === item ? styles.selectedButton : styles.button}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h3>Where?</h3>
          <div style={styles.buttonGrid}>
            {settings.map((item) => (
              <button key={item} onClick={() => changeSetting(item)} style={setting === item ? styles.selectedButton : styles.button}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h3>When?</h3>
          <p style={styles.small}>Auto-detected as {detectTimeOfDay()}, but you can override it.</p>
          <div style={styles.timeGrid}>
            {times.map((item) => (
              <button key={item} onClick={() => changeTime(item)} style={time === item ? styles.selectedButton : styles.button}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <p style={styles.small}>{availableQuests.length} quest option(s) available for this combo.</p>

        <button style={styles.bigButton} onClick={generateQuest}>Begin Quest</button>

        {currentQuest && (
          <div style={styles.questCard}>
            <p style={styles.difficulty}>{currentQuest.mode} • {currentQuest.setting} • {currentQuest.time}</p>
            <p style={styles.difficulty}>{currentQuest.xp} XP</p>
            <h2>{currentQuest.title}</h2>
            <p>{currentQuest.task}</p>
            <p style={styles.flavor}>“{currentQuest.flavor}”</p>
            <p style={styles.smallDark}>Title unlock: complete this quest 3 times.</p>

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
              {titles.map((title) => (
                <span key={title} style={styles.titleBadge}>{title}</span>
              ))}
            </div>
          )}
        </div>

        <button style={styles.resetButton} onClick={resetProgress}>Reset Progress</button>
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
  statsCard: { background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "18px", padding: "18px", marginBottom: "20px" },
  achievementCard: { background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "18px", padding: "18px", marginBottom: "20px" },
  achievementList: { display: "grid", gap: "10px" },
  achievementUnlocked: { background: "#f9c74f", color: "#132a13", padding: "12px", borderRadius: "12px" },
  achievementLocked: { background: "rgba(255,255,255,0.08)", color: "#d8f3dc", padding: "12px", borderRadius: "12px" },
  achievementText: { margin: "6px 0 0 0", color: "#132a13", fontSize: "14px" },
  lockedText: { margin: "6px 0 0 0", color: "#d8f3dc", fontSize: "14px" },
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
  titles: { background: "rgba(255,255,255,0.1)", borderRadius: "18px", padding: "18px", marginBottom: "18px" },
  titleList: { display: "flex", flexWrap: "wrap", gap: "10px" },
  titleBadge: { background: "#f9c74f", color: "#132a13", padding: "8px 12px", borderRadius: "999px", fontWeight: "bold" },
  resetButton: { width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.3)", background: "transparent", color: "#d8f3dc", fontWeight: "bold", cursor: "pointer" },
};
