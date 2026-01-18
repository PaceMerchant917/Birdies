// Helper script to create likes and matches between users
import pool from './index';

/**
 * Create a like from one user to another
 * Uses INSERT ... ON CONFLICT DO NOTHING for idempotency
 */
export async function createLike(fromUserId: string, toUserId: string): Promise<void> {
  await pool.query(
    `INSERT INTO likes (from_user_id, to_user_id)
     VALUES ($1, $2)
     ON CONFLICT (from_user_id, to_user_id) DO NOTHING`,
    [fromUserId, toUserId]
  );
}

/**
 * Create a match between two users
 * Ensures user_a_id < user_b_id to satisfy CHECK constraint
 * Uses INSERT ... ON CONFLICT DO NOTHING for idempotency
 * Returns the match ID
 */
export async function createMatch(userAId: string, userBId: string): Promise<string> {
  // Sort user IDs to satisfy CHECK constraint
  const [sortedUserA, sortedUserB] = userAId < userBId 
    ? [userAId, userBId] 
    : [userBId, userAId];

  const result = await pool.query(
    `INSERT INTO matches (user_a_id, user_b_id)
     VALUES ($1, $2)
     ON CONFLICT (user_a_id, user_b_id) DO UPDATE
     SET user_a_id = matches.user_a_id
     RETURNING id`,
    [sortedUserA, sortedUserB]
  );

  return result.rows[0].id;
}

/**
 * Create mutual likes between two users, which creates a match
 * Returns the match ID
 */
export async function createMutualLikes(userAId: string, userBId: string): Promise<string> {
  // Create both likes
  await createLike(userAId, userBId);
  await createLike(userBId, userAId);
  
  // Create the match
  const matchId = await createMatch(userAId, userBId);
  
  return matchId;
}

/**
 * Get random users from the database (excluding specified user IDs)
 */
export async function getRandomUsers(count: number, excludeUserIds: string[] = []): Promise<string[]> {
  const result = await pool.query(
    `SELECT id FROM users
     WHERE id != ALL($1)
     ORDER BY RANDOM()
     LIMIT $2`,
    [excludeUserIds, count]
  );

  return result.rows.map(row => row.id);
}
