const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function seed() {
  console.log('Dang ket noi MySQL...');
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'your_secure_mysql_password',
    multipleStatements: true,
    charset: 'utf8mb4'
  });

  try {
    // Chay file init.sql de tao schema
    console.log('Dang chay init.sql...');
    const initSQL = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    
    const delimiterSplit = initSQL.split(/DELIMITER\s+\$/);
    const schemaPart = delimiterSplit[0];
    const cleanSchema = schemaPart
      .split('\n')
      .filter(line => !/^-{3,}/.test(line.trim()))
      .join('\n');
    
    await connection.query(cleanSchema);
    console.log('=> Tao schema thanh cong');

    // Chay tung trigger rieng vi mysql2 khong ho tro DELIMITER
    for (let i = 1; i < delimiterSplit.length; i++) {
      const triggerBlock = delimiterSplit[i].split(/DELIMITER\s*;/)[0].trim();
      if (triggerBlock) {
        const cleanTrigger = triggerBlock.replace(/\$\s*$/, '').trim();
        if (cleanTrigger) {
          try {
            await connection.query(cleanTrigger);
            console.log(`=> Trigger ${i} da tao`);
          } catch (err) {
            if (err.code === 'ER_TRG_ALREADY_EXISTS') {
              console.log(`=> Trigger ${i} da ton tai, bo qua`);
            } else {
              console.error(`=> Trigger ${i} loi: ${err.message}`);
            }
          }
        }
      }
    }

    // Chay file seed.sql de chen du lieu mau
    console.log('Dang chay seed.sql...');
    const seedSQL = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    const cleanSeed = seedSQL
      .split('\n')
      .filter(line => !/^-{3,}/.test(line.trim()))
      .join('\n');
    await connection.query(cleanSeed);
    console.log('=> Chen du lieu mau thanh cong');

    console.log('\nHoan tat cai dat CSDL!');
  } catch (err) {
    console.error('Loi:', err.message);
  } finally {
    await connection.end();
  }
}

seed();
