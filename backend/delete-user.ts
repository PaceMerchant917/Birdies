// Script to delete a specific user and all their data
import pool from './src/db';

async function deleteUser() {
  const targetEmail = 'emile.labrunie@mail.mcgill.ca';

  try {
    console.log(`🔍 Searching for user: ${targetEmail}`);

    // First, find the user
    const userResult = await pool.query(
      'SELECT id, email, created_at FROM users WHERE email = $1',
      [targetEmail]
    );

    if (userResult.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }

    const user = userResult.rows[0];
    console.log('✅ Found user:', {
      id: user.id,
      email: user.email,
      created: user.created_at
    });

    console.log('🗑️ Deleting all related data...');

    // Delete in correct order to handle foreign keys
    const deleteQueries = [
      { table: 'likes', query: 'DELETE FROM likes WHERE from_user_id = $1 OR to_user_id = $1' },
      { table: 'messages', query: 'DELETE FROM messages WHERE sender_id = $1' },
      { table: 'matches', query: 'DELETE FROM matches WHERE user_a_id = $1 OR user_b_id = $1' },
      { table: 'blocks', query: 'DELETE FROM blocks WHERE blocker_id = $1 OR target_id = $1' },
      { table: 'profiles', query: 'DELETE FROM profiles WHERE user_id = $1' },
      { table: 'users', query: 'DELETE FROM users WHERE id = $1' }
    ];

    for (const { table, query } of deleteQueries) {
      const result = await pool.query(query, [user.id]);
      console.log(`✅ Deleted ${result.rowCount} records from ${table}`);
    }

    console.log(`🎉 User ${targetEmail} and all related data deleted successfully!`);

  } catch (error) {
    console.error('❌ Error deleting user:', error);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  deleteUser()
    .then(() => {
      console.log('Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export default deleteUser;
