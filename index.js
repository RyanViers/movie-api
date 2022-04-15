/*****Load Express Framework*****/
const express = require('express');
const app = express();//Encapsulates Express's functionality to configure web server.

/*****Import Mongoose, modles.js, and the Movies and Users models.*****/
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

/*Allows Mongoose to connect to database so it can perform CRUD operations on the documents it contains from REST API.*/
mongoose.connect('mongodb://localhost:27017/myFlixDB', {useNewUrlParser: true, useUnifiedTopology: true });

/*****Import Middleware Libraries: Morgan, Body-Parser, and UUID.*****/
const morgan = require('morgan'),//Imports express and morgan modules locally to file.
	bodyParser = require('body-parser'),
	uuid = require('uuid');

/*****Middleware Invoked*****/
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

/*****Authentication*****/
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

/*****Serving Static Files*****/
app.use(express.static('public'));

/*****CREATE Requests*****/

/*CREATE a new user.*/
app.post('/users', (req, res) => {
	Users.findOne({ Username: req.body.Username })
		.then((user) => {
			if (user) {
				return res.status(400).send(req.body.Username + 'already exists.');
			}else {
				Users.create({
					Username: req.body.Username,
					Password: req.body.Password,
					Email: req.body.Email,
					Birthday: req.body.Birthday
				})
				.then((user) => {res.status(201).json(user) })
				.catch((error) => {
					console.error(error);
					res.status(500).send('Error: ' + error);
				})
			}
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

/*****READ Requests*****/

/*Default Page*/
app.get('/', (req, res) => {
	res.status(200).send('This Is The Default Page');
});

/*READ data about all users.*/
app.get('/users', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.find()
	.populate('FavoriteMovies')
	.exec()
	.then((users) => {
		res.status(200).json(users);
	})
	.catch((err) => {
		console.error(err);
		res.status(500).send('Error: ' + err);
	});
});

/*READ data about specific user by username.*/
app.get('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
	Users.findOne({ Username: req.params.Username})
		.populate('FavoriteMovies')
		.exec()
		.then((user) => {
		    res.json(user);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

/*READ list of data about all movies.*/
app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
	Movies.find()
		.then((movies) => {
			res.status(200).json(movies);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

/*READ movie data about specific movie by title.*/
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
	Movies.findOne({Title: req.params.Title})
		.then((movie) => {
			res.status(200).json(movie);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

/*READ genre data by genre name.*/
app.get('/movies/genre/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
	Movies.findOne({'Genre.Name': req.params.Name})
		.then((movie) => {
			if (movie) {
				res.status(200).json(movie.Genre);
			}else {
				res.status(400).send('Genre not found.');
			};
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

/*READ director data by director name.*/
app.get('/movies/director/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
	Movies.findOne({'Director.Name': req.params.Name})
		.then((movie) => {
			if (movie) {
				 res.status(200).json(movie.Director);
			} else{
				res.status(400).send('Director not found.');
			};
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

/*****UPDATE Requests*****/

/*UPDATE user info by username.*/
app.put('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
	Users.findOneAndUpdate({Username: req.params.Username}, {$set:
		{
			Username: req.body.Username,
			Password: req.body.Password,
			Email: req.body.Email,
			Birthday: req.body.Birthday
		}
	},
	{new: true},//Makes sure that the updated document is returned.
	(err, updatedUser) => {
		if(err) {
			console.error(err);
			res.status(500).send('Error: ' + err);
		} else{
			res.status(200).json(updatedUser);
		}
	});
});

/*UPDATE user's movie list by adding a new movie.*/
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
	Users.findOneAndUpdate({Username: req.params.Username},
		{$push: {FavoriteMovies: req.params.MovieID}},
		{new: true},
		(err, updatedUser) => {
			if (err) {
				console.error(err);
				res.status(500).send('Error: ' + err);
			} else{
				res.status(200).json(updatedUser);
			}
		});
});

/*****DELETE Requests*****/

/*DELETE movie from user's favorite list.*/
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
	Users.findOneAndUpdate({Username: req.params.Username},
		{$pull: {FavoriteMovies: req.params.MovieID}},
		{new: true},
		(err, updatedUser) => {
			if(err) {
				console.error(err);
				res.status(400).send('Error: ' + err);
			} else{
				res.status(200).json(updatedUser);
			}
		});
});

/*DELETE user from users list by username.*/
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
	Users.findOneAndRemove({Username: req.params.Username})
		.then((user) => {
			if (!user) {
				res.status(400).send(req.params.Username + ' was not found.');
			} else{
				res.status(200).send(req.params.Username + ' was deleted.');
			}
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

/*Error Handeling*/
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
/*App Listener*/
app.listen(8080, () => console.log('This app is listening on port 8080'));