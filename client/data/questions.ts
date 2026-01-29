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
      { text: "What's the first thing Gen Z does when they wake up?", correct: "Check notifications", wrong: ["Scroll TikTok for 10 mins", "Text their group chat", "Check if they're late"], category: "daily-life" },
      { text: "How does Gen Z respond when something is really good?", correct: "No cap, this slaps", wrong: ["That's fire, bestie", "Lowkey obsessed", "It's giving everything"], category: "slang" },
      { text: "What's Gen Z's preferred way to end a friendship?", correct: "Slowly stop responding", wrong: ["Mute their stories first", "Unfollow but don't block", "Archive all their DMs"], category: "relationships" },
      { text: "How does Gen Z research before buying something?", correct: "Search TikTok reviews", wrong: ["Check Reddit threads", "Ask their group chat", "Watch YouTube comparisons"], category: "shopping" },
      { text: "What does Gen Z do when they disagree with someone online?", correct: "Ratio them in replies", wrong: ["Quote tweet with commentary", "Send it to their group chat", "Screenshot for later"], category: "social-media" },
      { text: "How does Gen Z show they're paying attention in a conversation?", correct: "Say 'no literally' repeatedly", wrong: ["Add 'period' after statements", "Nod while looking at phone", "React with 'that's so real'"], category: "communication" },
      { text: "What's Gen Z's approach to planning group hangouts?", correct: "Make a group chat and hope someone takes charge", wrong: ["Create a shared Google Doc", "Start a poll in Stories", "Text everyone individually"], category: "social" },
      { text: "How does Gen Z handle receiving a compliment?", correct: "Deflect with self-deprecating humor", wrong: ["Screenshot and send to friends", "Say 'bestie stoppp' while smiling", "Respond with a compliment back immediately"], category: "social" },
      { text: "What's the Gen Z equivalent of a phone call?", correct: "Voice memo conversation", wrong: ["FaceTime with no warning", "Sending a TikTok to explain", "Typing paragraphs in real-time"], category: "communication" },
      { text: "How does Gen Z decide where to eat?", correct: "Whoever suggests it has to decide", wrong: ["Check which place has better aesthetics", "Go wherever has TikTok hype", "Default to the group favorite"], category: "food" },
      { text: "What does Gen Z do when they see their ex post a story?", correct: "Watch it from a finsta", wrong: ["Screenshot before viewing", "Have a friend screen record", "Watch and immediately close the app"], category: "relationships" },
      { text: "How does Gen Z apologize?", correct: "Send a long paragraph at 2am", wrong: ["Post a vague story about growth", "Like their posts first to test waters", "Send a meme about forgiveness"], category: "relationships" },
      { text: "What's Gen Z's reaction when plans get cancelled?", correct: "Relieved but say 'nooo that sucks'", wrong: ["Already expected it honestly", "Immediately reschedule to be polite", "Sad react but happy inside"], category: "social" },
      { text: "How does Gen Z handle being put on the spot?", correct: "Nervous laugh and say 'I literally can't'", wrong: ["Make it into a bit", "Pretend they didn't hear it", "Deflect to someone else immediately"], category: "social" },
      { text: "What's Gen Z's preferred method of flirting?", correct: "React to stories strategically", wrong: ["Send memes at specific times", "Like old photos intentionally", "Comment inside jokes only"], category: "relationships" },
      { text: "How does Gen Z express genuine excitement?", correct: "Keysmash and cry emojis", wrong: ["Multiple exclamation points", "Voice memo of them screaming", "All caps with skull emoji"], category: "communication" },
      { text: "What does Gen Z do during an awkward silence?", correct: "Pull out their phone naturally", wrong: ["Make a random noise", "Say 'anyway' to change topics", "Pretend to check the time"], category: "social" },
      { text: "How does Gen Z take notes in class?", correct: "Photo of the slides", wrong: ["Notes app bullet points", "Screen record the lecture", "Type directly into the shared doc"], category: "education" },
      { text: "What's Gen Z's move when they want to leave a party?", correct: "Irish exit without telling anyone", wrong: ["Find one friend and whisper 'SOS'", "Make up an early morning excuse", "Pretend they're going to the bathroom"], category: "social" },
      { text: "How does Gen Z handle job interview stress?", correct: "Research the company on TikTok", wrong: ["Practice answers with a friend", "Watch interview hack videos", "Ask Reddit for company tea"], category: "career" },
      { text: "What does Gen Z do when they don't understand something?", correct: "Pretend they do and Google later", wrong: ["Ask for clarification subtly", "Look around to see if others are confused", "Nod and take a screenshot"], category: "social" },
      { text: "How does Gen Z remember birthdays?", correct: "Instagram or Snapchat notifications", wrong: ["Birthday tab on Facebook", "Group chat reminders", "Actually saved in their calendar"], category: "social" },
      { text: "What's Gen Z's approach to learning new recipes?", correct: "Find a 60-second TikTok version", wrong: ["Screenshot from Instagram Reels", "Save a YouTube short for later", "Ask for the recipe in comments"], category: "food" },
      { text: "How does Gen Z decide if someone is trustworthy?", correct: "Check their following-to-follower ratio", wrong: ["See if they have a finsta", "Check who they follow back", "Look at their close friends list activity"], category: "social-media" },
      { text: "What's Gen Z's response to a parent asking about their day?", correct: "Fine, nothing happened", wrong: ["Long pause then 'it was okay'", "One-word answers while scrolling", "Redirect to something they saw online"], category: "family" },
      { text: "How does Gen Z deal with stress?", correct: "Doom scroll until 3am", wrong: ["Reorganize their room at midnight", "Start a new hobby for one week", "Online shop and abandon cart"], category: "mental-health" },
      { text: "What does Gen Z do when they're bored?", correct: "Cycle through the same 3 apps", wrong: ["Lie in bed and stare at ceiling", "Text 'wyd' to everyone", "Start and abandon a project"], category: "daily-life" },
      { text: "How does Gen Z react to cringe content?", correct: "Keep watching while physically cringing", wrong: ["Close the app immediately", "Share to group chat for collective suffering", "Cover their face but don't scroll away"], category: "social-media" },
    ],
    honest: [
      { text: "What's Gen Z honestly thinking during work meetings?", correct: "This could have been a Slack message", wrong: ["When is my camera expected on?", "I should look engaged on camera", "How do I unmute again?"], category: "work" },
      { text: "Why does Gen Z really use BeReal?", correct: "To see what their crush is doing", wrong: ["To post intentionally aesthetic 'candids'", "Because everyone else is doing it", "To prove they have a social life"], category: "social-media" },
      { text: "What's Gen Z's honest opinion when someone says 'call me'?", correct: "Immediate anxiety spike", wrong: ["Is this bad news?", "Can I just text back instead?", "Let me prepare for 20 minutes first"], category: "communication" },
      { text: "Why does Gen Z really post gym selfies?", correct: "External validation for motivation", wrong: ["To prove they actually went", "For the algorithm engagement", "To make their ex see them thriving"], category: "social-media" },
      { text: "What's Gen Z honestly doing when they say 'brb'?", correct: "Coming back in 3 hours minimum", wrong: ["Probably fell asleep", "Got distracted by another app", "Waiting for a better response opportunity"], category: "communication" },
      { text: "Why does Gen Z really have multiple Instagram accounts?", correct: "Finsta for unfiltered thoughts", wrong: ["To stalk without being caught", "Different aesthetics for different moods", "To separate friend groups cleanly"], category: "social-media" },
      { text: "What's Gen Z's honest reaction to 'we need to talk'?", correct: "Running through every possible scenario", wrong: ["Heart rate immediately increases", "Checking all recent interactions for clues", "Preparing defense for unknown accusations"], category: "relationships" },
      { text: "Why does Gen Z really leave people on read?", correct: "Saw it but need energy to respond properly", wrong: ["Waiting for the perfect response to come", "Testing how long before they double text", "Genuinely forgot to respond"], category: "communication" },
      { text: "What's Gen Z honestly thinking when someone shows them a long video?", correct: "Please let this be under 30 seconds", wrong: ["I'm only going to watch 10 seconds max", "Can I ask how long this is without being rude?", "Already planning my polite reaction"], category: "social" },
      { text: "Why does Gen Z really screenshot DMs?", correct: "To analyze with the group chat", wrong: ["Evidence for potential future drama", "To craft the perfect response together", "Insurance in case messages get deleted"], category: "social-media" },
      { text: "What's Gen Z honestly doing during study time?", correct: "Studying for 5 mins, scrolling for 40", wrong: ["Background video playing the whole time", "Making aesthetic study content instead", "Reorganizing notes to avoid actual studying"], category: "education" },
      { text: "Why does Gen Z really stay up late?", correct: "Revenge bedtime procrastination for me-time", wrong: ["The algorithm keeps serving good content", "Only time they have without responsibilities", "Sleep schedule is beyond repair now"], category: "lifestyle" },
      { text: "What's Gen Z's honest reason for being late?", correct: "Left on time but underestimated everything", wrong: ["One more scroll turned into thirty", "Changed outfits multiple times", "Assumed they could make it work anyway"], category: "daily-life" },
      { text: "Why does Gen Z really ask 'what are we' in relationships?", correct: "Tired of overanalyzing with friends", wrong: ["Need to update the close friends story", "Want clarity before investing more effort", "The situationship is driving them crazy"], category: "relationships" },
      { text: "What's Gen Z honestly thinking about their screen time report?", correct: "That number has to be wrong somehow", wrong: ["Okay but some of that was productive", "I'll limit it starting tomorrow", "Is this bad compared to average?"], category: "technology" },
      { text: "Why does Gen Z really have such strong opinions on coffee orders?", correct: "It's a personality trait now", wrong: ["Social media made it part of their identity", "Need something to judge others by", "Genuinely care about the taste differences"], category: "food" },
      { text: "What's Gen Z's honest feeling about networking events?", correct: "Social anxiety dressed as professionalism", wrong: ["Making LinkedIn connections feels fake", "Wish they could just text people instead", "Overthinking every conversation already"], category: "career" },
      { text: "Why does Gen Z really post throwback photos?", correct: "Current life isn't aesthetic enough", wrong: ["Feeling nostalgic for simpler times", "Algorithm engagement hack", "Ran out of new content to post"], category: "social-media" },
      { text: "What's Gen Z honestly thinking during 'how are you' exchanges?", correct: "Neither of us wants the real answer", wrong: ["This is just a script we're following", "Please don't actually ask how I am", "Fine is the only acceptable response"], category: "social" },
      { text: "Why does Gen Z really watch sad content late at night?", correct: "Controlled emotional release feels cathartic", wrong: ["The algorithm knows their vulnerable hours", "Only time they let themselves feel things", "Procrastinating sleep with emotional content"], category: "mental-health" },
      { text: "What's Gen Z's honest thought when someone types for 3 minutes?", correct: "Either a novel or they deleted it all", wrong: ["This is either really good or really bad", "Should I prepare a long response too?", "Just send it already please"], category: "communication" },
      { text: "Why does Gen Z really take outfit pics before going out?", correct: "Content just in case they don't take any there", wrong: ["Better lighting at home", "Need backup if the main pics don't hit", "Document the effort before anything goes wrong"], category: "social-media" },
      { text: "What's Gen Z honestly thinking when parents text in all caps?", correct: "They don't know it reads as yelling", wrong: ["Something must be urgent", "Should I explain internet etiquette?", "Just let them express themselves"], category: "family" },
      { text: "Why does Gen Z really have a love-hate relationship with TikTok?", correct: "Addictive but making them feel behind in life", wrong: ["Too much content, not enough time", "Love the app, hate the algorithm's accuracy", "Can't quit but wish they could"], category: "social-media" },
      { text: "What's Gen Z's honest reaction to someone saying 'adulting'?", correct: "Cringe but also relatable", wrong: ["Only millennials say that now", "We just call it 'barely surviving'", "Same struggle, different vocabulary"], category: "culture" },
    ],
    embarrassing: [
      { text: "What embarrassing thing does Gen Z do at 3am?", correct: "Deep dive their ex's following list", wrong: ["Calculate what time they need to sleep by", "Practice arguments they'll never have", "Write drafts they'll never send"], category: "late-night" },
      { text: "What does Gen Z pretend to understand in conversations?", correct: "References their friends make confidently", wrong: ["News events they only saw headlines for", "Podcasts they said they'd listen to", "Movies they just watched the trailer of"], category: "social" },
      { text: "What embarrassing thing does Gen Z accidentally do on social media?", correct: "Like a 3-year-old photo while stalking", wrong: ["Accidentally go live when opening camera", "Post to main instead of close friends", "Follow a private account by accident"], category: "social-media" },
      { text: "What does Gen Z cry about at 2am but never mention?", correct: "A single sad TikTok that hit too hard", wrong: ["Realizing their comfort show isn't streaming anymore", "A nostalgic song that started playing", "Memories that randomly resurfaced"], category: "late-night" },
      { text: "What embarrassing thing does Gen Z google?", correct: "How to schedule a doctor's appointment", wrong: ["How to adult basic tasks", "Is this normal or should I worry", "How to write a professional email"], category: "adulting" },
      { text: "What does Gen Z do when they're alone that they'd never admit?", correct: "Record TikToks they never post", wrong: ["Practice influencer-style talking to camera", "Have full conversations with themselves", "Rehearse hypothetical confrontations"], category: "secrets" },
      { text: "What embarrassing thing has Gen Z done while on their phone?", correct: "Walked into a pole or door", wrong: ["Completely missed their bus stop", "Ignored someone waving at them", "Sat in gum because they weren't looking"], category: "daily-life" },
      { text: "What does Gen Z secretly stress about that seems trivial?", correct: "The order they like people's posts in", wrong: ["If their reply sounded too dry", "Whether to use punctuation or not", "If they're viewing stories too fast"], category: "social-media" },
      { text: "What embarrassing thing does Gen Z do before a date?", correct: "Stalk all their social media for talking points", wrong: ["Practice conversation topics in the mirror", "Screenshot their profile to send friends", "Research restaurants to seem spontaneous"], category: "relationships" },
      { text: "What does Gen Z pretend they don't do?", correct: "Check their own profile from a guest view", wrong: ["Rehearse voice memos before sending", "Calculate posting times for engagement", "Compare their likes to others"], category: "social-media" },
      { text: "What embarrassing thing does Gen Z do when nervous?", correct: "Start speaking in memes and references", wrong: ["Laugh at inappropriate moments", "Talk way faster than normal", "Make jokes that don't land"], category: "social" },
      { text: "What does Gen Z secretly enjoy that they call 'cringe'?", correct: "Early 2010s pop songs unironically", wrong: ["Reality dating shows completely seriously", "Cheesy rom-coms from their childhood", "Mainstream trends they publicly mock"], category: "guilty-pleasures" },
      { text: "What embarrassing thing does Gen Z do during video calls?", correct: "Check their own camera angle constantly", wrong: ["Zone out while looking engaged", "Mute to have another conversation", "Look at their own face more than others"], category: "technology" },
      { text: "What does Gen Z lie about casually?", correct: "Having seen that show everyone's talking about", wrong: ["Being 'almost there' when they haven't left", "Having read the article they're commenting on", "Being busy when they're just home"], category: "social" },
      { text: "What embarrassing thing does Gen Z save on their phone?", correct: "Screenshots of validation from years ago", wrong: ["Memes they'll never have context to use", "Recipes they've never made", "Motivation quotes they ignore"], category: "secrets" },
      { text: "What does Gen Z immediately do after posting something?", correct: "Refresh obsessively to check engagement", wrong: ["Zoom in on themselves repeatedly", "Wonder if the caption was too much", "Consider deleting it within minutes"], category: "social-media" },
      { text: "What embarrassing thing does Gen Z do when they don't get a reply?", correct: "Unsend and resend hoping they'll see it again", wrong: ["Check if their message even delivered", "Analyze if they came on too strong", "Wait exactly 24 hours to follow up"], category: "communication" },
      { text: "What does Gen Z do that they mock older generations for?", correct: "Spend hours doom scrolling without realizing", wrong: ["Get overly invested in online discourse", "Share things without fact-checking", "Use apps past their prime ironically"], category: "hypocrisy" },
      { text: "What embarrassing thing does Gen Z do when they have a crush?", correct: "Memorize their entire post history", wrong: ["Plan 'coincidental' encounters carefully", "Screenshot everything to analyze later", "Know their schedule without ever asking"], category: "relationships" },
      { text: "What does Gen Z secretly google about themselves?", correct: "Their own name in quotes to see what shows up", wrong: ["If their username is taken on other platforms", "What their aesthetic is called officially", "How old they look to AI generators"], category: "ego" },
      { text: "What embarrassing assumption does Gen Z make?", correct: "That everyone knows the same niche memes", wrong: ["That sarcasm translates through text", "That everyone follows the same discourse", "That references don't need context"], category: "social" },
      { text: "What does Gen Z do when someone sends them a long text?", correct: "React with an emoji to acknowledge but respond later", wrong: ["Skim it and hope they catch the main points", "Screenshot to respond when they have energy", "Start typing to show effort before reading fully"], category: "communication" },
      { text: "What embarrassing thing does Gen Z do on first dates?", correct: "Already know everything but pretend to ask", wrong: ["Accidentally reference their Instagram posts", "Know mutual connections from stalking", "Have pre-researched conversation fillers"], category: "relationships" },
      { text: "What does Gen Z secretly judge people for?", correct: "Having an unorganized Spotify playlist", wrong: ["Unironic use of outdated slang", "Basic profile aesthetic choices", "Following too many meme pages"], category: "social" },
      { text: "What embarrassing thing does Gen Z do at family events?", correct: "Hide in the bathroom scrolling their phone", wrong: ["Pretend their phone is ringing to escape", "Count down minutes until they can leave", "Have a separate group chat for live updates"], category: "family" },
    ],
  },
  {
    panelId: "desi-parents",
    common: [
      { text: "What do Desi parents ask about within five minutes of conversation?", correct: "When you're getting married", wrong: ["What your salary is now", "When you're having children", "Why you're not a doctor yet"], category: "family" },
      { text: "How do Desi parents measure your success compared to others?", correct: "Sharma ji's son's achievements", wrong: ["Your cousin's latest promotion", "The neighbor's kid's wedding", "Your childhood friend's visa status"], category: "comparison" },
      { text: "What's a Desi parent's first suggestion when you're sick?", correct: "Drink haldi doodh and sleep it off", wrong: ["Have hot water with lemon and honey", "Put Vicks on everything", "Eat khichdi and rest properly"], category: "health" },
      { text: "What do Desi parents never throw away?", correct: "Plastic containers from takeout", wrong: ["Shopping bags from every store", "Old newspapers for 'later use'", "Empty jars for storage"], category: "lifestyle" },
      { text: "What time do Desi parents think is appropriate to call?", correct: "6 AM regardless of time zones", wrong: ["Right when you're clearly busy", "During their morning prayers", "Whenever they remember something"], category: "communication" },
      { text: "What's a Desi parent's reaction to the AC being on?", correct: "Why waste money, open the windows", wrong: ["It's too cold, you'll get sick", "Ceiling fan is more than enough", "Put on a sweater instead"], category: "home" },
      { text: "How do Desi parents show love?", correct: "Forcing you to eat more food", wrong: ["Asking if you've eaten five times", "Packing extra food for the road", "Cooking your favorite dish unexpectedly"], category: "love" },
      { text: "What's a Desi parent's go-to wedding gift?", correct: "Cash in a decorated envelope", wrong: ["Gold jewelry from their collection", "A practical home appliance", "An embellished gift card"], category: "traditions" },
      { text: "How do Desi parents react to you paying rent?", correct: "Why rent when you could live at home?", wrong: ["That's too much, find cheaper", "You should buy instead", "At least save something"], category: "finance" },
      { text: "What do Desi parents consider a proper vacation?", correct: "Visiting relatives in another country", wrong: ["A pilgrimage to religious sites", "Weddings that require travel", "Staying with family friends abroad"], category: "travel" },
      { text: "How do Desi parents respond to your career choice?", correct: "But what about job security?", wrong: ["Engineering or medicine was right there", "At least get a government job", "Your cousin did the sensible thing"], category: "career" },
      { text: "What do Desi parents do with leftovers?", correct: "Make sure nothing is wasted, ever", wrong: ["Create a whole new dish from them", "Store them for exactly one week", "Offer them to guests as fresh"], category: "food" },
      { text: "What's a Desi parent's opinion on studying abroad?", correct: "Good for career, but come back after", wrong: ["Only if it leads to a green card", "Too far from family, reconsider", "Make sure to call daily minimum"], category: "education" },
      { text: "How do Desi parents find out about your life?", correct: "The auntie network gossip chain", wrong: ["Checking your social media secretly", "Calling your friends' parents", "Casually interrogating your siblings"], category: "social" },
      { text: "What do Desi parents say about your cooking?", correct: "It's good, but not like mine", wrong: ["You need more masala in this", "Who taught you to cook like this?", "At least you tried something"], category: "food" },
      { text: "How do Desi parents prepare for guests?", correct: "Cook enough food for triple the number", wrong: ["Deep clean the entire house first", "Hide the good snacks until after", "Prepare for every dietary restriction possible"], category: "hospitality" },
      { text: "What do Desi parents think about dating apps?", correct: "Log kya kahenge if they find out", wrong: ["Just meet people the proper way", "Matrimonial sites are more respectable", "How do you even trust strangers?"], category: "relationships" },
      { text: "How do Desi parents react to a new relationship?", correct: "When are we meeting the parents?", wrong: ["What caste and community are they?", "Are they from a good family?", "This is marriage material, right?"], category: "relationships" },
      { text: "What's a Desi parent's approach to bargaining?", correct: "Never pay the first price, always negotiate", wrong: ["Walk away at least twice first", "Compare prices at three stores minimum", "Mention another shop has it cheaper"], category: "shopping" },
      { text: "How do Desi parents respond to you being tired?", correct: "We worked harder at your age with no complaints", wrong: ["You don't even have real responsibilities", "Sleep is a luxury, you'll understand later", "We didn't have time to be tired"], category: "generational" },
      { text: "What's a Desi parent's solution to most problems?", correct: "Drink more water and pray", wrong: ["Talk to your elders for guidance", "Everything happens for a reason", "This is nothing compared to our struggles"], category: "advice" },
      { text: "How do Desi parents react to spicy food complaints?", correct: "This isn't even spicy, you've gone too Western", wrong: ["You used to eat this as a baby", "Your tolerance is embarrassing", "Add yogurt and stop complaining"], category: "food" },
      { text: "What's a Desi parent's view on saving money?", correct: "Put away at least half your salary", wrong: ["Why buy when you can get it cheaper?", "Every rupee saved is a rupee earned", "You never know when you'll need it"], category: "finance" },
      { text: "How do Desi parents show they miss you?", correct: "Call to ask random questions they know answers to", wrong: ["Send long voice notes about nothing", "Forward religious good morning messages", "Ask what you ate for every meal"], category: "love" },
      { text: "What's a Desi parent's reaction to you being home late?", correct: "Where were you, we were worried since 9pm", wrong: ["Call twenty times in two hours", "Already imagining worst scenarios", "Have your sibling track your location"], category: "family" },
    ],
    honest: [
      { text: "What do Desi parents honestly worry about most?", correct: "What will the community say about us", wrong: ["Whether you'll take care of them later", "If you'll marry the right person", "Your actual happiness and stability"], category: "concerns" },
      { text: "Why do Desi parents really call so frequently?", correct: "They genuinely miss you every day", wrong: ["To make sure you're still alive", "Because they have no one else to call", "To remind you of your responsibilities"], category: "family" },
      { text: "What's Desi parents' honest opinion on your independence?", correct: "Proud but wish you needed them more", wrong: ["Scared you'll forget your roots", "Happy but also a little lonely", "Conflicted between wanting this and missing you"], category: "feelings" },
      { text: "Why do Desi parents really push marriage so hard?", correct: "They want to see you settled before anything happens to them", wrong: ["Grandchildren are the main goal honestly", "Community expectations weigh heavily", "They're worried about you being alone"], category: "marriage" },
      { text: "What's Desi parents' honest fear about kids living abroad?", correct: "That the distance will make you forget them", wrong: ["You'll lose connection to your culture", "They won't be there for important moments", "The food won't be good enough for you"], category: "culture" },
      { text: "Why do Desi parents really cook so much?", correct: "Feeding you is how they say I love you", wrong: ["They learned abundance from their parents", "It's the only thing that brings them joy", "They can't eat alone, ever"], category: "love" },
      { text: "What's Desi parents' honest reaction to your cooking?", correct: "Secretly happy but must find something to improve", wrong: ["Proud you're learning their recipes", "Worried you'll never match their skills", "Relieved you won't starve without them"], category: "family" },
      { text: "Why do Desi parents really save every rupee?", correct: "Everything they have is meant for you eventually", wrong: ["They experienced scarcity and never forgot", "Security feels better than spending", "They want you to have better than they did"], category: "finance" },
      { text: "What do Desi parents honestly think about modern dating?", correct: "Terrified but trying to seem open-minded", wrong: ["Judging but keeping opinions private", "Worried about what could go wrong", "Wishing it was simpler like their time"], category: "relationships" },
      { text: "What's Desi parents' honest feeling when you succeed?", correct: "Pride so deep they can't express it properly", wrong: ["Relief that their sacrifices paid off", "Immediately thinking about the next goal", "Wishing they could brag appropriately"], category: "emotions" },
      { text: "Why do Desi parents really compare you to others?", correct: "Motivation that worked on them, they think works on you", wrong: ["They genuinely believe it helps", "It's the only parenting style they know", "They don't realize how it sounds"], category: "comparison" },
      { text: "What do Desi parents honestly think about your friends?", correct: "Judging based on their parents' reputation first", wrong: ["Hoping they're a good influence", "Wishing they knew them better", "Wondering if they're marriage material for you"], category: "social" },
      { text: "What's Desi parents' honest hope for your future?", correct: "That you'll be happy but also nearby", wrong: ["Success that the community will recognize", "A stable job and a good family", "That you'll take care of them eventually"], category: "future" },
      { text: "Why do Desi parents really make you call daily?", correct: "Hearing your voice is the highlight of their day", wrong: ["They worry something happened otherwise", "It's a habit they can't break", "They need to feel still connected"], category: "communication" },
      { text: "What do Desi parents honestly feel about their own sacrifices?", correct: "Would do it all again without question", wrong: ["Hope you understand someday", "Wish you appreciated it more openly", "Never want you to have to do the same"], category: "sacrifice" },
      { text: "What's Desi parents' honest thought when you don't answer calls?", correct: "Something terrible must have happened", wrong: ["You're too busy for them now", "This generation doesn't respect elders", "They should've called your sibling first"], category: "anxiety" },
      { text: "Why do Desi parents really forward those morning messages?", correct: "It's their way of saying they thought of you", wrong: ["They believe the blessings actually work", "It's the only technology they've mastered", "Everyone their age does it, so they do too"], category: "communication" },
      { text: "What do Desi parents honestly think about your relationship choices?", correct: "Worried but will love whoever you choose eventually", wrong: ["Hope you choose someone they can brag about", "Scared you'll marry outside the community", "Praying it works out no matter what"], category: "relationships" },
      { text: "What's Desi parents' honest reaction to your mental health conversations?", correct: "Want to help but don't know how to respond", wrong: ["Worried they did something wrong", "Confused because they never had this", "Hoping it's just a phase that passes"], category: "mental-health" },
      { text: "Why do Desi parents really hold onto old traditions?", correct: "It's all they have left of where they came from", wrong: ["They believe it kept them on the right path", "Worried the next generation will lose it all", "It connects them to their parents too"], category: "culture" },
      { text: "What do Desi parents honestly feel about technology?", correct: "Frustrated but trying their best to learn", wrong: ["Wish you had patience to teach them", "Scared of doing something wrong", "Miss when things were simpler"], category: "technology" },
      { text: "What's Desi parents' honest opinion on your lifestyle?", correct: "Different from theirs but they're adapting slowly", wrong: ["Worried you're losing important values", "Accepting but with private concerns", "Hoping you find balance eventually"], category: "lifestyle" },
      { text: "Why do Desi parents really want grandchildren?", correct: "To experience the love they have for you, again", wrong: ["To feel like the family continues", "To have someone to spoil properly", "Because their friends all have them now"], category: "family" },
      { text: "What do Desi parents honestly think when you're struggling?", correct: "They wish they could fix everything for you", wrong: ["Wondering if they should offer money", "Wanting to help but respecting your independence", "Blaming themselves for not preparing you better"], category: "support" },
      { text: "What's Desi parents' honest feeling about retirement?", correct: "Looking forward to spending time with you finally", wrong: ["Scared of being a burden", "Hoping you'll visit more often", "Already planning trips to see you"], category: "future" },
    ],
    embarrassing: [
      { text: "What embarrassing thing do Desi parents do at weddings?", correct: "Point out every single person over 25 to you", wrong: ["Take photos with every relative they recognize", "Loudly discuss who is still unmarried", "Ask strangers if they have any eligible children"], category: "weddings" },
      { text: "What do Desi parents secretly do on Facebook?", correct: "Share every family photo with public privacy settings", wrong: ["Friend all your friends without asking", "Comment 'proud of you beta' on everything", "Post old embarrassing childhood photos"], category: "social-media" },
      { text: "What embarrassing thing do Desi parents forward on WhatsApp?", correct: "Good morning messages with sparkly text and flowers", wrong: ["Unverified health tips from unknown sources", "Religious chain messages requiring forwarding", "Political opinions without fact-checking"], category: "technology" },
      { text: "What do Desi parents brag about to relatives?", correct: "Your salary, but a significantly inflated version", wrong: ["Your job title with added prestige", "How successful you are compared to their kids", "Every achievement since you were born"], category: "bragging" },
      { text: "What embarrassing thing do Desi parents keep forever?", correct: "Report cards from when you were seven", wrong: ["Drawings you made in primary school", "Participation certificates from forgotten events", "Every greeting card you ever gave them"], category: "nostalgia" },
      { text: "What do Desi parents do when they see your friend's parents?", correct: "Immediately discuss your marriage prospects", wrong: ["Compare children's achievements in detail", "Exchange gossip about the community", "Try to set up a formal meeting"], category: "social" },
      { text: "What embarrassing thing do Desi parents say about technology?", correct: "Is this safe? Someone will hack our account", wrong: ["Why do we need passwords for everything?", "In my time we managed without all this", "Can you come fix this again?"], category: "technology" },
      { text: "What do Desi parents do when you bring someone home?", correct: "Ask intrusive questions within the first hour", wrong: ["Feed them enough for a week", "Show all your baby photos immediately", "Tell embarrassing childhood stories"], category: "relationships" },
      { text: "What embarrassing thing do Desi parents do at the doctor?", correct: "Explain symptoms you didn't ask them to share", wrong: ["Insist on coming into the room with you", "Ask the doctor about marriage stress", "Bring up health issues from fifteen years ago"], category: "health" },
      { text: "What do Desi parents embarrassingly announce to guests?", correct: "Your entire relationship status and plans", wrong: ["How much weight you've gained or lost", "What time you woke up today", "Every detail of your job and salary"], category: "social" },
      { text: "What embarrassing thing do Desi parents do at airports?", correct: "Pack food that sets off security alarms", wrong: ["Wave until you're completely out of sight", "Call your name loudly across the terminal", "Cry enough to concern other passengers"], category: "travel" },
      { text: "What do Desi parents do when you say you're not hungry?", correct: "Put food on your plate anyway and watch", wrong: ["List everything they cooked that morning", "Ask if you're sick or something is wrong", "Take personal offense to your lack of hunger"], category: "food" },
      { text: "What embarrassing thing do Desi parents post online?", correct: "Photos of you without permission or filters", wrong: ["Long captions about how proud they are", "Old unflattering pictures from events", "Comments on all your posts in their language"], category: "social-media" },
      { text: "What do Desi parents embarrassingly ask in front of everyone?", correct: "When you're finally settling down", wrong: ["Why your sibling is doing better than you", "What happened to that person you were dating", "How much everything you own costs"], category: "family-events" },
      { text: "What embarrassing thing do Desi parents do during phone calls?", correct: "Put you on speaker without warning anyone", wrong: ["Have full background conversations you can hear", "Pass the phone to every relative present", "Repeat everything you say to everyone in the room"], category: "communication" },
      { text: "What do Desi parents do when you're successful?", correct: "Call every relative to share the news immediately", wrong: ["Post about it before you've told anyone", "Compare it to what Sharma ji's son did", "Plan how to announce it at the next event"], category: "achievement" },
      { text: "What embarrassing thing do Desi parents say about your weight?", correct: "Comments in front of everyone at family gatherings", wrong: ["Suggest eating more or less at every meal", "Compare you to how you looked as a child", "Ask if you're stressed because of your weight"], category: "body" },
      { text: "What do Desi parents embarrassingly do with technology?", correct: "Accidentally video call when trying to text", wrong: ["Leave voice messages that are ten minutes long", "Type in all caps without realizing", "Send the same photo seven times"], category: "technology" },
      { text: "What embarrassing thing do Desi parents assume about your life?", correct: "That you need their help with everything still", wrong: ["That you can't cook without them", "That you don't know how to save money", "That you'll mess up without their guidance"], category: "independence" },
      { text: "What do Desi parents do that embarrasses you at restaurants?", correct: "Negotiate the price or ask for extras", wrong: ["Bring their own food or condiments", "Complain that it's not as good as home cooking", "Tip inappropriately or not at all"], category: "dining" },
      { text: "What embarrassing thing do Desi parents keep asking about?", correct: "When you're giving them grandchildren", wrong: ["Why you haven't called more often", "Whether you've prayed today", "If you're eating properly over there"], category: "family" },
      { text: "What do Desi parents embarrassingly compare everything to?", correct: "How things were back in their village days", wrong: ["How much cheaper things used to be", "How much harder they worked at your age", "How their generation handled things better"], category: "generational" },
      { text: "What embarrassing thing do Desi parents say about your friends?", correct: "Ask if any of them are 'good marriage material'", wrong: ["Comment on their appearance or background", "Wonder why they're not married yet", "Ask about their family's reputation"], category: "social" },
      { text: "What do Desi parents embarrassingly do at your workplace stories?", correct: "Tell their friends exaggerated versions", wrong: ["Offer unsolicited career advice", "Suggest ways to impress your boss", "Ask if your colleagues are single"], category: "career" },
      { text: "What embarrassing thing do Desi parents reveal to new acquaintances?", correct: "Your entire life history in the first meeting", wrong: ["Medical conditions you never mentioned", "Failed relationships from years ago", "Academic struggles from childhood"], category: "social" },
    ],
  },
  {
    panelId: "blonde",
    common: [
      { text: "What do people assume about blondes in professional settings?", correct: "They got the job for their looks, not skills", wrong: ["They must be the assistant, not the manager", "They won't understand complex topics", "They're probably not the decision maker"], category: "career" },
      { text: "What's the first thing people assume when a blonde speaks up?", correct: "Surprised if the point is intelligent", wrong: ["Waiting for the stereotypical mistake", "Already preparing to explain it simpler", "Expecting a question, not a statement"], category: "stereotypes" },
      { text: "What question do blondes get asked constantly?", correct: "Is that your real hair color?", wrong: ["Do blondes really have more fun?", "What products do you use for it?", "When did you decide to go blonde?"], category: "appearance" },
      { text: "What assumption do movies make about blonde characters?", correct: "They're the fun friend, not the smart lead", wrong: ["They need rescuing more than others", "They're good at romance, bad at strategy", "They peak in popularity, not achievement"], category: "media" },
      { text: "How do people react when a blonde solves a complex problem?", correct: "Wait, you figured that out yourself?", wrong: ["That's impressive... for anyone", "I didn't expect that, honestly", "Where did you learn to do that?"], category: "stereotypes" },
      { text: "What do blondes hear when they're introduced as successful?", correct: "You don't look like a [their profession]", wrong: ["Beauty and brains, that's rare", "You must work twice as hard", "I wouldn't have guessed that"], category: "career" },
      { text: "What joke do blondes hear that's been recycled for decades?", correct: "Any blonde joke from a 90s sitcom", wrong: ["Something about hair dye and IQ", "The classic 'blonde walks into' setup", "References to stereotypical blonde behavior"], category: "humor" },
      { text: "What assumption do people make about blonde ambition?", correct: "They're probably just looking for a rich partner", wrong: ["Their career goals aren't serious", "They'll quit once they're married", "Success came from connections, not effort"], category: "stereotypes" },
      { text: "How are blondes treated when they know the answer first?", correct: "Double-checking if they're actually right", wrong: ["Asking them to explain their reasoning", "Surprised they participated at all", "Confirming with someone else anyway"], category: "workplace" },
      { text: "What do people assume about blonde driving abilities?", correct: "Probably can't park or navigate", wrong: ["Needs GPS for everywhere", "Dangerous behind the wheel", "Gets lost in familiar areas"], category: "stereotypes" },
      { text: "What's assumed about blondes and technology?", correct: "They need help with anything technical", wrong: ["Phones are about selfies only", "Computers are confusing for them", "Technology isn't their strength"], category: "stereotypes" },
      { text: "How do people talk to blondes about complex topics?", correct: "Slower and with simpler words", wrong: ["With visual aids as backup", "Checking for understanding constantly", "Offering to explain it differently"], category: "communication" },
      { text: "What do blondes supposedly prioritize?", correct: "Looking good over being smart", wrong: ["Shopping over career development", "Social life over responsibilities", "Fun over serious commitments"], category: "stereotypes" },
      { text: "What's assumed when a blonde enters a meeting late?", correct: "Probably didn't know the start time", wrong: ["Was fixing their appearance", "Couldn't find the room", "Got confused about the calendar"], category: "workplace" },
      { text: "How do commercials typically portray blondes?", correct: "Beautiful but needing help with basic tasks", wrong: ["Having fun but not solving problems", "Confident but not competent", "Popular but not particularly smart"], category: "media" },
      { text: "What's the common reaction when a blonde corrects someone?", correct: "Surprised and slightly defensive", wrong: ["Checking if the correction is right", "Asking who told them that", "Assuming they misunderstood something"], category: "social" },
      { text: "What do people expect from blonde humor?", correct: "Accidental comedy, not intentional wit", wrong: ["Laughing at themselves primarily", "Not getting sophisticated jokes", "Simple, uncomplicated comedy"], category: "social" },
      { text: "What's assumed about blondes in STEM fields?", correct: "They must be the exception, not the rule", wrong: ["Probably more focused on presentation", "There as diversity, not merit", "Will eventually switch to something easier"], category: "career" },
      { text: "How do people react to a blonde with a PhD?", correct: "That's so unexpected, good for you", wrong: ["Was the program difficult?", "What made you choose that path?", "Your advisor must have been supportive"], category: "education" },
      { text: "What do strangers assume blonde women are studying?", correct: "Something easy like communications or marketing", wrong: ["Fashion or beauty-related fields", "Anything that doesn't require math", "A field that values appearance"], category: "education" },
      { text: "What's the assumption when a blonde asks a question?", correct: "They probably don't understand the basics", wrong: ["It's a simple question in disguise", "They need extra clarification", "This might take a while to explain"], category: "communication" },
      { text: "How are blondes treated when they have authority?", correct: "Their competence is tested more often", wrong: ["Decisions are questioned more", "Subordinates need more proof of expertise", "Leadership is attributed to luck"], category: "workplace" },
      { text: "What do people assume about blonde reading habits?", correct: "Magazines over serious literature", wrong: ["Light fiction at most", "Nothing too intellectually challenging", "More interested in images than text"], category: "stereotypes" },
      { text: "What's assumed when a blonde speaks multiple languages?", correct: "Wait, you actually speak [language] fluently?", wrong: ["That must have been hard for you", "When did you have time to learn that?", "Are you sure you're fluent or just conversational?"], category: "skills" },
      { text: "How do people respond to blonde confidence?", correct: "Interpret it as naive or misplaced", wrong: ["Assume it's covering for insecurity", "Wonder where it comes from", "Expect it to fade with real challenges"], category: "social" },
    ],
    honest: [
      { text: "How do blondes honestly feel about blonde jokes?", correct: "Tired of fake laughing at the same ones", wrong: ["Frustrated that people think they're original", "Over it but hiding the annoyance", "Waiting for them to finally die out"], category: "feelings" },
      { text: "What do blondes honestly think when underestimated?", correct: "Fine, I'll prove them wrong again", wrong: ["Here we go, another person to convince", "This happens so often it's boring now", "Watch me exceed their low expectations"], category: "mindset" },
      { text: "Why do some blondes play into stereotypes?", correct: "It's exhausting to correct everyone constantly", wrong: ["Sometimes it's easier to just go along", "Fighting it takes more energy than accepting it", "People don't listen when you try to change their mind"], category: "survival" },
      { text: "What's a blonde's honest experience in job interviews?", correct: "Working twice as hard to be taken seriously", wrong: ["Anticipating the inevitable surprise", "Over-preparing because of lower expectations", "Knowing they need to prove themselves immediately"], category: "career" },
      { text: "How do blondes honestly feel about hair color assumptions?", correct: "It's just keratin, not a personality test", wrong: ["Wish people understood genetics better", "Tired of being reduced to pigmentation", "It says nothing about intelligence"], category: "frustration" },
      { text: "What do blondes honestly wish people knew?", correct: "Hair color has zero correlation with IQ", wrong: ["Stereotypes hurt even when they seem harmless", "They notice every dismissive look", "Assumptions are exhausting to navigate"], category: "wishes" },
      { text: "How do blondes honestly handle being talked down to?", correct: "Note it, then outperform them spectacularly", wrong: ["Correct them calmly but firmly", "Let it slide but remember later", "Prove them wrong with actions, not words"], category: "response" },
      { text: "What's a blonde's honest thought on 'for a blonde' compliments?", correct: "That's not the compliment you think it is", wrong: ["Why is my hair color relevant here?", "You're actually insulting me", "Just say I did well, drop the qualifier"], category: "reactions" },
      { text: "How do blondes honestly feel in male-dominated industries?", correct: "Fighting stereotypes from multiple angles at once", wrong: ["Proving competence feels twice as hard", "Every mistake is attributed to being blonde", "Success is never fully credited to ability"], category: "career" },
      { text: "What do blondes honestly think about dumb blonde portrayals?", correct: "Lazy writing that should have died in the 90s", wrong: ["Hollywood needs new character types", "It's harmful and overdone", "People actually believe this representation"], category: "media" },
      { text: "How do blondes honestly feel when proven right?", correct: "Vindicated but tired of needing proof", wrong: ["Satisfied but wish it wasn't necessary", "Happy but frustrated it took so long", "Pleased but exhausted by the pattern"], category: "feelings" },
      { text: "What's a blonde's honest reaction to 'you're not like other blondes'?", correct: "Because other blondes are just like me", wrong: ["That's not the compliment you intended", "You're the one with the wrong assumptions", "Maybe examine your stereotypes"], category: "reactions" },
      { text: "How do blondes honestly feel about hair dye comments?", correct: "My roots don't determine my brain cells", wrong: ["Natural or dyed shouldn't matter to you", "Why are you even asking about this?", "Focus on what I said, not my hair"], category: "appearance" },
      { text: "What do blondes honestly do when assumptions are made?", correct: "Decide case by case if it's worth correcting", wrong: ["Weigh the effort of explaining yet again", "Sometimes let it slide, sometimes push back", "Pick battles based on the situation"], category: "strategy" },
      { text: "How do blondes honestly feel about being underestimated?", correct: "Sometimes use it as a strategic advantage", wrong: ["It's annoying but can work in their favor", "Let them underestimate while exceeding", "Use low expectations to overdeliver"], category: "mindset" },
      { text: "What's a blonde's honest experience with first impressions?", correct: "Fighting uphill from the first second", wrong: ["Knowing they have more to prove than others", "Expecting the assumptions before they happen", "Preparing responses before questions come"], category: "social" },
      { text: "How do blondes honestly feel about representation?", correct: "Want complex blonde characters in media", wrong: ["Tired of being the comic relief", "Hoping for smart blonde leads someday", "Waiting for stereotypes to evolve"], category: "media" },
      { text: "What do blondes honestly think about blonde jokes from friends?", correct: "Tolerate them but keep a mental count", wrong: ["Wish they'd read the room better", "It's less funny every time", "Friends should know better by now"], category: "relationships" },
      { text: "How do blondes honestly feel in academic settings?", correct: "Answers scrutinized more than others", wrong: ["Correct answers sometimes get questioned", "Need more evidence to be believed", "Working harder to get equal credit"], category: "education" },
      { text: "What's a blonde's honest thought on casual bias?", correct: "It's death by a thousand small cuts", wrong: ["Each one seems small but they add up", "Individually nothing, collectively exhausting", "People don't realize what they do"], category: "experience" },
      { text: "How do blondes honestly handle workplace stereotypes?", correct: "Document everything, outperform everyone", wrong: ["Keep records of dismissive behavior", "Let results speak louder than assumptions", "Build a reputation that can't be denied"], category: "career" },
      { text: "What do blondes honestly wish would change?", correct: "That intelligence was never linked to appearance", wrong: ["That people stopped making assumptions", "That competence was the first assumption", "That hair color became irrelevant"], category: "wishes" },
      { text: "How do blondes honestly feel about explaining themselves?", correct: "Shouldn't be necessary, but always is", wrong: ["Tired of justifying their qualifications", "Wish credentials spoke for themselves", "Exhausted by the constant clarification"], category: "frustration" },
      { text: "What's a blonde's honest reaction to skepticism?", correct: "Noted, will prove wrong by end of meeting", wrong: ["Challenge accepted, watch closely", "Fine, I'll just have to show you", "Your doubt is my motivation"], category: "response" },
      { text: "How do blondes honestly process daily microaggressions?", correct: "Exhausting but normalized at this point", wrong: ["Notice every one, address few", "Pick moments to correct, let others go", "Mental note filed, moving on"], category: "experience" },
    ],
    embarrassing: [
      { text: "What embarrassing thing have blondes done to avoid conflict?", correct: "Laughed at offensive jokes about themselves", wrong: ["Pretended not to notice the assumption", "Let comments slide to keep the peace", "Changed the subject instead of correcting"], category: "social" },
      { text: "What do blondes secretly worry about more than they admit?", correct: "That they'll accidentally fit the stereotype", wrong: ["Making a mistake that 'proves' the bias", "Forgetting something publicly", "Any slip being attributed to hair color"], category: "anxiety" },
      { text: "What embarrassing moment do blondes experience regularly?", correct: "Being talked to like a child by strangers", wrong: ["Having things over-explained unnecessarily", "Being offered help for simple tasks", "Receiving instructions for basic things"], category: "social" },
      { text: "What do blondes find embarrassing about others' behavior?", correct: "The obvious relief when they're competent", wrong: ["The exaggerated surprise at intelligence", "The uncomfortable backpedaling", "The 'you're different' comments"], category: "reactions" },
      { text: "What embarrassing assumption do blondes face constantly?", correct: "That any success came from their appearance", wrong: ["That they had help they didn't need", "That someone else did the real work", "That connections mattered more than ability"], category: "career" },
      { text: "What's embarrassing about how people treat blonde achievements?", correct: "Crediting anything but their actual ability", wrong: ["Looking for other explanations", "Assuming luck over skill", "Attributing it to help from others"], category: "recognition" },
      { text: "What do blondes find embarrassing about dating assumptions?", correct: "That people assume they're easy or superficial", wrong: ["Being approached for looks only", "Assumptions about their standards", "People surprised by their depth"], category: "relationships" },
      { text: "What embarrassing thing happens to blondes in work settings?", correct: "Being mistaken for the secretary, not the manager", wrong: ["Assumptions about their role level", "Being assigned simpler tasks automatically", "Ideas attributed to others first"], category: "workplace" },
      { text: "What's embarrassing about how blondes are introduced?", correct: "Physical description before accomplishments", wrong: ["Hair mentioned before credentials", "Appearance noted before expertise", "Looks referenced in professional settings"], category: "social" },
      { text: "What do blondes find embarrassing about TV representation?", correct: "Being the punchline in every sitcom", wrong: ["Seeing the same stereotype repeatedly", "Characters that reinforce harmful ideas", "Comedy based on their hair color"], category: "media" },
      { text: "What embarrassing question do blondes get asked?", correct: "So, are you actually smart?", wrong: ["What did you do to get this job?", "Did you study for this?", "Who helped you with that?"], category: "social" },
      { text: "What's embarrassing about others' assumptions?", correct: "Being quizzed on qualifications more than others", wrong: ["Extra questions to verify competence", "Being tested when others aren't", "Needing to prove credentials repeatedly"], category: "workplace" },
      { text: "What embarrassing thing do blondes experience in groups?", correct: "Surprise when they lead the discussion", wrong: ["Being talked over initially", "Ideas dismissed then repeated by others", "Credit going to someone else"], category: "social" },
      { text: "What do blondes find embarrassing about compliments?", correct: "The 'but' that often follows them", wrong: ["Qualifiers that diminish the praise", "Hair color mentioned unnecessarily", "Surprise included in the compliment"], category: "social" },
      { text: "What embarrassing bias do blondes notice in hiring?", correct: "Being interviewed for culture fit over competence", wrong: ["Questions focused on personality", "Less technical discussion than expected", "Assumptions about their abilities"], category: "career" },
      { text: "What's embarrassing about others' reactions to achievements?", correct: "The obvious recalibration of expectations", wrong: ["Visible surprise at success", "Assumptions being revised in real-time", "People clearly adjusting their opinions"], category: "social" },
      { text: "What embarrassing thing do blondes deal with at networking events?", correct: "Not being taken seriously until proven", wrong: ["Small talk assumed instead of business", "Expertise questioned before confirmed", "Being underestimated in introductions"], category: "professional" },
      { text: "What do blondes find embarrassing about casual conversations?", correct: "The relief when they demonstrate knowledge", wrong: ["Being tested without realizing", "Others gauging their intelligence", "Surprise at substantive contributions"], category: "social" },
      { text: "What embarrassing pattern do blondes notice?", correct: "Having to prove themselves to each new person", wrong: ["Reputation not preceding them", "Starting from zero with everyone", "Credentials not being assumed"], category: "experience" },
      { text: "What's embarrassing about how achievements are described?", correct: "'She's smart for a blonde' type comments", wrong: ["Qualifiers added to praise", "Hair color included unnecessarily", "Accomplishments with caveats"], category: "recognition" },
      { text: "What embarrassing situation do blondes face in academia?", correct: "Professors being surprised at good grades", wrong: ["Extra verification of work", "Assumptions about study habits", "Expectations being exceeded visibly"], category: "education" },
      { text: "What do blondes find embarrassing about first meetings?", correct: "Watching assumptions form in real-time", wrong: ["Seeing the stereotype appear in their eyes", "Knowing what they're probably thinking", "The predictable judgment forming"], category: "social" },
      { text: "What embarrassing thing happens at job interviews?", correct: "Interviewers clearly adjusting expectations mid-interview", wrong: ["Questions becoming more complex as they respond", "Surprise at answers being visible", "The interview shifting once competence shows"], category: "career" },
      { text: "What's embarrassing about others' 'compliments'?", correct: "Being called 'not like other blondes'", wrong: ["Surprise presented as flattery", "Intelligence as unexpected trait", "Competence framed as exceptional"], category: "social" },
      { text: "What embarrassing bias do blondes see in media?", correct: "Being the before picture in makeover narratives", wrong: ["Blonde characters needing rescue", "Smart blonde as twist, not default", "Competence as character development"], category: "media" },
    ],
  },
  {
    panelId: "elder-sister",
    common: [
      { text: "What role did elder sisters play while growing up?", correct: "Unpaid assistant parent to siblings", wrong: ["The responsible one by default", "Translator between kids and parents", "Practice child for parenting mistakes"], category: "family" },
      { text: "What phrase do elder sisters hear most from parents?", correct: "Set an example for your siblings", wrong: ["You should know better than this", "They're looking up to you", "Show them how it's done"], category: "expectations" },
      { text: "What responsibility falls on elder sisters at family events?", correct: "Keeping the younger ones out of trouble", wrong: ["Making sure everyone eats properly", "Helping in the kitchen automatically", "Managing the kids' entertainment"], category: "events" },
      { text: "How do parents react when elder sisters make mistakes?", correct: "Stricter because siblings are watching", wrong: ["Disappointed because expectations were higher", "Punishment plus lecture about influence", "Reminded that they're supposed to be better"], category: "discipline" },
      { text: "What do elder sisters sacrifice that's rarely acknowledged?", correct: "Their childhood to help raise the others", wrong: ["Time that could've been for themselves", "Freedom other firstborns didn't have", "Age-appropriate activities for responsibilities"], category: "sacrifice" },
      { text: "What academic pressure do elder sisters face?", correct: "Setting the bar high for siblings to follow", wrong: ["Being the experiment for education strategies", "Proving the family's academic potential", "Performing to establish the standard"], category: "education" },
      { text: "What skill do elder sisters develop involuntarily?", correct: "Mediating family conflicts before they escalate", wrong: ["Reading the room for tension", "Managing different personalities at once", "Diffusing arguments strategically"], category: "skills" },
      { text: "How do younger siblings view elder sisters?", correct: "Too bossy and always in their business", wrong: ["Stricter than parents sometimes", "Know-it-all who won't leave them alone", "Unnecessarily involved in everything"], category: "dynamics" },
      { text: "What's the elder sister's unofficial job title?", correct: "On-call babysitter who didn't apply", wrong: ["Emergency caretaker without notice", "Backup parent when needed", "Default supervisor of chaos"], category: "role" },
      { text: "What do elder sisters learn to do without being taught?", correct: "Putting everyone else's needs first", wrong: ["Anticipating what siblings need", "Taking care of situations automatically", "Managing household when parents are busy"], category: "behavior" },
      { text: "What expectation do elder sisters face in relationships?", correct: "Being mature and understanding always", wrong: ["Having it together more than others", "Being the reasonable one in conflicts", "Managing emotions for everyone"], category: "relationships" },
      { text: "What's the elder sister's role during family crises?", correct: "Emotional support while being strong", wrong: ["Handling logistics while grieving", "Taking care of everyone else first", "Being the calm one for others"], category: "family" },
      { text: "What do elder sisters automatically do with advice?", correct: "Give it whether asked or not", wrong: ["Share lessons learned unsolicited", "Offer wisdom from experience freely", "Help before being asked to"], category: "behavior" },
      { text: "What pressure do elder sisters feel about their achievements?", correct: "Making parents proud to motivate siblings", wrong: ["Proving the family can succeed", "Being the model for what's possible", "Showing siblings what to aim for"], category: "achievement" },
      { text: "What's expected when elder sisters visit home?", correct: "Help with everything like they never left", wrong: ["Resume responsibilities immediately", "Pick up where they left off", "Take over household duties again"], category: "family" },
      { text: "How do elder sisters handle sibling achievements?", correct: "Proud but slightly competitive inside", wrong: ["Genuinely happy but comparing secretly", "Supportive while noting they did it first", "Celebrating while remembering their own"], category: "dynamics" },
      { text: "What do elder sisters get blamed for by default?", correct: "Not watching the siblings closely enough", wrong: ["Whatever went wrong with the younger ones", "Any trouble siblings get into", "Sibling behavior issues"], category: "blame" },
      { text: "What's the elder sister's approach to holidays?", correct: "Organizing while pretending not to", wrong: ["Planning everything people don't notice", "Managing logistics naturally", "Keeping events running smoothly"], category: "events" },
      { text: "What do elder sisters know about siblings they wish they didn't?", correct: "Everything from covering for them for years", wrong: ["Secrets kept from parents still", "All the times they saved them", "Things that could've gotten them in trouble"], category: "knowledge" },
      { text: "What's the elder sister's default in family disagreements?", correct: "The one who has to understand everyone", wrong: ["Mediator who can't take sides", "The one expected to compromise", "Peacekeeper whether they want to be or not"], category: "dynamics" },
      { text: "How do elder sisters handle family drama?", correct: "Knowing everyone's side from all the venting", wrong: ["Being the confidant for everyone separately", "Carrying information they can't share", "Hearing all perspectives without commenting"], category: "family" },
      { text: "What do elder sisters do when siblings have problems?", correct: "Drop everything to help fix it", wrong: ["Offer solutions before being asked", "Step in to manage the situation", "Help even when they're struggling too"], category: "support" },
      { text: "What's the elder sister's experience with personal boundaries?", correct: "Learning to have them only in adulthood", wrong: ["Boundaries didn't exist growing up", "Privacy was for other families", "Personal space was a foreign concept"], category: "growth" },
      { text: "How do elder sisters react when siblings get preferential treatment?", correct: "Notice but don't mention it often", wrong: ["File it away for later acknowledgment", "Accept it as the natural order", "Internally keep a running tally"], category: "dynamics" },
      { text: "What's the elder sister's default setting at gatherings?", correct: "Checking if everyone has what they need", wrong: ["Making sure siblings are behaving", "Looking out for the whole family", "Managing things without being asked"], category: "events" },
    ],
    honest: [
      { text: "How does the eldest daughter honestly feel about her role?", correct: "Love them but resent the responsibility sometimes", wrong: ["Grateful but exhausted often", "Proud but wish it was different", "Close to them but tired of always being needed"], category: "feelings" },
      { text: "What does an elder sister honestly wish?", correct: "That being a kid was an option back then", wrong: ["That responsibilities were shared equally", "That someone asked what she wanted", "That expectations weren't so high"], category: "wishes" },
      { text: "How does the eldest honestly feel about favoritism?", correct: "Know the youngest got easier treatment", wrong: ["Notice the different rules for them", "See the softer parenting they got", "Acknowledge the double standards silently"], category: "family" },
      { text: "What's the eldest's honest reaction to 'you're so mature'?", correct: "Wasn't given another choice, really", wrong: ["Maturity was survival, not personality", "Had to grow up faster than wanted", "Didn't have the luxury of being immature"], category: "response" },
      { text: "How does an elder sister honestly feel about boundaries?", correct: "Still learning they're allowed to have them", wrong: ["Realizing at 30 that she can say no", "Understanding privacy is actually okay", "Figuring out her needs matter too"], category: "growth" },
      { text: "What does the elder sister honestly think about family expectations?", correct: "Overwhelming but carried silently", wrong: ["Too much but never complained", "Heavy but never acknowledged", "Crushing but dealt with alone"], category: "pressure" },
      { text: "How does the eldest honestly feel about sibling gratitude?", correct: "Wish they knew everything she gave up", wrong: ["Hope someday they'll understand", "Want acknowledgment, not just thanks", "Waiting for recognition that may never come"], category: "feelings" },
      { text: "What's the eldest's honest thought about being responsible?", correct: "Sometimes want permission to mess up too", wrong: ["Want to be irresponsible just once", "Wish failure was allowed for them", "Tired of always having to be right"], category: "pressure" },
      { text: "How does an elder sister honestly feel about 'you understand'?", correct: "Code for asking her to sacrifice again", wrong: ["Means her needs don't matter here", "Translation: don't complain about this", "Signal that she should accept it"], category: "experience" },
      { text: "What does the eldest honestly wish parents knew?", correct: "That she needed parenting too, not partnering", wrong: ["That she was also just a kid", "That she needed care, not just responsibilities", "That childhood should've been different"], category: "wishes" },
      { text: "How does the elder sister honestly feel about asking for help?", correct: "Feels wrong even when she desperately needs it", wrong: ["Like she's failing if she asks", "Guilt for not handling it alone", "Uncomfortable because it's unfamiliar"], category: "behavior" },
      { text: "What's the eldest's honest experience with self-care?", correct: "Still learning her needs are valid", wrong: ["Feels selfish prioritizing herself", "Guilt accompanies personal time", "Struggling to put herself first"], category: "growth" },
      { text: "How does an elder sister honestly feel about always being strong?", correct: "Exhausting but doesn't know another way", wrong: ["Tired but it's default mode", "Draining but feels expected", "Heavy but seems required"], category: "feelings" },
      { text: "What does the eldest honestly think when siblings struggle?", correct: "Instinct to fix it, even if tired", wrong: ["Want to help but wish she didn't have to", "Can't ignore it even if she tries", "Natural response is to step in"], category: "behavior" },
      { text: "How does the elder sister honestly feel about holidays now?", correct: "Still organizing even when she said she wouldn't", wrong: ["Can't help but take charge", "Falls into old patterns automatically", "Tries to step back but ends up leading"], category: "patterns" },
      { text: "What's the eldest's honest thought about sibling success?", correct: "Proud but wonder if she paved the way", wrong: ["Happy but think about her contributions", "Pleased but recall her sacrifices", "Supportive but know she helped make it possible"], category: "feelings" },
      { text: "How does an elder sister honestly view her childhood?", correct: "More responsibility than kid experiences", wrong: ["Memories of duties, not just play", "Growing up faster than others", "Adult concerns at a young age"], category: "reflection" },
      { text: "What does the eldest honestly feel about her current role?", correct: "Still the go-to person, always will be", wrong: ["Default for family problems still", "First call when anything happens", "Expected to handle things forever"], category: "reality" },
      { text: "How does the elder sister honestly feel about parental praise?", correct: "For responsibility, rarely for being herself", wrong: ["For achievements in caretaking", "For maturity, not her personality", "For what she did, not who she is"], category: "recognition" },
      { text: "What's the eldest's honest relationship with guilt?", correct: "Constant companion, even when undeserved", wrong: ["Present even when she did nothing wrong", "There even when she prioritizes herself", "Follows any boundary she sets"], category: "emotions" },
      { text: "How does an elder sister honestly feel about her independence?", correct: "Fought hard for it, still feels guilty", wrong: ["Earned it but feels selfish having it", "Necessary but comes with baggage", "Wanted it but carries family weight still"], category: "growth" },
      { text: "What does the eldest honestly think about therapy revelations?", correct: "Realizing a lot wasn't normal or fair", wrong: ["Understanding her childhood differently now", "Processing what she thought was standard", "Recognizing patterns that weren't healthy"], category: "healing" },
      { text: "How does the elder sister honestly feel about being the 'stable' one?", correct: "Sometimes wants permission to fall apart", wrong: ["Wish someone would catch her too", "Want support without having to ask", "Need to be taken care of sometimes"], category: "feelings" },
      { text: "What's the eldest's honest thought about family dynamics?", correct: "See patterns no one else acknowledges", wrong: ["Notice things that go unsaid", "Understand dynamics others miss", "Aware of issues kept quiet"], category: "observation" },
      { text: "How does an elder sister honestly feel about the future?", correct: "Hope to break the cycle with her own kids", wrong: ["Want to do things differently", "Determined to change the pattern", "Committed to not repeating it"], category: "future" },
    ],
    embarrassing: [
      { text: "What embarrassing thing do elder sisters do automatically?", correct: "Parent mode activating in inappropriate settings", wrong: ["Correcting people who aren't their siblings", "Offering unsolicited advice to strangers", "Managing situations that aren't their business"], category: "behavior" },
      { text: "What's an elder sister's embarrassing habit in relationships?", correct: "Mothering partners without realizing it", wrong: ["Taking care of adults who can manage", "Organizing others' lives automatically", "Managing when not asked to"], category: "relationships" },
      { text: "What embarrassing title do elder sisters get?", correct: "The second mother who appointed herself", wrong: ["The one who acts like she's in charge", "The assistant parent everyone rolls eyes at", "The sibling who forgot she's not the mom"], category: "roles" },
      { text: "What do elder sisters embarrassingly know about everyone?", correct: "Family secrets from being everyone's confidant", wrong: ["Information no one asked her to keep", "Details that weren't her business", "Secrets from years of covering for siblings"], category: "knowledge" },
      { text: "What embarrassing thing do elder sisters do at family dinners?", correct: "Check if everyone's eating enough, including adults", wrong: ["Monitor the table like she's hosting", "Make sure everyone has what they need", "Manage the meal without being asked"], category: "events" },
      { text: "What do elder sisters embarrassingly struggle with?", correct: "Not correcting people who are wrong", wrong: ["Letting others make preventable mistakes", "Watching someone do it the wrong way", "Staying quiet when she knows better"], category: "behavior" },
      { text: "What embarrassing reaction do elder sisters have to chaos?", correct: "Instant need to organize and fix it", wrong: ["Can't relax until it's handled", "Physically uncomfortable with disorder", "Must step in even when not their problem"], category: "instincts" },
      { text: "What do elder sisters embarrassingly do in group projects?", correct: "Take over because 'someone has to'", wrong: ["End up doing most of the work", "Manage the team automatically", "Assign roles without being asked"], category: "work" },
      { text: "What embarrassing assumption do elder sisters make?", correct: "That everyone needs their guidance", wrong: ["That they know best by default", "That others want their help", "That their experience is always relevant"], category: "mindset" },
      { text: "What do elder sisters embarrassingly say to partners' families?", correct: "Offer to help with everything immediately", wrong: ["Insert themselves into hosting duties", "Start helping before being asked", "Take over tasks automatically"], category: "social" },
      { text: "What embarrassing thing happens when elder sisters try to relax?", correct: "Mentally running through everyone's problems", wrong: ["Can't stop thinking about family needs", "Feeling like something is being forgotten", "Guilt for not being productive"], category: "relaxation" },
      { text: "What do elder sisters embarrassingly do at parties?", correct: "End up managing the cleanup", wrong: ["Organize the event without realizing", "Check if the host needs help repeatedly", "Take responsibility that isn't theirs"], category: "social" },
      { text: "What embarrassing texts do elder sisters send?", correct: "Checking in on siblings who didn't ask", wrong: ["Reminders for things adults can handle", "Follow-ups on non-urgent matters", "Advice for situations not shared with her"], category: "communication" },
      { text: "What do elder sisters embarrassingly struggle to accept?", correct: "That siblings are capable adults now", wrong: ["That they can handle their own problems", "That help isn't always needed", "That letting go is actually okay"], category: "growth" },
      { text: "What embarrassing thing do elder sisters do with friends' problems?", correct: "Slip into fix-it mode automatically", wrong: ["Give advice when just listening was needed", "Offer solutions before empathy", "Try to manage the situation"], category: "relationships" },
      { text: "What do elder sisters embarrassingly bring to events?", correct: "Extra supplies 'just in case' for everyone", wrong: ["Things no one asked for but might need", "Backup items for every scenario", "Preparation that seems excessive"], category: "habits" },
      { text: "What embarrassing memory do elder sisters have?", correct: "Parent-teacher conferences they attended for siblings", wrong: ["Adult conversations they sat in on", "Responsibilities that weren't age-appropriate", "Things kids shouldn't have to handle"], category: "childhood" },
      { text: "What do elder sisters embarrassingly do during conflicts?", correct: "Mediate when it's not their fight", wrong: ["Insert themselves as peacemaker", "Try to fix issues between others", "Can't help but get involved"], category: "behavior" },
      { text: "What embarrassing trait do elder sisters have at work?", correct: "Treating colleagues like younger siblings", wrong: ["Mentoring without being asked", "Looking out for people who don't need it", "Managing people who report to someone else"], category: "workplace" },
      { text: "What do elder sisters embarrassingly do with free time?", correct: "Feel guilty for not being productive", wrong: ["Use it to catch up on others' needs", "Fill it with tasks that help family", "Struggle to actually relax"], category: "lifestyle" },
      { text: "What embarrassing thing do elder sisters overshare?", correct: "Sibling stories that prove their caretaking", wrong: ["Examples of times they saved the day", "Evidence of how responsible they are", "Stories about managing family chaos"], category: "social" },
      { text: "What do elder sisters embarrassingly hold onto?", correct: "Receipts of everything they've done for family", wrong: ["Mental records of sacrifices made", "Memories of times they weren't thanked", "Evidence of contributions unacknowledged"], category: "feelings" },
      { text: "What embarrassing reaction do elder sisters have to praise?", correct: "Deflect it to talk about siblings' achievements", wrong: ["Immediately think of what others did", "Uncomfortable accepting just for herself", "Redirect attention to family"], category: "response" },
      { text: "What do elder sisters embarrassingly struggle to ask for?", correct: "Help, because she's supposed to give it", wrong: ["Support, because she's the supporter", "Time for herself without guilt", "Her own needs to be prioritized"], category: "needs" },
      { text: "What embarrassing pattern do elder sisters repeat?", correct: "Dating people who need to be taken care of", wrong: ["Attracted to fixing others", "Choosing partners who need managing", "Finding people who need her"], category: "relationships" },
    ],
  },
  {
    panelId: "millennials",
    common: [
      { text: "What do millennials check before making any major purchase?", correct: "Reviews on at least three different platforms", wrong: ["Reddit threads for real opinions", "YouTube videos with honest takes", "Their bank account and upcoming bills"], category: "shopping" },
      { text: "How do millennials feel about voicemails?", correct: "Will listen eventually, probably not", wrong: ["Anxiety until they check what it says", "Transcription or nothing", "Who leaves voicemails in 2024?"], category: "communication" },
      { text: "What's a millennial's response to 'we need to talk'?", correct: "Already spiraling through every possibility", wrong: ["Heart rate elevated immediately", "Mentally preparing for the worst", "Rehearsing responses before the conversation"], category: "anxiety" },
      { text: "What did millennials expect from their careers?", correct: "Purpose plus stability, got neither", wrong: ["Passion that also pays the bills", "Work-life balance that actually works", "Advancement based on merit and effort"], category: "career" },
      { text: "How do millennials handle birthday invites for kids?", correct: "RSVP via group text with all parents", wrong: ["Create a shared calendar event", "Check schedules across all platforms", "Confirm then add to the family calendar"], category: "parenting" },
      { text: "What do millennials remember about their first job interviews?", correct: "Being told experience was needed for entry-level", wrong: ["Unpaid internship as 'opportunity'", "Promise of growth that never came", "Passion as a substitute for fair pay"], category: "career" },
      { text: "What streaming situation stresses millennials out?", correct: "Content scattered across eight subscriptions", wrong: ["Deciding what to watch for 40 minutes", "Finding something both partners agree on", "That show moving to another platform"], category: "entertainment" },
      { text: "How do millennials approach home buying?", correct: "Researching like they'll ever afford it", wrong: ["Calculators and dream spreadsheets", "Watching market like they're in it", "Avocado toast jokes aren't funny anymore"], category: "housing" },
      { text: "What's a millennial's relationship with plants?", correct: "Treat them like the children they might not have", wrong: ["Named all of them, know their schedules", "Research their needs like dependents", "Emotional about any that don't make it"], category: "lifestyle" },
      { text: "How do millennials handle nostalgia?", correct: "Deep dive into 90s and 2000s content monthly", wrong: ["Playlists organized by childhood era", "Rewatching shows from decades ago", "References that Gen Z won't understand"], category: "culture" },
      { text: "What do millennials think about self-care?", correct: "Know it's important, can't afford it", wrong: ["Bath bombs count as mental health", "Cancelling plans is a valid form", "Buying things they don't need but deserve"], category: "wellness" },
      { text: "How do millennials feel about weddings now?", correct: "Excited but calculating the cost immediately", wrong: ["Love going but budgeting the gift", "Happy for them, stressed for wallet", "Enthusiastic until travel costs appear"], category: "social" },
      { text: "What's a millennial's approach to side hustles?", correct: "Have at least one, probably two", wrong: ["Gig economy is just regular economy now", "Multiple income streams are survival", "Main job doesn't cover everything"], category: "work" },
      { text: "How do millennials handle comparison on social media?", correct: "Know it's fake, still feel behind", wrong: ["Understand it's curated, still compare", "Logically get it, emotionally don't", "Aware of the game, still playing it"], category: "social-media" },
      { text: "What do millennials think about retirement?", correct: "A concept they read about in books", wrong: ["Something they'll figure out later", "401k means hoping for the best", "Planning for something that seems impossible"], category: "finance" },
      { text: "How do millennials respond to 'just buy a house'?", correct: "Internal screaming, external politeness", wrong: ["Explain the market, no one listens", "Smile through the unhelpful advice", "Calculation of what they'd need immediately"], category: "housing" },
      { text: "What's a millennial's fitness approach?", correct: "Gym membership used seasonally at best", wrong: ["YouTube workouts at home mostly", "Apps that track but don't motivate", "Intention to exercise more than execution"], category: "health" },
      { text: "How do millennials feel about being called 'old' by Gen Z?", correct: "Existential crisis in a single comment", wrong: ["Wait, when did this happen?", "Didn't realize 30s was ancient now", "Defending their relevance internally"], category: "aging" },
      { text: "What do millennials hoard digitally?", correct: "Screenshots they'll definitely look at never", wrong: ["Bookmarks from 2015 still saved", "Saved posts across every platform", "Tabs that have been open for weeks"], category: "technology" },
      { text: "How do millennials handle climate anxiety?", correct: "Recycling while knowing it's not enough", wrong: ["Small actions with existential dread", "Doing what they can, aware it's limited", "Trying while feeling the futility"], category: "mental-health" },
      { text: "What's a millennial's relationship with coffee?", correct: "Personality trait meets survival mechanism", wrong: ["Specific order that cannot be changed", "Morning ritual that structures the day", "Spending money they shouldn't on it"], category: "lifestyle" },
      { text: "How do millennials approach doctor's appointments?", correct: "Googled symptoms for a week first", wrong: ["WebMD before making the call", "Reddit threads for diagnosis", "Appointment plus prepared research"], category: "health" },
      { text: "What do millennials think about work communication?", correct: "Email for paper trail, Slack for everything else", wrong: ["Calendar holds should be laws", "Meetings that could've been messages", "The passive-aggressive 'per my last email'"], category: "work" },
      { text: "How do millennials react to surprise phone calls?", correct: "Stare at it ringing, then text 'what's up'", wrong: ["Heart rate spikes immediately", "Let it go to voicemail, call back prepared", "Assume the worst until they know"], category: "communication" },
      { text: "What's a millennial's take on adulting?", correct: "Still don't feel like a real adult honestly", wrong: ["Waiting for the 'adult' to arrive", "Faking it, never made it", "Responsibilities without the readiness"], category: "life" },
    ],
    honest: [
      { text: "How do millennials honestly feel about their financial future?", correct: "Terrified but too tired to panic daily", wrong: ["Anxious but pushing through", "Worried but functioning", "Scared but can't dwell on it"], category: "finance" },
      { text: "What do millennials honestly think about work-life balance?", correct: "Concept they advocate for but don't have", wrong: ["Something they talk about but can't achieve", "Ideal they support but don't experience", "Value they preach but don't practice"], category: "work" },
      { text: "How do millennials honestly feel about their parents' generation?", correct: "Love them but frustrated by different realities", wrong: ["Care about them but wish they understood", "Close to them but feel unseen", "Appreciate them but recognize the gap"], category: "family" },
      { text: "What do millennials honestly think about being 'the middle' generation?", correct: "Exhausted by both sides' expectations", wrong: ["Caught between two worlds constantly", "Neither old enough nor young enough", "Too old for Gen Z, too young for Boomers"], category: "identity" },
      { text: "How do millennials honestly feel about their career paths?", correct: "Pivoted so many times they lost count", wrong: ["Original plan derailed years ago", "Flexibility born from necessity", "Career trajectory looks like a maze"], category: "career" },
      { text: "What do millennials honestly think about dating apps?", correct: "Hate them but what's the alternative", wrong: ["Exhausting but necessary somehow", "Terrible but still swiping", "Broken but no other option"], category: "relationships" },
      { text: "How do millennials honestly feel about nostalgia content?", correct: "Comfort from a time when things seemed simpler", wrong: ["Escape to when the future felt possible", "Return to before everything got complicated", "Safe space from current anxieties"], category: "mental-health" },
      { text: "What do millennials honestly think about their screen time?", correct: "Alarming but not changing it", wrong: ["Know it's bad, continue anyway", "Aware of the problem, not addressing it", "See the number, ignore the number"], category: "technology" },
      { text: "How do millennials honestly feel about starting families?", correct: "Want to but running out of financial runway", wrong: ["Desire vs. reality conflict", "Emotional ready, not practically ready", "Heart says yes, wallet says wait"], category: "life" },
      { text: "What do millennials honestly think about therapy?", correct: "Normalized it but can't always afford it", wrong: ["Believe in it, struggle to access it", "Advocate for it, can't maintain it", "Know it helps, cost is prohibitive"], category: "mental-health" },
      { text: "How do millennials honestly feel about success markers?", correct: "Didn't hit them and redefined what success means", wrong: ["Traditional metrics don't apply anymore", "Changed the goalposts because they had to", "Success looks different than expected"], category: "life" },
      { text: "What do millennials honestly think about their education debt?", correct: "Paying it off like a second rent forever", wrong: ["Loan companies are their longest relationship", "Degree that costs more than it earned", "Investment that hasn't paid off yet"], category: "finance" },
      { text: "How do millennials honestly feel about current events?", correct: "Informed but emotionally exhausted by it all", wrong: ["Know too much, wish they didn't", "Staying aware while trying to cope", "Following everything, processing nothing"], category: "mental-health" },
      { text: "What do millennials honestly think about their health?", correct: "Should probably see a doctor but haven't", wrong: ["Ignoring things because of cost", "Hoping problems resolve themselves", "WebMD as primary healthcare"], category: "health" },
      { text: "How do millennials honestly feel about work culture?", correct: "Burned out but grateful to be employed", wrong: ["Exhausted but can't afford to quit", "Overworked but scared of alternative", "Tired but aware it could be worse"], category: "work" },
      { text: "What do millennials honestly think about being called lazy?", correct: "Work multiple jobs but sure, we're lazy", wrong: ["Hustling constantly but narrative persists", "Productivity through exhaustion", "Outwork the stereotype, still labeled"], category: "stereotypes" },
      { text: "How do millennials honestly feel about their resilience?", correct: "Proud of surviving but wish it wasn't necessary", wrong: ["Adapted out of necessity", "Strong because there was no choice", "Resilient but tired of needing to be"], category: "feelings" },
      { text: "What do millennials honestly think about social media breaks?", correct: "Know they need one, won't take one", wrong: ["Aware it helps, don't commit", "Consider it regularly, never do it", "Talk about it more than practice it"], category: "technology" },
      { text: "How do millennials honestly feel about their mental health?", correct: "Functioning but barely, and that's fine", wrong: ["Getting by, which counts as okay", "Managing, lower bar than expected", "Surviving is success at this point"], category: "mental-health" },
      { text: "What do millennials honestly think about future planning?", correct: "Hard to plan when nothing goes to plan", wrong: ["Five-year plans seem laughable now", "Goals in a world that keeps shifting", "Trying to prepare for unpredictability"], category: "future" },
      { text: "How do millennials honestly feel about their friendships?", correct: "Deep connections maintained by group chat only", wrong: ["Love them, never see them", "Close but schedules don't align", "Best friends who meet twice a year"], category: "relationships" },
      { text: "What do millennials honestly think about trends?", correct: "Can't keep up and stopped trying", wrong: ["Observing from the sidelines now", "Gen Z moves too fast to follow", "Aware they're happening, not participating"], category: "culture" },
      { text: "How do millennials honestly feel about being adults?", correct: "Winging it and hoping no one notices", wrong: ["Imposter in their own life", "Playing pretend professionally", "Adult costume, kid inside"], category: "life" },
      { text: "What do millennials honestly think about work-from-home?", correct: "Best and worst thing simultaneously", wrong: ["Freedom and isolation mixed", "Flexibility with boundary issues", "Loved until it blurred everything"], category: "work" },
      { text: "How do millennials honestly feel about their impact?", correct: "Tried to change things, exhausted by results", wrong: ["Wanted to make difference, barely surviving", "Idealistic intentions, practical limitations", "Had hopes, have bills now"], category: "life" },
    ],
    embarrassing: [
      { text: "What embarrassing thing do millennials still quote?", correct: "Harry Potter references for every life situation", wrong: ["Office quotes in professional settings", "Mean Girls for conflict resolution", "Early 2000s memes that no one remembers"], category: "culture" },
      { text: "What do millennials embarrassingly remember?", correct: "Their MySpace song and Top 8 drama", wrong: ["AIM away messages that were too deep", "Facebook albums they can't find anymore", "Embarrassing email addresses from 2006"], category: "nostalgia" },
      { text: "What's a millennial's embarrassing fear?", correct: "That Gen Z sees them as the new Boomers", wrong: ["Being told they're out of touch", "Using slang incorrectly in public", "Not understanding new platforms"], category: "aging" },
      { text: "What do millennials embarrassingly still own?", correct: "DVD collections for 'in case' scenarios", wrong: ["CD binders in storage somewhere", "Tech cables from devices long gone", "Instruction manuals for nothing they have"], category: "hoarding" },
      { text: "What embarrassing thing do millennials do when stressed?", correct: "Rewatch the same comfort shows for the tenth time", wrong: ["Listen to the same playlist from college", "Order food they can't afford", "Online shop without purchasing"], category: "coping" },
      { text: "What do millennials embarrassingly believe about themselves?", correct: "They're still the young generation somehow", wrong: ["30s is basically late 20s mentally", "They're not that different from Gen Z", "Age is just a number, right?"], category: "denial" },
      { text: "What embarrassing habit do millennials have online?", correct: "Using '.' between words for emphasis unironically", wrong: ["Hashtags that are entire sentences", "Lol at the end of serious messages", "Overuse of crying laughing emoji"], category: "communication" },
      { text: "What do millennials embarrassingly try to explain?", correct: "That they actually invented the internet culture", wrong: ["Why their references are still relevant", "How they did this first, actually", "That they were posting memes before it was cool"], category: "ego" },
      { text: "What embarrassing financial decision do millennials make?", correct: "Subscription services they forgot about", wrong: ["Impulse purchases justified as self-care", "Buying things to feel okay temporarily", "Monthly charges for apps never used"], category: "finance" },
      { text: "What do millennials embarrassingly check?", correct: "If their ex is doing better or worse than them", wrong: ["Social media of people they don't talk to", "Profiles of high school acquaintances", "What happened to that one person from college"], category: "social-media" },
      { text: "What embarrassing phrase do millennials overuse?", correct: "I can't even, which they definitely still say", wrong: ["That's so random, unironically", "Living my best life, constantly", "It is what it is, for everything"], category: "language" },
      { text: "What do millennials embarrassingly do at concerts?", correct: "Record entire songs on their phone to never watch", wrong: ["Complain about standing the whole time", "Need to sit more than expected", "Leave before the encore sometimes"], category: "entertainment" },
      { text: "What embarrassing thing do millennials collect digitally?", correct: "Unread ebooks they meant to finish", wrong: ["Podcasts downloaded but never played", "Articles saved for later, never read", "Courses started and abandoned"], category: "hoarding" },
      { text: "What do millennials embarrassingly remember fondly?", correct: "Dial-up internet sounds as 'simpler times'", wrong: ["Waiting for songs to download overnight", "Burning CDs as an art form", "The excitement of an email notification"], category: "nostalgia" },
      { text: "What embarrassing thing do millennials say about Gen Z?", correct: "We're not that different, really", wrong: ["I actually understand most of their slang", "They'll appreciate us when they're older", "We walked so they could run"], category: "generational" },
      { text: "What do millennials embarrassingly spend on?", correct: "Experiences they post about then forget", wrong: ["Aesthetic food for Instagram only", "Wellness products that promised too much", "Self-help books that sit on shelves"], category: "spending" },
      { text: "What embarrassing realization do millennials have?", correct: "They parent the way they said they never would", wrong: ["Sounding exactly like their parents now", "Giving the same advice they ignored", "Understanding things they used to mock"], category: "aging" },
      { text: "What do millennials embarrassingly defend?", correct: "Skinny jeans against any trend opposition", wrong: ["Side parts like their identity depends on it", "Their generational achievements", "Platforms they grew up with"], category: "culture" },
      { text: "What embarrassing thing do millennials keep secret?", correct: "How much time they spend on Facebook still", wrong: ["That they actually enjoy some Boomer content", "Reading articles their parents share", "Checking platform they say they don't use"], category: "social-media" },
      { text: "What do millennials embarrassingly relate to?", correct: "Memes about being tired but can't sleep", wrong: ["Content about not having their life together", "Jokes about buying things to feel okay", "Posts about wanting to cancel all plans"], category: "mental-health" },
      { text: "What embarrassing activity do millennials do for fun?", correct: "Competitive trivia about 90s nostalgia", wrong: ["Quote movies from 2004 with friends", "Rank things from childhood seriously", "Debate which generation had it better"], category: "entertainment" },
      { text: "What do millennials embarrassingly hold grudges about?", correct: "Articles that blamed them for killing industries", wrong: ["Being told to stop eating avocados", "Economic advice from people with different experiences", "Generational stereotypes that won't die"], category: "culture" },
      { text: "What embarrassing thing do millennials do professionally?", correct: "Use 'synergy' unironically in meetings now", wrong: ["Send emails with too many exclamation points", "Corporate language they used to mock", "Jargon they swore they'd never use"], category: "work" },
      { text: "What do millennials embarrassingly try to hide?", correct: "That they learned TikTok trends from their kids", wrong: ["That they don't understand all the new slang", "That some Gen Z references confuse them", "That they had to Google recent memes"], category: "culture" },
      { text: "What embarrassing truth do millennials avoid?", correct: "They're now the managers they complained about", wrong: ["Becoming the adults they questioned", "Understanding why things were the way they were", "Agreeing with takes they used to fight"], category: "aging" },
    ],
  },
  {
    panelId: "boomers",
    common: [
      { text: "What's a Boomer's approach to technology problems?", correct: "Call their kids or grandkids first", wrong: ["Restart everything and hope", "Google the error message", "Watch a YouTube tutorial slowly"], category: "technology" },
      { text: "How do Boomers prefer to make reservations?", correct: "Phone call to speak with a real person", wrong: ["Have someone else do it online", "Walk in and ask directly", "Call the restaurant multiple times to confirm"], category: "communication" },
      { text: "What's a Boomer's response to 'just Google it'?", correct: "Why can't you just tell me the answer?", wrong: ["Prefer to ask someone who knows", "Google doesn't explain like a person", "Would rather call someone instead"], category: "technology" },
      { text: "How do Boomers feel about self-checkout?", correct: "Would rather wait for a real cashier", wrong: ["Don't trust the machines fully", "Prefer the human interaction", "Avoid unless absolutely necessary"], category: "shopping" },
      { text: "What do Boomers think about working from home?", correct: "How do you know people are actually working?", wrong: ["Work happens in an office, period", "Face time matters for productivity", "Need to see employees to trust them"], category: "work" },
      { text: "What's a Boomer's view on multiple streaming services?", correct: "Miss when cable had everything in one place", wrong: ["Too complicated to manage", "Why pay for so many separate things?", "Netflix was enough, why did this happen?"], category: "entertainment" },
      { text: "How do Boomers approach email?", correct: "Print important ones for their records", wrong: ["Read every single one thoroughly", "Reply all as the default", "Check it at scheduled times only"], category: "technology" },
      { text: "What do Boomers value in customer service?", correct: "Speaking to a human who can actually help", wrong: ["Someone who takes their time", "A person who remembers them", "Direct phone numbers that work"], category: "service" },
      { text: "How do Boomers feel about passwords?", correct: "Write them down in a physical notebook", wrong: ["Use memorable combinations", "One password for most things", "Keep them somewhere 'safe'"], category: "technology" },
      { text: "What's a Boomer's approach to news?", correct: "Morning paper or evening TV news ritual", wrong: ["Trusted sources they've used for decades", "Same anchor they've watched for years", "News at specific times, not all day"], category: "media" },
      { text: "How do Boomers handle flight bookings?", correct: "Call the airline or use a travel agent", wrong: ["Print all confirmations and itineraries", "Arrive at the airport very early", "Prefer speaking to someone directly"], category: "travel" },
      { text: "What do Boomers think about social media influencers?", correct: "Don't understand how that's a real job", wrong: ["Kids these days have strange careers", "Whatever happened to real professions?", "How do they actually make money?"], category: "culture" },
      { text: "How do Boomers prefer to give feedback?", correct: "Direct conversation, not passive text", wrong: ["Face to face when possible", "Phone call if in-person isn't option", "Honest and straightforward always"], category: "communication" },
      { text: "What's a Boomer's view on job loyalty?", correct: "You stay with a company for decades", wrong: ["Job hopping shows lack of commitment", "Loyalty used to mean something", "One career path for life made sense"], category: "career" },
      { text: "How do Boomers feel about text abbreviations?", correct: "Why not just write the whole word?", wrong: ["Takes longer to decode than read normally", "Proper grammar isn't that hard", "English didn't need shortcuts"], category: "communication" },
      { text: "What do Boomers think about home ownership?", correct: "Everyone should own their home by 30", wrong: ["Renting is throwing money away", "Mortgage means you're building something", "The American Dream is a house"], category: "finance" },
      { text: "How do Boomers approach family dinners?", correct: "Phones away, conversation required", wrong: ["Scheduled and non-negotiable", "Everyone together at the table", "Proper dinner, not eating in front of screens"], category: "family" },
      { text: "What's a Boomer's retirement expectation?", correct: "Pension, savings, and Social Security working together", wrong: ["Planned it out decades ago", "Worked hard to deserve this", "Traditional retirement at 65"], category: "finance" },
      { text: "How do Boomers feel about changing gender norms?", correct: "Trying to understand but struggling sometimes", wrong: ["Times have really changed", "Wasn't like this in their day", "Learning new terms slowly"], category: "culture" },
      { text: "What do Boomers think about tipping culture?", correct: "15% was standard, now it's everywhere", wrong: ["Tip for good service, not mandatory", "When did tipping expectations increase?", "Used to be just restaurants"], category: "culture" },
      { text: "How do Boomers handle medical appointments?", correct: "Show up early with a list of written questions", wrong: ["Bring documentation of everything", "Prefer the same doctor for years", "Take notes during the appointment"], category: "health" },
      { text: "What's a Boomer's approach to directions?", correct: "Print MapQuest or write them down beforehand", wrong: ["Prefer to know the route in advance", "Don't fully trust the GPS", "Study the map before leaving"], category: "navigation" },
      { text: "How do Boomers feel about financial apps?", correct: "Prefer bank statements and balancing checkbooks", wrong: ["Don't trust putting money stuff on phones", "Like to see the numbers on paper", "Visit the bank in person regularly"], category: "finance" },
      { text: "What do Boomers think about hustle culture?", correct: "Whatever happened to work-life separation?", wrong: ["Work was work, home was home", "Didn't need side hustles to survive", "One good job should be enough"], category: "work" },
      { text: "How do Boomers prefer to learn new things?", correct: "Step-by-step instructions, preferably printed", wrong: ["A manual they can reference", "Someone showing them in person", "Time to practice without rushing"], category: "learning" },
    ],
    honest: [
      { text: "How do Boomers honestly feel about technology changes?", correct: "Overwhelming but won't admit they need help", wrong: ["More confusing than it needs to be", "Miss when things were simpler", "Pride prevents asking for help often"], category: "technology" },
      { text: "What do Boomers honestly think about millennials' struggles?", correct: "Starting to understand it's actually harder now", wrong: ["Realize the economy is different", "See that housing is genuinely expensive", "Acknowledge some things changed"], category: "generational" },
      { text: "How do Boomers honestly feel about retirement?", correct: "Worried it won't be as secure as planned", wrong: ["Concerned about outliving savings", "Scared of healthcare costs", "Anxious about fixed income"], category: "finance" },
      { text: "What do Boomers honestly think about social media?", correct: "Secretly enjoy staying connected, won't admit it", wrong: ["Like seeing grandkids' photos actually", "Appreciate the connection it provides", "Use it more than they let on"], category: "technology" },
      { text: "How do Boomers honestly feel about being called Boomers?", correct: "Slightly offended but trying not to show it", wrong: ["The term feels dismissive", "Wish they had a better reputation", "Don't love being a meme"], category: "feelings" },
      { text: "What do Boomers honestly worry about?", correct: "Being seen as out of touch or irrelevant", wrong: ["Becoming dependent on others", "Not understanding the modern world", "Being left behind by change"], category: "fears" },
      { text: "How do Boomers honestly feel about their legacy?", correct: "Defensive but questioning if they got everything right", wrong: ["Want credit for progress made", "Aware some decisions had consequences", "Reflecting more than they admit"], category: "reflection" },
      { text: "What do Boomers honestly think about young people's work ethic?", correct: "Different, not worse, though hard to admit", wrong: ["They work, just in different ways", "The environment changed, not the people", "Starting to see it's not laziness"], category: "work" },
      { text: "How do Boomers honestly feel about asking for help with phones?", correct: "Embarrassing but necessary sometimes", wrong: ["Hate feeling dependent", "Wish they could figure it out alone", "Pride makes it harder to ask"], category: "technology" },
      { text: "What do Boomers honestly think about climate change now?", correct: "More concerned than they were, quietly", wrong: ["See the changes happening", "Worry about grandchildren's future", "Taking it more seriously now"], category: "environment" },
      { text: "How do Boomers honestly feel about their health?", correct: "More worried than they let on", wrong: ["Aging is harder than expected", "Body doesn't work like it used to", "Medical concerns increase quietly"], category: "health" },
      { text: "What do Boomers honestly think about their financial advice?", correct: "Know times changed but still think basics apply", wrong: ["Same principles, different circumstances", "Core ideas work, execution is harder", "Acknowledge the market is different now"], category: "finance" },
      { text: "How do Boomers honestly feel about family dynamics now?", correct: "Miss the way things used to be done", wrong: ["Holidays feel different now", "Family time has changed", "Wish traditions continued more"], category: "family" },
      { text: "What do Boomers honestly think about their generation's reputation?", correct: "Tired of being blamed but reflecting quietly", wrong: ["Some criticism is fair, some isn't", "Not responsible for everything bad", "Did their best with what they knew"], category: "reflection" },
      { text: "How do Boomers honestly feel about living alone?", correct: "Scared of isolation but value independence", wrong: ["Want to stay in their home", "Don't want to be a burden", "Fear losing autonomy more than solitude"], category: "aging" },
      { text: "What do Boomers honestly think about their kids' parenting?", correct: "Different approach but mostly approve", wrong: ["More involved than they were", "Kids seem happy so it's working", "Some methods make sense now"], category: "family" },
      { text: "How do Boomers honestly feel about current politics?", correct: "Exhausted by the divisiveness of everything", wrong: ["Miss when it felt less extreme", "Tired of constant conflict", "Wish for more civility"], category: "politics" },
      { text: "What do Boomers honestly think about their career choices?", correct: "Would do some things differently with hindsight", wrong: ["Some regrets, mostly at peace", "Wish they'd taken some risks", "Career had trade-offs they see now"], category: "career" },
      { text: "How do Boomers honestly feel about healthcare costs?", correct: "Terrified of what they might face", wrong: ["Expenses keep increasing", "Insurance doesn't cover enough", "Worried about affording care"], category: "health" },
      { text: "What do Boomers honestly think about dating apps?", correct: "Glad they didn't have to deal with that", wrong: ["Seems impersonal and strange", "Traditional dating made more sense", "How do people trust strangers?"], category: "culture" },
      { text: "How do Boomers honestly feel about grandparenting?", correct: "Best role they've had, less pressure", wrong: ["Get the fun parts, not the hard parts", "Love them and send them home", "Joy without full responsibility"], category: "family" },
      { text: "What do Boomers honestly think about their own parents?", correct: "Appreciate them more now that they're this age", wrong: ["Understand decisions they questioned before", "See the sacrifices more clearly now", "Wish they'd said more while they could"], category: "family" },
      { text: "How do Boomers honestly feel about death?", correct: "Thinking about it more but rarely discussing it", wrong: ["Aware it's approaching, processing quietly", "Making plans they don't talk about", "Concerned but keeping it private"], category: "aging" },
      { text: "What do Boomers honestly think about their accomplishments?", correct: "Proud but wondering if it mattered", wrong: ["Did their best, question the impact", "Worked hard, unsure of legacy", "Achieved goals, seeking meaning now"], category: "reflection" },
      { text: "How do Boomers honestly feel about change?", correct: "Adapting slower than they'd like to admit", wrong: ["Change is harder at this age", "Miss the stability of routine", "Learning takes longer now"], category: "adaptation" },
    ],
    embarrassing: [
      { text: "What embarrassing thing do Boomers do with technology?", correct: "Type with one finger very carefully", wrong: ["Hold phone far away to read", "Ask the same question multiple times", "Click suspicious links accidentally"], category: "technology" },
      { text: "What do Boomers embarrassingly share on Facebook?", correct: "Unverified news articles without checking", wrong: ["Chain posts about copying and pasting", "Photos with location and personal info", "Minion memes on public posts"], category: "social-media" },
      { text: "What embarrassing thing do Boomers say about phones?", correct: "In my day, phones were attached to the wall", wrong: ["Kids are always on their phones", "What's wrong with a landline?", "We survived without constant connection"], category: "technology" },
      { text: "What do Boomers embarrassingly not understand?", correct: "Why websites need so many passwords", wrong: ["What the cloud actually means", "Why updates are always necessary", "How to clear the cache"], category: "technology" },
      { text: "What embarrassing assumption do Boomers make?", correct: "That young people are on their phones 'doing nothing'", wrong: ["That video games rot your brain", "That social media is all narcissism", "That screens are always bad"], category: "stereotypes" },
      { text: "What do Boomers embarrassingly keep?", correct: "Phone book and yellow pages 'just in case'", wrong: ["Instruction manuals for everything", "Expired coupons for possible use", "Receipts from years ago"], category: "hoarding" },
      { text: "What embarrassing thing do Boomers do at restaurants?", correct: "Complain loudly about the prices", wrong: ["Ask to speak to the manager", "Calculate tip on paper visibly", "Send food back for minor issues"], category: "dining" },
      { text: "What do Boomers embarrassingly believe about jobs?", correct: "Walking in with a firm handshake still works", wrong: ["Loyalty guarantees advancement", "One company for life is best", "Hard work alone is enough"], category: "career" },
      { text: "What embarrassing thing do Boomers do on video calls?", correct: "Forget to unmute and keep talking", wrong: ["Leave camera on at bad angles", "Not realize when they're visible", "Background visible when they didn't intend it"], category: "technology" },
      { text: "What do Boomers embarrassingly forward?", correct: "Virus warnings that are actually hoaxes", wrong: ["Chain emails requiring forwarding", "Outdated health advice", "Jokes from 1995"], category: "communication" },
      { text: "What embarrassing opinion do Boomers share unsolicited?", correct: "That millennials can't afford houses because of spending", wrong: ["Career advice that doesn't apply anymore", "Relationship tips from different eras", "Parenting criticism disguised as help"], category: "opinions" },
      { text: "What do Boomers embarrassingly do with new gadgets?", correct: "Not read the instructions then complain it's broken", wrong: ["Set it up wrong and blame the product", "Press buttons randomly until something works", "Give up and say they don't need it"], category: "technology" },
      { text: "What embarrassing thing do Boomers say about music?", correct: "Today's music isn't real music like ours was", wrong: ["Can't understand the lyrics anymore", "What happened to real instruments?", "No one can sing without autotune"], category: "culture" },
      { text: "What do Boomers embarrassingly do on social media?", correct: "Comment on everything their kids post publicly", wrong: ["Like photos from years ago accidentally", "Share personal information too freely", "Not understand privacy settings at all"], category: "social-media" },
      { text: "What embarrassing thing do Boomers believe about health?", correct: "Walking it off works for most things", wrong: ["Their generation was tougher", "Diet trends are all fake", "Natural remedies beat modern medicine"], category: "health" },
      { text: "What do Boomers embarrassingly struggle with?", correct: "Understanding that texting is a valid form of communication", wrong: ["Why people don't just call", "Reading small text on screens", "Keeping up with changing terminology"], category: "communication" },
      { text: "What embarrassing thing do Boomers do when confused?", correct: "Blame the technology instead of asking for help", wrong: ["Get frustrated quickly", "Insist it used to work differently", "Say everything is too complicated now"], category: "technology" },
      { text: "What do Boomers embarrassingly say about prices?", correct: "In my day, this cost a fraction of that", wrong: ["Remember when gas was under a dollar?", "Everything is so expensive now", "We could buy a house for that amount"], category: "nostalgia" },
      { text: "What embarrassing thing do Boomers do at the doctor?", correct: "Bring a list of symptoms they Googled incorrectly", wrong: ["Insist their diagnosis is right", "Show internet printouts to doctors", "Not mention things they should"], category: "health" },
      { text: "What do Boomers embarrassingly think about remote work?", correct: "How do you stay productive at home?", wrong: ["That's just being lazy", "Real work happens in offices", "People are probably not working"], category: "work" },
      { text: "What embarrassing thing do Boomers say about fashion?", correct: "I can't believe what people wear in public", wrong: ["Kids have no sense of style", "What happened to dressing properly?", "In my day, we made an effort"], category: "culture" },
      { text: "What do Boomers embarrassingly do with email?", correct: "Reply all to things that don't need it", wrong: ["Use all caps without realizing tone", "Include unnecessary people", "Write emails like formal letters"], category: "technology" },
      { text: "What embarrassing stance do Boomers take?", correct: "Insisting their experience applies universally today", wrong: ["That they figured it out, so can others", "That younger generations have it easy", "That basic rules haven't changed"], category: "mindset" },
      { text: "What do Boomers embarrassingly not realize?", correct: "That 'back in my day' stories aren't always helpful", wrong: ["Times have genuinely changed", "Some advice no longer applies", "Their experience was different economically"], category: "communication" },
      { text: "What embarrassing habit do Boomers have with photos?", correct: "Print everything instead of storing digitally", wrong: ["Take blurry photos of screens", "Accidentally take selfies of their forehead", "Not understand how to share them"], category: "technology" },
    ],
  },
  {
    panelId: "endometriosis",
    common: [
      { text: "How long does it take to get an endo diagnosis?", correct: "7-10 years on average", wrong: ["3-5 years for most patients", "1-2 years with a good doctor", "A few months of testing"], category: "diagnosis" },
      { text: "What do people say about endo pain?", correct: "It's just bad period cramps", wrong: ["Have you tried a heating pad?", "Everyone gets cramps sometimes", "It can't be that bad"], category: "dismissal" },
      { text: "What do endo warriors hear from doctors?", correct: "Have you tried birth control?", wrong: ["Let's run more tests", "I believe your pain level", "This needs specialist attention"], category: "healthcare" },
      { text: "What's a common misunderstanding about endo?", correct: "Pregnancy cures it", wrong: ["Diet alone can fix it", "Exercise makes it disappear", "It gets better with age"], category: "myths" },
      { text: "What do endo patients deal with monthly?", correct: "Debilitating pain that disrupts life", wrong: ["Manageable discomfort usually", "Symptoms that medication controls", "Pain that rest relieves"], category: "symptoms" },
      { text: "What's the reality of endo treatment?", correct: "Surgery and ongoing management", wrong: ["Medication that fully works", "Treatment that offers relief", "Options that provide control"], category: "treatment" },
      { text: "How does endo affect work life?", correct: "Missing days due to flare-ups", wrong: ["Manageable with accommodation", "Minor productivity impact", "Occasional adjustments needed"], category: "work" },
      { text: "What do people assume about endo?", correct: "If you don't look sick you're fine", wrong: ["That treatment must be working", "That you're handling it well", "That you've got it under control"], category: "assumptions" },
      { text: "What's a daily reality for endo warriors?", correct: "Planning life around pain cycles", wrong: ["Managing with medication mostly", "Working around symptoms", "Adapting to limitations"], category: "daily-life" },
      { text: "What healthcare hurdle do endo patients face?", correct: "Not being believed by doctors", wrong: ["Long wait times for specialists", "Insurance coverage battles", "Finding the right treatment"], category: "healthcare" },
      { text: "How visible is endometriosis?", correct: "It's an invisible illness", wrong: ["Symptoms can be subtle", "Effects aren't always obvious", "It varies by person"], category: "awareness" },
      { text: "What's a common endo symptom besides pain?", correct: "Chronic fatigue", wrong: ["Occasional tiredness", "Energy fluctuations", "Mild exhaustion"], category: "symptoms" },
      { text: "What do endo warriors navigate constantly?", correct: "Medical gaslighting", wrong: ["Appointment scheduling", "Medication management", "Insurance paperwork"], category: "healthcare" },
      { text: "How does endo affect relationships?", correct: "Partners may not understand the pain", wrong: ["It requires communication", "Adjustments are needed", "It takes patience from both"], category: "relationships" },
      { text: "What's an endo warrior's medicine cabinet like?", correct: "Full of pain management options", wrong: ["Standard medication supply", "Organized prescription setup", "Various treatment options"], category: "treatment" },
      { text: "What do doctors often suggest first for endo?", correct: "Lose weight or reduce stress", wrong: ["Specialist referral immediately", "Comprehensive testing", "Multiple treatment options"], category: "healthcare" },
      { text: "How does endo affect mental health?", correct: "Constant pain leads to depression and anxiety", wrong: ["It can be stressful sometimes", "Management takes effort", "It requires coping skills"], category: "mental-health" },
      { text: "What's the truth about endo surgery?", correct: "It's not a cure, symptoms can return", wrong: ["It usually fixes the problem", "Recovery is straightforward", "Results are typically lasting"], category: "treatment" },
      { text: "How do endo patients prepare for events?", correct: "Backup plans for potential flare-ups", wrong: ["Hope for good days", "Pack medication just in case", "Stay flexible with timing"], category: "daily-life" },
      { text: "What do endo warriors know about pain scales?", correct: "Their 7 would be someone else's emergency", wrong: ["They've learned to rate accurately", "Medical scales work for them", "They can communicate pain well"], category: "experience" },
      { text: "How long do endo surgeries take to recover from?", correct: "Weeks to months depending on extent", wrong: ["A few days typically", "Back to normal quickly", "Minimal downtime usually"], category: "treatment" },
      { text: "What affects endo symptoms unpredictably?", correct: "Weather, stress, diet, hormones - everything", wrong: ["Mainly hormonal cycles", "Typically predictable patterns", "Usually manageable triggers"], category: "symptoms" },
      { text: "How do endo patients feel about future planning?", correct: "Uncertain because symptoms are unpredictable", wrong: ["Cautiously optimistic usually", "They adapt and adjust", "Planning is possible with effort"], category: "life" },
      { text: "What do endo warriors wish people understood?", correct: "Rest doesn't fix this, it's not a tired thing", wrong: ["It's more than just periods", "Treatment is ongoing", "It affects daily life"], category: "awareness" },
      { text: "How common is endometriosis actually?", correct: "Affects 1 in 10 women yet still underfunded", wrong: ["Relatively common condition", "More prevalent than known", "Affects many but research exists"], category: "awareness" },
    ],
    honest: [
      { text: "How do endo warriors honestly feel about being dismissed?", correct: "Exhausted and frustrated", wrong: ["Used to it by now", "Learning to advocate", "Building resilience"], category: "feelings" },
      { text: "What do endo patients honestly think about heating pads?", correct: "Not enough but better than nothing", wrong: ["Helpful most of the time", "One tool in the arsenal", "Provides some relief at least"], category: "treatment" },
      { text: "How do endo warriors honestly feel about explaining again?", correct: "Tired of justifying invisible pain", wrong: ["Part of raising awareness", "Necessary for understanding", "Important for advocacy"], category: "communication" },
      { text: "What's the honest truth about endo flare-ups?", correct: "They're unpredictable and terrifying", wrong: ["Hard to manage sometimes", "Challenging but survivable", "Difficult but you adapt"], category: "symptoms" },
      { text: "How do endo warriors honestly feel about 'helpful' suggestions?", correct: "Frustrated by oversimplification", wrong: ["Appreciative of the intent", "Understand they mean well", "Patient with the ignorance"], category: "support" },
      { text: "What's the honest impact on mental health?", correct: "Depression and anxiety from chronic pain", wrong: ["Occasional low moments", "Manageable stress levels", "Some emotional impact"], category: "mental-health" },
      { text: "How do endo patients honestly feel about their future?", correct: "Scared about fertility and disease progression", wrong: ["Hopeful with treatment advances", "Cautiously optimistic", "Taking it day by day"], category: "future" },
      { text: "What do endo warriors honestly think during flares?", correct: "Is this going to be my life forever?", wrong: ["This will pass eventually", "Focus on management", "Get through today first"], category: "thoughts" },
      { text: "How do endo patients honestly feel about intimacy?", correct: "Scared of pain, affecting relationships", wrong: ["It requires communication", "Adjustments are made", "Partners are understanding"], category: "relationships" },
      { text: "What's the honest experience of seeking diagnosis?", correct: "Years of being told nothing's wrong", wrong: ["A journey to answers", "Persistence paid off", "Eventually found help"], category: "healthcare" },
      { text: "How do endo warriors honestly feel about doctors?", correct: "Medical trauma from being dismissed repeatedly", wrong: ["Some good, some bad", "Learning to find good ones", "It varies by provider"], category: "healthcare" },
      { text: "What do endo patients honestly wish they could do?", correct: "Have one day without thinking about pain", wrong: ["Just manage symptoms better", "Find a treatment that works", "Get consistent relief"], category: "wishes" },
      { text: "How do endo warriors honestly feel about advocacy?", correct: "Exhausted from fighting for themselves", wrong: ["Empowered to speak up", "Part of the journey", "Making a difference"], category: "advocacy" },
      { text: "What's the honest feeling about 'good days'?", correct: "Waiting for the other shoe to drop", wrong: ["Grateful for relief", "Enjoying the break", "Making the most of it"], category: "experience" },
      { text: "How do endo patients honestly feel about canceling plans?", correct: "Guilty but have no choice", wrong: ["People understand usually", "It's a necessity", "Friends adapt"], category: "social" },
      { text: "What do endo warriors honestly think about their bodies?", correct: "Betrayed by their own bodies constantly", wrong: ["Learning to work with it", "Adapting to limitations", "Finding new normals"], category: "feelings" },
      { text: "How do endo patients honestly feel about treatment options?", correct: "None are perfect and all have tradeoffs", wrong: ["Making do with what exists", "Some relief is better than none", "Working with available options"], category: "treatment" },
      { text: "What's the honest fear about surgery?", correct: "That it won't help and symptoms will return", wrong: ["Normal surgical anxiety", "Concerns about recovery", "Hope mixed with worry"], category: "treatment" },
      { text: "How do endo warriors honestly feel about comparing pain?", correct: "Shouldn't have to prove severity to be believed", wrong: ["Hard to communicate effectively", "Scales don't capture it", "Everyone's pain is valid"], category: "validation" },
      { text: "What do endo patients honestly experience at work?", correct: "Hiding pain to avoid judgment", wrong: ["Managing as best they can", "Some days are harder", "Making accommodations"], category: "work" },
      { text: "How do endo warriors honestly feel about holidays?", correct: "Planning around potential flares ruins joy", wrong: ["Making adjustments as needed", "Family understands mostly", "Celebrating when possible"], category: "life" },
      { text: "What's the honest truth about pain medication?", correct: "Often not strong enough but doctors hesitate", wrong: ["Provides some relief", "Part of the treatment plan", "Works when available"], category: "treatment" },
      { text: "How do endo patients honestly feel about awareness campaigns?", correct: "Good but not enough action follows", wrong: ["Making progress slowly", "Increasing understanding", "Part of the solution"], category: "advocacy" },
      { text: "What do endo warriors honestly need from others?", correct: "Belief without needing to justify pain", wrong: ["Support and understanding", "Patience and compassion", "Help when asked"], category: "support" },
      { text: "How do endo patients honestly feel about their journey?", correct: "Isolated in an experience few understand", wrong: ["Found community eventually", "Learning to cope", "Growing through struggle"], category: "feelings" },
    ],
    embarrassing: [
      { text: "What embarrassing thing do endo warriors do at work?", correct: "Hide heating pads under desk", wrong: ["Take breaks for pain management", "Schedule around symptoms", "Keep medication accessible"], category: "work" },
      { text: "What's an embarrassing endo moment?", correct: "Canceling plans last minute from pain", wrong: ["Needing to rest unexpectedly", "Leaving events early", "Asking for accommodations"], category: "social" },
      { text: "What do endo warriors embarrassingly carry?", correct: "Emergency pain kit everywhere", wrong: ["Extra medication always", "Supplies for any scenario", "Backup everything"], category: "daily-life" },
      { text: "What embarrassing question do endo patients get?", correct: "Have you tried yoga though?", wrong: ["How are you feeling today?", "Is there anything I can do?", "What does your doctor say?"], category: "social" },
      { text: "What's embarrassing about explaining endo?", correct: "Describing pain levels sounds exaggerated", wrong: ["It's a complex condition", "Not everyone understands", "It takes time to explain"], category: "communication" },
      { text: "What do endo patients embarrassingly do in meetings?", correct: "Shift constantly trying to find comfortable position", wrong: ["Take notes to distract", "Focus despite discomfort", "Manage quietly"], category: "work" },
      { text: "What embarrassing preparation do endo warriors make?", correct: "Scout bathroom locations everywhere they go", wrong: ["Pack extra supplies", "Plan routes carefully", "Research accessibility"], category: "daily-life" },
      { text: "What do endo patients embarrassingly avoid?", correct: "Social events because they can't predict symptoms", wrong: ["Certain activities that trigger pain", "Situations that are difficult", "Things that don't accommodate"], category: "social" },
      { text: "What embarrassing thing happens during flares?", correct: "Breaking down crying in public from pain", wrong: ["Needing to sit down quickly", "Asking for help suddenly", "Leaving without explanation"], category: "symptoms" },
      { text: "What do endo warriors embarrassingly count?", correct: "Days between good days", wrong: ["Medication doses carefully", "Symptoms for doctors", "Energy levels daily"], category: "tracking" },
      { text: "What embarrassing excuse have endo patients used?", correct: "'Just a stomach bug' to avoid explaining", wrong: ["Needed personal day", "Felt under the weather", "Had a medical appointment"], category: "communication" },
      { text: "What do endo warriors embarrassingly research?", correct: "Every symptom at 2am in a spiral", wrong: ["Treatment options thoroughly", "New developments constantly", "Anything that might help"], category: "late-night" },
      { text: "What embarrassing thing do endo patients do at restaurants?", correct: "Calculate how far bathroom is from table", wrong: ["Order carefully for diet", "Ask about ingredients", "Plan meals around symptoms"], category: "daily-life" },
      { text: "What do endo warriors embarrassingly keep?", correct: "Mental map of cleanest public bathrooms", wrong: ["Lists of what helps", "Records of symptoms", "Notes for doctors"], category: "preparation" },
      { text: "What embarrassing assumption do people make?", correct: "That endo patients are 'exaggerating for attention'", wrong: ["That treatment is straightforward", "That it's easily managed", "That rest helps fully"], category: "stigma" },
      { text: "What do endo patients embarrassingly time?", correct: "Medication so it kicks in before obligations", wrong: ["Activities around cycles", "Events for best days", "Work around symptoms"], category: "management" },
      { text: "What embarrassing thing do endo warriors wear?", correct: "Loose clothes to accommodate bloating", wrong: ["Comfortable clothing choices", "Practical outfit options", "Flexible wardrobe pieces"], category: "daily-life" },
      { text: "What do endo patients embarrassingly admit?", correct: "Passing out from pain is not unusual", wrong: ["Some days are very hard", "Pain levels vary greatly", "It affects everything"], category: "experience" },
      { text: "What embarrassing thing happens at appointments?", correct: "Crying from finally being believed", wrong: ["Long detailed explanations", "Advocating firmly for care", "Bringing documentation"], category: "healthcare" },
      { text: "What do endo warriors embarrassingly calculate?", correct: "Can I make it there and back before the pain hits", wrong: ["Distance to medical care", "Time for medications", "Energy for activities"], category: "planning" },
      { text: "What embarrassing thing do endo patients hide?", correct: "How much of their life is spent in pain", wrong: ["Medication schedules", "Doctor appointments", "Treatment details"], category: "secrets" },
      { text: "What do endo warriors embarrassingly practice?", correct: "Smiling through severe pain", wrong: ["Pain management techniques", "Breathing exercises", "Distraction methods"], category: "coping" },
      { text: "What embarrassing purchase do endo patients make?", correct: "Multiple heating pads for every location", wrong: ["Pain management supplies", "Comfort items for flares", "Treatment necessities"], category: "shopping" },
      { text: "What do endo warriors embarrassingly explain?", correct: "Why they can't eat, stand, move, exist that day", wrong: ["Symptom details to doctors", "Limitations to employers", "Needs to friends"], category: "communication" },
      { text: "What embarrassing fear do endo patients have?", correct: "That people think they're 'faking it'", wrong: ["That symptoms will worsen", "That treatment won't help", "That life will be limited"], category: "anxiety" },
    ],
  },
  {
    panelId: "hustlers",
    common: [
      { text: "What does a hustler check first every morning?", correct: "Stock prices and crypto portfolio", wrong: ["Sales numbers and revenue", "LinkedIn notifications", "Market news and trends"], category: "business" },
      { text: "What's a hustler's favorite conversation topic?", correct: "Passive income streams they're building", wrong: ["New business opportunities", "Investment strategies", "Startup ideas they have"], category: "conversation" },
      { text: "How does a hustler describe their employment?", correct: "Serial entrepreneur with multiple ventures", wrong: ["Self-employed building something", "Business owner by choice", "Independent professional"], category: "career" },
      { text: "What book sits on a hustler's desk?", correct: "Rich Dad Poor Dad, heavily highlighted", wrong: ["The 4-Hour Workweek", "Think and Grow Rich", "Atomic Habits"], category: "education" },
      { text: "What's a hustler's ideal vacation?", correct: "Mastermind retreat with other entrepreneurs in Bali", wrong: ["Working from a tropical location", "Conference with networking opportunities", "Business trip with beach time"], category: "lifestyle" },
      { text: "What podcast does a hustler have on?", correct: "Hustle motivation while driving", wrong: ["Business news and analysis", "Interview with successful founders", "Self-improvement content"], category: "media" },
      { text: "What does a hustler wear everywhere?", correct: "Branded athleisure they call 'professional casual'", wrong: ["Comfortable but polished looks", "Startup casual with intention", "Business casual with personality"], category: "fashion" },
      { text: "What's in a hustler's morning routine?", correct: "4 AM alarm, cold shower, gratitude journaling", wrong: ["Early exercise and meditation", "Planning and prioritizing", "Protein shake and podcasts"], category: "lifestyle" },
      { text: "What does a hustler's LinkedIn headline say?", correct: "Entrepreneur | Investor | Thought Leader | 10X Mindset", wrong: ["Building something meaningful", "Startup founder and advisor", "Helping businesses scale"], category: "social-media" },
      { text: "What's a hustler's philosophy on sleep?", correct: "Sleep when you're successful, grind now", wrong: ["Optimize sleep for performance", "Rest is part of productivity", "Quality over quantity hours"], category: "lifestyle" },
    ],
    honest: [
      { text: "What's a hustler honestly thinking at social events?", correct: "Who here can benefit my network?", wrong: ["Is there opportunity here?", "Who's worth talking to?", "Can I pitch something?"], category: "social" },
      { text: "What do hustlers honestly feel about regular jobs?", correct: "Fear disguised as contempt", wrong: ["Not for them specifically", "Respect but not interested", "Different paths work differently"], category: "career" },
      { text: "Why do hustlers really post on LinkedIn daily?", correct: "Desperate for leads and validation", wrong: ["Personal branding strategy", "Building authority", "Reaching potential clients"], category: "social-media" },
      { text: "What's a hustler's honest relationship with failure?", correct: "Terrified but pretending it's embraced", wrong: ["Learning opportunity genuinely", "Part of the process", "Feedback mechanism"], category: "mindset" },
      { text: "What do hustlers honestly think at 11 PM?", correct: "Imposter syndrome before forcing productivity", wrong: ["Planning for tomorrow", "Reviewing today's progress", "One more thing before bed"], category: "work" },
    ],
    embarrassing: [
      { text: "What embarrassing thing do hustlers do on dates?", correct: "Pitch their startup within 20 minutes", wrong: ["Check messages too often", "Talk about work a lot", "Mention achievements"], category: "relationships" },
      { text: "What do hustlers secretly watch at night?", correct: "Reality TV instead of business content", wrong: ["Netflix to decompress", "Something mindless to relax", "Shows they won't mention"], category: "entertainment" },
      { text: "What embarrassing habit do hustlers have?", correct: "Networking at completely inappropriate venues", wrong: ["Talking business too much", "Always pitching ideas", "Never fully off work"], category: "behavior" },
      { text: "What do hustlers embarrassingly check mid-conversation?", correct: "Their crypto portfolio performance", wrong: ["Business notifications", "Market updates", "Work messages"], category: "technology" },
    ],
  },
  {
    panelId: "artists",
    common: [
      { text: "What inspires artists most?", correct: "Random moments others wouldn't notice", wrong: ["Nature and beauty", "Emotional experiences", "Other art and music"], category: "creativity" },
      { text: "Where do artists prefer to work?", correct: "Messy studio with organized chaos", wrong: ["Inspiring coffee shop", "Home space set up for creating", "Anywhere with good lighting"], category: "workspace" },
      { text: "What's an artist's preferred schedule?", correct: "Creative at midnight, useless in morning meetings", wrong: ["Flexible hours that work for flow", "Work when inspiration strikes", "Non-traditional but productive"], category: "lifestyle" },
      { text: "How do artists describe their personal style?", correct: "Intentionally unconventional but curated", wrong: ["Expressive and unique", "Comfortable but aesthetic", "Personal and authentic"], category: "fashion" },
      { text: "What's an artist's relationship with rules?", correct: "Learn them to break them properly", wrong: ["Prefer flexibility", "Question authority", "Find their own way"], category: "philosophy" },
      { text: "How do artists handle criticism of their work?", correct: "Devastated privately, thoughtful response publicly", wrong: ["Process it and grow", "Take what's useful", "Consider and evaluate"], category: "feedback" },
      { text: "What do artists struggle to do?", correct: "Put a price on work without feeling weird", wrong: ["Market themselves confidently", "Balance art and business", "Value their own time"], category: "business" },
      { text: "What's an artist's relationship with deadlines?", correct: "Panic-driven finishing at 2 AM", wrong: ["Working best under pressure", "Flexible interpretation needed", "Time as a rough guide"], category: "work" },
      { text: "What do artists accumulate 'for inspiration'?", correct: "Random objects that might never be used", wrong: ["Reference materials and images", "Things that spark ideas", "Objects with potential meaning"], category: "lifestyle" },
      { text: "How do artists respond to 'real job' comments?", correct: "Controlled rage behind polite explanation", wrong: ["Firm but patient correction", "It is a real job defense", "Education about the profession"], category: "career" },
    ],
    honest: [
      { text: "What's an artist honestly worried about?", correct: "Financial instability despite loving the work", wrong: ["Finding consistent opportunities", "Balancing passion and practicality", "Making it work long-term"], category: "finances" },
      { text: "Why do artists really procrastinate?", correct: "Fear that the work won't match the vision", wrong: ["Waiting for the right moment", "Part of the creative process", "Needing more preparation"], category: "work" },
      { text: "What do artists honestly think about exposure as payment?", correct: "Rage masked by professional decline", wrong: ["Not ideal but considered", "Would prefer real payment", "Depends on the opportunity"], category: "business" },
      { text: "How do artists honestly experience imposter syndrome?", correct: "Daily companion that never fully leaves", wrong: ["Comes and goes in waves", "Present but managed", "Part of the journey"], category: "mental-health" },
      { text: "What's an artist's honest take on social media?", correct: "Hate needing it, need it to exist", wrong: ["Necessary for visibility", "Mixed feelings overall", "Part of modern art business"], category: "marketing" },
    ],
    embarrassing: [
      { text: "What embarrassing thing do artists blame?", correct: "Mercury retrograde or the algorithm", wrong: ["Timing and circumstances", "External factors genuinely", "Things outside their control"], category: "creativity" },
      { text: "What do artists secretly compare constantly?", correct: "Their engagement to other artists' posts", wrong: ["Their work to others", "Their progress to peers", "Their success to colleagues"], category: "social" },
      { text: "What embarrassing excuse do artists use?", correct: "'Waiting for inspiration' when really scared", wrong: ["Need more research first", "The timing isn't right", "Still developing the concept"], category: "work" },
      { text: "What do artists embarrassingly overspend on?", correct: "Supplies for projects that never happen", wrong: ["Materials they already have", "Things they might need", "Quality over necessity"], category: "shopping" },
    ],
  },
];

const additionalPanelSets: PanelQuestionSet[] = [];

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
  const usedQuestionIds = new Set<string>();
  
  let attempts = 0;
  const maxAttempts = 100;
  
  while (selectedQuestions.length < 10 && attempts < maxAttempts) {
    const panelIndex = Math.floor(seededRandom(seed + attempts) * panelIds.length);
    const panelQuestions = allQuestions.filter(q => q.panelId === panelIds[panelIndex]);
    const questionIndex = Math.floor(seededRandom(seed + attempts + 100) * panelQuestions.length);
    
    const question = panelQuestions[questionIndex];
    if (question && !usedQuestionIds.has(question.id)) {
      selectedQuestions.push(question);
      usedQuestionIds.add(question.id);
    }
    attempts++;
  }
  
  return selectedQuestions.length > 0 ? selectedQuestions : allQuestions.slice(0, 10);
}
