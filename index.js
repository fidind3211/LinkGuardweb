const express = require('express');
const path = require('path');

const app = express();
const port = 4020;

app.use(express.static(path.join(__dirname, '')));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
