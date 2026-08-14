/**
 * Collection of 95+ fun, witty, developer-themed English loading phrases for AI Assistant
 */
export const LOADING_PHRASES: string[] = [
  // 1. Thinking & Cooking
  "Thinking really hard... 🤔",
  "Cooking up a delicious response... 🍳",
  "Searching Alfian's digital memory... 🧠",
  "Compiling words into wisdom... ⚡",
  "Brewing the perfect answer... ✍️",
  "Scanning portfolio & project archives... 🔍",
  "Steeping a fresh cup of coffee... ☕",
  "Awakening digital neurons... ✨",
  "Simmering ideas to perfection... 🍲",
  "Whisking up optimal algorithms... 🥣",
  "Baking fresh insights... 🥐",
  "Seasoning with rhetorical spices... 🧂",
  "Brewing a potion of clarity... 🧪",
  "Sautéing raw data into gold... 🥘",
  "Taste-testing the response... 🍽️",

  // 2. Developer & Coding Humor
  "Hunting down a rogue missing semicolon... 🐛",
  "Resolving merge conflicts in my mind... 🔀",
  "Quickly consulting Stack Overflow archives... 📚",
  "Clearing console.log spam from brain... 🧹",
  "Pushing knowledge straight to main branch... 🚀",
  "Dodging an infinite while loop... 🔄",
  "Optimizing Big-O complexity of this reply... ⏱️",
  "Consulting the rubber duck first... 🦆",
  "Writing clean, DRY code for this response... 🧼",
  "Resolving internal promises... 🤝",
  "Git stash doubts, git pop certainty... 📦",
  "Listening closely to compiler whispers... 👂",
  "Checking package dependencies... 📦",
  "Parsing request with arcane regex magic... 🪄",
  "Rebooting localhost brain server... 🔌",
  "Preventing NullPointerException... 🛡️",
  "Spinning up Docker containers of thought... 🐳",
  "Executing indexed SQL queries... ⚡",
  "De-indexing past cache memories... 🗂️",
  "Reading life's API documentation... 📖",

  // 3. AI & Data Science
  "Calculating semantic cosine similarity... 📐",
  "Tokenizing Alfian's thoughts... 🎟️",
  "Fine-tuning weights in the background... 🎛️",
  "Deflecting AI hallucinations... 🧘",
  "Querying secret vector embeddings... 💾",
  "Filtering signal from background noise... 📡",
  "Syncing neural network weights... 🕸️",
  "Engaging deep reasoning mode... 💡",
  "Running lightning-fast inference... 🏎️",
  "Embedding semantic context vectors... 🧩",

  // 4. Coffee & Chill
  "Grinding robusta coffee beans... 🫘",
  "Pouring curly bracket latte art... ☕",
  "Sipping hot tea for instant inspiration... 🫖",
  "Chilling in the Linux terminal... 🐧",
  "Enjoying the syntax highlighting vibes... 🎨",
  "Injecting pure caffeine into the circuits... 🔋",
  "Taking a brief aromatic tea break... 🍵",

  // 5. Gaming & Pop Culture
  "Loading Screen Tip: Remember to drink water! 💧",
  "Farming EXP for higher accuracy... 🎮",
  "Casting Level 99 insight spell... 🧙‍♂️",
  "Rolling a nat 20 on wisdom... 🎲",
  "Buffing intelligence stats... 🛡️",
  "Respawning at the nearest thought checkpoint... 🚩",
  "Dodging final boss bugs... 👾",
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
  "Brain quota running at peak performance... 🏃‍♂️",
  "Activating 3000 IQ digital clone mode... 🤖",
  "Flexing dev skills behind the scenes... 💪",
  "Polishing markdown formatting... 📝",
  "Dispatching response via express courier... 🚚",
  "Checking server weather forecasts... ⛅",

  // 7. Philosophical & Exploratory
  "Pondering the mysteries of the coding universe... 🌌",
  "Seeking inspiration under the binary tree... 🌳",
  "Diving deep into the data ocean... 🌊",
  "Connecting the logical dots... 🔗",
  "Translating abstract dreams into clean text... 💭",
  "Assembling the puzzle of arguments... 🧩",
  "Lighting the lantern of understanding... 🏮",
  "Jumping across paradigm dimensions... 🚀",
  "Weighing the gravitas of every syllable... ⚖️",
  "Weaving threads of elegant solutions... 🧶",

  // 8. Extra Fun
  "Warm-up stretch for digital clone... 🤸",
  "Pinging satellite uplink of ideas... 🛰️",
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
