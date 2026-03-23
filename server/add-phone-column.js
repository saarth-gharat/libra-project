// Migration script to add phone_number column to users table
const { sequelize } = require('./models');

async function addPhoneNumberColumn() {
  try {
    console.log('Adding phone_number column to users table...');
    
    // Add phone_number column to users table
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN phone_number VARCHAR(20) NULL
    `);
    
    console.log('✅ phone_number column added successfully!');
    
    // Verify the column was added
    const [results] = await sequelize.query(`
      PRAGMA table_info(users)
    `);
    
    console.log('Users table columns:');
    results.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });
    
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('✅ phone_number column already exists');
    } else {
      console.error('❌ Error adding column:', error.message);
    }
  } finally {
    await sequelize.close();
  }
}

addPhoneNumberColumn();