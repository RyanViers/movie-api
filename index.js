const express = require('express'),
	morgan = require('morgan');//Imports express and morgan modules locally to file.

const app = express();//Encapsulates Express's functionality to configure web server.

let movies =[{"Title":"DUNE","Director":"Denis Villeneuve"},
{"Title":"Nacho Libre","Director":"Jared Hess"},
{"Title":"Dumb and Dumber","Director":"Peter Farrelly"},
{"Title":"Spider Man: No Way Home","Director":"Jon Watts"},
{"Title":"Walk Hard: The Dewey Cox Story","Director":"Jake Kasdan"}];

/*Morgan Middleware Invoked*/
app.use(morgan('common'));

/*Serving Static Files*/
app.use(express.static('public'));

/*GET Requests*/
app.get('/', (req, res) => {
	res.send('This Is The Default Page');
});

app.get('/movies', (req, res) => {
	res.json(movies);
});

/*Error Handeling*/
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
/*App Listener*/
app.listen(8080, () => {
	console.log('This app is listening on port 8080');
});