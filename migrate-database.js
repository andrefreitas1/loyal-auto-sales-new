const { PrismaClient } = require('@prisma/client');
const mysql = require('mysql2/promise');

const sourceDb = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'loyal_auto_sales'
};

const targetDb = {
  host: '51.91.51.137',
  user: 'telewayc_loyal_auto_sales',
  password: 'twCGD#]&#jnM',
  database: 'telewayc_loyal_auto_sales'
};

async function migrateDatabase() {
  let sourceConn;
  let targetConn;

  try {
    console.log('Conectando aos bancos de dados...');
    
    // Conectar aos bancos
    sourceConn = await mysql.createConnection(sourceDb);
    targetConn = await mysql.createConnection(targetDb);

    // Array com todas as tabelas na ordem correta de dependência
    const tables = [
      'User',
      'Vehicle',
      'Image',
      'Expense',
      'MarketPrice',
      'SaleInfo'
    ];

    // Migrar cada tabela
    for (const table of tables) {
      console.log(`\nMigrando tabela ${table}...`);
      
      // Obter dados da tabela fonte
      const [rows] = await sourceConn.query(`SELECT * FROM ${table}`);
      console.log(`- ${rows.length} registros encontrados`);

      if (rows.length > 0) {
        // Preparar query de inserção
        const columns = Object.keys(rows[0]).join(', ');
        const placeholders = Object.keys(rows[0]).map(() => '?').join(', ');
        const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;

        // Inserir dados na tabela destino
        for (const row of rows) {
          try {
            await targetConn.query(query, Object.values(row));
            process.stdout.write('.');
          } catch (err) {
            console.error(`\nErro ao inserir registro em ${table}:`, err.message);
          }
        }
        console.log('\n- Migração concluída');
      }
    }

    console.log('\nMigração finalizada com sucesso!');

  } catch (error) {
    console.error('Erro durante a migração:', error);
  } finally {
    if (sourceConn) await sourceConn.end();
    if (targetConn) await targetConn.end();
  }
}

migrateDatabase(); 