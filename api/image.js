const express = require('express');
const path = require('node:path');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const { getUserInfo } = require('../helpers/disav');
GlobalFonts.registerFromPath(path.join(__dirname, '..', 'fonts', 'arial.ttf'), 'Arial');

const app = express();

app.get('/api/perfil', async (req, res) => {
  const userId = req.query.id || '1159667835761594449'; // ID padrão se não fornecido
  const money = req.query.money || 0; // Valor padrão se não fornecido

  try {
    const userInfo = await getUserInfo(userId);
    userInfo.coins = money; // Atualiza o valor de coins baseado no parâmetro

    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const avatarUrl = userInfo.avatar || 'https://media.discordapp.net/attachments/1245865207646130236/1308524311858122752/default_avatar.png';
    let bannerUrl = userInfo.banner || path.join(__dirname, 'Bbanner.png');

    // Carregar avatar
    const avatar = await loadImage(avatarUrl).catch(() => {
      console.error('Erro ao carregar o avatar.');
      return null;
    });

    // Carregar banner
    let banner = await loadImage(bannerUrl).catch(() => {
      console.warn('Erro ao carregar o banner, usando o banner base.');
      return loadImage(path.join(__dirname, 'Bbanner.png'));
    });

    if (!avatar || !banner) {
      return res.status(404).send('Avatar ou Banner não encontrado.');
    }

    ctx.drawImage(banner, 0, 0, width, height / 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, height / 2, width, height / 2);

    const avatarSize = 130;
    const avatarX = 40;
    const avatarY = (height / 2) - (avatarSize / 2);

    // Desenhar um círculo maior para simular a borda
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, (avatarSize / 2) + 10, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();

    // Desenhar o avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // Sobre mim abaixo do avatar
    const aboutMeText = userInfo.aboutMe || 'Entusiasta de tecnologia e programação.';
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial'; // Usando uma fonte padrão
    ctx.fillText(`Sobre mim: ${aboutMeText}`, avatarX, avatarY + avatarSize + 20);

    // Nome do usuário à direita do avatar
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial'; // Usando uma fonte padrão em negrito
 ctx.fillText(userInfo.username, avatarX + avatarSize + 20, height / 2 + 30);

    // Exibir retângulos de informações abaixo do nome do usuário
    const infoStartX = avatarX + avatarSize + 20;
    const infoStartY = height / 2 + 60;
    const rectWidth = 100;
    const rectHeight = 30;
    const spacing = 10;

    const infos = [
      { label: 'Coins', value: userInfo.coins || 0 },
      { label: 'Reps', value: userInfo.reps || 0 },
      { label: 'Status', value: userInfo.married ? 'Casado(a)' : 'Solteiro(a)' }
    ];

    infos.forEach((info, index) => {
      const rectX = infoStartX + (index * (rectWidth + spacing));
      const rectY = infoStartY;

      // Desenhar retângulo de informação
      ctx.fillStyle = '#333';
      ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

      // Texto fora do retângulo
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial';
      ctx.fillText(`${info.label}: ${info.value}`, rectX + 10, rectY + 20);
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