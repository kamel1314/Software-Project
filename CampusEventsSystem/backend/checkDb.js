const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'events.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking database schema and data...\n');

db.serialize(() => {
  // Check events table schema
  console.log('📋 Events Table Schema:');
  db.all("PRAGMA table_info(events)", (err, rows) => {
    if (err) {
      console.error('Error checking events schema:', err);
    } else {
      console.table(rows);
    }
    
    // Check events data
    console.log('\n📅 Events Data:');
    db.all("SELECT * FROM events", (err, rows) => {
      if (err) {
        console.error('Error fetching events:', err);
      } else {
        console.log(`Found ${rows.length} events:`);
        console.table(rows);
      }
      
      // Check registrations table schema
      console.log('\n📋 Registrations Table Schema:');
      db.all("PRAGMA table_info(registrations)", (err, rows) => {
        if (err) {
          console.error('Error checking registrations schema:', err);
        } else {
          console.table(rows);
        }
        
        // Check registrations data
        console.log('\n👥 Registrations Data:');
        db.all("SELECT * FROM registrations", (err, rows) => {
          if (err) {
            console.error('Error fetching registrations:', err);
          } else {
            console.log(`Found ${rows.length} registrations:`);
            console.table(rows);
          }
          
          // Check for any issues
          console.log('\n🔍 Checking for issues...');
          
          // Check for invalid capacity
          db.all("SELECT * FROM events WHERE capacity IS NULL OR capacity < 1", (err, rows) => {
            if (err) {
              console.error('Error checking capacity:', err);
            } else if (rows.length > 0) {
              console.log(`❌ Found ${rows.length} events with invalid capacity:`);
              console.table(rows);
            } else {
              console.log('✅ All events have valid capacity');
            }
            
            // Check for invalid dates
            db.all("SELECT * FROM events WHERE date IS NULL OR date = ''", (err, rows) => {
              if (err) {
                console.error('Error checking dates:', err);
              } else if (rows.length > 0) {
                console.log(`❌ Found ${rows.length} events with invalid dates:`);
                console.table(rows);
              } else {
                console.log('✅ All events have valid dates');
              }
              
              // Check for orphaned registrations
              db.all("SELECT r.* FROM registrations r LEFT JOIN events e ON r.event_id = e.id WHERE e.id IS NULL", (err, rows) => {
                if (err) {
                  console.error('Error checking orphaned registrations:', err);
                } else if (rows.length > 0) {
                  console.log(`❌ Found ${rows.length} orphaned registrations (event doesn't exist):`);
                  console.table(rows);
                } else {
                  console.log('✅ No orphaned registrations');
                }
                
                // Check capacity vs registrations mismatch
                db.all(`
                  SELECT e.id, e.title, e.capacity, e.status, COUNT(r.id) as reg_count
                  FROM events e
                  LEFT JOIN registrations r ON e.event_id = r.event_id
                  GROUP BY e.id
                  HAVING (e.status = 'full' AND reg_count < e.capacity) OR (reg_count >= e.capacity AND e.status != 'full')
                `, (err, rows) => {
                  if (err) {
                    console.error('Error checking capacity mismatches:', err);
                  } else if (rows.length > 0) {
                    console.log(`⚠️  Found ${rows.length} events with capacity/status mismatch:`);
                    console.table(rows);
                  } else {
                    console.log('✅ All event capacities match their status');
                  }
                  
                  db.close();
                });
              });
            });
          });
        });
      });
    });
  });
});
