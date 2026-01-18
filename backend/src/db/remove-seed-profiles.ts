// Script to remove the seeded test profiles
import pool from './index';

async function removeSeedProfiles() {
  try {
    console.log('🗑️  Removing seeded test profiles...');

    // List of seeded emails
    const seededEmails = [
      'sarah.johnson@mail.mcgill.ca',
      'mike.chen@mail.mcgill.ca',
      'alex.taylor@mail.mcgill.ca',
      'emma.wilson@mail.mcgill.ca',
      'david.lee@mail.mcgill.ca',
    ];

    // Delete users (profiles will cascade delete automatically)
    const result = await pool.query(
      'DELETE FROM users WHERE email = ANY($1) RETURNING email',
      [seededEmails]
    );

    console.log(`✅ Removed ${result.rowCount} seeded profiles:`);
    result.rows.forEach((row) => {
      console.log(`   - ${row.email}`);
    });

    console.log('\n✅ All seeded profiles removed!');
    console.log('Now only real user profiles will appear in the discover page.');
  } catch (error) {
    console.error('❌ Error removing seeded profiles:', error);
  } finally {
    await pool.end();
  }
}

removeSeedProfiles();
