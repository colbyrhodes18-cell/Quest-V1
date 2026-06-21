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

const variants = [
  "Scout",
  "Challenge",
  "Council",
  "Expedition",
  "Ritual",
];

const titleWords = {
  Solo: ["Wanderer", "Scout", "Philosopher", "Operator", "Goblin"],
  Friends: ["Council", "Crew", "Legends", "Prophets", "Gladiators"],
  Family: ["Clan", "Keepers", "Explorers", "Champions", "Rangers"],
  Date: ["Romantics", "Seekers", "Partners", "Stargazers", "Adventurers"],
};

const settingWords = {
  Indoor: ["Couch", "Kitchen", "Room", "Table", "Fort"],
  Outdoor: ["Trail", "Sunset", "Field", "Sky", "Perimeter"],
  City: ["Street", "Gas Station", "Sidewalk", "Shop", "Neon"],
  Country: ["Backroad", "Creek", "Porch", "Fence Line", "Starlight"],
};

const timeWords = {
  Morning: ["Dawn", "Breakfast", "Sunrise", "Wake-Up", "First Light"],
  Afternoon: ["Midday", "Daylight", "Prime Time", "Afternoon", "Sun-High"],
  Evening: ["Dusk", "Golden Hour", "Sundown", "Evening", "Twilight"],
  Night: ["Moonlight", "Night Owl", "Midnight", "Dark Hours", "Star Watch"],
  Anytime: ["Wildcard", "Open Call", "Anytime", "Free Quest", "Random Call"],
};

function detectTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 21) return "Evening";
  return "Night";
}

function getXP(time: TimeOfDay, index: number) {
  if (time === "Night") return index >= 3 ? 25 : 15;
  if (index >= 3) return 20;
  return 10;
}

function makeTask(mode: Mode, setting: Setting, time: TimeOfDay, index: number) {
  const tasks = {
    Solo: {
      Indoor: [
        "Read, write, clean, build, or practice something useful for 15 minutes.",
        "Fix one small annoying thing you have been ignoring.",
        "Make a snack or meal using only what you already have.",
        "Write down one goal and one tiny step toward it.",
        "Create something small: a note, sketch, list, plan, or idea.",
      ],
      Outdoor: [
        "Walk outside and find three things you usually ignore.",
        "Take a short walk and photograph the weirdest thing you find.",
        "Sit outside for 10 minutes without scrolling.",
        "Find the quietest spot nearby and stay there for 5 minutes.",
        "Move your body outside for 20 minutes.",
      ],
      City: [
        "Visit a place nearby you usually pass but never enter.",
        "Find the strangest snack or drink available nearby.",
        "Walk a new block, sidewalk, or shopping strip.",
        "Find the most interesting sign, sticker, or window display.",
        "Try a cheap food or drink from somewhere new.",
      ],
      Country: [
        "Take a backroad, path, porch sit, or quiet walk.",
        "Find one natural thing worth remembering.",
        "Look for tracks, birds, bugs, trees, water, or weird rocks.",
        "Sit outside and listen for wildlife or wind.",
        "Walk or drive a route you usually ignore.",
      ],
    },
    Friends: {
      Indoor: [
        "Everyone brings one snack and votes on the champion.",
        "Watch something bad and each person defends one terrible part.",
        "Make up a ridiculous indoor competition.",
        "Everyone writes a prediction about the group’s future.",
        "Create a fake award ceremony and crown a winner.",
      ],
      Outdoor: [
        "Go outside and invent a competition using whatever is nearby.",
        "Take a safe walk and compete to find the weirdest object.",
        "Sit outside and each person tells one true story.",
        "Create a fake sport and play one round.",
        "Find a view, bench, field, or open spot and hold council.",
      ],
      City: [
        "Find the weirdest item in a store under $10.",
        "Grab cheap food and rate it like professional idiots.",
        "Walk somewhere busy and invent backstories for strangers.",
        "Find the most interesting sign, mural, or display.",
        "Let each friend pick one stop and visit them all.",
      ],
      Country: [
        "Take a backroad drive and pick the best view.",
        "Sit around a porch, fire, truck, or table and tell stories.",
        "Find the oldest-looking structure, tree, or road nearby.",
        "Create a country scavenger hunt with five objects.",
        "Go outside and name three fake landmarks.",
      ],
    },
    Family: {
      Indoor: [
        "Build a blanket fort and name the kingdom.",
        "Create three silly indoor games and crown a champion.",
        "Make a snack together and rate it dramatically.",
        "Draw, build, or invent something as a family.",
        "Create a family trivia contest.",
      ],
      Outdoor: [
        "Find one bug, one bird, one rock, and one weird-shaped leaf.",
        "Take a walk and let the kids choose the route.",
        "Create a backyard or park scavenger hunt.",
        "Find the best stick, rock, flower, or cloud.",
        "Spend 20 minutes outside with no screens.",
      ],
      City: [
        "Visit a library, store, museum, or public place and find the coolest thing.",
        "Go get one small treat and rate it out of 10.",
        "Find a mural, statue, fountain, or weird sign.",
        "Let each family member pick one small stop.",
        "Turn a normal errand into a mission.",
      ],
      Country: [
        "Find water, rocks, bugs, tracks, or signs of animals.",
        "Go outside and find three stars, planes, birds, or mysterious lights.",
        "Take a slow walk and name fake landmarks.",
        "Find the quietest spot and stay there for 5 minutes.",
        "Create a nature treasure hunt.",
      ],
    },
    Date: {
      Indoor: [
        "Pick a movie neither of you has seen and make ridiculous predictions.",
        "Each person makes or picks one snack. Compare results.",
        "Ask each other three questions you’ve never asked before.",
        "Cook, build, draw, or plan something together.",
        "Create a fake vacation plan with no budget limit.",
      ],
      Outdoor: [
        "Take a walk and each ask one new question.",
        "Find a sunset spot and bring one drink each.",
        "Sit outside for 10 minutes with no phones.",
        "Find the best view nearby.",
        "Take a slow walk and point out three things you like.",
      ],
      City: [
        "Go get breakfast, coffee, dessert, or a snack somewhere new.",
        "Each person picks one place and you visit both.",
        "Find the weirdest item in a store together.",
        "Walk somewhere new and choose a favorite building or sign.",
        "Try a cheap bite from somewhere neither of you has visited.",
      ],
      Country: [
        "Drive a road neither of you has taken before.",
        "Go outside and look at the stars for 10 minutes.",
        "Find a quiet view and talk about one future plan.",
        "Take a backroad drive and pick a song for the moment.",
        "Find the most peaceful spot nearby.",
      ],
    },
  };

  return tasks[mode][setting][index];
}

function makeFlavor(mode: Mode, setting: Setting, time: TimeOfDay, index: number) {
  const flavors = [
    "The quest board has spoken. Try not to embarrass the kingdom.",
    "Your ancestors endured worse with fewer snacks.",
    "This is technically character development.",
    "If this goes badly, at least it becomes lore.",
    "The possums are watching. Make them proud.",
  ];

  if (mode === "Date") return ["Romance is just side quests with better lighting.", "If it goes wrong, it becomes a memory.", "Two adventurers. One questionable plan.", "Love requires snacks and courage.", "Main character energy, but shared."][index];

  if (mode === "Family") return ["Small humans respect quests more than chores.", "The council demands adventure.", "Memory unlocked, probably sticky.", "Family lore begins here.", "Chaos is just bonding with sound effects."][index];

  if (mode === "Friends") return ["Bad ideas are better with witnesses.", "Friendship is mostly snacks and poor judgment.", "The group chat demands proof.", "Someone will make this weird. Let them.", "Legends are born from boredom."][index];

  return flavors[index];
}

function makeQuest(mode: Mode, setting: Setting, time: TimeOfDay, index: number): Quest {
  const title = `${timeWords[time][index]} ${settingWords[setting][index]} ${variants[index]}`;
  const unlockTitle = `${settingWords[setting][index]} ${titleWords[mode][index]}`;

  return {
    title,
    mode,
    setting,
    time,
    xp: getXP(time, index),
    task: makeTask(mode, setting, time, index),
    flavor: makeFlavor(mode, setting, time, index),
    unlockTitle,
  };
}

const quests: Quest[] = modes.flatMap((mode) =>
  settings.flatMap((setting) =>
    times.flatMap((time) =>
      variants.map((_, index) => makeQuest(mode, setting, time, index))
    )
  )
);

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
    q.time === time
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
                onClick={() => setMode(m)}
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
                onClick={() => setSetting(s)}
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
                onClick={() => setTime(t)}
                style={time === t ? styles.selectedButton : styles.button}
              >
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
            <p style={styles.difficulty}>{currentQuest.xp} XP</p>

            <h2>{currentQuest.title}</h2>
            <p>{currentQuest.task}</p>
            <p style={styles.flavor}>“{currentQuest.flavor}”</p>
            <p style={styles.smallDark}>
              Title unlock: complete this quest 3 times.
            </p>

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
  smallDark: {
    color: "#31572c",
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
