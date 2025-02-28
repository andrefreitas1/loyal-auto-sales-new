const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: '51.91.51.137',
      user: 'telewayc_loyal_auto_sales',
      password: '34aNDcv3LGlc',
      database: 'telewayc_loyal_auto_sales'
    });

    console.log('Conexão estabelecida com sucesso!');
    await connection.execute('SELECT 1');
    console.log('Query executada com sucesso!');
    await connection.end();
  } catch (error) {
    console.error('Erro ao conectar:', error);
  }
}

testConnection(); 