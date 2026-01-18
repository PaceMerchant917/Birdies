// Helper script to create sample messages in matches
import pool from './index';

// Sample message templates
const MESSAGE_TEMPLATES = [
  "Hey! How's it going?",
  "Nice to match with you!",
  "I saw you're in {faculty}, me too!",
  "What year are you in?",
  "Have you been to that new cafe on campus?",
  "I'm also into {intent}! What are you looking for?",
  "Your profile looks interesting!",
  "Would love to chat sometime!",
  "What do you like to do in Montreal?",
  "Hey there!",
  "Thanks for matching!",
  "I'm in {year}, what about you?",
  "Do you go to any campus events?",
  "What's your favorite spot on campus?",
  "I love your bio!",
  "So what brings you to Birdies?",
  "Coffee sometime?",
  "Have you checked out the study spots in McLennan?",
  "What's your major?",
  "I'm always looking for new study buddies!",
];

/**
 * Create random messages in a match
 * Only seeds if the match currently has 0 messages
 */
export async function seedMessagesForMatch(
  matchId: string,
  userAId: string,
  userBId: string,
  count: number = 3
): Promise<void> {
  // Check if match already has messages
  const existingMessages = await pool.query(
    'SELECT COUNT(*) as count FROM messages WHERE match_id = $1',
    [matchId]
  );

  if (parseInt(existingMessages.rows[0].count) > 0) {
    console.log(`  ⏭️  Match ${matchId} already has messages, skipping`);
    return;
  }

  // Create random messages alternating between users
  const messageCount = Math.floor(Math.random() * count) + 1; // 1 to count messages
  
  for (let i = 0; i < messageCount; i++) {
    // Alternate sender
    const senderId = i % 2 === 0 ? userAId : userBId;
    
    // Pick a random message template
    const message = MESSAGE_TEMPLATES[Math.floor(Math.random() * MESSAGE_TEMPLATES.length)];
    
    // Insert with a slight delay to ensure chronological order
    await pool.query(
      `INSERT INTO messages (match_id, sender_id, body, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP + ($4 || ' seconds')::interval)`,
      [matchId, senderId, message, i]
    );
  }

  // Update the match's last_message_at
  await pool.query(
    'UPDATE matches SET last_message_at = CURRENT_TIMESTAMP WHERE id = $1',
    [matchId]
  );

  console.log(`  ✓ Created ${messageCount} messages in match ${matchId}`);
}

/**
 * Seed messages for all matches involving a specific user
 */
export async function seedMessagesForUser(userId: string): Promise<void> {
  // Get all matches for this user
  const matchesResult = await pool.query(
    `SELECT id, user_a_id, user_b_id 
     FROM matches 
     WHERE user_a_id = $1 OR user_b_id = $1`,
    [userId]
  );

  console.log(`Found ${matchesResult.rows.length} matches for user ${userId}`);

  for (const match of matchesResult.rows) {
    const otherUserId = match.user_a_id === userId ? match.user_b_id : match.user_a_id;
    await seedMessagesForMatch(match.id, match.user_a_id, match.user_b_id, 5);
  }
}
