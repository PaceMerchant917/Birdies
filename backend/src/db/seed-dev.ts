// Main dev data seeding orchestrator
// Creates sample profiles, likes, matches, and messages
import pool from './index';
import { hashPassword } from '../auth/helpers';
import { createLike, createMutualLikes } from './seed-likes';
import { seedMessagesForMatch } from './seed-messages';

// Configuration
const DEFAULT_PROFILE_COUNT = 80;
const DEFAULT_PASSWORD = 'password123';

// Sample data pools
const DISPLAY_NAMES = [
  'Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery',
  'Quinn', 'Reese', 'Cameron', 'Skyler', 'Jamie', 'Dakota', 'Peyton',
  'Rowan', 'Sage', 'Parker', 'Emerson', 'Drew', 'Charlie', 'Finley',
  'Hayden', 'Kendall', 'Logan', 'Micah', 'River', 'Sydney', 'Blake',
  'Phoenix', 'Harley', 'Jesse', 'Ari', 'Kai', 'Remy', 'Shae', 'Tate',
  'Wren', 'Ellis', 'Indigo', 'Nova', 'Marlowe', 'Kit', 'Lennox',
  'Sarah', 'Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Mia',
  'Charlotte', 'Amelia', 'Harper', 'Evelyn', 'Abigail', 'Emily',
  'Ella', 'Elizabeth', 'Madison', 'Avery', 'Sofia', 'Camila',
  'Michael', 'James', 'David', 'William', 'John', 'Robert', 'Christopher',
  'Matthew', 'Daniel', 'Joseph', 'Thomas', 'Charles', 'Ryan', 'Andrew',
  'Joshua', 'Nathan', 'Lucas', 'Benjamin', 'Jacob', 'Ethan',
];

const BIOS = [
  'Arts student who loves coffee, books, and exploring Montreal',
  'Engineering student, rock climbing enthusiast, always down for poutine',
  'Science major, love hiking and board games. Looking to meet new people!',
  'Management student, foodie, and travel lover. Let\'s grab coffee!',
  'Music student, guitarist, and coffee addict. Always looking for jam sessions',
  'Computer Science nerd who loves hackathons and bubble tea',
  'Pre-med student balancing studies with yoga and photography',
  'Economics major with a passion for sustainable finance',
  'Political science enthusiast, debate team captain, and Netflix binger',
  'Fine arts student, painter, and vintage clothing collector',
  'Psychology major interested in cognitive science and mindfulness',
  'Architecture student who sketches buildings and people',
  'Biology major, nature lover, and aspiring conservation biologist',
  'History buff who loves museum visits and historical fiction',
  'Mathematics student who sees beauty in equations',
  'Environmental science major fighting for a greener future',
  'Philosophy student asking all the big questions',
  'Linguistics nerd who speaks 4 languages and counting',
  'Chemistry major, lab enthusiast, and science communicator',
  'Anthropology student fascinated by cultures and human behavior',
  'Marketing student with a creative side and social media expertise',
  'Civil engineering student building a better tomorrow',
  'Neuroscience major exploring the mysteries of the brain',
  'Education student passionate about making learning fun',
  'Journalism major, storyteller, and aspiring documentary filmmaker',
];

const FACULTIES = [
  'Arts', 'Science', 'Engineering', 'Management', 'Music',
  'Education', 'Law', 'Medicine', 'Architecture', 'Agricultural and Environmental Sciences',
];

const YEARS = [2025, 2026, 2027, 2028];

const PRONOUNS = ['he/him', 'she/her', 'they/them', 'he/they', 'she/they'];

const GENDERS = ['male', 'female', 'non-binary', 'prefer not to say'];

const INTENTS = ['dating', 'friendship', 'networking', 'casual'];

/**
 * Get target user email from environment or command line
 */
function getTargetEmail(): string | null {
  return process.env.TARGET_EMAIL || process.argv[2] || null;
}

/**
 * Get profile count from environment or use default
 */
function getProfileCount(): number {
  const envCount = process.env.PROFILE_COUNT;
  return envCount ? parseInt(envCount) : DEFAULT_PROFILE_COUNT;
}

/**
 * Create or get a user by email
 */
async function createOrGetUser(email: string, password: string): Promise<string> {
  // Check if user exists
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  
  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }

  // Create user
  const passwordHash = await hashPassword(password);
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, mcgill_verified)
     VALUES ($1, $2, TRUE)
     RETURNING id`,
    [email, passwordHash]
  );

  return result.rows[0].id;
}

/**
 * Create or update a profile for a user
 */
async function createOrUpdateProfile(
  userId: string,
  displayName: string,
  bio: string,
  photos: string[],
  faculty: string,
  year: number,
  pronouns: string,
  gender: string,
  intent: string
): Promise<void> {
  // Check if profile exists
  const existing = await pool.query('SELECT user_id FROM profiles WHERE user_id = $1', [userId]);

  if (existing.rows.length > 0) {
    // Profile exists, skip
    return;
  }

  // Create profile
  await pool.query(
    `INSERT INTO profiles (
      user_id, display_name, bio, photos, faculty, year,
      pronouns, gender, intent, age_min, age_max
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      userId,
      displayName,
      bio,
      photos,
      faculty,
      year,
      pronouns,
      gender,
      intent,
      18,
      30,
    ]
  );
}

/**
 * Main seeding function
 */
async function seedDevData() {
  try {
    console.log('🌱 Starting dev data seeding...\n');

    const targetEmail = getTargetEmail();
    if (!targetEmail) {
      console.error('❌ Error: TARGET_EMAIL not provided');
      console.log('Usage: TARGET_EMAIL=your.email@mail.mcgill.ca npm run seed-dev');
      console.log('   or: npm run seed-dev your.email@mail.mcgill.ca');
      process.exit(1);
    }

    console.log(`🎯 Target user: ${targetEmail}`);

    // Get or create target user
    const targetUserId = await createOrGetUser(targetEmail, DEFAULT_PASSWORD);
    console.log(`✓ Target user ID: ${targetUserId}\n`);

    // Create sample users and profiles
    const profileCount = getProfileCount();
    console.log(`📝 Creating ${profileCount} sample profiles...`);
    
    const seedUserIds: string[] = [];
    
    for (let i = 0; i < profileCount; i++) {
      const paddedNum = String(i + 1).padStart(3, '0');
      const email = `seed+${paddedNum}@mail.mcgill.ca`;
      
      // Create user
      const userId = await createOrGetUser(email, DEFAULT_PASSWORD);
      seedUserIds.push(userId);
      
      // Generate random profile data
      const displayName = DISPLAY_NAMES[i % DISPLAY_NAMES.length];
      const bio = BIOS[Math.floor(Math.random() * BIOS.length)];
      const faculty = FACULTIES[Math.floor(Math.random() * FACULTIES.length)];
      const year = YEARS[Math.floor(Math.random() * YEARS.length)];
      const pronouns = PRONOUNS[Math.floor(Math.random() * PRONOUNS.length)];
      const gender = GENDERS[Math.floor(Math.random() * GENDERS.length)];
      const intent = INTENTS[Math.floor(Math.random() * INTENTS.length)];
      
      // Use stable placeholder photos (Picsum with seed for consistency)
      const photoSeed = 1000 + i;
      const photos = [
        `https://picsum.photos/seed/${photoSeed}/800/900`,
      ];
      
      // Create profile
      await createOrUpdateProfile(
        userId,
        displayName,
        bio,
        photos,
        faculty,
        year,
        pronouns,
        gender,
        intent
      );
      
      if ((i + 1) % 10 === 0) {
        console.log(`  ✓ Created ${i + 1}/${profileCount} profiles...`);
      }
    }
    
    console.log(`✅ Created ${profileCount} sample profiles\n`);

    // Simulate likes from random seed users to target
    console.log('💜 Creating likes from seed users to target...');
    const likersCount = 20;
    const likerIds = seedUserIds.slice(0, likersCount);
    
    for (const likerId of likerIds) {
      await createLike(likerId, targetUserId);
    }
    
    console.log(`✅ Created ${likersCount} likes to target user\n`);

    // Create mutual likes (matches) with 10 users
    console.log('💕 Creating mutual likes (matches)...');
    const matchCount = 10;
    const matchUserIds = likerIds.slice(0, matchCount);
    
    const matchIds: string[] = [];
    
    for (const matchUserId of matchUserIds) {
      const matchId = await createMutualLikes(targetUserId, matchUserId);
      matchIds.push(matchId);
      
      // Get the other user's info for logging
      const otherUserResult = await pool.query(
        'SELECT email FROM users WHERE id = $1',
        [matchUserId]
      );
      const otherEmail = otherUserResult.rows[0].email;
      
      console.log(`  ✓ Match created with ${otherEmail} (Match ID: ${matchId})`);
    }
    
    console.log(`✅ Created ${matchCount} matches\n`);

    // Seed messages in each match
    console.log('💬 Seeding messages in matches...');
    
    for (const matchId of matchIds) {
      // Get match details
      const matchResult = await pool.query(
        'SELECT user_a_id, user_b_id FROM matches WHERE id = $1',
        [matchId]
      );
      
      const match = matchResult.rows[0];
      await seedMessagesForMatch(matchId, match.user_a_id, match.user_b_id, 5);
    }
    
    console.log(`✅ Seeded messages in ${matchIds.length} matches\n`);

    console.log('✅ Dev data seeding complete!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Target user: ${targetEmail}`);
    console.log(`   - Sample profiles created: ${profileCount}`);
    console.log(`   - Likes to target: ${likersCount}`);
    console.log(`   - Matches created: ${matchCount}`);
    console.log(`   - Messages seeded: ${matchIds.length} matches with 1-5 messages each`);
    console.log(`\n🚀 You can now log in as ${targetEmail} and explore the app!`);
  } catch (error) {
    console.error('❌ Error seeding dev data:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedDevData();
}
