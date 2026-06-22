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
  return templates.map((quest) => ({ ...quest, mode, setting, time }));
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
  const [setting, setSetting] = useState<Setting>("Outdoor");
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

  function clearQuest() {
    setCurrentQuest(null);
    setMessage("");
  }

  return (
    <div style={styles.page}>
      <div style={styles.phoneFrame}>
        <div style={styles.hero}>
          <div style={styles.topIcons}>
            <span style={styles.iconButton}>☰</span>
            <span style={styles.iconButton}>🔔</span>
          </div>

          <div style={styles.logoMark}>⛰</div>
          <h1 style={styles.logo}>QUEST</h1>
          <p style={styles.subtitle}>ADVENTURE. TOGETHER.</p>

          <div style={styles.rankCard}>
            <div style={styles.rankBadge}>⛰️</div>
            <div style={styles.rankInfo}>
              <p style={styles.rankLabel}>RANK</p>
              <h2 style={styles.rankName}>{rank}</h2>
              <div style={styles.levelRow}>
                <span>LEVEL {Math.max(1, Math.floor(xp / 100) + 1)}</span>
                <div style={styles.progressOuter}>
                  <div style={{ ...styles.progressInner, width: `${progress}%` }} />
                </div>
              </div>
              <p style={styles.xpText}>{xp.toLocaleString()} / {nextXp.toLocaleString()} XP</p>
            </div>
            <div style={styles.rankArrow}>›</div>
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.modeTabs}>
            {modes.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setMode(item);
                  clearQuest();
                }}
                style={mode === item ? styles.activeTab : styles.tab}
              >
                {item}
              </button>
            ))}
          </div>

          <section style={styles.panel}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>⚙ TODAY’S QUEST</h3>
              <span style={styles.viewAll}>View All</span>
            </div>

            <div style={styles.selectorBlock}>
              <p style={styles.selectorLabel}>WHERE?</p>
              <div style={styles.pillGrid}>
                {settings.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setSetting(item);
                      clearQuest();
                    }}
                    style={setting === item ? styles.activePill : styles.pill}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <p style={styles.selectorLabel}>WHEN?</p>
              <div style={styles.pillGrid}>
                {times.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setTime(item);
                      clearQuest();
                    }}
                    style={time === item ? styles.activePill : styles.pill}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <p style={styles.availableText}>{availableQuests.length} quest option(s) available</p>

            {!currentQuest ? (
              <button style={styles.beginButton} onClick={generateQuest}>
                BEGIN QUEST
              </button>
            ) : (
              <div style={styles.questCard}>
                <div style={styles.questImage}>
                  <div style={styles.questImageOverlay}>
                    <span style={styles.questTag}>{currentQuest.setting} • {currentQuest.time}</span>
                    <h2 style={styles.questTitle}>{currentQuest.title}</h2>
                    <p style={styles.questTask}>{currentQuest.task}</p>
                    <div style={styles.questFooter}>
                      <strong>⛰ {currentQuest.xp} XP</strong>
                      <button style={styles.startQuestButton} onClick={completeQuest}>COMPLETE</button>
                    </div>
                  </div>
                </div>

                <p style={styles.flavor}>“{currentQuest.flavor}”</p>
                <p style={styles.unlockText}>Title unlock: complete this quest 3 times.</p>

                <button style={styles.textButton} onClick={shareQuest}>Text Quest</button>
              </div>
            )}

            {message && <div style={styles.message}>{message}</div>}
          </section>

          <section style={styles.featureCard}>
            <div style={styles.smallBadge}>WEEKLY CHALLENGE</div>
            <h3 style={styles.featureTitle}>Adventure Awaits</h3>
            <p style={styles.featureText}>Complete 5 quests this week.</p>
            <div style={styles.weeklyRow}>
              <div style={styles.miniProgress}>
                <div
                  style={{
                    ...styles.miniProgressInner,
                    width: `${Math.min((completionStats.totalCompleted % 5) * 20, 100)}%`,
                  }}
                />
              </div>
              <span>{completionStats.totalCompleted % 5} / 5</span>
            </div>
          </section>

          <details style={styles.dropdownCard}>
            <summary style={styles.dropdownSummary}>👤 Adventurer Profile</summary>
            <h2 style={styles.archetype}>{archetype}</h2>
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

          <details style={styles.dropdownCard}>
            <summary style={styles.dropdownSummary}>🎖 Achievements: {unlockedAchievements.length} / {achievements.length}</summary>
            <div style={styles.badgeGrid}>
              {achievements.map((achievement) => (
                <div
                  key={achievement.name}
                  style={achievement.unlocked ? styles.achievementBadge : styles.lockedBadge}
                >
                  <div style={styles.badgeIcon}>{achievement.unlocked ? "🏆" : "🔒"}</div>
                  <strong>{achievement.name}</strong>
                  <p style={styles.badgeText}>{achievement.description}</p>
                </div>
              ))}
            </div>
          </details>

          <details style={styles.dropdownCard}>
            <summary style={styles.dropdownSummary}>👑 Titles ({titles.length})</summary>
            {titles.length === 0 ? (
              <p style={styles.muted}>No titles yet. The possums remain unimpressed.</p>
            ) : (
              <div style={styles.titleList}>
                {titles.map((title) => <span key={title} style={styles.titleBadge}>{title}</span>)}
              </div>
            )}
          </details>

          <details style={styles.dropdownCard}>
            <summary style={styles.dropdownSummary}>📖 Recent Quest History ({questHistory.length})</summary>
            {questHistory.length === 0 ? (
              <p style={styles.muted}>No completed quests yet.</p>
            ) : (
              <div style={styles.historyList}>
                {questHistory.map((item, index) => (
                  <div key={`${item.title}-${index}`} style={styles.historyItem}>
                    <strong>✓ {item.title}</strong>
                    <p style={styles.muted}>{item.mode} • {item.setting} • {item.time} • +{item.xp} XP</p>
                    <p style={styles.muted}>{item.completedAt}</p>
                  </div>
                ))}
              </div>
            )}
          </details>

          <button style={styles.resetButton} onClick={resetProgress}>Reset Progress</button>
        </div>

        <nav style={styles.bottomNav}>
          <div style={styles.navItemActive}>⌂<span>HOME</span></div>
          <div style={styles.navItem}>⌖<span>QUESTS</span></div>
          <div style={styles.navItem}>▤<span>JOURNAL</span></div>
          <div style={styles.navItem}>♙<span>PROFILE</span></div>
        </nav>
      </div>
    </div>
  );
}

const cream = "#f5ecd9";
const deepGreen = "#13291f";
const forest = "#244532";
const olive = "#566b3d";
const gold = "#d9a441";
const ink = "#16231b";

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#080b08",
    color: ink,
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    display: "flex",
    justifyContent: "center",
    padding: "16px",
  },
  phoneFrame: {
    width: "100%",
    maxWidth: "480px",
    minHeight: "100vh",
    background: cream,
    borderRadius: "28px",
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 20px 60px rgba(0,0,0,.45)",
    paddingBottom: "84px",
  },
  hero: {
    minHeight: "390px",
    position: "relative",
    padding: "22px",
    background: `
      linear-gradient(to bottom, rgba(245,236,217,.2), rgba(245,236,217,.92) 76%),
      radial-gradient(circle at 70% 20%, rgba(255,222,157,.65), transparent 18%),
      linear-gradient(135deg, #e9dcc3 0%, #d8d4c1 45%, #33483a 46%, #152b22 100%)
    `,
  },
  topIcons: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: deepGreen,
    fontSize: "26px",
    marginBottom: "12px",
  },
  iconButton: {
    width: "38px",
    height: "38px",
    display: "grid",
    placeItems: "center",
  },
  logoMark: {
    textAlign: "center",
    color: deepGreen,
    fontSize: "34px",
    marginTop: "8px",
  },
  logo: {
    textAlign: "center",
    fontSize: "58px",
    letterSpacing: "9px",
    margin: "0",
    color: deepGreen,
    fontWeight: 900,
    lineHeight: 1,
  },
  subtitle: {
    textAlign: "center",
    color: deepGreen,
    fontWeight: 800,
    fontSize: "13px",
    letterSpacing: "3px",
    marginTop: "10px",
  },
  rankCard: {
    position: "absolute",
    left: "20px",
    right: "20px",
    bottom: "-42px",
    background: `linear-gradient(135deg, ${deepGreen}, ${forest})`,
    color: cream,
    borderRadius: "20px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    border: "1px solid rgba(217,164,65,.55)",
    boxShadow: "0 14px 30px rgba(0,0,0,.28)",
  },
  rankBadge: {
    width: "88px",
    height: "88px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    fontSize: "42px",
    background: "linear-gradient(135deg,#efe4c8,#8fa078)",
    border: `5px solid ${gold}`,
    flexShrink: 0,
  },
  rankInfo: {
    flex: 1,
  },
  rankLabel: {
    color: gold,
    fontWeight: 800,
    fontSize: "12px",
    letterSpacing: "2px",
    margin: 0,
  },
  rankName: {
    margin: "3px 0 8px",
    fontSize: "30px",
    lineHeight: 1,
  },
  levelRow: {
    display: "grid",
    gridTemplateColumns: "70px 1fr",
    alignItems: "center",
    gap: "10px",
    fontWeight: 800,
    fontSize: "12px",
  },
  progressOuter: {
    height: "10px",
    background: "rgba(255,255,255,.18)",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressInner: {
    height: "100%",
    background: gold,
    borderRadius: "999px",
  },
  xpText: {
    textAlign: "right",
    margin: "6px 0 0",
    color: "#f6e2ae",
    fontWeight: 700,
    fontSize: "13px",
  },
  rankArrow: {
    fontSize: "36px",
    color: gold,
  },
  content: {
    padding: "66px 20px 20px",
  },
  modeTabs: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "10px",
    marginBottom: "18px",
  },
  tab: {
    border: "1px solid #d6c7a7",
    background: "#fbf4e6",
    color: ink,
    borderRadius: "10px",
    padding: "12px 6px",
    fontWeight: 800,
    cursor: "pointer",
  },
  activeTab: {
    border: "1px solid #3f5f37",
    background: olive,
    color: "#fff",
    borderRadius: "10px",
    padding: "12px 6px",
    fontWeight: 800,
    cursor: "pointer",
  },
  panel: {
    background: "#fff8e9",
    borderRadius: "20px",
    padding: "18px",
    boxShadow: "0 10px 25px rgba(0,0,0,.08)",
    marginBottom: "18px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 900,
  },
  viewAll: {
    fontSize: "14px",
  },
  selectorBlock: {
    marginBottom: "12px",
  },
  selectorLabel: {
    fontSize: "12px",
    fontWeight: 900,
    color: olive,
    letterSpacing: "2px",
    marginBottom: "8px",
  },
  pillGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: "8px",
    marginBottom: "12px",
  },
  pill: {
    padding: "10px",
    borderRadius: "999px",
    border: "1px solid #d6c7a7",
    background: "#fbf4e6",
    fontWeight: 800,
    cursor: "pointer",
  },
  activePill: {
    padding: "10px",
    borderRadius: "999px",
    border: "1px solid #263d2b",
    background: "#263d2b",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  availableText: {
    color: olive,
    fontSize: "13px",
    fontWeight: 700,
  },
  beginButton: {
    width: "100%",
    border: "none",
    borderRadius: "16px",
    padding: "18px",
    background: `linear-gradient(135deg, ${olive}, ${deepGreen})`,
    color: "#fff",
    fontWeight: 900,
    fontSize: "17px",
    letterSpacing: "1px",
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(0,0,0,.2)",
  },
  questCard: {
    marginTop: "14px",
  },
  questImage: {
    minHeight: "250px",
    borderRadius: "18px",
    overflow: "hidden",
    background: `
      linear-gradient(to bottom, rgba(0,0,0,.1), rgba(0,0,0,.75)),
      linear-gradient(135deg,#536b4c 0%, #13291f 55%, #0c1510 100%)
    `,
    color: "#fff",
    position: "relative",
    boxShadow: "0 10px 24px rgba(0,0,0,.18)",
  },
  questImageOverlay: {
    position: "absolute",
    inset: 0,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  questTag: {
    alignSelf: "flex-start",
    background: "#496331",
    color: "#f7e9bf",
    padding: "7px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: "1px",
  },
  questTitle: {
    fontSize: "30px",
    margin: "20px 0 8px",
    lineHeight: 1,
  },
  questTask: {
    fontSize: "17px",
    lineHeight: 1.35,
    maxWidth: "90%",
  },
  questFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid rgba(255,255,255,.18)",
    paddingTop: "14px",
    fontSize: "22px",
  },
  startQuestButton: {
    border: "1px solid rgba(255,255,255,.35)",
    background: "#6d7f38",
    color: "#fff",
    borderRadius: "10px",
    padding: "12px 18px",
    fontWeight: 900,
    cursor: "pointer",
  },
  flavor: {
    color: olive,
    fontStyle: "italic",
    marginTop: "14px",
    lineHeight: 1.4,
  },
  unlockText: {
    color: "#6d5c3d",
    fontSize: "13px",
    fontWeight: 700,
  },
  textButton: {
    width: "100%",
    background: "#e6d7bb",
    color: ink,
    border: "1px solid #cdbb95",
    borderRadius: "12px",
    padding: "12px",
    fontWeight: 900,
    cursor: "pointer",
  },
  message: {
    marginTop: "12px",
    background: "#f0d28a",
    color: ink,
    padding: "13px",
    borderRadius: "12px",
    fontWeight: 800,
  },
  featureCard: {
    background: "#fff8e9",
    borderRadius: "18px",
    padding: "18px",
    marginBottom: "18px",
    boxShadow: "0 8px 20px rgba(0,0,0,.08)",
  },
  smallBadge: {
    color: olive,
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: "2px",
  },
  featureTitle: {
    margin: "8px 0 4px",
    fontSize: "22px",
  },
  featureText: {
    margin: 0,
    color: "#5e604e",
  },
  weeklyRow: {
    display: "grid",
    gridTemplateColumns: "1fr 42px",
    gap: "10px",
    alignItems: "center",
    marginTop: "12px",
    fontWeight: 800,
  },
  miniProgress: {
    height: "8px",
    background: "#d8ceb7",
    borderRadius: "999px",
    overflow: "hidden",
  },
  miniProgressInner: {
    height: "100%",
    background: olive,
  },
  dropdownCard: {
    background: "#fff8e9",
    borderRadius: "18px",
    padding: "16px",
    marginBottom: "14px",
    boxShadow: "0 8px 18px rgba(0,0,0,.07)",
  },
  dropdownSummary: {
    cursor: "pointer",
    fontWeight: 900,
    fontSize: "16px",
  },
  archetype: {
    color: deepGreen,
  },
  badgeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: "12px",
    marginTop: "14px",
  },
  achievementBadge: {
    background: "#f0d28a",
    border: `2px solid ${gold}`,
    borderRadius: "16px",
    padding: "12px",
    textAlign: "center",
  },
  lockedBadge: {
    background: "#e7ddc8",
    border: "2px solid #d6c7a7",
    borderRadius: "16px",
    padding: "12px",
    textAlign: "center",
    opacity: 0.75,
  },
  badgeIcon: {
    fontSize: "30px",
    marginBottom: "6px",
  },
  badgeText: {
    fontSize: "12px",
    color: "#554936",
  },
  titleList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "14px",
  },
  titleBadge: {
    background: deepGreen,
    color: cream,
    padding: "8px 12px",
    borderRadius: "999px",
    fontWeight: 800,
  },
  muted: {
    color: "#6d6a58",
    fontSize: "14px",
  },
  historyList: {
    display: "grid",
    gap: "10px",
    marginTop: "14px",
  },
  historyItem: {
    background: "#f5ecd9",
    border: "1px solid #d6c7a7",
    padding: "12px",
    borderRadius: "12px",
  },
  resetButton: {
    width: "100%",
    background: "transparent",
    border: "1px solid #b67435",
    color: "#9b4f1e",
    borderRadius: "12px",
    padding: "12px",
    fontWeight: 900,
    cursor: "pointer",
    marginBottom: "20px",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "74px",
    background: deepGreen,
    color: "#fff",
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    borderTopLeftRadius: "18px",
    borderTopRightRadius: "18px",
    boxShadow: "0 -8px 20px rgba(0,0,0,.2)",
  },
  navItem: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "4px",
    fontSize: "22px",
    color: "#f6ead2",
  },
  navItemActive: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "4px",
    fontSize: "22px",
    color: gold,
  },
};
