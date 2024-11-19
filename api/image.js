const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const { getUserInfo } = require('../helpers/disav');

const app = express();

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Página Inicial</title>
    </head>
    <body>
      <h1>Bem-vindo à API Nano</h1>
      <p>Este é um exemplo simples de página inicial.</p>
    </body>
    </html>
  `);
});

app.get('/api', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Nano</title>
    </head>
    <body>
      <h1>API Nano</h1>
      <p>Bem-vindo à API Nano! Use a rota <code>/api/perfil</code> para obter uma imagem de perfil.</p>
    </body>
    </html>
  `);
});

app.get('/api/perfil', async (req, res) => {
  const width = 400;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#333';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('Imagem de Perfil', 100, 200);

  // Exemplo de uso do fetch (caso queira buscar dados de outra API):
  // try {
  //   const response = await fetch('https://exemplo.com/api/data');
  //   const data = await response.json();
  //   // Processar os dados recebidos aqui
  // } catch (error) {
  //   console.error('Erro ao buscar dados:', error);
  // }
  setTimeout(() => console.log(await getUserInfo('769969803526930504')), 10000);

  res.setHeader('Content-Type', 'image/png');
  res.send(canvas.toBuffer('image/png'));
});

app.listen(3000, () => console.log('API is running on http://localhost:3000'));