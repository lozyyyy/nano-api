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

    // Nome (movido para a parte escura)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px Arial';
    const nameX = avatarX + avatarSize + 20;
    const nameY = avatarY + avatarSize / 2 + 20; // Movido para baixo
    ctx.fillText(userInfo.username, nameX, nameY);

    // Retângulos para Coins, Reps, Status
    const infoY = nameY + 30; // Abaixo do nome
    const rectWidth = 200;
    const rectHeight = 40;
    const rectPadding = 10;

    const infoLabels = ['Coins', 'Reps', 'Status'];
    const infoValues = [`${userInfo.coins || 0}`, `${userInfo.reps || 0}`, `${userInfo.married ? 'Casado(a)' : 'Solteiro(a)'}`];

    infoLabels.forEach((label, index) => {
      // Desenha o retângulo de fundo
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(nameX, infoY + index * (rectHeight + rectPadding), rectWidth, rectHeight);

      // Texto dentro do retângulo
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px Arial';
      ctx.fillText(`${label}: ${infoValues[index]}`, nameX + 10, infoY + 25 + index * (rectHeight + rectPadding));
    });

    // Sobre mim com quebra de linha
    const aboutMeText = userInfo.aboutMe || 'Sou um entusiasta em tecnologia e programação.';
    ctx.font = '14px Arial';
    const aboutMeX = avatarX;
    const aboutMeY = infoY + 3 * (rectHeight + rectPadding) + 20; // Abaixo dos campos

    const lines = wrapText(aboutMeText, 30); // Função que divide o texto em várias linhas
    lines.forEach((line, index) => {
      ctx.fillText(line, aboutMeX, aboutMeY + index * 20);
    });

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

// Função que quebra o texto em várias linhas de acordo com o comprimento
function wrapText(text, maxLength) {
  const lines = [];
  const words = text.split(' ');
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length > maxLength) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine += (currentLine ? ' ' : '') + word;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

app.listen(3000, () => console.log('API is running on http://localhost:3000'));