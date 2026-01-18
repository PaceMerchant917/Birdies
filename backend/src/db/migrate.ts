import pool from './index';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  try {
    // Log migration target
    const target = process.env.DATABASE_URL 
      ? `DATABASE_URL target (${process.env.DATABASE_URL.includes('supabase') ? 'Supabase' : 'remote DB'})`
      : 'local database';
    console.log(`🔄 Running migrations against ${target}...`);
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      if (statement.length > 0) {
        await pool.query(statement);
      }
    }
    
    console.log('✅ Database schema created successfully');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migration complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export default runMigrations;
