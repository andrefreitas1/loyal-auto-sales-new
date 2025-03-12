const net = require('net');

const testPort = () => {
  const client = new net.Socket();
  const timeout = 5000; // 5 segundos de timeout

  client.setTimeout(timeout);

  client.connect(3306, '51.91.51.137', () => {
    console.log('Porta 3306 está aberta e acessível!');
    client.end();
  });

  client.on('error', (err) => {
    console.error('Erro ao conectar:', err.message);
    client.end();
  });

  client.on('timeout', () => {
    console.error('Conexão expirou após', timeout, 'ms');
    client.end();
  });
};

testPort(); 