const express = require('express');
const app = express();
const helmet = require('helmet');
const { join } = require('path');

//Prevent crawlers from indexing...
app.use(function (_req, res, next) {
  res.setHeader('X-Robots-Tag', 'noindex, follow');
  return next();
});

app.use(helmet());

// Run the app by serving the static files
// in the dist directory
app.use(express.static(join(__dirname, 'dist')));

app.get('/robots.txt', function (_req, res) {
  res.type('text/plain');
  return res.send('User-agent: *\nDisallow: /');
});

app.get('/*', function (_req, res) {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Start the app by listening on the default
// Heroku port
app.listen(process.env.PORT || 8080, '0.0.0.0');
