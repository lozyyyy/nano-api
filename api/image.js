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

  // Obter informações do usuário usando o ID
  const userInfo = await getUserInfo('769969803526930504');  // Substitua pelo ID correto
  const avatarUrl = userInfo.avatar || 'https://media.discordapp.net/attachments/1245865207646130236/1308524311858122752/default_avatar.png';

  // Verificar se o usuário possui um banner, caso contrário, usar o banner base
  let bannerUrl = './Bbanner.png';

  // Tentar carregar o avatar e o banner
  let avatar, banner;
  if (req.query.json === 'true') {
    return res.json(userInfo);
  }
  
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
    bannerUrl = './Bbase.png';  // Redefine para o banner base
    try {
      banner = await loadImage(bannerUrl);
    } catch (err) {
      console.error('Erro ao carregar o banner base:', err);
      return res.status(404).send('Banner não encontrado.');
    }
  }

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
  const aboutMeText = userInfo.aboutMe || 'Entusiasta de tecnologia e programação.';
  ctx.font = '16px Arial';
  ctx.fillText(`Sobre mim: ${aboutMeText}`, 180, height / 2 + 70);

  // Resposta em JSON se o parâmetro json=true estiver presente
  
  // Enviar a imagem como resposta
  res.setHeader('Content-Type', 'image/png');
  res.send(canvas.toBuffer('image/png'));
});

app.listen(3000, () => console.log('API is running on http://localhost:3000'));