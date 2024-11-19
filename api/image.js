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

const path = require('node:path');

app.get('/api/perfil', async (req, res) => {
  const width = 800;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const userInfo = await getUserInfo('769969803526930504');
  const avatarUrl = userInfo.avatar || 'https://media.discordapp.net/attachments/1245865207646130236/1308524311858122752/default_avatar.png';

  let bannerUrl = userInfo.banner || path.join(__dirname, 'Bbanner.png');

  let avatar, banner;
  try {
    avatar = await loadImage(avatarUrl);
  } catch (error) {
    console.error('Erro ao carregar o avatar:', error);
    return res.status(404).send('Avatar não encontrado.');
  }

  try {
    banner = await loadImage(bannerUrl);
  } catch (error) {
    console.warn('Erro ao carregar o banner, usando o banner base.');
    bannerUrl = path.join(__dirname, 'Bbanner.png'); 
    try {
      banner = await loadImage(bannerUrl);
    } catch (err) {
      console.error('Erro ao carregar o banner base:', err);
      return res.status(404).send('Banner não encontrado.');
    }
  }

  ctx.drawImage(banner, 0, 0, width, height / 2);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, height / 2, width, height / 2);

  // Ajuste do tamanho do avatar e borda
  const avatarSize = 130; // Aumentei o tamanho do avatar
  const avatarX = 40;
  const avatarY = (height / 2) - (avatarSize / 2);

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.clip();

  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
  ctx.restore();

  // Borda do avatar mais larga e colada
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 8, 0, Math.PI * 2);
  ctx.strokeStyle = '#1a1a1a'; // Cor da borda igual ao fundo inferior
  ctx.lineWidth = 8; // Aumento da largura da borda
  ctx.stroke();

  // Nome do usuário alinhado à direita do avatar
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial';
  ctx.fillText(userInfo.username, avatarX + avatarSize + 20, height / 2 + 40);

  const aboutMeText = userInfo.aboutMe || 'Entusiasta de tecnologia e programação.';
  ctx.font = '16px Arial';
  ctx.fillText(`Sobre mim: ${aboutMeText}`, avatarX + avatarSize + 20, height / 2 + 70);

  if (req.query.json === 'true') {
    return res.json(userInfo);
  }

  res.setHeader('Content-Type', 'image/png');
  res.send(canvas.toBuffer('image/png'));
});

app.listen(3000, () => console.log('API is running on http://localhost:3000'));