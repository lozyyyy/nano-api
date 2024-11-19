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
  const width = 800;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Carregar o avatar e banner do usuário
  const userInfo = await getUserInfo('769969803526930504');  // Substitua pelo ID correto
  const avatarUrl = userInfo.avatar || 'https://cdn.discordapp.com/avatars/769969803526930504/default.png';
  const bannerUrl = 'https://cdn.discordapp.com/banners/769969803526930504/yourBannerId.png' || 'https://cdn.discordapp.com/banners/default_banner.png';

  const avatar = await loadImage(avatarUrl);
  const banner = await loadImage(bannerUrl);

  // Desenhar o banner (metade superior)
  ctx.drawImage(banner, 0, 0, width, height / 2);

  // Adicionar tema dark com fundo
  ctx.fillStyle = '#1a1a1a'; // Cor de fundo dark
  ctx.fillRect(0, height / 2, width, height / 2);

  // Cortar o avatar para um círculo
  const avatarSize = 100;
  const avatarX = 50;
  const avatarY = (height / 2) - (avatarSize / 2);

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.clip();

  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
  ctx.restore();

  // Adicionar o nome do usuário
  ctx.fillStyle = '#ffffff'; // Cor do texto
  ctx.font = 'bold 24px Arial';
  ctx.fillText(userInfo.username, 180, height / 2 + 40);

  // Adicionar "Sobre mim"
  ctx.font = '16px Arial';
  ctx.fillText('Sobre mim: Entusiasta de tecnologia e programação.', 180, height / 2 + 70);

  // Resposta em JSON se o parâmetro json=true estiver presente
  if (req.query.json === 'true') {
    return res.json(userInfo);
  }

  // Enviar a imagem como resposta
  res.setHeader('Content-Type', 'image/png');
  res.send(canvas.toBuffer('image/png'));
});
app.listen(3000, () => console.log('API is running on http://localhost:3000'));