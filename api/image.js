const express = require('express');
const path = require('node:path');
const { createCanvas, loadImage, registerFont } = require('canvas');
const { getUserInfo, abbreviate } = require('../helpers/disav');
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
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Nano</title>
    </head>
    <body>
      <h1>API Nano</h1>
      <p>Bem-vindo à API Nano! Abaixo estão as rotas e parâmetros disponíveis:</p>
      <h2>Rota: <code>/api/perfil</code></h2>
      <p>Esta rota gera uma imagem de perfil personalizada com base nos parâmetros fornecidos.</p>
      <h3>Parâmetros disponíveis:</h3>
      <ul>
        <li><strong>id</strong>: (opcional) O ID do usuário. Se não fornecido, será usado o ID padrão '1159667835761594449'.</li>
        <li><strong>money</strong>: (opcional) O valor de coins do usuário, que será abreviado (por exemplo, 2000 vira 2k). Se não fornecido, o valor será 0.</li>
        <li><strong>reps</strong>: (opcional) O valor de reputações (reps) do usuário, que também será abreviado. Se não fornecido, o valor será 0.</li>
        <li><strong>status</strong>: (opcional) O status do usuário, como 'Solteiro(a)', 'Casado(a)', etc. O valor padrão é 'Solteiro(a)'.</li>
        <li><strong>aboutMe</strong>: (opcional) Texto sobre o usuário. O valor padrão é 'Sou um entusiasta\nem tecnologia.'</li>
        <li><strong>json</strong>: (opcional) Se definido como 'true', a resposta será no formato JSON, contendo as informações do usuário. Caso contrário, será gerada uma imagem de perfil em formato PNG.</li>
      </ul>
      <p>Exemplo de uso:</p>
      <ul>
        <li><code>/api/perfil?id=123456789&money=1000&reps=50&status=Casado(a)&aboutMe=Adoro programar</code> - Gera uma imagem de perfil com as informações fornecidas.</li>
        <li><code>/api/perfil?json=true&id=123456789</code> - Retorna as informações do perfil em formato JSON.</li>
      </ul>
    </body>
    </html>
  `);
});

app.get('/api/perfil', async (req, res) => {
  const userId = req.query.id || '1159667835761594449';  // ID do usuário, com valor padrão
  
  // Valor de coins e reps, usando a função abbreviate
  const money = req.query.money ? abbreviate(Number(req.query.money)) : '0';  
  const reps = req.query.reps ? abbreviate(Number(req.query.reps)) : '0';   
  
  const status = req.query.status || 'Solteiro(a)';  // Status, passado pela URL
  const aboutMe = req.query.aboutMe || 'Sou um entusiasta\nem tecnologia.';  // Texto sobre o usuário, passado pela URL

  try {
    const userInfo = await getUserInfo(userId);
    userInfo.coins = money;
    userInfo.reps = reps;
    userInfo.status = status;
    userInfo.aboutMe = aboutMe;

    const width = 800;
    const height = 450;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const avatarUrl = userInfo.avatar || 'https://media.discordapp.net/attachments/1245865207646130236/1308524311858122752/default_avatar.png';
    const bannerUrl = userInfo.banner || path.join(__dirname, 'Bbanner.png');

    const avatar = await loadImage(avatarUrl).catch(() => null);
    const banner = await loadImage(bannerUrl).catch(() => loadImage(path.join(__dirname, 'Bbanner.png')));
    const coinsIcon = await loadImage(path.join(__dirname, 'icons/coins.png'));
    const repsIcon = await loadImage(path.join(__dirname, 'icons/reps.png'));
    const statusIcon = await loadImage(path.join(__dirname, 'icons/status.png'));

    if (!avatar || !banner || !coinsIcon || !repsIcon || !statusIcon) {
      return res.status(404).send('Avatar, Banner ou Ícones não encontrados.');
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
    const nameY = avatarY + avatarSize / 2 + 30;
    ctx.fillText(userInfo.username, nameX, nameY);

    // Coins, Reps e Status (com imagens)
    const infoY = nameY + 30;
    const iconSize = 30; // Tamanho dos ícones
    const rectHeight = 40;
    const rectPadding = 10;

    const infoImages = [coinsIcon, repsIcon, statusIcon];
    const infoValues = [
      `${userInfo.coins || 0}`,
      `${userInfo.reps || 0}`,
      userInfo.status || 'Solteiro(a)'
    ];

    let currentX = nameX;
    infoImages.forEach((icon, index) => {
      const text = infoValues[index];
      const rectWidth = ctx.measureText(text).width + iconSize + 20; // Espaço para o texto e o ícone
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(currentX, infoY, rectWidth, rectHeight);

      // Desenhar o ícone
      ctx.drawImage(icon, currentX + 5, infoY + (rectHeight - iconSize) / 2, iconSize, iconSize);

      // Desenhar o texto
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px Arial';
      ctx.fillText(text, currentX + iconSize + 10, infoY + 25);

      currentX += rectWidth + rectPadding; // Atualiza a posição para o próximo campo
    });

    // Retângulo "Sobre mim"
    const aboutMeRectWidth = 350;
    const aboutMeRectX = nameX;
    const aboutMeRectY = infoY + rectHeight + rectPadding * 2;
    const aboutMeRectHeight = 100;
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(aboutMeRectX, aboutMeRectY, aboutMeRectWidth, aboutMeRectHeight);

    // Label "Sobre mim"
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    const labelText = 'Sobre mim';
    const labelTextWidth = ctx.measureText(labelText).width;
    ctx.fillText(
      labelText,
      aboutMeRectX + (aboutMeRectWidth - labelTextWidth) / 2,
      aboutMeRectY + 20
    );

    // Texto "Sobre mim" centralizado
    const aboutMeLines = aboutMe.split('\n');
    const lineHeight = 20;

    const totalTextHeight = aboutMeLines.length * lineHeight;
    const startY = aboutMeRectY + (aboutMeRectHeight - totalTextHeight) / 2 + lineHeight;

    ctx.font = '16px Arial';
    aboutMeLines.forEach((line, index) => {
      const lineWidth = ctx.measureText(line).width;
      ctx.fillText(
        line,
        aboutMeRectX + (aboutMeRectWidth - lineWidth) / 2,
        startY + index * lineHeight
      );
    });

    // Rodapé: "Criado em <data atual>"
    const footerText = `Criado em ${new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`;
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    const footerTextWidth = ctx.measureText(footerText).width;
    ctx.fillText(footerText, width - footerTextWidth - 20, height - 20);

    // Marca de Copyright
    const copyrightText = `© 2024 Sam Bot`;
    ctx.font = '14px Arial';
    const copyrightTextWidth = ctx.measureText(copyrightText).width;
    ctx.fillText(copyrightText, width - copyrightTextWidth - 20, height - 40); // Coloca logo acima do "Criado em"

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