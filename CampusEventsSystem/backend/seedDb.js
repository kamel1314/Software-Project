// backend/seedDb.js
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'events.db');
const sqlPath = path.join(__dirname, 'events.sql');

const db = new sqlite3.Database(dbPath);

console.log('📥 Seeding database from events.sql...\n');

const sql = fs.readFileSync(sqlPath, 'utf8');

db.exec(sql, (err) => {
  if (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
  
  console.log('✅ Database seeded successfully!\n');
  
  // Verify
  console.log('📋 Events:');
  db.all('SELECT * FROM events', (err, rows) => {
    if (err) {
      console.error('Error fetching events:', err);
    } else {
      console.table(rows);
    }
    
    console.log('\n👥 Registrations:');
    db.all('SELECT * FROM registrations', (err, rows) => {
      if (err) {
        console.error('Error fetching registrations:', err);
      } else {
        console.table(rows);
      }
      
      db.close();
    });
  });
});
