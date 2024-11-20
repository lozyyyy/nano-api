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
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const avatarUrl = userInfo.avatar || 'https://media.discordapp.net/attachments/1245865207646130236/1308524311858122752/default_avatar.png';
    let bannerUrl = userInfo.banner || path.join(__dirname, 'Bbanner.png');

    const avatar = await loadImage(avatarUrl).catch(() => null);
    let banner = await loadImage(bannerUrl).catch(() => loadImage(path.join(__dirname, 'Bbanner.png')));

    if (!avatar || !banner) {
      return res.status(404).send('Avatar ou Banner não encontrado.');
    }

    ctx.drawImage(banner, 0, 0, width, height / 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, height / 2, width, height / 2);

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

    // Função para quebrar texto com base no tamanho
    const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
      const words = text.split(' ');
      let line = '';
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, y);
    };

    const aboutMeText = userInfo.aboutMe || 'Entusiasta de tecnologia e programação.';
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    const aboutMeX = (width - 300) / 2;  // Centralizando
    wrapText(ctx, `Sobre mim: ${aboutMeText}`, aboutMeX, avatarY + avatarSize + 20, 300, 20);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px Arial';
    ctx.fillText(userInfo.username, avatarX + avatarSize + 20, height / 2 + 30);

    // Campos dinâmicos de informações (Coins, Reps, Status)
    const infoStartX = avatarX + avatarSize + 20;
    const infoStartY = height / 2 + 60;
    const rectHeight = 30;
    const spacing = 10;

    const infos = [
      { label: 'Coins', value: userInfo.coins || 0 },
      { label: 'Reps', value: userInfo.reps || 0 },
      { label: 'Status', value: userInfo.married ? 'Casado(a)' : 'Solteiro(a)' }
    ];

    infos.forEach((info, index) => {
      const text = `${info.label}: ${info.value}`;
      const textWidth = ctx.measureText(text).width;  // Calculando a largura do texto
      const rectWidth = textWidth + 20;  // Adicionando margem ao retângulo

      const rectX = infoStartX + (index * (rectWidth + spacing));
      const rectY = infoStartY;

      ctx.fillStyle = '#333';
      ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(text, rectX + 10, rectY + 20);
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

app.listen(3000, () => console.log('API is running on http://localhost:3000'));