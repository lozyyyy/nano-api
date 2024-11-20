const express = require('express');
const path = require('node:path');
const { createCanvas, loadImage, registerFont } = require('canvas');
const { getUserInfo } = require('../helpers/disav');
registerFont(path.join(__dirname, 'fonts', 'arial.ttf'), { family: 'Arial' });

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
  const userId = req.query.id || '1159667835761594449';
  const money = req.query.money || 0;

  try {
    const userInfo = await getUserInfo(userId);
    userInfo.coins = money;

    const width = 800;
    const height = 450; // Dimensão do canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const avatarUrl = userInfo.avatar || 'https://media.discordapp.net/attachments/1245865207646130236/1308524311858122752/default_avatar.png';
    const bannerUrl = userInfo.banner || path.join(__dirname, 'Bbanner.png');

    const avatar = await loadImage(avatarUrl).catch(() => null);
    const banner = await loadImage(bannerUrl).catch(() => loadImage(path.join(__dirname, 'Bbanner.png')));

    if (!avatar || !banner) {
      return res.status(404).send('Avatar ou Banner não encontrado.');
    }

    // Fundo e banner
    ctx.drawImage(banner, 0, 0, width, height / 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, height / 2, width, height / 2);

    // Avatar
    const avatarSize = 130;
    const avatarX = 40;
    const avatarY = (height / 2) - (avatarSize / 2);

    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, (avatarSize / 2) + 10, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // Nome
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px Arial';
    const nameX = avatarX + avatarSize + 20;
    const nameY = avatarY + 40; // Ajustado para alinhar com o avatar
    ctx.fillText(userInfo.username, nameX, nameY);

    // Campos de informações
    const infoY = nameY + 40; // Abaixo do nome
    ctx.font = '18px Arial';
    const infos = [
      `Coins: ${userInfo.coins || 0}`,
      `Reps: ${userInfo.reps || 0}`,
      `Status: ${userInfo.married ? 'Casado(a)' : 'Solteiro(a)'}`
    ];

    infos.forEach((text, index) => {
      ctx.fillText(text, nameX, infoY + index * 30); // Espaçamento vertical entre os campos
    });

    // Sobre mim
    const aboutMeText = userInfo.aboutMe || 'Entusiasta de tecnologia e programação.';
    ctx.font = '14px Arial';
    const aboutMeX = avatarX;
    const aboutMeY = avatarY + avatarSize + 30;
    ctx.fillText(`Sobre mim: ${aboutMeText}`, aboutMeX, aboutMeY);

    if (req.query.json === 'true') {
      return res.json(userInfo);
    }

    res.setHeader('Content-Type', 'image/png');
    res.send(canvas.toBuffer('image/png'));
  } catch (error) {
    console.error('Erro ao gerar perfil:', error);
    res.status(500).send('Erro interno do servidor.');
  }
});

app.listen(3000, () => console.log('API is running on http://localhost:3000'));