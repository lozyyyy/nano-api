const express = require('express');
const path = require('node:path');
const Jimp = require('jimp');
const { getUserInfo } = require('../helpers/disav');

const app = express();

app.get('/api/perfil', async (req, res) => {
  const userId = req.query.id || '1159667835761594449';
  const money = req.query.money || 0;

  try {
    const userInfo = await getUserInfo(userId);
    userInfo.coins = money;

    const width = 800;
    const height = 400;

    const avatarUrl = userInfo.avatar || 'https://media.discordapp.net/attachments/1245865207646130236/1308524311858122752/default_avatar.png';
    let bannerUrl = userInfo.banner || path.join(__dirname, 'Bbanner.png');

    const canvas = await new Jimp(width, height, '#1a1a1a');

    let banner = await Jimp.read(bannerUrl).catch(() => {
      console.warn('Erro ao carregar o banner, usando o banner base.');
      return Jimp.read(path.join(__dirname, 'Bbanner.png'));
    });

    let avatar = await Jimp.read(avatarUrl).catch(() => {
      console.error('Erro ao carregar o avatar.');
      return null;
    });

    if (!avatar || !banner) {
      return res.status(404).send('Avatar ou Banner não encontrado.');
    }

    banner.resize(width, height / 2);
    canvas.composite(banner, 0, 0);

    avatar.resize(130, 130);
    const avatarCircle = avatar.clone().circle();

    const avatarX = 40;
    const avatarY = (height / 2) - (avatar.bitmap.height / 2);
    canvas.composite(avatarCircle, avatarX, avatarY);

    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    const fontSmall = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);

    canvas.print(font, avatarX, avatarY + avatar.bitmap.height + 10, `Sobre mim: ${userInfo.aboutMe || 'Entusiasta de tecnologia e programação.'}`, 720);
    canvas.print(font, avatarX + avatar.bitmap.width + 20, height / 2 + 10, userInfo.username);

    const infos = [
      { label: 'Coins', value: userInfo.coins || 0 },
      { label: 'Reps', value: userInfo.reps || 0 },
      { label: 'Status', value: userInfo.married ? 'Casado(a)' : 'Solteiro(a)' }
    ];

    const infoStartX = avatarX + avatar.bitmap.width + 20;
    const infoStartY = height / 2 + 50;
    const rectWidth = 150;
    const rectHeight = 50;
    const spacing = 10;

    infos.forEach((info, index) => {
      const rectX = infoStartX + (index * (rectWidth + spacing));
      const rectY = infoStartY;

      const rect = new Jimp(rectWidth, rectHeight, '#333333');
      rect.print(fontSmall, 10, 10, `${info.label}: ${info.value}`);
      canvas.composite(rect, rectX, rectY);
    });

    if (req.query.json === 'true') {
      return res.json(userInfo);
    }

    res.setHeader('Content-Type', 'image/png');
    const buffer = await canvas.getBufferAsync(Jimp.MIME_PNG);
    res.send(buffer);
  } catch (error) {
    console.error('Erro ao gerar perfil:', error);
    res.status(500).send('Erro interno do servidor.');
  }
});

app.listen(3000, () => console.log('API is running on http://localhost:3000'));