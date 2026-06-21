export type Mode = "Solo" | "Friends" | "Family" | "Date";

export type Setting =
  | "Indoor"
  | "Outdoor"
  | "City"
  | "Country";

export type TimeOfDay =
  | "Morning"
  | "Afternoon"
  | "Evening"
  | "Night"
  | "Anytime";

export type QuestTemplate = {
  title: string;
  xp: number;
  task: string;
  flavor: string;
  unlockTitle: string;
};

export type Quest = QuestTemplate & {
  mode: Mode;
  setting: Setting;
  time: TimeOfDay;
};
