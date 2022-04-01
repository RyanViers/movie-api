const express = require('express'),
	morgan = require('morgan'),//Imports express and morgan modules locally to file.
	bodyParser = require('body-parser'),
	uuid = require('uuid');

const app = express();//Encapsulates Express's functionality to configure web server.

let users = [
	{
		id: 1,
		name: 'Kim',
		favoriteMovies:[]
	},

	{
		id: 2,
		name: 'Joe',
		favoriteMovies: ['Dune']
	}
];

let movies =[
	{
		"Title":"Dune",
		"Description":"",
		"Genre": {
			"Name":"Sci-Fi",
			"Description":"",
		},
		"Director":{
			"Name":"Denis Villeneuve",
			"Birth":"",
			"Death":"",
			"Bio":"",
		},
		"ImagePath":"",
	},

	{
		"Title":"Nacho Libre",
		"Description":"Comedy",
		"Genre": {
			"Name":"",
			"Description":"",
		},
		"Director":{
			"Name":"Jared Hess",
			"Birth":"",
			"Death":"",
			"Bio":"",
		},
		"ImagePath":"",
	},

	{
		"Title":"Dumb and Dumber",
		"Description":"Comedy",
		"Genre": {
			"Name":"",
			"Description":"",
		},
		"Director":{
			"Name":"Peter Farrelly",
			"Birth":"",
			"Death":"",
			"Bio":"",
		},
		"ImagePath":"",
	},

	{
		"Title":"Spider Man: No Way Home",
		"Description":"Action",
		"Genre": {
			"Name":"",
			"Description":"",
		},
		"Director":{
			"Name":"Jon Watts",
			"Birth":"",
			"Death":"",
			"Bio":"",
		},
		"ImagePath":"",
	},

	{
		"Title":"Walk Hard: The Dewey Cox Story",
		"Description":"",
		"Genre": {
			"Name":"Comedy",
			"Description":"",
		},
		"Director":{
			"Name":"Jake Kasdan",
			"Birth":"",
			"Death":"",
			"Bio":"",
		},
		"ImagePath":"",
	},
];

/*Middleware Invoked*/
app.use(morgan('common'));
app.use(bodyParser.json());

/*Serving Static Files*/
app.use(express.static('public'));

/*CREATE Requests*/

/*CREATE a new user.*/
app.post('/users', (req, res) => {
	const newUser = req.body;

	if (newUser.name){
		newUser.id = uuid.v4();
		users.push(newUser);
		res.status(201).json(newUser);
	} else{
		res.status(400).send('User Name Cannot Be Blank!');
	}
});

/*READ Requests*/

/*Default Page*/
app.get('/', (req, res) => {
	res.send('This Is The Default Page');
});

/*READ list of dat about all movies.*/
app.get('/movies', (req, res) => {
	res.status(200).json(movies);
});

/*READ movie data by title.*/
app.get('/movies/:title', (req, res) => {
	const { title } = req.params;
	const movie = movies.find(movie => movie.Title === title);

	if (movie){
		res.status(200).json(movie);
	} else{
		res.status(404).send('Invalid Movie Name');
	}
});

/*READ genre data by genre name.*/
app.get('/movies/genre/:genreName', (req, res) => {
	const { genreName } = req.params;
	const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;

	if (genre){
		res.status(200).json(genre);
	} else{
		res.status(404).send('Invalid Genre');
	}
});

/*READ director data by director name.*/
app.get('/movies/directors/:directorName', (req, res) => {
	const { directorName } = req.params;
	const director = movies.find(movie => movie.Director.Name === directorName).Director;

	if (director){
		res.status(200).json(director);
	} else{
		res.status(404).send('Invalid Director Name');
	}
});

/*UPDATE Requests*/

/*UPDATE user name.*/
app.put('/users/:id', (req, res) => {
	const { id } = req.params;
	const updatedUser = req.body;

	let user = users.find(user => user.id == id);//Use == because user.id is a number and id is a string.

	if (user){
		user.name = updatedUser.name;
		res.status(200).json(user);
	} else{
		res.status(400).send('No User Found');
	}
});

/*UPDATE user's movie list with new movie.*/
app.post('/users/:id/:movieTitle', (req, res) => {
	const { id, movieTitle } = req.params;

	let user = users.find(user => user.id == id);//Use == because user.id is a number and id is a string.

	if (user){
		user.favoriteMovies.push(movieTitle);
		res.status(200).send(`${movieTitle} has been added to user ${id}'s favorites.`);
	} else{
		res.status(400).send('No User Found');
	}
});

/*DELETE Requests*/

/*DELETE movie from user's favorite list.*/
app.delete('/users/:id/:movieTitle', (req, res) => {
	const { id, movieTitle } = req.params;

	let user = users.find(user => user.id == id);//Use == because user.id is a number and id is a string.

	if (user){
		user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle );
		res.status(200).send(`${movieTitle} has been deleted from user ${id}'s favorites.`);
	} else{
		res.status(400).send('No User Found');
	}
});

/*DELETE user from users list by id.*/
app.delete('/users/:id', (req, res) => {
	const { id } = req.params;

	let user = users.find(user => user.id == id);//Use == because user.id is a number and id is a string.

	if (user){
		user = users.find(user => user.id != id);
		res.status(200).send(`User ${id} has been deleted.`);
	} else{
		res.status(400).send('No User Found');
	}
});

/*Error Handeling*/
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
/*App Listener*/
app.listen(8080, () => console.log('This app is listening on port 8080'));