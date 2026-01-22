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

type QuestionTemplate = {
  text: string;
  correct: string;
  wrong: string[];
  category: string;
};

type PanelQuestionSet = {
  panelId: string;
  common: QuestionTemplate[];
  honest: QuestionTemplate[];
  embarrassing: QuestionTemplate[];
};

const questionSets: PanelQuestionSet[] = [
  {
    panelId: "gen-z",
    common: [
      { text: "What's the first thing Gen Z does when they wake up?", correct: "Check their phone", wrong: ["Make breakfast", "Go for a run", "Read the news"], category: "daily-life" },
      { text: "What app do Gen Z use most?", correct: "TikTok", wrong: ["Facebook", "LinkedIn", "Email"], category: "technology" },
      { text: "How does Gen Z prefer to communicate?", correct: "Text messages", wrong: ["Phone calls", "In-person meetings", "Letters"], category: "communication" },
      { text: "What's Gen Z's favorite way to shop?", correct: "Online shopping", wrong: ["Mall shopping", "Catalog ordering", "Thrift stores only"], category: "shopping" },
      { text: "What does Gen Z value most in a job?", correct: "Work-life balance", wrong: ["Corner office", "Company car", "Pension plan"], category: "career" },
      { text: "How does Gen Z learn new skills?", correct: "YouTube tutorials", wrong: ["Library books", "Night classes", "Apprenticeships"], category: "education" },
      { text: "What's Gen Z's go-to coffee order?", correct: "Iced coffee with oat milk", wrong: ["Black coffee", "Instant coffee", "Tea only"], category: "food" },
      { text: "How does Gen Z handle disagreements?", correct: "Ghost them", wrong: ["Write a letter", "Schedule a meeting", "Send flowers"], category: "relationships" },
      { text: "What's Gen Z's preferred content length?", correct: "60-second videos", wrong: ["3-hour movies", "Full albums", "Long novels"], category: "entertainment" },
      { text: "How does Gen Z show they like something?", correct: "Double tap to like", wrong: ["Send a thank you card", "Call them", "Buy them a gift"], category: "social" },
      { text: "What's Gen Z's preferred social platform for updates?", correct: "Instagram Stories", wrong: ["Newspaper", "Radio", "Email newsletter"], category: "media" },
      { text: "How does Gen Z prefer to pay?", correct: "Apple Pay or Venmo", wrong: ["Cash only", "Checks", "Money order"], category: "finance" },
      { text: "What's Gen Z's relationship with TV?", correct: "Stream everything", wrong: ["Cable TV", "Antenna only", "DVDs"], category: "entertainment" },
      { text: "How does Gen Z take notes?", correct: "Phone screenshots", wrong: ["Handwritten notebooks", "Typewriter", "Dictaphone"], category: "education" },
      { text: "What's Gen Z's favorite way to meet people?", correct: "Dating apps", wrong: ["Church socials", "Arranged meetings", "Newspaper ads"], category: "relationships" },
      { text: "How does Gen Z express excitement?", correct: "SCREAMING in all caps", wrong: ["Formal letter", "Firm handshake", "Slight nod"], category: "communication" },
      { text: "What does Gen Z think about home phones?", correct: "What's a home phone?", wrong: ["Essential device", "Use it daily", "Prefer it"], category: "technology" },
      { text: "How does Gen Z plan events?", correct: "Group chat", wrong: ["Formal invitations", "Phone tree", "Bulletin board"], category: "social" },
      { text: "What's Gen Z's stance on email?", correct: "Too formal and slow", wrong: ["Best communication", "Use it constantly", "Love it"], category: "communication" },
      { text: "How does Gen Z handle FOMO?", correct: "Check social media constantly", wrong: ["Accept they miss things", "Don't care", "Stay offline"], category: "mental-health" },
    ],
    honest: [
      { text: "What's Gen Z honestly thinking during meetings?", correct: "This could have been an email", wrong: ["Great leadership here", "I love meetings", "Very productive"], category: "work" },
      { text: "Why does Gen Z really go to brunch?", correct: "For the Instagram pics", wrong: ["Love of pancakes", "Nutritional value", "Family tradition"], category: "social" },
      { text: "What's Gen Z's honest opinion on phone calls?", correct: "Pure anxiety", wrong: ["Love them", "Very professional", "Prefer them always"], category: "communication" },
      { text: "How does Gen Z honestly feel about adulting?", correct: "Terrifying and confusing", wrong: ["Totally prepared", "Completely natural", "Love responsibilities"], category: "life" },
      { text: "What's Gen Z's honest screen time?", correct: "8+ hours daily", wrong: ["30 minutes", "Only for work", "Very limited"], category: "technology" },
      { text: "Why does Gen Z really post outfit pics?", correct: "Validation through likes", wrong: ["Document fashion history", "For future reference", "Share with family"], category: "social-media" },
      { text: "What's Gen Z's honest reaction to voicemails?", correct: "Delete without listening", wrong: ["Listen immediately", "Save them all", "Call back right away"], category: "communication" },
      { text: "How does Gen Z really feel about their future?", correct: "Climate anxiety is real", wrong: ["Totally optimistic", "Not worried at all", "Everything is fine"], category: "mental-health" },
      { text: "What's Gen Z's honest thought on hustle culture?", correct: "Exhausting but feel pressured", wrong: ["Love every minute", "Born to hustle", "Can't wait to work more"], category: "career" },
      { text: "Why does Gen Z really stay up late?", correct: "Revenge bedtime procrastination", wrong: ["Productive work", "Exercise", "Reading textbooks"], category: "lifestyle" },
    ],
    embarrassing: [
      { text: "What embarrassing thing does Gen Z do at 3am?", correct: "Stalk their ex online", wrong: ["Study for exams", "Exercise", "Read philosophy"], category: "late-night" },
      { text: "What does Gen Z secretly enjoy but won't admit?", correct: "Reality TV shows", wrong: ["Classical music", "Gardening", "Bird watching"], category: "guilty-pleasures" },
      { text: "What's Gen Z's embarrassing online habit?", correct: "Accidentally liking old photos", wrong: ["Too much productivity", "Excessive saving", "Over-planning"], category: "technology" },
      { text: "What does Gen Z cry about at 2am?", correct: "Existential dread from a TikTok", wrong: ["Work achievements", "Exercise gains", "Productivity goals"], category: "late-night" },
      { text: "What embarrassing thing does Gen Z google?", correct: "How to do basic adult tasks", wrong: ["Advanced calculus", "Stock trading", "Home repairs"], category: "adulting" },
      { text: "What does Gen Z pretend to understand?", correct: "Cryptocurrency", wrong: ["Simple math", "Basic cooking", "Walking"], category: "knowledge" },
      { text: "What's Gen Z's embarrassing music guilty pleasure?", correct: "Early 2000s pop hits", wrong: ["Only indie music", "Jazz exclusively", "Opera"], category: "music" },
      { text: "What does Gen Z do when no one's watching?", correct: "Practice TikTok dances", wrong: ["Clean thoroughly", "Exercise intensely", "Study hard"], category: "secrets" },
    ],
  },
  {
    panelId: "desi-parents",
    common: [
      { text: "What do Desi parents ask about first?", correct: "When are you getting married?", wrong: ["How's the weather?", "Any new hobbies?", "Read any good books?"], category: "family" },
      { text: "What's a Desi parent's favorite achievement?", correct: "Doctor or engineer in the family", wrong: ["Social media following", "Travel experiences", "Art collection"], category: "education" },
      { text: "What do Desi parents compare most?", correct: "Their children to Sharma ji's son", wrong: ["Cooking recipes", "Vacation photos", "Book collections"], category: "social" },
      { text: "What's Desi parents' preferred medicine?", correct: "Haldi doodh (turmeric milk)", wrong: ["Expensive supplements", "Modern medicine only", "Essential oils"], category: "health" },
      { text: "What do Desi parents never throw away?", correct: "Plastic containers and bags", wrong: ["Old newspapers", "Expired coupons", "Broken umbrellas"], category: "lifestyle" },
      { text: "What's Desi parents' favorite time for phone calls?", correct: "6 AM your time", wrong: ["Business hours", "Late evening", "Text first"], category: "communication" },
      { text: "What do Desi parents always have extra of?", correct: "Food for guests", wrong: ["Modern gadgets", "Fashion magazines", "Gaming consoles"], category: "home" },
      { text: "What's Desi parents' reaction to AC usage?", correct: "Open the windows instead", wrong: ["Turn it up higher", "No opinion", "Love the cold"], category: "home" },
      { text: "What do Desi parents gift at weddings?", correct: "Cash in decorated envelopes", wrong: ["Gift cards", "Appliances", "Art pieces"], category: "traditions" },
      { text: "What's Desi parents' cure for everything?", correct: "Drink more water and sleep early", wrong: ["Visit doctor immediately", "Take expensive medicine", "Rest for a week"], category: "health" },
      { text: "What do Desi parents think about rent?", correct: "Why rent when you can stay with us?", wrong: ["Independence is great", "Move out young", "Renting is wise"], category: "finance" },
      { text: "What's Desi parents' vacation destination?", correct: "Visiting relatives abroad", wrong: ["Beach resorts", "Adventure trips", "Cruises"], category: "travel" },
      { text: "How do Desi parents measure success?", correct: "Marriage and grandchildren", wrong: ["Personal happiness", "Creativity", "Experiences"], category: "values" },
      { text: "What do Desi parents think about leftovers?", correct: "Finish them or you're wasting food", wrong: ["Throw them away", "Never make leftovers", "Compost them"], category: "food" },
      { text: "What's Desi parents' opinion on studying abroad?", correct: "Good for career but come back", wrong: ["Never leave home", "Stay abroad forever", "Don't pursue education"], category: "education" },
    ],
    honest: [
      { text: "What do Desi parents honestly worry about most?", correct: "What will people say?", wrong: ["Climate change", "Stock market", "Technology trends"], category: "concerns" },
      { text: "Why do Desi parents really call so often?", correct: "Miss their kids terribly", wrong: ["To discuss finances", "Business updates", "Weather reports"], category: "family" },
      { text: "What's Desi parents' honest opinion on dating?", correct: "Terrified but pretending to be modern", wrong: ["Fully supportive always", "No interest in it", "Too busy to care"], category: "relationships" },
      { text: "Why do Desi parents really save so much?", correct: "To leave something for their children", wrong: ["Love of money", "Don't trust banks", "Hobby collecting"], category: "finance" },
      { text: "What's Desi parents' honest fear about kids living abroad?", correct: "They'll forget their culture", wrong: ["They'll be too successful", "They'll have too much fun", "They'll become too healthy"], category: "culture" },
      { text: "Why do Desi parents really cook so much?", correct: "Food is their love language", wrong: ["Bored at home", "Restaurant practice", "Cooking competition"], category: "love" },
      { text: "What's Desi parents' honest reaction to kids cooking?", correct: "Secretly pleased but will critique", wrong: ["Pure happiness", "Complete indifference", "Genuine criticism only"], category: "family" },
    ],
    embarrassing: [
      { text: "What embarrassing thing do Desi parents do at weddings?", correct: "Point out single people to their kids", wrong: ["Dance professionally", "Leave early", "Skip the food"], category: "social" },
      { text: "What do Desi parents secretly do on Facebook?", correct: "Share every family photo publicly", wrong: ["Only read news", "Never post anything", "Perfect privacy settings"], category: "technology" },
      { text: "What embarrassing thing do Desi parents forward on WhatsApp?", correct: "Good morning messages with flowers", wrong: ["Work documents", "Professional updates", "Nothing at all"], category: "technology" },
      { text: "What do Desi parents brag about to relatives?", correct: "Their child's salary (inflated)", wrong: ["Cooking skills", "Dance moves", "Gaming achievements"], category: "social" },
      { text: "What embarrassing thing do Desi parents keep?", correct: "Report cards from decades ago", wrong: ["Nothing from the past", "Only digital memories", "Minimal keepsakes"], category: "nostalgia" },
    ],
  },
  {
    panelId: "blonde",
    common: [
      { text: "What do people assume about blondes at work?", correct: "They're not serious about careers", wrong: ["They're the CEO", "They're overqualified", "They're too smart"], category: "career" },
      { text: "What joke do blondes hear most often?", correct: "Another blonde joke from the 90s", wrong: ["Smart person jokes", "Serious jokes", "No jokes ever"], category: "social" },
      { text: "What do people think blondes major in?", correct: "Something 'easy'", wrong: ["Nuclear physics", "Brain surgery", "Rocket science"], category: "education" },
      { text: "How do people react when a blonde is intelligent?", correct: "Surprised, like it's rare", wrong: ["Expected behavior", "No reaction", "Complete indifference"], category: "stereotypes" },
      { text: "What do blondes get asked about constantly?", correct: "Is that your natural color?", wrong: ["Stock market tips", "Scientific theories", "Political analysis"], category: "appearance" },
      { text: "What do movies show blondes doing?", correct: "Being the ditzy best friend", wrong: ["Solving world problems", "Running corporations", "Being scientists"], category: "media" },
      { text: "What assumption do people make about blonde ambition?", correct: "They just want to marry rich", wrong: ["They want to change the world", "Career focused only", "No assumptions"], category: "stereotypes" },
      { text: "How are blondes portrayed in commercials?", correct: "Having fun but not being smart", wrong: ["Giving financial advice", "Teaching science", "Leading businesses"], category: "media" },
      { text: "What do people assume about blonde driving?", correct: "They're probably lost", wrong: ["Expert navigators", "Professional drivers", "Map enthusiasts"], category: "stereotypes" },
      { text: "What do blondes supposedly love?", correct: "Shopping and selfies", wrong: ["Quantum physics", "Philosophy debates", "Economic theory"], category: "stereotypes" },
    ],
    honest: [
      { text: "How do blondes honestly feel about blonde jokes?", correct: "Exhausted by them", wrong: ["Love them all", "Find them original", "Never tired of them"], category: "feelings" },
      { text: "What do blondes honestly think when underestimated?", correct: "I'll prove them wrong", wrong: ["They're probably right", "I should dye my hair", "Maybe I am dumb"], category: "mindset" },
      { text: "Why do some blondes play into stereotypes?", correct: "It's easier than fighting them", wrong: ["They believe them", "No other choice", "Love the attention"], category: "social" },
      { text: "What's a blonde's honest experience in meetings?", correct: "Having to prove intelligence twice", wrong: ["Instant respect", "Never questioned", "Always taken seriously"], category: "work" },
      { text: "How do blondes honestly feel about hair color jokes?", correct: "Bored of 50 year old jokes", wrong: ["They're fresh and fun", "Never heard them before", "Always laughing"], category: "social" },
    ],
    embarrassing: [
      { text: "What embarrassing thing have blondes done to fit the stereotype?", correct: "Laughed at jokes about themselves", wrong: ["Corrected everyone", "Filed complaints", "Lectured on stereotypes"], category: "social" },
      { text: "What do blondes secretly worry about?", correct: "Being taken less seriously at first", wrong: ["Having too much respect", "Being too smart", "Intimidating everyone"], category: "insecurity" },
      { text: "What embarrassing moment do blondes experience?", correct: "People slowly explaining simple things", wrong: ["Being asked complex questions", "Trusted with hard tasks", "Given leadership roles"], category: "social" },
      { text: "What's the most embarrassing assumption about blondes?", correct: "That they dyed their hair for attention", wrong: ["That they're natural geniuses", "That they're born leaders", "That they're too serious"], category: "appearance" },
    ],
  },
  {
    panelId: "elder-sister",
    common: [
      { text: "What's an elder sister's primary role growing up?", correct: "Second parent to siblings", wrong: ["Just a kid", "No responsibilities", "The baby"], category: "family" },
      { text: "What do parents expect from the eldest daughter?", correct: "To set an example always", wrong: ["To make mistakes freely", "Nothing special", "Same as others"], category: "expectations" },
      { text: "What does an elder sister hear most?", correct: "You should know better", wrong: ["Do whatever you want", "You're still young", "Take it easy"], category: "parenting" },
      { text: "What's an elder sister's responsibility at gatherings?", correct: "Watch the younger kids", wrong: ["Have fun with friends", "Relax completely", "Be served first"], category: "family-events" },
      { text: "How do parents react to elder sister's mistakes?", correct: "Stricter punishment as an example", wrong: ["Let it slide", "Laugh it off", "Ignore completely"], category: "discipline" },
      { text: "What does an elder sister sacrifice?", correct: "Her own childhood to help raise siblings", wrong: ["Nothing at all", "Only small things", "Just her room"], category: "sacrifice" },
      { text: "What's expected of elder sisters academically?", correct: "Straight A's to inspire siblings", wrong: ["Average is fine", "No expectations", "Grades don't matter"], category: "education" },
      { text: "What do elder sisters become experts at?", correct: "Mediating family conflicts", wrong: ["Causing problems", "Avoiding family", "Being selfish"], category: "skills" },
      { text: "How do parents use elder sisters?", correct: "As free babysitters", wrong: ["As honored guests", "As kids to protect", "As people with free time"], category: "family-role" },
      { text: "What do younger siblings think of elder sisters?", correct: "She's too bossy", wrong: ["She's too relaxed", "She does nothing", "She's never around"], category: "sibling-dynamics" },
    ],
    honest: [
      { text: "How does the eldest daughter honestly feel about her role?", correct: "Overwhelmed but loves her siblings", wrong: ["Totally relaxed", "No feelings about it", "Wants more responsibility"], category: "feelings" },
      { text: "What does an elder sister honestly wish?", correct: "She could have been just a kid sometimes", wrong: ["More chores", "More responsibility", "Stricter parents"], category: "wishes" },
      { text: "How does the eldest honestly feel about favoritism?", correct: "The youngest gets away with everything", wrong: ["Everything is fair", "I get special treatment", "No favorites exist"], category: "family-dynamics" },
      { text: "What's the eldest's honest reaction to 'you're so mature'?", correct: "I had to be, not by choice", wrong: ["Thank you for the compliment", "I love being mature", "It came naturally"], category: "feelings" },
      { text: "How does an elder sister honestly feel about boundaries?", correct: "I never learned to have my own", wrong: ["I'm great at them", "Had plenty of privacy", "Very respected"], category: "personal-growth" },
    ],
    embarrassing: [
      { text: "What embarrassing thing do elder sisters do?", correct: "Act like a parent at inappropriate times", wrong: ["Let everything go", "Mind their own business", "Stay out of it"], category: "behavior" },
      { text: "What's an elder sister's embarrassing habit?", correct: "Correcting siblings in public", wrong: ["Being too laid back", "Ignoring problems", "Not caring enough"], category: "habits" },
      { text: "What embarrassing title do elder sisters get?", correct: "The second mom nobody asked for", wrong: ["The cool sister", "The fun one", "The relaxed sibling"], category: "roles" },
      { text: "What do elder sisters embarrassingly know?", correct: "All their siblings' secrets they wish they didn't", wrong: ["Nothing about anyone", "Only their own business", "Just surface stuff"], category: "knowledge" },
    ],
  },
  {
    panelId: "endometriosis",
    common: [
      { text: "How long does it take to get an endo diagnosis?", correct: "7-10 years on average", wrong: ["Immediately", "One doctor visit", "A few weeks"], category: "diagnosis" },
      { text: "What do people say about endo pain?", correct: "It's just bad period cramps", wrong: ["It needs immediate attention", "Let's help you now", "That sounds serious"], category: "dismissal" },
      { text: "What do endo warriors hear from doctors?", correct: "Have you tried birth control?", wrong: ["Let's investigate further", "Here's a specialist referral", "Pain is never normal"], category: "healthcare" },
      { text: "What's a common misunderstanding about endo?", correct: "Pregnancy cures it", wrong: ["It's a serious condition", "It needs proper treatment", "It affects fertility"], category: "myths" },
      { text: "What do endo patients deal with monthly?", correct: "Debilitating pain that disrupts life", wrong: ["Minor inconvenience", "Nothing unusual", "Slight discomfort"], category: "symptoms" },
      { text: "What's the reality of endo treatment?", correct: "Surgery and ongoing management", wrong: ["Simple pill fixes it", "Exercise cures it", "Diet alone helps"], category: "treatment" },
      { text: "How does endo affect work life?", correct: "Missing days due to flare-ups", wrong: ["No impact at all", "Improves productivity", "Easier work life"], category: "work" },
      { text: "What do people assume about endo?", correct: "If you don't look sick you're fine", wrong: ["Invisible illness is real", "Symptoms are valid", "Pain levels vary"], category: "assumptions" },
      { text: "What's a daily reality for endo warriors?", correct: "Planning life around pain cycles", wrong: ["Completely normal life", "No planning needed", "Pain-free days"], category: "daily-life" },
      { text: "What healthcare hurdle do endo patients face?", correct: "Not being believed by doctors", wrong: ["Too much attention", "Over-diagnosed", "Immediate help always"], category: "healthcare" },
      { text: "How visible is endometriosis?", correct: "It's an invisible illness", wrong: ["Very obvious", "Easy to diagnose", "Everyone can see it"], category: "awareness" },
      { text: "What's a common endo symptom besides pain?", correct: "Chronic fatigue", wrong: ["Increased energy", "Better sleep", "More stamina"], category: "symptoms" },
      { text: "What do endo warriors navigate constantly?", correct: "Medical gaslighting", wrong: ["Immediate validation", "Understanding doctors", "Easy diagnoses"], category: "healthcare" },
      { text: "How does endo affect relationships?", correct: "Partners may not understand the pain", wrong: ["No impact at all", "Always supportive", "Never an issue"], category: "relationships" },
      { text: "What's an endo warrior's medicine cabinet like?", correct: "Full of pain management options", wrong: ["Empty and unused", "Just vitamins", "No medications needed"], category: "treatment" },
    ],
    honest: [
      { text: "How do endo warriors honestly feel about being dismissed?", correct: "Exhausted and frustrated", wrong: ["Totally fine with it", "Happy to explain again", "Love being patient"], category: "feelings" },
      { text: "What do endo patients honestly think about heating pads?", correct: "Not enough but better than nothing", wrong: ["Complete cure", "Works perfectly", "Don't need them"], category: "treatment" },
      { text: "How do endo warriors honestly feel about explaining again?", correct: "Tired of justifying invisible pain", wrong: ["Love educating people", "It's always fun", "Never gets old"], category: "communication" },
      { text: "What's the honest truth about endo flare-ups?", correct: "They're unpredictable and terrifying", wrong: ["Easy to manage", "Completely predictable", "Minor inconvenience"], category: "symptoms" },
      { text: "How do endo warriors honestly feel about 'helpful' suggestions?", correct: "Frustrated by oversimplification", wrong: ["Grateful for advice", "It's always helpful", "Love suggestions"], category: "support" },
      { text: "What's the honest impact on mental health?", correct: "Depression and anxiety from chronic pain", wrong: ["No mental impact", "Always positive", "Pain doesn't affect mood"], category: "mental-health" },
    ],
    embarrassing: [
      { text: "What embarrassing thing do endo warriors do at work?", correct: "Hide heating pads under desk", wrong: ["Announce their condition", "Take no precautions", "Never plan ahead"], category: "work" },
      { text: "What's an embarrassing endo moment?", correct: "Canceling plans last minute from pain", wrong: ["Always available", "Never cancel anything", "Pain has no impact"], category: "social" },
      { text: "What do endo warriors embarrassingly carry?", correct: "Emergency pain kit everywhere", wrong: ["Nothing special", "Just a phone", "Normal purse items"], category: "daily-life" },
      { text: "What embarrassing question do endo patients get?", correct: "Have you tried yoga though?", wrong: ["Tell me about your treatment", "How can I help?", "What do you need?"], category: "social" },
      { text: "What's embarrassing about explaining endo?", correct: "Describing pain levels sounds exaggerated", wrong: ["Everyone understands immediately", "Easy to explain", "People always believe you"], category: "communication" },
    ],
  },
  {
    panelId: "millennials",
    common: [
      { text: "What do millennials love spending on?", correct: "Experiences over things", wrong: ["Material possessions", "Fancy cars", "Big houses"], category: "spending" },
      { text: "What killed various industries according to headlines?", correct: "Millennials", wrong: ["Economic changes", "Technology shifts", "Natural evolution"], category: "media" },
      { text: "What do millennials remember fondly?", correct: "When rent was affordable", wrong: ["Current housing prices", "Student loan rates", "Entry-level salaries"], category: "nostalgia" },
      { text: "What's the millennial approach to work?", correct: "Work hard but need purpose", wrong: ["Work for money only", "Loyalty to one company", "9-5 forever"], category: "career" },
      { text: "What do millennials drink?", correct: "Craft beer and specialty coffee", wrong: ["Generic drinks", "Whatever's cheapest", "Just water"], category: "lifestyle" },
      { text: "What streaming services do millennials subscribe to?", correct: "Too many to count", wrong: ["Cable TV only", "None at all", "Just one service"], category: "entertainment" },
      { text: "What's the millennial housing situation?", correct: "Renting or living with parents longer", wrong: ["Homeowner by 25", "Easy mortgage access", "Abundant affordable housing"], category: "housing" },
      { text: "What do millennials value in brands?", correct: "Social responsibility", wrong: ["Just low prices", "Brand tradition", "Celebrity endorsements"], category: "values" },
      { text: "How do millennials feel about phone calls?", correct: "Text first, please", wrong: ["Love surprise calls", "Answer every call", "Prefer voicemails"], category: "communication" },
      { text: "What's the millennial side hustle culture?", correct: "Multiple income streams are normal", wrong: ["One job is enough", "Side hustles are rare", "Everyone has time"], category: "work" },
    ],
    honest: [
      { text: "How do millennials honestly feel about their finances?", correct: "Anxious about retirement", wrong: ["Totally secure", "No worries at all", "Have it figured out"], category: "finance" },
      { text: "What do millennials honestly think about adulting?", correct: "Still googling how to do basic things", wrong: ["Expert at everything", "Fully prepared", "Born ready"], category: "life" },
      { text: "How do millennials honestly feel about aging?", correct: "Wait, when did we become the old ones?", wrong: ["Embracing it fully", "Love being older", "Age is just a number"], category: "aging" },
      { text: "What's millennials' honest take on self-care?", correct: "Can't afford it but try anyway", wrong: ["Unlimited spa days", "No need for it", "Money is no object"], category: "wellness" },
      { text: "How do millennials honestly feel about job security?", correct: "There's no such thing anymore", wrong: ["Totally secure", "Jobs are guaranteed", "Never worried"], category: "career" },
    ],
    embarrassing: [
      { text: "What embarrassing thing do millennials still do?", correct: "Quote Harry Potter for life advice", wrong: ["Only read business books", "Never reference pop culture", "Too mature for that"], category: "culture" },
      { text: "What do millennials embarrassingly remember?", correct: "Their embarrassing AIM screen names", wrong: ["Nothing from the past", "Only dignified memories", "Perfect online history"], category: "nostalgia" },
      { text: "What's a millennial's embarrassing fear?", correct: "That Gen Z thinks they're old", wrong: ["No fear of judgment", "Don't care about age", "Always feel young"], category: "aging" },
      { text: "What do millennials embarrassingly still own?", correct: "DVD collections they never watch", wrong: ["Nothing from the past", "All digital", "Minimalist only"], category: "possessions" },
    ],
  },
  {
    panelId: "hustlers",
    common: [
      { text: "What does a hustler check first every morning?", correct: "Stock prices and crypto", wrong: ["Weather forecast", "Horoscope", "Sports scores"], category: "business" },
      { text: "What's a hustler's favorite topic?", correct: "Passive income streams", wrong: ["Weekend plans", "TV shows", "Local news"], category: "conversation" },
      { text: "How does a hustler describe their job?", correct: "Serial entrepreneur", wrong: ["Employee", "Works 9-5", "Retired early"], category: "career" },
      { text: "What book is always on a hustler's desk?", correct: "Rich Dad Poor Dad", wrong: ["Romance novels", "Cookbooks", "Travel guides"], category: "education" },
      { text: "What's a hustler's ideal vacation?", correct: "Networking retreat in Bali", wrong: ["Unplugged beach vacation", "Staycation", "Camping trip"], category: "lifestyle" },
      { text: "What podcast does a hustler listen to?", correct: "Business and motivation", wrong: ["True crime", "Comedy", "Fiction audiobooks"], category: "media" },
      { text: "What does a hustler wear to casual events?", correct: "Branded athleisure", wrong: ["Formal suits", "Vintage clothing", "Whatever's clean"], category: "fashion" },
      { text: "What's a hustler's morning routine?", correct: "4 AM wake-up, cold shower, meditation", wrong: ["Sleep in late", "Skip breakfast", "No routine"], category: "lifestyle" },
      { text: "What does a hustler's LinkedIn profile say?", correct: "Entrepreneur | Investor | Thought Leader", wrong: ["Job seeker", "Just working", "Employee"], category: "social-media" },
      { text: "What's a hustler's view on sleep?", correct: "I'll sleep when I'm successful", wrong: ["8 hours minimum", "Sleep is priority", "Very well rested"], category: "lifestyle" },
    ],
    honest: [
      { text: "What's a hustler honestly thinking at parties?", correct: "Who here can I network with?", wrong: ["Great music here", "Love the decorations", "Time to relax"], category: "social" },
      { text: "What do hustlers honestly feel about 9-5 jobs?", correct: "Trading time for money trap", wrong: ["Great stability", "Perfect lifestyle", "Dream career path"], category: "career" },
      { text: "Why do hustlers really post on LinkedIn?", correct: "Personal branding and leads", wrong: ["Share knowledge freely", "Stay in touch", "Bored at lunch"], category: "social-media" },
      { text: "What's a hustler's honest relationship with failure?", correct: "Every failure is terrifying", wrong: ["Love to fail", "Failure doesn't matter", "Never experience it"], category: "mindset" },
      { text: "What do hustlers honestly think at 11 PM?", correct: "Should be working harder", wrong: ["Time to relax", "Done for today", "Sleep sounds nice"], category: "work" },
    ],
    embarrassing: [
      { text: "What embarrassing thing do hustlers do on dates?", correct: "Talk about their business the whole time", wrong: ["Listen attentively", "Never mention work", "Focus on romance"], category: "relationships" },
      { text: "What do hustlers secretly watch at night?", correct: "Reality TV instead of business content", wrong: ["More business lectures", "Educational documentaries", "Nothing, just work"], category: "entertainment" },
      { text: "What embarrassing habit do hustlers have?", correct: "Networking at funerals", wrong: ["Keeping business separate", "Respecting all boundaries", "Never networking"], category: "behavior" },
      { text: "What do hustlers embarrassingly check during dinner?", correct: "Their portfolio performance", wrong: ["Nothing at all", "Just the time", "Only emergencies"], category: "technology" },
    ],
  },
  {
    panelId: "artists",
    common: [
      { text: "What inspires artists most?", correct: "Everyday life moments", wrong: ["Spreadsheets", "Corporate meetings", "Tax documents"], category: "creativity" },
      { text: "Where do artists prefer to work?", correct: "Cozy coffee shops", wrong: ["Cubicle offices", "Board rooms", "Factories"], category: "workspace" },
      { text: "What's an artist's preferred schedule?", correct: "Creative at midnight", wrong: ["9-5 sharp", "Early bird routine", "Strict schedules"], category: "lifestyle" },
      { text: "How do artists describe their style?", correct: "Eclectic and unique", wrong: ["Business casual", "Sports uniforms", "Plain and simple"], category: "fashion" },
      { text: "What's an artist's view on rules?", correct: "Made to be broken", wrong: ["Strictly follow them", "Create more rules", "Love bureaucracy"], category: "philosophy" },
      { text: "How do artists handle criticism?", correct: "Take it personally but grow", wrong: ["Ignore it completely", "Get defensive always", "Change everything immediately"], category: "feedback" },
      { text: "What do artists struggle with?", correct: "Putting a price on their work", wrong: ["Being overpaid", "Too many buyers", "Business being too easy"], category: "business" },
      { text: "What's an artist's relationship with deadlines?", correct: "Flexible interpretation", wrong: ["Always early", "Never miss them", "Love deadlines"], category: "work" },
      { text: "What do artists collect?", correct: "Random objects for inspiration", wrong: ["Corporate memorabilia", "Tax receipts", "Nothing at all"], category: "lifestyle" },
      { text: "How do artists feel about 'real jobs'?", correct: "This IS a real job", wrong: ["Want to switch", "Not a real job", "Just a hobby"], category: "career" },
    ],
    honest: [
      { text: "What's an artist honestly thinking about money?", correct: "Wish I had more stability", wrong: ["Money is everything", "Don't need any", "Love budgeting"], category: "finances" },
      { text: "Why do artists really procrastinate?", correct: "Fear of not being good enough", wrong: ["Too organized", "Nothing to do", "Work is boring"], category: "work" },
      { text: "What do artists honestly think about exposure as payment?", correct: "Can't pay rent with exposure", wrong: ["Love working for free", "Best payment method", "Always accept it"], category: "business" },
      { text: "How do artists honestly feel about imposter syndrome?", correct: "It never goes away", wrong: ["Never experienced it", "Completely confident", "No self-doubt"], category: "mental-health" },
      { text: "What's an artist's honest relationship with social media?", correct: "Necessary evil for exposure", wrong: ["Love everything about it", "Don't need it", "Best part of the job"], category: "marketing" },
    ],
    embarrassing: [
      { text: "What embarrassing thing do artists do when stuck?", correct: "Blame the algorithm", wrong: ["Work harder", "Take a calm break", "Stay productive"], category: "creativity" },
      { text: "What do artists secretly compare?", correct: "Their follower count to peers", wrong: ["Nothing at all", "Only recipes", "Sleep schedules"], category: "social" },
      { text: "What embarrassing excuse do artists use?", correct: "Waiting for inspiration to strike", wrong: ["Working consistently", "No excuses needed", "Always disciplined"], category: "work" },
      { text: "What do artists embarrassingly spend money on?", correct: "Art supplies they don't need", wrong: ["Practical items only", "Nothing ever", "Just necessities"], category: "shopping" },
    ],
  },
  {
    panelId: "office-workers",
    common: [
      { text: "What gets office workers through Monday?", correct: "Coffee and counting to Friday", wrong: ["Pure enthusiasm", "Love of spreadsheets", "Monday is favorite day"], category: "survival" },
      { text: "What do office workers talk about at lunch?", correct: "Weekend plans and office drama", wrong: ["Advanced physics", "Philosophy debates", "Global economics"], category: "social" },
      { text: "What's an office worker's dream?", correct: "Working from home permanently", wrong: ["More meetings", "Longer commute", "No vacation ever"], category: "aspirations" },
      { text: "What do office workers fear most?", correct: "Reply-all accidents", wrong: ["Getting promoted", "Free snacks", "Early finish"], category: "work" },
      { text: "What's an office worker's favorite email?", correct: "Meeting cancelled", wrong: ["New project assigned", "Urgent deadline", "Performance review"], category: "communication" },
      { text: "How do office workers celebrate wins?", correct: "Free pizza in break room", wrong: ["Champagne toast", "Company yacht trip", "Personal butler"], category: "culture" },
      { text: "What's an office worker's most used phrase?", correct: "Per my last email", wrong: ["I love extra work", "Let's meet more", "More deadlines please"], category: "communication" },
      { text: "What do office workers perfect over time?", correct: "Looking busy when not", wrong: ["Always being busy", "Asking for more work", "Loving overtime"], category: "skills" },
      { text: "What's an office worker's lunch strategy?", correct: "Eat at desk while working", wrong: ["Two-hour lunches", "Skip lunch entirely", "Personal chef"], category: "food" },
      { text: "What do office workers daydream about?", correct: "Winning the lottery and quitting", wrong: ["More meetings", "Longer reports", "Extra projects"], category: "dreams" },
    ],
    honest: [
      { text: "What are office workers honestly doing in meetings?", correct: "Online shopping or zoning out", wrong: ["Taking perfect notes", "Fully engaged always", "Leading discussion"], category: "meetings" },
      { text: "Why do office workers really take sick days?", correct: "Mental health breaks", wrong: ["Actually dying sick", "Love the office too much", "Never take them"], category: "time-off" },
      { text: "What do office workers honestly think about open offices?", correct: "Hate the lack of privacy", wrong: ["Love being watched", "Great for focus", "Perfect design"], category: "workspace" },
      { text: "How do office workers honestly feel about team building?", correct: "Forced fun is exhausting", wrong: ["Best day ever", "Love all activities", "Wish there was more"], category: "culture" },
      { text: "What's an office worker's honest Slack status?", correct: "Away mentally even when online", wrong: ["Always productive", "100% engaged", "Never distracted"], category: "work" },
    ],
    embarrassing: [
      { text: "What embarrassing thing do office workers do during calls?", correct: "Forget they're not on mute", wrong: ["Perfect professionalism", "Always camera ready", "Love video calls"], category: "remote-work" },
      { text: "What do office workers do when boss walks by?", correct: "Quickly switch from social media", wrong: ["Wave enthusiastically", "Continue working calmly", "Start a conversation"], category: "behavior" },
      { text: "What embarrassing email have office workers sent?", correct: "Complained about boss TO the boss", wrong: ["Perfect emails only", "No mistakes ever", "Always professional"], category: "communication" },
      { text: "What do office workers embarrassingly do in the bathroom?", correct: "Take a mental break from life", wrong: ["Quick in and out", "Just the essentials", "No extra time"], category: "escape" },
    ],
  },
  {
    panelId: "small-town",
    common: [
      { text: "What do small-town families value most?", correct: "Community and tradition", wrong: ["Anonymity", "Fast-paced life", "Constant change"], category: "values" },
      { text: "What's a small-town family's weekend activity?", correct: "Church and family BBQ", wrong: ["Clubbing downtown", "Art gallery hopping", "Escape rooms"], category: "lifestyle" },
      { text: "How do small-town families get news?", correct: "Local gossip network", wrong: ["Only Twitter", "International news only", "Never follow news"], category: "communication" },
      { text: "What do small-town families think of city life?", correct: "Too fast and expensive", wrong: ["Want to move there", "Perfect for everyone", "No opinion"], category: "opinions" },
      { text: "What's a small-town family's prized possession?", correct: "Family recipes and heirlooms", wrong: ["Latest gadgets", "Designer clothes", "Art collections"], category: "possessions" },
      { text: "How do small-town families greet each other?", correct: "Wave at every passing car", wrong: ["Ignore everyone", "Never acknowledge strangers", "Only text"], category: "social" },
      { text: "What's a small-town family's view on neighbors?", correct: "Extended family basically", wrong: ["Complete strangers", "Never interact", "Just neighbors"], category: "community" },
      { text: "What do small-town families do for fun?", correct: "High school sports events", wrong: ["Broadway shows", "Art exhibits", "Nightclubs"], category: "entertainment" },
      { text: "What's the small-town approach to news?", correct: "Know everything before it's published", wrong: ["Read newspapers days later", "Only national news", "Ignore local happenings"], category: "gossip" },
      { text: "What do small-town families never lock?", correct: "Their front doors", wrong: ["Everything is secured", "Multiple locks", "High-tech security"], category: "safety" },
    ],
    honest: [
      { text: "What do small-town families honestly think about newcomers?", correct: "Suspicious but curious", wrong: ["Immediately welcoming", "Don't notice them", "Move away"], category: "social" },
      { text: "Why do small-town families really know everyone's business?", correct: "It's entertainment", wrong: ["Security concerns", "Professional duty", "Don't actually know"], category: "community" },
      { text: "How do small-town families honestly feel about change?", correct: "Resistant but adapting slowly", wrong: ["Love all change", "Embrace it immediately", "No opinion on change"], category: "values" },
      { text: "What's the honest reason for waves at every car?", correct: "Trying to identify who's driving", wrong: ["Pure friendliness", "It's the law", "Random gesture"], category: "social" },
    ],
    embarrassing: [
      { text: "What embarrassing thing happens at small-town events?", correct: "Running into every ex", wrong: ["Perfect anonymity", "No awkward moments", "Only strangers attend"], category: "social" },
      { text: "What do small-town families secretly watch?", correct: "Big city reality shows", wrong: ["Only local news", "Educational only", "Nothing at all"], category: "entertainment" },
      { text: "What embarrassing thing does everyone know?", correct: "What you did in high school", wrong: ["Nothing from the past", "Only recent events", "No one remembers anything"], category: "memory" },
      { text: "What's the embarrassing side of small-town gossip?", correct: "Your business is everyone's business", wrong: ["Complete privacy", "No one cares", "Secrets are kept"], category: "social" },
    ],
  },
];

const additionalPanelSets: PanelQuestionSet[] = [
  {
    panelId: "introverts",
    common: [
      { text: "What's an introvert's ideal Friday night?", correct: "Home with a book or movie", wrong: ["Huge party", "Crowded bar", "Networking event"], category: "lifestyle" },
      { text: "How do introverts recharge?", correct: "Alone time and quiet", wrong: ["Large gatherings", "Parties", "Constant socializing"], category: "energy" },
      { text: "What's an introvert's nightmare?", correct: "Surprise party in their honor", wrong: ["Quiet evening", "Reading alone", "Small dinner"], category: "social" },
      { text: "How do introverts handle small talk?", correct: "Find it exhausting", wrong: ["Love every minute", "Their favorite thing", "Can do it forever"], category: "communication" },
      { text: "What do introverts need before social events?", correct: "Mental preparation time", wrong: ["More events added", "Larger crowds", "Less notice"], category: "planning" },
    ],
    honest: [
      { text: "Why do introverts really leave parties early?", correct: "Social battery depleted", wrong: ["Not having fun", "Hate everyone there", "Important plans"], category: "social" },
      { text: "What's an introvert's honest reaction to 'why so quiet'?", correct: "Internal screaming", wrong: ["Love that question", "Happy to explain", "Didn't notice they were quiet"], category: "feelings" },
    ],
    embarrassing: [
      { text: "What embarrassing thing do introverts do?", correct: "Hide in bathroom at parties", wrong: ["Dance on tables", "Lead karaoke", "Make speeches"], category: "behavior" },
      { text: "What do introverts embarrassingly prepare?", correct: "Exit excuses days in advance", wrong: ["Nothing at all", "Entrance speeches", "More party ideas"], category: "planning" },
    ],
  },
  {
    panelId: "extroverts",
    common: [
      { text: "What's an extrovert's ideal Friday night?", correct: "Out with as many friends as possible", wrong: ["Alone time", "Reading quietly", "Early bedtime"], category: "lifestyle" },
      { text: "How do extroverts recharge?", correct: "Being around people", wrong: ["Complete isolation", "Silent meditation", "Nature alone"], category: "energy" },
      { text: "What happens when an extrovert is alone too long?", correct: "They go stir-crazy", wrong: ["Feel recharged", "Love it", "No effect"], category: "isolation" },
      { text: "How do extroverts handle quiet moments?", correct: "Fill them with noise or activity", wrong: ["Embrace silence", "Meditate deeply", "Enjoy stillness"], category: "behavior" },
      { text: "What's an extrovert's approach to new places?", correct: "Make friends immediately", wrong: ["Observe quietly", "Stay anonymous", "Keep to themselves"], category: "social" },
    ],
    honest: [
      { text: "Why do extroverts honestly talk so much?", correct: "Process thoughts out loud", wrong: ["Love their own voice", "Have nothing else to do", "Being annoying on purpose"], category: "communication" },
      { text: "What's an extrovert's honest fear?", correct: "Missing out on social events", wrong: ["Too many plans", "Having peace", "Quiet weekends"], category: "feelings" },
    ],
    embarrassing: [
      { text: "What embarrassing thing do extroverts do?", correct: "Overshare with strangers", wrong: ["Stay mysterious", "Keep secrets well", "Talk less than needed"], category: "social" },
      { text: "What do extroverts embarrassingly need?", correct: "Constant validation from others", wrong: ["Nothing from anyone", "Complete independence", "No attention"], category: "needs" },
    ],
  },
  {
    panelId: "gamers",
    common: [
      { text: "What do gamers sacrifice for gaming?", correct: "Sleep and social events", wrong: ["Nothing at all", "Gaming time", "Their hobby"], category: "lifestyle" },
      { text: "What's a gamer's response to 'it's just a game'?", correct: "Visible irritation", wrong: ["Total agreement", "No reaction", "Calm acceptance"], category: "reactions" },
      { text: "How do gamers track time?", correct: "Badly - hours feel like minutes", wrong: ["Very accurately", "Always on schedule", "Never lose track"], category: "time" },
      { text: "What do gamers collect?", correct: "Games they'll never play", wrong: ["Nothing", "Only what they use", "Minimal possessions"], category: "hobbies" },
      { text: "What's a gamer's ideal setup?", correct: "Multi-monitor battle station", wrong: ["Single small screen", "No peripherals", "Basic laptop"], category: "equipment" },
    ],
    honest: [
      { text: "What do gamers honestly feel about their backlog?", correct: "Guilt mixed with excitement", wrong: ["Completely organized", "No backlog exists", "Don't care about it"], category: "feelings" },
      { text: "How do gamers honestly justify game purchases?", correct: "It was on sale (10% off)", wrong: ["Only buy necessities", "Never impulse buy", "Carefully planned"], category: "spending" },
    ],
    embarrassing: [
      { text: "What embarrassing thing have gamers done?", correct: "Called in sick to play a new release", wrong: ["Never missed work for games", "Work is priority", "Games can wait"], category: "behavior" },
      { text: "What do gamers embarrassingly rage at?", correct: "Lag and losing to 'noobs'", wrong: ["Nothing at all", "Always calm", "Accept all losses gracefully"], category: "reactions" },
    ],
  },
  {
    panelId: "pet-parents",
    common: [
      { text: "What's in a pet parent's phone gallery?", correct: "Thousands of pet photos", wrong: ["Balanced mix of photos", "Mostly landscapes", "Few photos"], category: "technology" },
      { text: "How do pet parents introduce their pet?", correct: "As their child/baby", wrong: ["Just an animal", "A pet", "Their roommate"], category: "language" },
      { text: "What's a pet parent's social media content?", correct: "90% pet photos and updates", wrong: ["News articles", "Food pictures", "Travel only"], category: "social-media" },
      { text: "What do pet parents celebrate?", correct: "Pet birthdays with parties", wrong: ["Only human occasions", "Nothing extra", "Just the basics"], category: "celebrations" },
      { text: "How much do pet parents spend on their pets?", correct: "More than on themselves", wrong: ["Minimal amounts", "Just necessities", "Very little"], category: "spending" },
    ],
    honest: [
      { text: "Why do pet parents honestly prefer their pet?", correct: "Unconditional love without drama", wrong: ["They don't", "Humans are better", "No preference"], category: "feelings" },
      { text: "What's a pet parent's honest reaction to pet messes?", correct: "Mad for 2 seconds then forgive", wrong: ["Angry forever", "Never forgive", "No reaction"], category: "behavior" },
    ],
    embarrassing: [
      { text: "What embarrassing thing do pet parents do?", correct: "Use baby talk with their pet in public", wrong: ["Stay silent around pets", "Act normal always", "Ignore their pet outside"], category: "behavior" },
      { text: "What do pet parents embarrassingly cancel plans for?", correct: "Pet looked a little sad", wrong: ["Never cancel for pets", "Only emergencies", "Pets are never the reason"], category: "priorities" },
    ],
  },
  {
    panelId: "foodies",
    common: [
      { text: "What does a foodie do before eating?", correct: "Take photos from multiple angles", wrong: ["Just eat", "Say a quick thanks", "Nothing special"], category: "habits" },
      { text: "What's a foodie's vacation priority?", correct: "Restaurants and food tours", wrong: ["Museums", "Beaches", "Shopping"], category: "travel" },
      { text: "How do foodies choose restaurants?", correct: "Extensive research and reviews", wrong: ["Random pick", "Whatever's close", "Don't care much"], category: "dining" },
      { text: "What do foodies talk about most?", correct: "Their last great meal", wrong: ["Sports", "Weather", "Politics"], category: "conversation" },
      { text: "What's in a foodie's kitchen?", correct: "Specialty ingredients they rarely use", wrong: ["Just basics", "Minimal items", "Instant meals only"], category: "cooking" },
    ],
    honest: [
      { text: "Why do foodies honestly photograph food?", correct: "Social media validation", wrong: ["Memory preservation", "For the chef", "Scientific documentation"], category: "motivation" },
      { text: "What's a foodie's honest grocery budget?", correct: "Embarrassingly high", wrong: ["Very controlled", "Minimal spending", "Just the essentials"], category: "spending" },
    ],
    embarrassing: [
      { text: "What embarrassing thing do foodies do at restaurants?", correct: "Send food back for being 'wrong'", wrong: ["Accept whatever comes", "Never complain", "Stay quiet"], category: "dining" },
      { text: "What do foodies embarrassingly judge others for?", correct: "Their restaurant choices", wrong: ["Nothing food-related", "Never judge", "Only big things"], category: "judgment" },
    ],
  },
  {
    panelId: "remote-workers",
    common: [
      { text: "What's a remote worker's dress code?", correct: "Business on top, pajamas on bottom", wrong: ["Full suit always", "Business casual", "Office attire"], category: "fashion" },
      { text: "Where do remote workers work from?", correct: "Couch, bed, anywhere with WiFi", wrong: ["Dedicated office only", "Never at home", "Always at desk"], category: "workspace" },
      { text: "What do remote workers miss about offices?", correct: "Free snacks and office supplies", wrong: ["Commuting", "Meetings", "Open floor plans"], category: "office-life" },
      { text: "How do remote workers handle virtual backgrounds?", correct: "Hide the mess behind them", wrong: ["Show real space always", "Never use them", "Office backgrounds only"], category: "technology" },
      { text: "What's a remote worker's biggest distraction?", correct: "Everything at home", wrong: ["Very focused", "No distractions", "Office was worse"], category: "productivity" },
    ],
    honest: [
      { text: "How many hours do remote workers honestly work?", correct: "Either too many or too few", wrong: ["Exactly 8 hours", "Perfectly balanced", "Less than required"], category: "work" },
      { text: "What's remote workers' honest relationship with pants?", correct: "Haven't worn them in weeks", wrong: ["Always fully dressed", "Professional attire daily", "Dress code matters"], category: "lifestyle" },
    ],
    embarrassing: [
      { text: "What embarrassing thing happens to remote workers?", correct: "Family walks in during important call", wrong: ["Nothing ever happens", "Always alone", "Perfect privacy"], category: "incidents" },
      { text: "What do remote workers embarrassingly do during meetings?", correct: "Multitask on other screens", wrong: ["Full attention always", "Take detailed notes", "100% engaged"], category: "meetings" },
    ],
  },
  {
    panelId: "new-parents",
    common: [
      { text: "What do new parents talk about most?", correct: "Baby's sleep schedule (or lack of)", wrong: ["Current events", "Career goals", "Hobbies"], category: "conversation" },
      { text: "What's a new parent's sleep like?", correct: "What sleep?", wrong: ["8 hours always", "Better than before", "No change"], category: "lifestyle" },
      { text: "What's in a new parent's bag?", correct: "Everything a baby could possibly need", wrong: ["Just a wallet", "Minimal items", "Nothing extra"], category: "preparation" },
      { text: "How do new parents view time?", correct: "Before baby and after baby", wrong: ["Normal timeline", "By year", "No different"], category: "perspective" },
      { text: "What do new parents photograph?", correct: "Every single thing the baby does", wrong: ["Only milestones", "Rarely take photos", "Other things"], category: "documentation" },
    ],
    honest: [
      { text: "How do new parents honestly feel?", correct: "Exhausted but obsessively in love", wrong: ["Perfectly rested", "No different than before", "Just normal"], category: "feelings" },
      { text: "What do new parents honestly miss?", correct: "Sleeping through the night", wrong: ["Nothing at all", "Being at work", "Less responsibility"], category: "nostalgia" },
    ],
    embarrassing: [
      { text: "What embarrassing thing do new parents do?", correct: "Smell the baby's diaper in public", wrong: ["Never check diapers", "Only at home", "Very discrete always"], category: "behavior" },
      { text: "What do new parents embarrassingly discuss?", correct: "Baby's bowel movements in detail", wrong: ["Only surface topics", "Never baby stuff", "Sophisticated subjects"], category: "conversation" },
    ],
  },
  {
    panelId: "college-students",
    common: [
      { text: "What's a college student's primary food group?", correct: "Instant noodles and pizza", wrong: ["Balanced meals", "Fresh vegetables", "Home cooking"], category: "food" },
      { text: "When do college students start assignments?", correct: "Night before it's due", wrong: ["Weeks in advance", "When assigned", "Plenty of time"], category: "academics" },
      { text: "What's a college student's sleep schedule?", correct: "Completely reversed", wrong: ["Early to bed", "Very regular", "8 hours nightly"], category: "lifestyle" },
      { text: "How do college students budget?", correct: "Poorly, then call parents", wrong: ["Very carefully", "Always within means", "Save consistently"], category: "finance" },
      { text: "What do college students consider exercise?", correct: "Walking to class", wrong: ["Gym every day", "Marathon training", "Organized sports"], category: "health" },
    ],
    honest: [
      { text: "Why do college students really go to library?", correct: "Procrastinate with WiFi", wrong: ["Pure studying", "Love of books", "No distractions there"], category: "academics" },
      { text: "What's college students' honest relationship with syllabi?", correct: "Read once, never again", wrong: ["Reference it constantly", "Memorize it", "Follow it exactly"], category: "academics" },
    ],
    embarrassing: [
      { text: "What embarrassing thing do college students do?", correct: "Wear same outfit for days", wrong: ["Fresh clothes daily", "Very stylish", "Always well-dressed"], category: "lifestyle" },
      { text: "What do college students embarrassingly eat?", correct: "Cereal for every meal", wrong: ["Three course meals", "Never repeat foods", "Varied diet"], category: "food" },
    ],
  },
  {
    panelId: "teachers",
    common: [
      { text: "What do teachers spend their own money on?", correct: "Classroom supplies", wrong: ["Just personal items", "Nothing work-related", "Only essentials"], category: "spending" },
      { text: "When does a teacher's day really end?", correct: "Never - always grading or planning", wrong: ["At 3 PM sharp", "When school ends", "Normal hours"], category: "work" },
      { text: "What's a teacher's superpower?", correct: "Eyes in the back of their head", wrong: ["Nothing special", "Average abilities", "Just like everyone"], category: "skills" },
      { text: "What do teachers hear too often?", correct: "But you get summers off!", wrong: ["Thank you for everything", "Teachers are underpaid", "Your job is hard"], category: "comments" },
      { text: "What's in a teacher's desk?", correct: "Emergency snacks and supplies", wrong: ["Nothing personal", "Only books", "Minimal items"], category: "preparation" },
    ],
    honest: [
      { text: "How do teachers honestly feel about summer?", correct: "Still planning and attending trainings", wrong: ["Pure vacation time", "Completely off", "No work at all"], category: "work" },
      { text: "What do teachers honestly think during parent meetings?", correct: "I see where this comes from", wrong: ["No judgments", "Parents are always right", "Never notice patterns"], category: "observations" },
    ],
    embarrassing: [
      { text: "What embarrassing thing do teachers do in public?", correct: "Use their teacher voice on strangers", wrong: ["Never stand out", "Completely blend in", "Act normal always"], category: "behavior" },
      { text: "What do teachers embarrassingly know about students?", correct: "Which ones will cause trouble", wrong: ["Nothing in advance", "All are equal", "Never predict anything"], category: "experience" },
    ],
  },
  {
    panelId: "nurses",
    common: [
      { text: "What's a nurse's relationship with coffee?", correct: "It's a survival necessity", wrong: ["Rarely drink it", "Don't need it", "Just water"], category: "lifestyle" },
      { text: "How many steps does a nurse take daily?", correct: "Thousands more than they'd like", wrong: ["Sit most of the day", "Very few", "Average amount"], category: "work" },
      { text: "What do nurses hear too often?", correct: "So you couldn't become a doctor?", wrong: ["Nurses are amazing", "Thank you for everything", "You're underpaid"], category: "comments" },
      { text: "What's a nurse's shoe collection like?", correct: "Comfortable over fashionable", wrong: ["High heels", "Stylish first", "Appearance matters"], category: "fashion" },
      { text: "How do nurses handle gross situations?", correct: "Nothing phases them anymore", wrong: ["Get squeamish", "Always uncomfortable", "Never got used to it"], category: "resilience" },
    ],
    honest: [
      { text: "What do nurses honestly think about TV medical shows?", correct: "That's not how any of this works", wrong: ["Very accurate", "Love them", "Great representation"], category: "media" },
      { text: "How do nurses honestly feel after a shift?", correct: "Physically and emotionally drained", wrong: ["Fully energized", "Ready for more", "Not tired at all"], category: "feelings" },
    ],
    embarrassing: [
      { text: "What embarrassing thing do nurses do at dinner?", correct: "Discuss medical procedures casually", wrong: ["Never talk about work", "Keep it pleasant", "Avoid all details"], category: "social" },
      { text: "What do nurses embarrassingly diagnose?", correct: "Everyone at family gatherings", wrong: ["No one", "Only when asked", "Stay out of it"], category: "behavior" },
    ],
  },
  {
    panelId: "tech-workers",
    common: [
      { text: "What do tech workers claim is their biggest skill?", correct: "Googling things effectively", wrong: ["Pure genius", "All memorized", "Natural talent"], category: "skills" },
      { text: "How do tech workers explain their job to parents?", correct: "I work with computers", wrong: ["Full technical explanation", "They understand completely", "Easy to explain"], category: "communication" },
      { text: "What's a tech worker's response to computer issues?", correct: "Have you tried turning it off and on?", wrong: ["Immediate deep investigation", "Don't know what to do", "Call someone else"], category: "troubleshooting" },
      { text: "What do tech workers debate about?", correct: "Tabs vs spaces, vim vs emacs", wrong: ["Nothing ever", "Always agree", "Don't have opinions"], category: "culture" },
      { text: "What's on a tech worker's desk?", correct: "Multiple monitors and energy drinks", wrong: ["Just a laptop", "Minimal setup", "Paper and pen"], category: "workspace" },
    ],
    honest: [
      { text: "What do tech workers honestly do when stuck?", correct: "Copy code from Stack Overflow", wrong: ["Write it all themselves", "Never get stuck", "Know everything"], category: "work" },
      { text: "How do tech workers honestly feel about meetings?", correct: "Interrupt their actual work", wrong: ["Love them all", "Very productive", "Need more of them"], category: "culture" },
    ],
    embarrassing: [
      { text: "What embarrassing thing happens to tech workers?", correct: "Demo fails in front of everyone", wrong: ["Everything always works", "No embarrassing moments", "Perfect presentations"], category: "work" },
      { text: "What do tech workers embarrassingly forget?", correct: "That not everyone codes", wrong: ["Nothing", "Very considerate", "Always explain well"], category: "communication" },
    ],
  },
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

function generateQuestionVariations(template: QuestionTemplate, panelId: string, layer: AnswerLayer, baseId: string, count: number): Question[] {
  const variations: Question[] = [];
  
  const questionPrefixes = [
    "", "According to most, ", "Survey says: ", "People think: ", "The typical view: ",
    "Generally speaking, ", "Most would say: ", "Common belief: ", "Popular opinion: ", "Typically, "
  ];
  
  const questionSuffixes = [
    "", " (be honest!)", " (no judgment)", " (true answer)", " (survey says)",
    " (think about it)", " (answer truthfully)", " (what do you think?)", " (real talk)", " (the truth is)"
  ];
  
  for (let i = 0; i < count; i++) {
    const prefix = questionPrefixes[i % questionPrefixes.length];
    const suffix = questionSuffixes[Math.floor(i / questionPrefixes.length) % questionSuffixes.length];
    
    let text = template.text;
    if (i > 0) {
      text = prefix + template.text.charAt(0).toLowerCase() + template.text.slice(1);
      if (i > questionPrefixes.length) {
        text = text.replace(/\?$/, suffix + "?");
      }
    }
    
    const options: QuestionOption[] = [
      { text: template.correct, isCorrect: true },
      ...template.wrong.map(w => ({ text: w, isCorrect: false }))
    ];
    
    variations.push({
      id: `${baseId}-${i}`,
      text,
      panelId,
      layer,
      options: shuffleArray(options),
      category: template.category,
    });
  }
  
  return variations;
}

function generateAllQuestions(): Question[] {
  const allSets = [...questionSets, ...additionalPanelSets];
  const questions: Question[] = [];
  const variationsPerTemplate = 50;
  
  allSets.forEach((panelSet) => {
    ["common", "honest", "embarrassing"].forEach((layer) => {
      const templates = panelSet[layer as keyof Omit<PanelQuestionSet, "panelId">];
      if (templates && Array.isArray(templates)) {
        templates.forEach((template, templateIndex) => {
          const baseId = `${panelSet.panelId}-${layer}-${templateIndex}`;
          const variations = generateQuestionVariations(
            template,
            panelSet.panelId,
            layer as AnswerLayer,
            baseId,
            variationsPerTemplate
          );
          questions.push(...variations);
        });
      }
    });
  });
  
  console.log(`Generated ${questions.length} questions`);
  return questions;
}

export const allQuestions: Question[] = generateAllQuestions();

export function getQuestionsForPanel(
  panelId: string,
  layer: AnswerLayer,
  count: number,
  answeredIds?: Set<string>
): Question[] {
  let available = allQuestions.filter(
    (q) => q.panelId === panelId && q.layer === layer
  );
  
  if (answeredIds && answeredIds.size > 0) {
    const unanswered = available.filter(q => !answeredIds.has(q.id));
    if (unanswered.length >= count) {
      available = unanswered;
    }
  }
  
  const shuffled = shuffleArray(available);
  return shuffled.slice(0, count);
}

export function getDailyChallenge(): Question[] {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  const seededRandom = (s: number) => {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
  
  const panelIds = [...new Set(allQuestions.map(q => q.panelId))];
  const selectedQuestions: Question[] = [];
  
  for (let i = 0; i < 10; i++) {
    const panelIndex = Math.floor(seededRandom(seed + i) * panelIds.length);
    const panelQuestions = allQuestions.filter(q => q.panelId === panelIds[panelIndex]);
    const questionIndex = Math.floor(seededRandom(seed + i + 100) * panelQuestions.length);
    
    if (panelQuestions[questionIndex]) {
      selectedQuestions.push(panelQuestions[questionIndex]);
    }
  }
  
  return selectedQuestions.length > 0 ? selectedQuestions : allQuestions.slice(0, 10);
}
