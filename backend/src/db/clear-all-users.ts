// Script to delete ALL users and related data from the database
import pool from './index';

async function clearAllUsers() {
  try {
    console.log('🗑️  Deleting ALL users and related data...');
    console.log('⚠️  This will remove all sign ups, profiles, matches, likes, and blocks!');
    
    // Get count before deletion
    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    const userCount = countResult.rows[0].count;
    
    if (userCount === '0') {
      console.log('ℹ️  No users found in the database.');
      return;
    }
    
    console.log(`📊 Found ${userCount} users to delete...`);
    
    // Delete all users (cascade will handle related tables)
    const result = await pool.query(
      'DELETE FROM users RETURNING email'
    );
    
    console.log(`✅ Successfully deleted ${result.rowCount} users:`);
    result.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.email}`);
    });
    
    // Verify deletion
    const verifyResult = await pool.query('SELECT COUNT(*) FROM users');
    const remainingUsers = verifyResult.rows[0].count;
    
    console.log('\n✅ Database cleared successfully!');
    console.log(`📊 Remaining users: ${remainingUsers}`);
    console.log('All profiles, matches, likes, blocks, and verification tokens have been removed.');
    
  } catch (error) {
    console.error('❌ Error clearing users:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

clearAllUsers();
