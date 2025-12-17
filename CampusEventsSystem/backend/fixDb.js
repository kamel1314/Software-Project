const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'events.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Fixing database issues...\n');

db.serialize(() => {
  // Delete orphaned registrations (registrations for events that don't exist)
  console.log('🗑️  Removing orphaned registrations...');
  db.run(`
    DELETE FROM registrations 
    WHERE event_id NOT IN (SELECT id FROM events)
  `, function(err) {
    if (err) {
      console.error('❌ Error removing orphaned registrations:', err);
    } else {
      console.log(`✅ Removed ${this.changes} orphaned registration(s)`);
    }
    
    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    db.all("SELECT r.* FROM registrations r LEFT JOIN events e ON r.event_id = e.id WHERE e.id IS NULL", (err, rows) => {
      if (err) {
        console.error('❌ Error verifying:', err);
      } else if (rows.length > 0) {
        console.log(`⚠️  Still found ${rows.length} orphaned registrations`);
        console.table(rows);
      } else {
        console.log('✅ No orphaned registrations remaining');
      }
      
      // Show current state
      console.log('\n📊 Current database state:');
      db.all("SELECT * FROM events", (err, events) => {
        console.log(`\nEvents: ${events.length}`);
        console.table(events);
        
        db.all("SELECT * FROM registrations", (err, regs) => {
          console.log(`\nRegistrations: ${regs.length}`);
          console.table(regs);
          
          console.log('\n✅ Database fixed successfully!');
          db.close();
        });
      });
    });
  });
});
