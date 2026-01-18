// Quick script to view all users in the database
import pool from './index';

async function viewUsers() {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        email,
        mcgill_verified,
        created_at
      FROM users
      ORDER BY created_at DESC
    `);

    console.log('\n========================================');
    console.log('👥 USERS IN DATABASE');
    console.log('========================================');
    console.log(`Total users: ${result.rows.length}\n`);

    if (result.rows.length === 0) {
      console.log('No users found in database.');
    } else {
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Verified: ${user.mcgill_verified ? '✅ Yes' : '❌ No'}`);
        console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
        console.log('');
      });
    }
    console.log('========================================\n');
  } catch (error) {
    console.error('Error viewing users:', error);
  } finally {
    await pool.end();
  }
}

viewUsers();
