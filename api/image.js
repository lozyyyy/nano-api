const express = require('express');
const { createCanvas } = require('canvas');

const app = express();

app.get('/api/image', (req, res) => {
  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffcc00';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#000';
  ctx.font = 'bold 30px Arial';
  ctx.fillText('Hello from Canvas!', 50, 100);

  res.setHeader('Content-Type', 'image/png');
  res.send(canvas.toBuffer('image/png'));
});

app.listen(3000, () => console.log('API is running on http://localhost:3000'));