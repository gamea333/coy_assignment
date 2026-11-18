import fs from "node:fs";
import path from "node:path";
import { openDb } from "../src/lib/db";
import { CURRENT_USER_ID, CURRENT_USER_PHOTO } from "../src/lib/constants";

const file = process.env.DB_PATH ?? path.join(process.cwd(), "data", "coy.db");
for (const f of [file, `${file}-wal`, `${file}-shm`]) fs.rmSync(f, { force: true });
const db = openDb(file);

type Seed = [name: string, age: number, city: string, college: string | null, bio: string, interests: string[]];

const profiles: Seed[] = [
  ["Aarav", 22, "Delhi", "IIT Delhi", "Building robots by day, burning maggi by night.", ["Robotics", "Cooking", "Chess"]],
  ["Ananya", 21, "Mumbai", "St. Xavier's", "Theatre kid who never grew out of it.", ["Theatre", "Poetry", "Chai"]],
  ["Vihaan", 23, "Bengaluru", "Christ University", "Will trade playlists for book recs.", ["Music", "Books", "Cycling"]],
  ["Diya", 20, "Pune", "Fergusson College", "Sunsets, sketchbooks, and spontaneous trips.", ["Art", "Travel", "Photography"]],
  ["Kabir", 24, "Hyderabad", null, "Product designer. Opinions on fonts.", ["Design", "Coffee", "Running"]],
  ["Ishita", 22, "Delhi", "LSR", "Debater. I will win the argument about pineapple pizza.", ["Debate", "Food", "Podcasts"]],
  ["Arjun", 21, "Chennai", "IIT Madras", "Cricket on weekends, code on weekdays.", ["Cricket", "Coding", "Movies"]],
  ["Meera", 23, "Kolkata", "Jadavpur University", "Classical dancer, closet metalhead.", ["Dance", "Metal", "Baking"]],
  ["Reyansh", 22, "Ahmedabad", "NID", "I make things out of cardboard and hope.", ["Design", "Pottery", "Anime"]],
  ["Saanvi", 20, "Jaipur", null, "Plant mom of 14. Looking for a 15th.", ["Plants", "Yoga", "Reading"]],
  ["Advait", 25, "Bengaluru", null, "Startup guy, but the fun kind. I promise.", ["Startups", "Trekking", "Board games"]],
  ["Kiara", 21, "Mumbai", "NMIMS", "Finance major, film nerd.", ["Films", "Finance", "Swimming"]],
  ["Rohan", 23, "Delhi", "DTU", "Guitar, gym, and genuinely good at karaoke.", ["Guitar", "Fitness", "Karaoke"]],
  ["Tara", 22, "Goa", null, "Surf instructor. Yes, really.", ["Surfing", "Beaches", "Music"]],
  ["Dev", 24, "Pune", "COEP", "I will make you a spreadsheet for our date.", ["Excel", "Coffee", "F1"]],
  ["Myra", 20, "Chandigarh", "Panjab University", "Aspiring journalist, professional overthinker.", ["Writing", "News", "Cats"]],
  ["Aditya", 22, "Lucknow", null, "Kebab connoisseur. Ask me anything.", ["Food", "History", "Football"]],
  ["Navya", 23, "Hyderabad", "BITS Hyderabad", "Researcher in ML, amateur stand-up.", ["AI", "Comedy", "Hiking"]],
  ["Krish", 21, "Indore", "IIM Indore", "Poha > everything.", ["Food", "Quizzing", "Badminton"]],
  ["Zara", 22, "Delhi", "Ashoka University", "Philosophy student. Let's talk about free will (or not).", ["Philosophy", "Jazz", "Thrifting"]],
  ["Vivaan", 24, "Mumbai", null, "Chef in training. Will feed you.", ["Cooking", "Wine", "Travel"]],
  ["Aadhya", 21, "Bengaluru", "PES University", "Gamer girl with a K/D ratio to brag about.", ["Gaming", "Esports", "Anime"]],
  ["Shaurya", 23, "Kochi", null, "Backwaters, books, boat races.", ["Rowing", "Books", "Nature"]],
  ["Pari", 20, "Mumbai", "Mithibai", "Dance reels are my cardio.", ["Dance", "Fashion", "Reels"]],
  ["Ayaan", 22, "Delhi", "SRCC", "Economics and bad puns.", ["Economics", "Puns", "Tennis"]],
  ["Anika", 24, "Pune", null, "Vet. I like dogs more than people (negotiable).", ["Dogs", "Volunteering", "Hiking"]],
  ["Atharv", 21, "Nagpur", "VNIT", "Astronomy nerd. Let's go stargazing.", ["Astronomy", "Physics", "Camping"]],
  ["Riya", 22, "Kolkata", "Presidency University", "Bookstore hopper, poetry reader.", ["Poetry", "Books", "Coffee"]],
  ["Ishaan", 23, "Bengaluru", "IISc", "PhD in progress. Patience in progress too.", ["Research", "Climbing", "Jazz"]],
  ["Avni", 21, "Delhi", "Miranda House", "Sustainability activist, thrift queen.", ["Sustainability", "Thrifting", "Music"]],
  ["Yash", 22, "Surat", null, "Diamonds are boring, I like mountains.", ["Trekking", "Photography", "Cricket"]],
  ["Sara", 23, "Mumbai", "IIT Bombay", "Hackathon regular. Ship it.", ["Coding", "Hackathons", "Music"]],
];

const insertUser = db.prepare(
  `INSERT INTO users (id, name, age, photo_url, bio, city, college, interests)
   VALUES (@id, @name, @age, @photo_url, @bio, @city, @college, @interests)`
);
const insertSwipe = db.prepare(
  `INSERT INTO swipes (swiper_id, target_id, direction) VALUES (?, ?, 'like')`
);

// Profiles that have already liked the current user (so matches can happen in a demo).
const LIKERS = [2, 4, 6, 9, 12, 15, 18, 21, 25, 30];

db.transaction(() => {
  insertUser.run({
    id: CURRENT_USER_ID, name: "You", age: 22, photo_url: CURRENT_USER_PHOTO,
    bio: "The logged-in demo user.", city: "Delhi", college: null, interests: JSON.stringify([]),
  });
  profiles.forEach(([name, age, city, college, bio, interests], i) => {
    const id = i + 2;
    insertUser.run({
      id, name, age, city, college, bio,
      photo_url: `https://i.pravatar.cc/600?img=${i + 1}`,
      interests: JSON.stringify(interests),
    });
  });
  for (const id of LIKERS) insertSwipe.run(id, CURRENT_USER_ID);
})();

console.log(`Seeded ${profiles.length + 1} users and ${LIKERS.length} incoming likes → ${file}`);
