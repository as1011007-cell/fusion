import { GameColors } from "@/constants/theme";

export type Panel = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
};

export const allPanels: Panel[] = [
  { id: "gen-z", name: "Gen Z", description: "Digital natives with main character energy", icon: "zap", color: "#FF006E" },
  { id: "hustlers", name: "Hustlers", description: "Grind culture and entrepreneurial spirit", icon: "trending-up", color: "#00FF87" },
  { id: "artists", name: "Artists", description: "Creative souls seeing the world differently", icon: "feather", color: "#00F5FF" },
  { id: "office-workers", name: "Office Workers", description: "Corporate life and water cooler wisdom", icon: "briefcase", color: "#A0A8C0" },
  { id: "small-town", name: "Small Town Families", description: "Close-knit communities with traditional values", icon: "home", color: "#FF8C00" },
  { id: "blonde", name: "Blonde Stereotypes", description: "Challenging and celebrating the stereotypes", icon: "sun", color: "#FFE135" },
  { id: "elder-sister", name: "Elder Sisters", description: "The responsible first-born experience", icon: "shield", color: "#FF69B4" },
  { id: "endometriosis", name: "Endo Warriors", description: "Living with endometriosis daily", icon: "heart", color: "#9B59B6" },
  { id: "millennials", name: "Millennials", description: "Avocado toast and existential dread", icon: "coffee", color: "#1ABC9C" },
  { id: "desi-parents", name: "Desi Parents", description: "Traditional values meet modern concerns", icon: "heart", color: "#FFD700" },
  { id: "boomers", name: "Boomers", description: "The generation that saw it all change", icon: "tv", color: "#E74C3C" },
  { id: "teachers", name: "Teachers", description: "Educators shaping the future", icon: "book-open", color: "#3498DB" },
  { id: "nurses", name: "Healthcare Heroes", description: "The frontline of care", icon: "activity", color: "#27AE60" },
  { id: "gamers", name: "Gamers", description: "Controllers and keyboards unite", icon: "monitor", color: "#9B59B6" },
  { id: "introverts", name: "Introverts", description: "Rich inner worlds, quiet outer presence", icon: "moon", color: "#34495E" },
  { id: "extroverts", name: "Extroverts", description: "Energy from social connections", icon: "users", color: "#F39C12" },
  { id: "pet-parents", name: "Pet Parents", description: "Fur babies are family too", icon: "heart", color: "#E91E63" },
  { id: "fitness-enthusiasts", name: "Fitness Buffs", description: "Gym life and protein shakes", icon: "target", color: "#00BCD4" },
  { id: "foodies", name: "Foodies", description: "Living to eat, not eating to live", icon: "coffee", color: "#FF5722" },
  { id: "remote-workers", name: "Remote Workers", description: "Pajamas and productivity", icon: "wifi", color: "#607D8B" },
  { id: "new-parents", name: "New Parents", description: "Sleep-deprived and loving it", icon: "star", color: "#FFC107" },
  { id: "college-students", name: "College Students", description: "Ramen noodles and all-nighters", icon: "book", color: "#673AB7" },
  { id: "travelers", name: "Travel Addicts", description: "Wanderlust is a lifestyle", icon: "globe", color: "#00BFA5" },
  { id: "music-lovers", name: "Music Lovers", description: "Life needs a soundtrack", icon: "music", color: "#E040FB" },
  { id: "bookworms", name: "Bookworms", description: "Lost in fictional worlds", icon: "book", color: "#795548" },
  { id: "tech-workers", name: "Tech Workers", description: "Debugging life one day at a time", icon: "code", color: "#2196F3" },
  { id: "only-child", name: "Only Child", description: "Sole focus of parental attention", icon: "user", color: "#FF4081" },
  { id: "middle-child", name: "Middle Child", description: "The forgotten peacemaker", icon: "minus", color: "#4CAF50" },
  { id: "italian-guy", name: "Italian Guy", description: "Mama mia! Hand gestures and passion", icon: "heart", color: "#009246" },
  { id: "baby-shower", name: "Baby Shower Guests", description: "Onesies, games, and unsolicited advice", icon: "gift", color: "#FFB6C1" },
  { id: "christmas", name: "Christmas Enthusiasts", description: "Deck the halls year-round mentality", icon: "gift", color: "#C41E3A" },
  { id: "new-years", name: "New Years Crowd", description: "New year, new me... until January 3rd", icon: "star", color: "#FFD700" },
  { id: "wedding-guests", name: "Wedding Guests", description: "Open bar and catching bouquets", icon: "heart", color: "#FF1493" },
  { id: "thanksgiving", name: "Thanksgiving Family", description: "Turkey, drama, and awkward questions", icon: "home", color: "#D2691E" },
  { id: "halloween", name: "Halloween Lovers", description: "Spooky season is a lifestyle", icon: "moon", color: "#FF6600" },
  { id: "summer-vibes", name: "Summer Vacation Mode", description: "Beach days and no responsibilities", icon: "sun", color: "#00CED1" },
];
