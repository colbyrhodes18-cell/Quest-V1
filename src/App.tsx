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

type QuestHistoryItem = {
  title: string;
  xp: number;
  mode: Mode;
  setting: Setting;
  time: TimeOfDay;
  completedAt: string;
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

function getArchetype(setting: string, time: string) {
  if (setting === "Country" && time === "Night") return "🌙 Night Ranger";
  if (setting === "Country") return "🌲 Wandering Naturalist";
  if (setting === "City" && time === "Night") return "🌃 Neon Nomad";
  if (setting === "City") return "🏙️ Urban Pathfinder";
  if (setting === "Outdoor" && time === "Morning") return "☀️ Dawn Trailwalker";
  if (setting === "Outdoor" && time === "Night") return "✨ Star Walker";
  if (setting === "Outdoor") return "🥾 Trail Seeker";
  if (setting === "Indoor" && time === "Night") return "🛋️ Couch Philosopher";
  if (setting === "Indoor") return "🏠 Hearth Keeper";
  return "🧭 Unwritten Wanderer";
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
    { name: "First Steps", description: "Complete 1 quest.", unlocked: completionStats.totalCompleted >= 1 },
    { name: "Wanderer", description: "Complete 10 quests.", unlocked: completionStats.totalCompleted >= 10 },
    { name: "Pathfinder", description: "Complete 25 quests.", unlocked: completionStats.totalCompleted >= 25 },
    { name: "Explorer", description: "Complete 50 quests.", unlocked: completionStats.totalCompleted >= 50 },
    { name: "Adventurer", description: "Complete 100 quests.", unlocked: completionStats.totalCompleted >= 100 },
    { name: "Homebody", description: "Complete 10 Indoor quests.", unlocked: (completionStats.bySetting["Indoor"] || 0) >= 10 },
    { name: "Trail Walker", description: "Complete 10 Outdoor quests.", unlocked: (completionStats.bySetting["Outdoor"] || 0) >= 10 },
    { name: "City Roamer", description: "Complete 10 City quests.", unlocked: (completionStats.bySetting["City"] || 0) >= 10 },
    { name: "Country Soul", description: "Complete 10 Country quests.", unlocked: (completionStats.bySetting["Country"] || 0) >= 10 },
    { name: "Night Owl", description: "Complete 10 Night quests.", unlocked: (completionStats.byTime["Night"] || 0) >= 10 },
    { name: "Streak Starter", description: "Reach a 3-day streak.", unlocked: streakData.bestStreak >= 3 },
    { name: "Dedicated", description: "Reach a 7-day streak.", unlocked: streakData.bestStreak >= 7 },
    { name: "Title Collector", description: "Unlock 5 titles.", unlocked: titles.length >= 5 },
  ];
}

export default function App() {
  const [mode, setMode] = useState<Mode>("Solo");
  const [setting, setSetting] = useState<Setting>("Indoor");
  const [time, setTime] = useState<TimeOfDay>(detectTimeOfDay());
  const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);
  const [lastQuestTitle, setLastQuestTitle] = useState("");

  const [xp, setXp] = useState(() => loadFromStorage<number>("quest-xp", 0));
  const [titles, setTitles] = useState<string[]>(() => loadFromStorage<string[]>("quest-titles", []));
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
  const [questHistory, setQuestHistory] = useState<QuestHistoryItem[]>(() =>
    loadFromStorage<QuestHistoryItem[]>("quest-history", [])
  );

  const [message, setMessage] = useState("");

  useEffect(() => localStorage.setItem("quest-xp", JSON.stringify(xp)), [xp]);
  useEffect(() => localStorage.setItem("quest-titles", JSON.stringify(titles)), [titles]);
  useEffect(() => localStorage.setItem("quest-completed-counts", JSON.stringify(completedCounts)), [completedCounts]);
  useEffect(() => localStorage.setItem("quest-completion-stats", JSON.stringify(completionStats)), [completionStats]);
  useEffect(() => localStorage.setItem("quest-streak-data", JSON.stringify(streakData)), [streakData]);
  useEffect(() => localStorage.setItem("quest-history", JSON.stringify(questHistory)), [questHistory]);

  const rank = getRank(xp);
  const nextXp = nextRankXp(xp);
  const progress = nextXp === xp ? 100 : Math.min((xp / nextXp) * 100, 100);
  const achievements = getAchievements(completionStats, streakData, titles);
  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked);

  const favoriteMode = getFavorite(completionStats.byMode);
  const favoriteSetting = getFavorite(completionStats.bySetting);
  const favoriteTime = getFavorite(completionStats.byTime);
  const archetype = getArchetype(favoriteSetting, favoriteTime);

  const availableQuests = useMemo(() => getQuestPool(mode, setting, time), [mode, setting, time]);

  function updateStreak() {
    const today = getTodayString();
    const yesterday = getYesterdayString();

    if (streakData.lastCompletedDate === today) return streakData;

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

    const oldAchievements = getAchievements(completionStats, streakData, titles).filter((a) => a.unlocked).length;
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

    const historyItem: QuestHistoryItem = {
      title: currentQuest.title,
      xp: currentQuest.xp,
      mode: currentQuest.mode,
      setting: currentQuest.setting,
      time: currentQuest.time,
      completedAt: new Date().toLocaleString(),
    };

    const newHistory = [historyItem, ...questHistory].slice(0, 10);
    const count = newCounts[currentQuest.title];

    let newTitles = titles;
    let titleMessage = "";

    if (count >= 3 && !titles.includes(currentQuest.unlockTitle)) {
      newTitles = [...titles, currentQuest.unlockTitle];
      titleMessage = ` 🏆 New Title: ${currentQuest.unlockTitle}.`;
    }

    const newAchievementCount = getAchievements(newStats, updatedStreak, newTitles).filter((a) => a.unlocked).length;
    const achievementMessage = newAchievementCount > oldAchievements ? " 🎖️ New achievement unlocked!" : "";

    setXp(newXp);
    setCompletedCounts(newCounts);
    setCompletionStats(newStats);
    setTitles(newTitles);
    setQuestHistory(newHistory);

    setMessage(`+${currentQuest.xp} XP earned. 🔥 Streak: ${updatedStreak.currentStreak} day(s).${titleMessage}${achievementMessage}`);
  }

  function shareQuest() {
    if (!currentQuest) return;
    const text = `I got a quest: "${currentQuest.title}" — ${currentQuest.task} Reward: ${currentQuest.xp} XP.`;
    window.location.href = `sms:?&body=${encodeURIComponent(text)}`;
  }

  function resetProgress() {
    const confirmed = window.confirm("Reset XP, titles, achievements, history, streaks, and completed quest progress?");
    if (!confirmed) return;

    setXp(0);
    setTitles([]);
    setCompletedCounts({});
    setCompletionStats({ totalCompleted: 0, byMode: {}, bySetting: {}, byTime: {} });
    setStreakData({ currentStreak: 0, bestStreak: 0, lastCompletedDate: "" });
    setQuestHistory([]);
    setCurrentQuest(null);
    setMessage("Progress reset.");
  }

  return (
   <div style={styles.hero}>
  <div style={styles.heroOverlay}>
    <h1 style={styles.logo}>QUEST</h1>
    <p style={styles.subtitle}>
      Adventure is closer than you think.
    </p>
  </div>
</div>

        <div style={styles.profile}>
          <h2>{rank}</h2>
          <p>{xp} XP</p>
          <div style={styles.progressOuter}>
            <div style={{ ...styles.progressInner, width: `${progress}%` }} />
          </div>
          <p style={styles.small}>Next rank at {nextXp} XP</p>
          <p style={styles.small}>🔥 Streak: {streakData.currentStreak} day(s)</p>
        </div>

        <div style={styles.section}>
          <h3>Who’s playing?</h3>
          <div style={styles.buttonGrid}>
            {modes.map((item) => (
              <button key={item} onClick={() => { setMode(item); setCurrentQuest(null); setMessage(""); }} style={mode === item ? styles.selectedButton : styles.button}>{item}</button>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h3>Where?</h3>
          <div style={styles.buttonGrid}>
            {settings.map((item) => (
              <button key={item} onClick={() => { setSetting(item); setCurrentQuest(null); setMessage(""); }} style={setting === item ? styles.selectedButton : styles.button}>{item}</button>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h3>When?</h3>
          <p style={styles.small}>Auto-detected as {detectTimeOfDay()}, but you can override it.</p>
          <div style={styles.timeGrid}>
            {times.map((item) => (
              <button key={item} onClick={() => { setTime(item); setCurrentQuest(null); setMessage(""); }} style={time === item ? styles.selectedButton : styles.button}>{item}</button>
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

        <details style={styles.profileCard}>
          <summary style={styles.dropdownSummary}>Adventurer Profile</summary>
          <h2>{archetype}</h2>
          <p>Rank: {rank}</p>
          <p>XP: {xp}</p>
          <p>Quests completed: {completionStats.totalCompleted}</p>
          <p>Titles unlocked: {titles.length}</p>
          <p>Achievements: {unlockedAchievements.length} / {achievements.length}</p>
          <p>Favorite mode: {favoriteMode}</p>
          <p>Favorite setting: {favoriteSetting}</p>
          <p>Favorite time: {favoriteTime}</p>
          <p>Current streak: 🔥 {streakData.currentStreak} day(s)</p>
          <p>Best streak: 🏆 {streakData.bestStreak} day(s)</p>
        </details>

        <details style={styles.statsCard}>
          <summary style={styles.dropdownSummary}>Adventure Stats</summary>
          <p>Total quests completed: {completionStats.totalCompleted}</p>
          <p>Total XP earned: {xp}</p>
          <p>Titles unlocked: {titles.length}</p>
          <p>Achievements unlocked: {unlockedAchievements.length} / {achievements.length}</p>
          <p>Favorite mode: {favoriteMode}</p>
          <p>Favorite setting: {favoriteSetting}</p>
          <p>Favorite time: {favoriteTime}</p>
          <p>Current streak: 🔥 {streakData.currentStreak} day(s)</p>
          <p>Best streak: 🏆 {streakData.bestStreak} day(s)</p>
        </details>

        <details style={styles.titles}>
          <summary style={styles.dropdownSummary}>Titles ({titles.length})</summary>
          {titles.length === 0 ? (
            <p style={styles.small}>No titles yet. The possums remain unimpressed.</p>
          ) : (
            <div style={styles.titleList}>
              {titles.map((title) => <span key={title} style={styles.titleBadge}>{title}</span>)}
            </div>
          )}
        </details>

        <details style={styles.historyCard}>
          <summary style={styles.dropdownSummary}>Recent Quest History ({questHistory.length})</summary>
          {questHistory.length === 0 ? (
            <p style={styles.small}>No completed quests yet.</p>
          ) : (
            <div style={styles.historyList}>
              {questHistory.map((item, index) => (
                <div key={`${item.title}-${index}`} style={styles.historyItem}>
                  <strong>✓ {item.title}</strong>
                  <p style={styles.small}>{item.mode} • {item.setting} • {item.time} • +{item.xp} XP</p>
                  <p style={styles.small}>{item.completedAt}</p>
                </div>
              ))}
            </div>
          )}
        </details>

        <details style={styles.achievementCard}>
          <summary style={styles.dropdownSummary}>Achievements: {unlockedAchievements.length} / {achievements.length} unlocked</summary>
          <div style={styles.achievementList}>
            {achievements.map((achievement) => (
              <div key={achievement.name} style={achievement.unlocked ? styles.achievementUnlocked : styles.achievementLocked}>
                <strong>{achievement.unlocked ? "🏆" : "🔒"} {achievement.name}</strong>
                <p style={achievement.unlocked ? styles.achievementText : styles.lockedText}>{achievement.description}</p>
              </div>
            ))}
          </div>
        </details>

        <button style={styles.resetButton} onClick={resetProgress}>Reset Progress</button>
      </div>
    </div>
  );
}

const cardBase: React.CSSProperties = {
  background: "#f7f2e8",
  border: "2px solid #d6c7a7",
  borderRadius: "20px",
  padding: "18px",
  marginBottom: "18px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg,#1b4332 0%,#2d6a4f 35%,#dad7cd 100%)",
    color: "#1b4332",
    fontFamily: "system-ui, sans-serif",
    padding: "24px",
  },

  app: {
    maxWidth: "700px",
    margin: "0 auto",
  },

  logo: {
    textAlign: "center",
    fontSize: "56px",
    letterSpacing: "8px",
    color: "#fefae0",
    marginBottom: "6px",
    textShadow: "2px 2px 10px rgba(0,0,0,.3)",
  },

  subtitle: {
    textAlign: "center",
    color: "#dad7cd",
    marginBottom: "24px",
    fontWeight: 500,
  },

  profile: {
    ...cardBase,
    background: "#fefae0",
  },

  profileCard: cardBase,

  statsCard: cardBase,

  historyCard: cardBase,

  achievementCard: cardBase,

  titles: cardBase,

  dropdownSummary: {
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "18px",
    color: "#1b4332",
  },

  progressOuter: {
    height: "14px",
    background: "#ccd5ae",
    borderRadius: "999px",
    overflow: "hidden",
  },

  progressInner: {
    height: "100%",
    background: "#dda15e",
    borderRadius: "999px",
  },

  section: {
    ...cardBase,
  },

  buttonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: "10px",
  },

  timeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: "10px",
  },

  button: {
    padding: "14px",
    borderRadius: "14px",
    border: "2px solid #588157",
    background: "#a3b18a",
    color: "#1b4332",
    fontWeight: 700,
    cursor: "pointer",
  },

  selectedButton: {
    padding: "14px",
    borderRadius: "14px",
    border: "2px solid #bc6c25",
    background: "#dda15e",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },

  bigButton: {
    width: "100%",
    padding: "18px",
    borderRadius: "18px",
    border: "none",
    background: "#2d6a4f",
    color: "#fff",
    fontSize: "20px",
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: "20px",
    boxShadow: "0 6px 16px rgba(0,0,0,.2)",
  },

  questCard: {
    background: "#fefae0",
    color: "#1b4332",
    borderRadius: "22px",
    padding: "24px",
    marginBottom: "18px",
    border: "2px solid #d6c7a7",
    boxShadow: "0 8px 20px rgba(0,0,0,.1)",
  },

  difficulty: {
    color: "#bc6c25",
    fontWeight: 700,
  },

  flavor: {
    fontStyle: "italic",
    color: "#588157",
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
    background: "#2d6a4f",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },

  shareButton: {
    flex: 1,
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "#588157",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },

  message: {
    background: "#dda15e",
    color: "#fff",
    padding: "14px",
    borderRadius: "12px",
    fontWeight: 700,
    marginBottom: "18px",
  },

  achievementList: {
    display: "grid",
    gap: "10px",
    marginTop: "14px",
  },

  achievementUnlocked: {
    background: "#fefae0",
    border: "2px solid #dda15e",
    padding: "12px",
    borderRadius: "12px",
  },

  achievementLocked: {
    background: "#e9edc9",
    padding: "12px",
    borderRadius: "12px",
    opacity: 0.7,
  },

  achievementText: {
    marginTop: "6px",
    fontSize: "14px",
  },

  lockedText: {
    marginTop: "6px",
    fontSize: "14px",
  },

  historyList: {
    display: "grid",
    gap: "10px",
    marginTop: "14px",
  },

  historyItem: {
    background: "#fefae0",
    border: "1px solid #d6c7a7",
    padding: "12px",
    borderRadius: "12px",
  },

  titleList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "14px",
  },

  titleBadge: {
    background: "#dda15e",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "999px",
    fontWeight: 700,
  },

  small: {
    color: "#588157",
    fontSize: "14px",
  },

  smallDark: {
    color: "#588157",
    fontSize: "14px",
  },

  resetButton: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "2px solid #bc6c25",
    background: "#fefae0",
    color: "#bc6c25",
    fontWeight: 700,
    cursor: "pointer",
  },
};
