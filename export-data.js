const mysql = require('mysql2/promise');
const fs = require('fs').promises;

async function exportData() {
  const connection = await mysql.createConnection({
    host: '51.91.51.137',
    user: 'telewayc_loyal_auto_sales',
    password: '34aNDcv3LGlc',
    database: 'telewayc_loyal_auto_sales'
  });

  try {
    console.log('Exportando dados...');
    
    // Exportar usuários
    const [users] = await connection.execute('SELECT * FROM User');
    await fs.writeFile('users.json', JSON.stringify(users, null, 2));
    console.log(`Exportados ${users.length} usuários`);

    // Exportar veículos
    const [vehicles] = await connection.execute('SELECT * FROM Vehicle');
    await fs.writeFile('vehicles.json', JSON.stringify(vehicles, null, 2));
    console.log(`Exportados ${vehicles.length} veículos`);

    // Exportar imagens
    const [images] = await connection.execute('SELECT * FROM Image');
    await fs.writeFile('images.json', JSON.stringify(images, null, 2));
    console.log(`Exportadas ${images.length} imagens`);

    // Exportar despesas
    const [expenses] = await connection.execute('SELECT * FROM Expense');
    await fs.writeFile('expenses.json', JSON.stringify(expenses, null, 2));
    console.log(`Exportadas ${expenses.length} despesas`);

    // Exportar preços de mercado
    const [marketPrices] = await connection.execute('SELECT * FROM MarketPrice');
    await fs.writeFile('market-prices.json', JSON.stringify(marketPrices, null, 2));
    console.log(`Exportados ${marketPrices.length} preços de mercado`);

    // Exportar informações de venda
    const [saleInfo] = await connection.execute('SELECT * FROM SaleInfo');
    await fs.writeFile('sale-info.json', JSON.stringify(saleInfo, null, 2));
    console.log(`Exportadas ${saleInfo.length} informações de venda`);

    console.log('Exportação concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
  } finally {
    await connection.end();
  }
}

exportData(); 