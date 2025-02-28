const mysql = require('mysql2/promise');

async function testMysql2() {
  const url = 'mysql://telewayc_loyal_auto_sales:34aNDcv3LGlc@51.91.51.137:3306/telewayc_loyal_auto_sales';
  
  try {
    console.log('Tentando conectar usando string de conexão completa...');
    const connection = await mysql.createConnection(url);
    console.log('Conexão estabelecida com sucesso!');
    
    const [rows] = await connection.execute('SELECT 1');
    console.log('Query executada com sucesso:', rows);
    
    await connection.end();
  } catch (error) {
    console.error('Erro ao conectar:', error);
    
    if (error.message.includes('ER_NOT_SUPPORTED_AUTH_MODE')) {
      console.log('\nPossível solução: Execute no MySQL:');
      console.log("ALTER USER 'telewayc_loyal_auto_sales'@'%' IDENTIFIED WITH mysql_native_password BY '34aNDcv3LGlc';");
      console.log('FLUSH PRIVILEGES;');
    }
  }
}

testMysql2(); 