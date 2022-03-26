const express = require('express'),
	morgan = require('morgan');//Imports express module locally to file.

const app = express();//Encapsulates Express's functionality to configure web server.

let movies ={"Title":"DUNE"};

app.use(morgan('common'));
app.use(express.static('public'));

app.get('/', (req, res) => {
	res.send('This Is The Default Page boy');
});

app.get('/movies', (req, res) => {
	res.json(movies);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
	console.log('This app is listening on port 8080');
});