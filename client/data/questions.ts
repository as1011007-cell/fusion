import { Panel } from "@/context/GameContext";

export type AnswerLayer = "common" | "honest" | "embarrassing";

export type QuestionOption = {
  text: string;
  isCorrect: boolean;
};

export type Question = {
  id: string;
  text: string;
  panelId: string;
  layer: AnswerLayer;
  options: QuestionOption[];
  category: string;
};

const questionTemplates: {
  text: string;
  panelId: string;
  layer: AnswerLayer;
  options: QuestionOption[];
  category: string;
}[] = [
  // GEN Z - COMMON
  { text: "What's the first thing Gen Z does when they wake up?", panelId: "gen-z", layer: "common", category: "daily-life", options: [{ text: "Check their phone", isCorrect: true }, { text: "Make breakfast", isCorrect: false }, { text: "Go for a run", isCorrect: false }, { text: "Read the news", isCorrect: false }] },
  { text: "What app do Gen Z use most?", panelId: "gen-z", layer: "common", category: "technology", options: [{ text: "TikTok", isCorrect: true }, { text: "Facebook", isCorrect: false }, { text: "LinkedIn", isCorrect: false }, { text: "Email", isCorrect: false }] },
  { text: "How does Gen Z prefer to communicate?", panelId: "gen-z", layer: "common", category: "communication", options: [{ text: "Text messages", isCorrect: true }, { text: "Phone calls", isCorrect: false }, { text: "In-person meetings", isCorrect: false }, { text: "Letters", isCorrect: false }] },
  { text: "What's Gen Z's favorite way to shop?", panelId: "gen-z", layer: "common", category: "shopping", options: [{ text: "Online shopping", isCorrect: true }, { text: "Mall shopping", isCorrect: false }, { text: "Catalog ordering", isCorrect: false }, { text: "Thrift stores only", isCorrect: false }] },
  { text: "What does Gen Z value most in a job?", panelId: "gen-z", layer: "common", category: "career", options: [{ text: "Work-life balance", isCorrect: true }, { text: "Corner office", isCorrect: false }, { text: "Company car", isCorrect: false }, { text: "Pension plan", isCorrect: false }] },
  { text: "How does Gen Z learn new skills?", panelId: "gen-z", layer: "common", category: "education", options: [{ text: "YouTube tutorials", isCorrect: true }, { text: "Library books", isCorrect: false }, { text: "Night classes", isCorrect: false }, { text: "Apprenticeships", isCorrect: false }] },
  { text: "What's Gen Z's go-to coffee order?", panelId: "gen-z", layer: "common", category: "food", options: [{ text: "Iced coffee with oat milk", isCorrect: true }, { text: "Black coffee", isCorrect: false }, { text: "Instant coffee", isCorrect: false }, { text: "Tea only", isCorrect: false }] },
  { text: "How does Gen Z handle disagreements?", panelId: "gen-z", layer: "common", category: "relationships", options: [{ text: "Ghost them", isCorrect: true }, { text: "Write a letter", isCorrect: false }, { text: "Schedule a meeting", isCorrect: false }, { text: "Send flowers", isCorrect: false }] },
  { text: "What's Gen Z's preferred content length?", panelId: "gen-z", layer: "common", category: "entertainment", options: [{ text: "60-second videos", isCorrect: true }, { text: "3-hour movies", isCorrect: false }, { text: "Full albums", isCorrect: false }, { text: "Long novels", isCorrect: false }] },
  { text: "How does Gen Z show they like something?", panelId: "gen-z", layer: "common", category: "social", options: [{ text: "Double tap to like", isCorrect: true }, { text: "Send a thank you card", isCorrect: false }, { text: "Call them", isCorrect: false }, { text: "Buy them a gift", isCorrect: false }] },

  // GEN Z - HONEST
  { text: "What's Gen Z honestly thinking during meetings?", panelId: "gen-z", layer: "honest", category: "work", options: [{ text: "This could have been an email", isCorrect: true }, { text: "Great leadership here", isCorrect: false }, { text: "I love meetings", isCorrect: false }, { text: "Very productive", isCorrect: false }] },
  { text: "Why does Gen Z really go to brunch?", panelId: "gen-z", layer: "honest", category: "social", options: [{ text: "For the Instagram pics", isCorrect: true }, { text: "Love of pancakes", isCorrect: false }, { text: "Nutritional value", isCorrect: false }, { text: "Family tradition", isCorrect: false }] },
  { text: "What's Gen Z's honest opinion on phone calls?", panelId: "gen-z", layer: "honest", category: "communication", options: [{ text: "Pure anxiety", isCorrect: true }, { text: "Love them", isCorrect: false }, { text: "Very professional", isCorrect: false }, { text: "Prefer them always", isCorrect: false }] },
  { text: "How does Gen Z honestly feel about adulting?", panelId: "gen-z", layer: "honest", category: "life", options: [{ text: "Terrifying and confusing", isCorrect: true }, { text: "Totally prepared", isCorrect: false }, { text: "Completely natural", isCorrect: false }, { text: "Love responsibilities", isCorrect: false }] },
  { text: "What's Gen Z's honest screen time?", panelId: "gen-z", layer: "honest", category: "technology", options: [{ text: "8+ hours daily", isCorrect: true }, { text: "30 minutes", isCorrect: false }, { text: "Only for work", isCorrect: false }, { text: "Very limited", isCorrect: false }] },

  // GEN Z - EMBARRASSING
  { text: "What embarrassing thing does Gen Z do at 3am?", panelId: "gen-z", layer: "embarrassing", category: "late-night", options: [{ text: "Stalk their ex online", isCorrect: true }, { text: "Study for exams", isCorrect: false }, { text: "Exercise", isCorrect: false }, { text: "Read philosophy", isCorrect: false }] },
  { text: "What does Gen Z secretly enjoy but won't admit?", panelId: "gen-z", layer: "embarrassing", category: "guilty-pleasures", options: [{ text: "Reality TV shows", isCorrect: true }, { text: "Classical music", isCorrect: false }, { text: "Gardening", isCorrect: false }, { text: "Bird watching", isCorrect: false }] },
  { text: "What's Gen Z's embarrassing online habit?", panelId: "gen-z", layer: "embarrassing", category: "technology", options: [{ text: "Accidentally liking old photos", isCorrect: true }, { text: "Too much productivity", isCorrect: false }, { text: "Excessive saving", isCorrect: false }, { text: "Over-planning", isCorrect: false }] },

  // DESI PARENTS - COMMON
  { text: "What do Desi parents ask about first?", panelId: "desi-parents", layer: "common", category: "family", options: [{ text: "When are you getting married?", isCorrect: true }, { text: "How's the weather?", isCorrect: false }, { text: "Any new hobbies?", isCorrect: false }, { text: "Read any good books?", isCorrect: false }] },
  { text: "What's a Desi parent's favorite achievement?", panelId: "desi-parents", layer: "common", category: "education", options: [{ text: "Doctor or engineer in the family", isCorrect: true }, { text: "Social media following", isCorrect: false }, { text: "Travel experiences", isCorrect: false }, { text: "Art collection", isCorrect: false }] },
  { text: "What do Desi parents compare most?", panelId: "desi-parents", layer: "common", category: "social", options: [{ text: "Their children to Sharma ji's son", isCorrect: true }, { text: "Cooking recipes", isCorrect: false }, { text: "Vacation photos", isCorrect: false }, { text: "Book collections", isCorrect: false }] },
  { text: "What's Desi parents' preferred medicine?", panelId: "desi-parents", layer: "common", category: "health", options: [{ text: "Haldi doodh (turmeric milk)", isCorrect: true }, { text: "Expensive supplements", isCorrect: false }, { text: "Modern medicine only", isCorrect: false }, { text: "Essential oils", isCorrect: false }] },
  { text: "What do Desi parents never throw away?", panelId: "desi-parents", layer: "common", category: "lifestyle", options: [{ text: "Plastic containers and bags", isCorrect: true }, { text: "Old newspapers", isCorrect: false }, { text: "Expired coupons", isCorrect: false }, { text: "Broken umbrellas", isCorrect: false }] },
  { text: "What's Desi parents' favorite time for phone calls?", panelId: "desi-parents", layer: "common", category: "communication", options: [{ text: "6 AM your time", isCorrect: true }, { text: "Business hours", isCorrect: false }, { text: "Late evening", isCorrect: false }, { text: "Text first", isCorrect: false }] },
  { text: "What do Desi parents always have extra of?", panelId: "desi-parents", layer: "common", category: "home", options: [{ text: "Food for guests", isCorrect: true }, { text: "Modern gadgets", isCorrect: false }, { text: "Fashion magazines", isCorrect: false }, { text: "Gaming consoles", isCorrect: false }] },
  { text: "What's Desi parents' reaction to AC usage?", panelId: "desi-parents", layer: "common", category: "home", options: [{ text: "Open the windows instead", isCorrect: true }, { text: "Turn it up higher", isCorrect: false }, { text: "No opinion", isCorrect: false }, { text: "Love the cold", isCorrect: false }] },

  // DESI PARENTS - HONEST
  { text: "What do Desi parents honestly worry about most?", panelId: "desi-parents", layer: "honest", category: "concerns", options: [{ text: "What will people say?", isCorrect: true }, { text: "Climate change", isCorrect: false }, { text: "Stock market", isCorrect: false }, { text: "Technology trends", isCorrect: false }] },
  { text: "Why do Desi parents really call so often?", panelId: "desi-parents", layer: "honest", category: "family", options: [{ text: "Miss their kids terribly", isCorrect: true }, { text: "To discuss finances", isCorrect: false }, { text: "Business updates", isCorrect: false }, { text: "Weather reports", isCorrect: false }] },
  { text: "What's Desi parents' honest opinion on dating?", panelId: "desi-parents", layer: "honest", category: "relationships", options: [{ text: "Terrified but pretending to be modern", isCorrect: true }, { text: "Fully supportive always", isCorrect: false }, { text: "No interest in it", isCorrect: false }, { text: "Too busy to care", isCorrect: false }] },

  // DESI PARENTS - EMBARRASSING
  { text: "What embarrassing thing do Desi parents do at weddings?", panelId: "desi-parents", layer: "embarrassing", category: "social", options: [{ text: "Point out single people to their kids", isCorrect: true }, { text: "Dance professionally", isCorrect: false }, { text: "Leave early", isCorrect: false }, { text: "Skip the food", isCorrect: false }] },
  { text: "What do Desi parents secretly do on Facebook?", panelId: "desi-parents", layer: "embarrassing", category: "technology", options: [{ text: "Share every family photo publicly", isCorrect: true }, { text: "Only read news", isCorrect: false }, { text: "Never post anything", isCorrect: false }, { text: "Perfect privacy settings", isCorrect: false }] },

  // HUSTLERS - COMMON
  { text: "What does a hustler check first every morning?", panelId: "hustlers", layer: "common", category: "business", options: [{ text: "Stock prices and crypto", isCorrect: true }, { text: "Weather forecast", isCorrect: false }, { text: "Horoscope", isCorrect: false }, { text: "Sports scores", isCorrect: false }] },
  { text: "What's a hustler's favorite topic?", panelId: "hustlers", layer: "common", category: "conversation", options: [{ text: "Passive income streams", isCorrect: true }, { text: "Weekend plans", isCorrect: false }, { text: "TV shows", isCorrect: false }, { text: "Local news", isCorrect: false }] },
  { text: "How does a hustler describe their job?", panelId: "hustlers", layer: "common", category: "career", options: [{ text: "Serial entrepreneur", isCorrect: true }, { text: "Employee", isCorrect: false }, { text: "Works 9-5", isCorrect: false }, { text: "Retired early", isCorrect: false }] },
  { text: "What book is always on a hustler's desk?", panelId: "hustlers", layer: "common", category: "education", options: [{ text: "Rich Dad Poor Dad", isCorrect: true }, { text: "Romance novels", isCorrect: false }, { text: "Cookbooks", isCorrect: false }, { text: "Travel guides", isCorrect: false }] },
  { text: "What's a hustler's ideal vacation?", panelId: "hustlers", layer: "common", category: "lifestyle", options: [{ text: "Networking retreat in Bali", isCorrect: true }, { text: "Unplugged beach vacation", isCorrect: false }, { text: "Staycation", isCorrect: false }, { text: "Camping trip", isCorrect: false }] },
  { text: "What podcast does a hustler listen to?", panelId: "hustlers", layer: "common", category: "media", options: [{ text: "Business and motivation", isCorrect: true }, { text: "True crime", isCorrect: false }, { text: "Comedy", isCorrect: false }, { text: "Fiction audiobooks", isCorrect: false }] },
  { text: "What does a hustler wear to casual events?", panelId: "hustlers", layer: "common", category: "fashion", options: [{ text: "Branded athleisure", isCorrect: true }, { text: "Formal suits", isCorrect: false }, { text: "Vintage clothing", isCorrect: false }, { text: "Whatever's clean", isCorrect: false }] },

  // HUSTLERS - HONEST
  { text: "What's a hustler honestly thinking at parties?", panelId: "hustlers", layer: "honest", category: "social", options: [{ text: "Who here can I network with?", isCorrect: true }, { text: "Great music here", isCorrect: false }, { text: "Love the decorations", isCorrect: false }, { text: "Time to relax", isCorrect: false }] },
  { text: "What do hustlers honestly feel about 9-5 jobs?", panelId: "hustlers", layer: "honest", category: "career", options: [{ text: "Trading time for money trap", isCorrect: true }, { text: "Great stability", isCorrect: false }, { text: "Perfect lifestyle", isCorrect: false }, { text: "Dream career path", isCorrect: false }] },
  { text: "Why do hustlers really post on LinkedIn?", panelId: "hustlers", layer: "honest", category: "social-media", options: [{ text: "Personal branding and leads", isCorrect: true }, { text: "Share knowledge freely", isCorrect: false }, { text: "Stay in touch", isCorrect: false }, { text: "Bored at lunch", isCorrect: false }] },

  // HUSTLERS - EMBARRASSING
  { text: "What embarrassing thing do hustlers do on dates?", panelId: "hustlers", layer: "embarrassing", category: "relationships", options: [{ text: "Talk about their business the whole time", isCorrect: true }, { text: "Listen attentively", isCorrect: false }, { text: "Never mention work", isCorrect: false }, { text: "Focus on romance", isCorrect: false }] },
  { text: "What do hustlers secretly watch at night?", panelId: "hustlers", layer: "embarrassing", category: "entertainment", options: [{ text: "Reality TV instead of business content", isCorrect: true }, { text: "More business lectures", isCorrect: false }, { text: "Educational documentaries", isCorrect: false }, { text: "Nothing, just work", isCorrect: false }] },

  // ARTISTS - COMMON
  { text: "What inspires artists most?", panelId: "artists", layer: "common", category: "creativity", options: [{ text: "Everyday life moments", isCorrect: true }, { text: "Spreadsheets", isCorrect: false }, { text: "Corporate meetings", isCorrect: false }, { text: "Tax documents", isCorrect: false }] },
  { text: "Where do artists prefer to work?", panelId: "artists", layer: "common", category: "workspace", options: [{ text: "Cozy coffee shops", isCorrect: true }, { text: "Cubicle offices", isCorrect: false }, { text: "Board rooms", isCorrect: false }, { text: "Factories", isCorrect: false }] },
  { text: "What's an artist's preferred schedule?", panelId: "artists", layer: "common", category: "lifestyle", options: [{ text: "Creative at midnight", isCorrect: true }, { text: "9-5 sharp", isCorrect: false }, { text: "Early bird routine", isCorrect: false }, { text: "Strict schedules", isCorrect: false }] },
  { text: "How do artists describe their style?", panelId: "artists", layer: "common", category: "fashion", options: [{ text: "Eclectic and unique", isCorrect: true }, { text: "Business casual", isCorrect: false }, { text: "Sports uniforms", isCorrect: false }, { text: "Plain and simple", isCorrect: false }] },
  { text: "What's an artist's view on rules?", panelId: "artists", layer: "common", category: "philosophy", options: [{ text: "Made to be broken", isCorrect: true }, { text: "Strictly follow them", isCorrect: false }, { text: "Create more rules", isCorrect: false }, { text: "Love bureaucracy", isCorrect: false }] },
  { text: "How do artists handle criticism?", panelId: "artists", layer: "common", category: "feedback", options: [{ text: "Take it personally but grow", isCorrect: true }, { text: "Ignore it completely", isCorrect: false }, { text: "Get defensive always", isCorrect: false }, { text: "Change everything immediately", isCorrect: false }] },

  // ARTISTS - HONEST
  { text: "What's an artist honestly thinking about money?", panelId: "artists", layer: "honest", category: "finances", options: [{ text: "Wish I had more stability", isCorrect: true }, { text: "Money is everything", isCorrect: false }, { text: "Don't need any", isCorrect: false }, { text: "Love budgeting", isCorrect: false }] },
  { text: "Why do artists really procrastinate?", panelId: "artists", layer: "honest", category: "work", options: [{ text: "Fear of not being good enough", isCorrect: true }, { text: "Too organized", isCorrect: false }, { text: "Nothing to do", isCorrect: false }, { text: "Work is boring", isCorrect: false }] },
  { text: "What do artists honestly think about exposure as payment?", panelId: "artists", layer: "honest", category: "business", options: [{ text: "Can't pay rent with exposure", isCorrect: true }, { text: "Love working for free", isCorrect: false }, { text: "Best payment method", isCorrect: false }, { text: "Always accept it", isCorrect: false }] },

  // ARTISTS - EMBARRASSING
  { text: "What embarrassing thing do artists do when stuck?", panelId: "artists", layer: "embarrassing", category: "creativity", options: [{ text: "Blame the algorithm", isCorrect: true }, { text: "Work harder", isCorrect: false }, { text: "Take a calm break", isCorrect: false }, { text: "Stay productive", isCorrect: false }] },
  { text: "What do artists secretly compare?", panelId: "artists", layer: "embarrassing", category: "social", options: [{ text: "Their follower count to peers", isCorrect: true }, { text: "Nothing at all", isCorrect: false }, { text: "Only recipes", isCorrect: false }, { text: "Sleep schedules", isCorrect: false }] },

  // OFFICE WORKERS - COMMON
  { text: "What gets office workers through Monday?", panelId: "office-workers", layer: "common", category: "survival", options: [{ text: "Coffee and counting to Friday", isCorrect: true }, { text: "Pure enthusiasm", isCorrect: false }, { text: "Love of spreadsheets", isCorrect: false }, { text: "Monday is favorite day", isCorrect: false }] },
  { text: "What do office workers talk about at lunch?", panelId: "office-workers", layer: "common", category: "social", options: [{ text: "Weekend plans and office drama", isCorrect: true }, { text: "Advanced physics", isCorrect: false }, { text: "Philosophy debates", isCorrect: false }, { text: "Global economics", isCorrect: false }] },
  { text: "What's an office worker's dream?", panelId: "office-workers", layer: "common", category: "aspirations", options: [{ text: "Working from home permanently", isCorrect: true }, { text: "More meetings", isCorrect: false }, { text: "Longer commute", isCorrect: false }, { text: "No vacation ever", isCorrect: false }] },
  { text: "What do office workers fear most?", panelId: "office-workers", layer: "common", category: "work", options: [{ text: "Reply-all accidents", isCorrect: true }, { text: "Getting promoted", isCorrect: false }, { text: "Free snacks", isCorrect: false }, { text: "Early finish", isCorrect: false }] },
  { text: "What's an office worker's favorite email?", panelId: "office-workers", layer: "common", category: "communication", options: [{ text: "Meeting cancelled", isCorrect: true }, { text: "New project assigned", isCorrect: false }, { text: "Urgent deadline", isCorrect: false }, { text: "Performance review", isCorrect: false }] },
  { text: "How do office workers celebrate wins?", panelId: "office-workers", layer: "common", category: "culture", options: [{ text: "Free pizza in break room", isCorrect: true }, { text: "Champagne toast", isCorrect: false }, { text: "Company yacht trip", isCorrect: false }, { text: "Personal butler", isCorrect: false }] },

  // OFFICE WORKERS - HONEST
  { text: "What are office workers honestly doing in meetings?", panelId: "office-workers", layer: "honest", category: "meetings", options: [{ text: "Online shopping or zoning out", isCorrect: true }, { text: "Taking perfect notes", isCorrect: false }, { text: "Fully engaged always", isCorrect: false }, { text: "Leading discussion", isCorrect: false }] },
  { text: "Why do office workers really take sick days?", panelId: "office-workers", layer: "honest", category: "time-off", options: [{ text: "Mental health breaks", isCorrect: true }, { text: "Actually dying sick", isCorrect: false }, { text: "Love the office too much", isCorrect: false }, { text: "Never take them", isCorrect: false }] },
  { text: "What do office workers honestly think about open offices?", panelId: "office-workers", layer: "honest", category: "workspace", options: [{ text: "Hate the lack of privacy", isCorrect: true }, { text: "Love being watched", isCorrect: false }, { text: "Great for focus", isCorrect: false }, { text: "Perfect design", isCorrect: false }] },

  // OFFICE WORKERS - EMBARRASSING
  { text: "What embarrassing thing do office workers do during calls?", panelId: "office-workers", layer: "embarrassing", category: "remote-work", options: [{ text: "Forget they're not on mute", isCorrect: true }, { text: "Perfect professionalism", isCorrect: false }, { text: "Always camera ready", isCorrect: false }, { text: "Love video calls", isCorrect: false }] },
  { text: "What do office workers do when boss walks by?", panelId: "office-workers", layer: "embarrassing", category: "behavior", options: [{ text: "Quickly switch from social media", isCorrect: true }, { text: "Wave enthusiastically", isCorrect: false }, { text: "Continue working calmly", isCorrect: false }, { text: "Start a conversation", isCorrect: false }] },

  // SMALL TOWN FAMILIES - COMMON
  { text: "What do small-town families value most?", panelId: "small-town", layer: "common", category: "values", options: [{ text: "Community and tradition", isCorrect: true }, { text: "Anonymity", isCorrect: false }, { text: "Fast-paced life", isCorrect: false }, { text: "Constant change", isCorrect: false }] },
  { text: "What's a small-town family's weekend activity?", panelId: "small-town", layer: "common", category: "lifestyle", options: [{ text: "Church and family BBQ", isCorrect: true }, { text: "Clubbing downtown", isCorrect: false }, { text: "Art gallery hopping", isCorrect: false }, { text: "Escape rooms", isCorrect: false }] },
  { text: "How do small-town families get news?", panelId: "small-town", layer: "common", category: "communication", options: [{ text: "Local gossip network", isCorrect: true }, { text: "Only Twitter", isCorrect: false }, { text: "International news only", isCorrect: false }, { text: "Never follow news", isCorrect: false }] },
  { text: "What do small-town families think of city life?", panelId: "small-town", layer: "common", category: "opinions", options: [{ text: "Too fast and expensive", isCorrect: true }, { text: "Want to move there", isCorrect: false }, { text: "Perfect for everyone", isCorrect: false }, { text: "No opinion", isCorrect: false }] },
  { text: "What's a small-town family's prized possession?", panelId: "small-town", layer: "common", category: "possessions", options: [{ text: "Family recipes and heirlooms", isCorrect: true }, { text: "Latest gadgets", isCorrect: false }, { text: "Designer clothes", isCorrect: false }, { text: "Art collections", isCorrect: false }] },

  // SMALL TOWN - HONEST
  { text: "What do small-town families honestly think about newcomers?", panelId: "small-town", layer: "honest", category: "social", options: [{ text: "Suspicious but curious", isCorrect: true }, { text: "Immediately welcoming", isCorrect: false }, { text: "Don't notice them", isCorrect: false }, { text: "Move away", isCorrect: false }] },
  { text: "Why do small-town families really know everyone's business?", panelId: "small-town", layer: "honest", category: "community", options: [{ text: "It's entertainment", isCorrect: true }, { text: "Security concerns", isCorrect: false }, { text: "Professional duty", isCorrect: false }, { text: "Don't actually know", isCorrect: false }] },

  // SMALL TOWN - EMBARRASSING
  { text: "What embarrassing thing happens at small-town events?", panelId: "small-town", layer: "embarrassing", category: "social", options: [{ text: "Running into every ex", isCorrect: true }, { text: "Perfect anonymity", isCorrect: false }, { text: "No awkward moments", isCorrect: false }, { text: "Only strangers attend", isCorrect: false }] },
  { text: "What do small-town families secretly watch?", panelId: "small-town", layer: "embarrassing", category: "entertainment", options: [{ text: "Big city reality shows", isCorrect: true }, { text: "Only local news", isCorrect: false }, { text: "Educational only", isCorrect: false }, { text: "Nothing at all", isCorrect: false }] },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateVariations(template: typeof questionTemplates[0], count: number): Question[] {
  const variations: Question[] = [];
  const synonyms: Record<string, string[]> = {
    "first": ["main", "primary", "go-to", "favorite"],
    "most": ["primarily", "mainly", "especially", "particularly"],
    "think": ["feel", "believe", "consider", "say"],
    "do": ["handle", "approach", "deal with", "manage"],
  };

  for (let i = 0; i < count; i++) {
    let text = template.text;
    Object.entries(synonyms).forEach(([word, alternatives]) => {
      if (text.toLowerCase().includes(word) && Math.random() > 0.5) {
        const alt = alternatives[Math.floor(Math.random() * alternatives.length)];
        text = text.replace(new RegExp(word, 'i'), alt);
      }
    });

    variations.push({
      id: generateId(),
      text: i === 0 ? template.text : text,
      panelId: template.panelId,
      layer: template.layer,
      options: shuffleArray(template.options),
      category: template.category,
    });
  }

  return variations;
}

function generateMassQuestions(): Question[] {
  const allQuestions: Question[] = [];
  
  questionTemplates.forEach((template) => {
    const variations = generateVariations(template, 50);
    allQuestions.push(...variations);
  });

  const additionalTopics = [
    { panelId: "gen-z", topics: ["social media", "music", "fashion", "slang", "dating", "food", "travel", "gaming", "streaming", "memes"] },
    { panelId: "desi-parents", topics: ["festivals", "food", "savings", "respect", "education", "marriage", "health", "religion", "family", "traditions"] },
    { panelId: "hustlers", topics: ["investments", "networking", "startups", "motivation", "productivity", "success", "failure", "mentors", "goals", "mindset"] },
    { panelId: "artists", topics: ["inspiration", "creativity", "galleries", "rejection", "success", "community", "tools", "style", "growth", "collaboration"] },
    { panelId: "office-workers", topics: ["deadlines", "promotions", "colleagues", "emails", "meetings", "breaks", "commute", "dress code", "reviews", "teamwork"] },
    { panelId: "small-town", topics: ["neighbors", "festivals", "sports", "schools", "churches", "farms", "businesses", "weather", "politics", "change"] },
  ];

  const questionFormats = [
    "What do [PANEL] think about [TOPIC]?",
    "How do [PANEL] handle [TOPIC]?",
    "What's [PANEL]'s view on [TOPIC]?",
    "Why do [PANEL] care about [TOPIC]?",
    "What would [PANEL] say about [TOPIC]?",
    "How important is [TOPIC] to [PANEL]?",
    "What's [PANEL]'s biggest [TOPIC] challenge?",
    "What do [PANEL] secretly think about [TOPIC]?",
  ];

  const panelNames: Record<string, string> = {
    "gen-z": "Gen Z",
    "desi-parents": "Desi Parents",
    "hustlers": "Hustlers",
    "artists": "Artists",
    "office-workers": "Office Workers",
    "small-town": "Small Town Families",
  };

  const genericOptions = {
    "gen-z": [
      ["Very important for identity", "Not really relevant", "Outdated concept", "Parents decide this"],
      ["Share it online immediately", "Keep it private always", "Ask manager first", "Ignore it completely"],
      ["Obsessed with it", "Couldn't care less", "Old people thing", "Corporate stuff"],
      ["It's their whole personality", "Never think about it", "Parents handle it", "What's that?"],
    ],
    "desi-parents": [
      ["Essential for family honor", "Western nonsense", "Children should decide", "Not important at all"],
      ["Compare with neighbors", "Mind own business", "Modern approach", "Ask astrologer"],
      ["Traditional way is best", "Try new things", "Whatever kids want", "Ignore it"],
      ["Worry about it constantly", "Very relaxed about it", "Let fate decide", "Technology solves it"],
    ],
    "hustlers": [
      ["Great for networking", "Waste of time", "Need to monetize it", "Delegate to assistant"],
      ["Turn it into a business", "Keep it casual", "Not worth the effort", "Already mastered it"],
      ["ROI matters most", "Follow your passion", "Wait for right moment", "Ask your mentor"],
      ["Hustle through it", "Take a break", "Outsource it", "Pivot completely"],
    ],
    "artists": [
      ["Perfect for inspiration", "Kills creativity", "Need more funding", "Society doesn't understand"],
      ["Express it through art", "Ignore and create", "Commercial opportunity", "Deep philosophical meaning"],
      ["Follow your vision", "Sell out for money", "What the galleries want", "Pure self-expression"],
      ["Part of the struggle", "Sign of success", "Commercialization", "Authentic experience"],
    ],
    "office-workers": [
      ["Affects work-life balance", "Company policy issue", "Not my problem", "HR should handle"],
      ["Survive until Friday", "Actually productive", "Great for career", "Time to update resume"],
      ["Hate it but accept it", "Love it secretly", "What everyone does", "Against the rules"],
      ["Email about it", "Ignore until Monday", "Someone else's problem", "Annual review topic"],
    ],
    "small-town": [
      ["Community handles it", "City folk problem", "Church decides", "Always been this way"],
      ["Neighbors will know", "Keep it private", "Town meeting topic", "Kids these days"],
      ["Traditional values first", "Times are changing", "Not our business", "Everyone's talking about it"],
      ["Like our parents did", "Modern approach", "Ask the elders", "Newcomers brought this"],
    ],
  };

  additionalTopics.forEach(({ panelId, topics }) => {
    topics.forEach((topic) => {
      const layers: AnswerLayer[] = ["common", "honest", "embarrassing"];
      layers.forEach((layer) => {
        const format = questionFormats[Math.floor(Math.random() * questionFormats.length)];
        const questionText = format
          .replace("[PANEL]", panelNames[panelId])
          .replace("[TOPIC]", topic);

        const optionSet = genericOptions[panelId as keyof typeof genericOptions];
        const randomOptions = optionSet[Math.floor(Math.random() * optionSet.length)];
        
        for (let i = 0; i < 10; i++) {
          allQuestions.push({
            id: generateId(),
            text: questionText,
            panelId,
            layer,
            category: topic,
            options: shuffleArray([
              { text: randomOptions[0], isCorrect: true },
              { text: randomOptions[1], isCorrect: false },
              { text: randomOptions[2], isCorrect: false },
              { text: randomOptions[3], isCorrect: false },
            ]),
          });
        }
      });
    });
  });

  return shuffleArray(allQuestions);
}

export const allQuestions = generateMassQuestions();

export function getQuestionsForPanel(panelId: string, layer: AnswerLayer, count: number = 5): Question[] {
  const filtered = allQuestions.filter(q => q.panelId === panelId && q.layer === layer);
  return shuffleArray(filtered).slice(0, count);
}

export function getRandomQuestions(count: number = 5): Question[] {
  return shuffleArray(allQuestions).slice(0, count);
}

export function getDailyChallenge(): Question[] {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  const seededRandom = (index: number) => {
    const x = Math.sin(seed + index) * 10000;
    return x - Math.floor(x);
  };

  const panels = ["gen-z", "desi-parents", "hustlers", "artists", "office-workers", "small-town"];
  const dailyQuestions: Question[] = [];

  panels.forEach((panelId, index) => {
    const panelQuestions = allQuestions.filter(q => q.panelId === panelId);
    const questionIndex = Math.floor(seededRandom(index) * panelQuestions.length);
    if (panelQuestions[questionIndex]) {
      dailyQuestions.push(panelQuestions[questionIndex]);
    }
  });

  return dailyQuestions.slice(0, 10);
}

console.log(`Generated ${allQuestions.length} questions`);
