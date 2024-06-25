import express from 'express';
const app = express();

app.use(express.static('./dist'));

app.get('*', (req, res) => {
  res.sendFile('index.html', { root: './dist' });
});

app.listen(5173,'0.0.0.0', () => {
  console.log('Server is running on port 3000');
});