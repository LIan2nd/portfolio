/**
 * Collection of 95+ fun, witty, and universally relatable English loading phrases for AI Assistant
 */
export const LOADING_PHRASES: string[] = [
  // 1. Thinking & Cooking
  "Thinking really hard... 🤔",
  "Cooking up a delicious response... 🍳",
  "Searching Alfian's digital memory... 🧠",
  "Turning words into wisdom... ⚡",
  "Brewing the perfect answer... ✍️",
  "Scanning portfolio & project archives... 🔍",
  "Steeping a fresh cup of coffee... ☕",
  "Awakening digital neurons... ✨",
  "Simmering ideas to perfection... 🍲",
  "Whisking up the best answer... 🥣",
  "Baking fresh insights... 🥐",
  "Seasoning with just the right words... 🧂",
  "Brewing a potion of clarity... 🧪",
  "Turning raw ideas into golden words... 🥘",
  "Taste-testing the response... 🍽️",

  // 2. Craft & Problem-Solving
  "Hunting down the missing puzzle piece... 🧩",
  "Untangling a web of thoughts... 🕸️",
  "Quickly consulting the archives... 📚",
  "Clearing the mental whiteboard... 🧹",
  "Launching knowledge into orbit... 🚀",
  "Breaking out of a thought loop... 🔄",
  "Sharpening the answer to perfection... ⏱️",
  "Consulting the rubber duck first... 🦆",
  "Crafting a crisp, clean response... 🧼",
  "Keeping every promise made... 🤝",
  "Shelving doubts, unpacking confidence... 📦",
  "Listening closely to the creative muse... 👂",
  "Double-checking all the details... 📦",
  "Decoding the question with care... 🪄",
  "Restarting the brainstorm engine... 🔌",
  "Building a safety net for this answer... 🛡️",
  "Spinning up fresh containers of thought... 🐳",
  "Running a lightning-fast brainstorm... ⚡",
  "Sorting through the memory archive... 🗂️",
  "Reading the instruction manual of life... 📖",

  // 3. AI & Smart Vibes
  "Measuring how relevant this answer is... 📐",
  "Processing Alfian's thoughts... 🎟️",
  "Tuning the response for accuracy... 🎛️",
  "Deflecting AI hallucinations... 🧘",
  "Searching the secret knowledge vault... 💾",
  "Filtering signal from background noise... 📡",
  "Connecting the dots behind the scenes... 🕸️",
  "Engaging deep reasoning mode... 💡",
  "Running at full speed ahead... 🏎️",
  "Fitting the right context together... 🧩",

  // 4. Coffee & Chill
  "Grinding robusta coffee beans... 🫘",
  "Pouring heart-shaped latte art... ☕",
  "Sipping hot tea for instant inspiration... 🫖",
  "Vibing in the creative zone... 🐧",
  "Enjoying the aesthetic vibes... 🎨",
  "Injecting pure caffeine into the circuits... 🔋",
  "Taking a brief aromatic tea break... 🍵",

  // 5. Gaming & Pop Culture
  "Loading Screen Tip: Remember to drink water! 💧",
  "Farming EXP for higher accuracy... 🎮",
  "Casting Level 99 insight spell... 🧙‍♂️",
  "Rolling a nat 20 on wisdom... 🎲",
  "Buffing intelligence stats... 🛡️",
  "Respawning at the nearest thought checkpoint... 🚩",
  "Dodging final boss challenges... 👾",
  "Critical hit insight incoming! 💥",
  "Exploring the open world of knowledge... 🗺️",
  "Side quest: finding the most poetic words... 🏹",

  // 6. Witty & Sarcastic LIand Clone Tone
  "Good things take time, hang tight... ⏳",
  "Typing speed: 9999 WPM... ⌨️",
  "Hold on, don't spam the button yet... 🛑",
  "Polishing words to sound aesthetic... 😎",
  "Ensuring response is 100% organic & nutritious... 🥦",
  "Reminiscing thesis defense glory days... 🎓",
  "Checking if this question is from my crush... 👀",
  "Holding back laughter while crafting reply... 🤭",
  "Brain running at peak performance... 🏃‍♂️",
  "Activating 3000 IQ digital clone mode... 🤖",
  "Flexing creative skills behind the scenes... 💪",
  "Polishing the final draft... 📝",
  "Dispatching response via express courier... 🚚",
  "Checking the creative weather forecast... ⛅",

  // 7. Philosophical & Exploratory
  "Pondering the mysteries of the universe... 🌌",
  "Seeking inspiration under the shade of a tree... 🌳",
  "Diving deep into the ocean of knowledge... 🌊",
  "Connecting the dots... 🔗",
  "Translating abstract dreams into clear text... 💭",
  "Assembling the puzzle of ideas... 🧩",
  "Lighting the lantern of understanding... 🏮",
  "Jumping across creative dimensions... 🚀",
  "Weighing the gravitas of every syllable... ⚖️",
  "Weaving threads of elegant solutions... 🧶",

  // 8. Extra Fun
  "Warm-up stretch for digital clone... 🤸",
  "Pinging the satellite of ideas... 🛰️",
  "Firing up the word generation engine... ⚙️",
  "Gathering spirit bomb energy... 🔮",
  "Flipping through portfolio pages... 📚",
  "Almost ready... 99.9% loaded! 📶",
  "Ding! Freshly baked answer coming up... 🛎️",
];

/**
 * Gets a single random loading phrase in English
 */
export function getRandomLoadingPhrase(): string {
  const randomIndex = Math.floor(Math.random() * LOADING_PHRASES.length);
  return LOADING_PHRASES[randomIndex];
}

/**
 * Gets a random index from the loading phrases array
 */
export function getRandomLoadingIndex(): number {
  return Math.floor(Math.random() * LOADING_PHRASES.length);
}
