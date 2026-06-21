import { QuestTemplate } from "../types";

export const questLibrary: Record<string, QuestTemplate[]> = {
  "Solo-Indoor-Morning": [
    {
      title: "Morning Reset",
      xp: 10,
      task: "Make your bed, drink water, and plan one useful thing for today.",
      flavor: "A tiny civilization has begun.",
      unlockTitle: "Morning Operator",
    },
    {
      title: "Kitchen Recon",
      xp: 10,
      task: "Prepare breakfast without touching your phone.",
      flavor: "The eggs demand your full attention.",
      unlockTitle: "Breakfast Ranger",
    },
    {
      title: "Sunrise Reader",
      xp: 15,
      task: "Read for 10 minutes before scrolling.",
      flavor: "Your brain requested a better breakfast.",
      unlockTitle: "Sunrise Scholar",
    },
    {
      title: "Stretch Protocol",
      xp: 10,
      task: "Stretch for 10 minutes.",
      flavor: "Your joints have submitted formal complaints.",
      unlockTitle: "Flex Keeper",
    },
    {
      title: "Window Watcher",
      xp: 10,
      task: "Spend 5 minutes observing the outside world.",
      flavor: "Free nature documentary. No subscription required.",
      unlockTitle: "Window Watcher",
    },
  ],
};
