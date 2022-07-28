// Load Express Framework
const express = require("express");
const app = express(); //Encapsulates Express's functionality to configure web server.
const port = process.env.PORT || 8080;

// Import Mongoose, modles.js, and the Movies and Users models.
const mongoose = require("mongoose");
const Models = require("./models.js");
const cors = require("cors");
const Movies = Models.Movie;
const Users = Models.User;

// Express-Validator
const { check, validationResult } = require("express-validator");

// Allows Mongoose to connect to a database.
mongoose.connect(
  process.env.CONNECTION_URI || "mongodb://localhost:27017/myFlixDB",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

// Import Middleware Libraries: Morgan, Body-Parser, and UUID.
const morgan = require("morgan"), //Imports express and morgan modules locally to file.
  bodyParser = require("body-parser"),
  uuid = require("uuid");

// Middleware Invoked
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Uncomment To Set CORS Policy!!!


/*let allowedOrigins = ['http://localhost:8080', 'http://localhost:1234','https://ryan-viers-08aa31.netlify.app/'];
app.use(cors({
	origin: (origin, callback) => {
		if(!origin) return callback(null, true);
		if(allowedOrigins.indexOf(origin) === -1){//If a specific origin is not found on the list of allowed origins.
			let message = 'The CORS policy for this application does not allow access from origin ' + origin;
			return callback(new Error(message), false);
		}
		return callback(null, true);
	}
}));*/


// Authentication
let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

/**
 * Serves static content for the app from the 'public' directory.
 */
app.use(express.static("public"));

/**
* Error Handeling for Endpoints.
*/
const handleError = (error, res) => {
  console.error(error);
  res.status(500).send("Error: " + error);
};

// Endpoints

/** 
* POST: Allow a new user to register.
* Expected JSON Format:
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}
*
* Endpoint: /users
* Method: POST
* Request Body: Bearer Token, JSON with user object.
* @returns {object} User
*/
app.post(
  "/users",
  [
    check("Username", "Username is required.").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required.").not().isEmpty(),
    check("Email", "Email does not appear to be valid.").isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req); //Checks the validation object for errors.
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + "already exists.");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              handleError(error, res);
            });
        }
      })
      .catch((error) => {
        handleError(error, res);
      });
  }
);

// READ Requests

/*Default Page*/
app.get("/", (req, res) => {
  res.status(200).send("This Is The New Default Page");
});

/**
* GET: Returns a list of all users.
* Request Body: Bearer Token
* @returns Array of all user objects.
* @requires passport
*/
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.find()
      .populate("FavoriteMovies")
      .exec()
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((err) => {
        handleError(err, res);
        console.log('here');
      });
  }
);

/**
* GET: Returns data about specific user by username.
* Request Body: Bearer Token
* @param Username
* @returns User Object
* @requires passport
*/
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .populate("FavoriteMovies")
      .exec()
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        handleError(err, res);
      });
  }
);

/**
* GET: Returns list of all movies.
* Request Body: Bearer Token
* @returns Array of Movie objects
* @requires passport
*/
app.get("/movies",
  passport.authenticate('jwt', { session: false}),
  (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      handleError(err, res);
    });
});

/**
* GET: Returns movie data about specific movie by title.
* Request Body: Bearer Token
* @param MovieID
* @returns Movie object
* @requires passport
*/
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.status(200).json(movie);
      })
      .catch((err) => {
        handleError(err, res);
      });
  }
);

/**
* GET: Returns data about a specific specific genre by name.
* Request Body: Bearer Token
* @param Genre Name
* @returns Genre object
* @requires passport
*/
app.get(
  "/movies/genre/:Name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.Name })
      .then((movie) => {
        if (movie) {
          res.status(200).json(movie.Genre);
        } else {
          res.status(400).send("Genre not found.");
        }
      })
      .catch((err) => {
        handleError(err, res);
      });
  }
);

/**
* GET: Returns data about a specific director by name.
* Request Body: Bearer Token
* @param Director Name
* @returns Director object
* @requires passport
*/
app.get(
  "/movies/director/:Name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Director.Name": req.params.Name })
      .then((movie) => {
        if (movie) {
          res.status(200).json(movie.Director);
        } else {
          res.status(400).send("Director not found.");
        }
      })
      .catch((err) => {
        handleError(err, res);
      });
  }
);

//UPDATE Requests

/**
* PUT: Allows user to update profile information. Use username to update profile.
* Request Body: Bearer Token, User object
* @param Username
* @returns Updated User object
* @requires passport
*/
app.put(
  "/users/:Username",
  [
    check("Username", "Username is required.").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required.").not().isEmpty(),
    check("Email", "Email does not appear to be valid.").isEmail(),
  ],
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let errors = validationResult(req); //Checks the validation object for errors.
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }, //Makes sure that the updated document is returned.
      (err, updatedUser) => {
        if (err) {
          handleError(err, res);
        } else {
          res.status(200).json(updatedUser);
        }
      }
    );
  }
);

/**
 * POST: Allows users to add a movie to their list of favorite movies.
 * Request body: Bearer Token
 * @param Username
 * @param movieId
 * @returns Updated User object
 * @requires passport
 */
app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $push: { FavoriteMovies: req.params.MovieID } },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          handleError(err, res);
        } else {
          res.status(200).json(updatedUser);
        }
      }
    );
  }
);

// DELETE Requests

/**
 * DELETE: Allows users to remove a movie from their list of favorites
 * Request body: Bearer Token
 * @param Username
 * @param movieId
 * @returns Updated User object
 * @requires passport
 */
app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $pull: { FavoriteMovies: req.params.MovieID } },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          handleError(err, res);
        } else {
          res.status(200).json(updatedUser);
        }
      }
    );
  }
);

/**
 * DELETE: Allows existing users to delete profiles
 * Request body: Bearer token
 * @param Username
 * @returns Confirmation of deletion message.
 * @requires passport
 */
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found.");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch((err) => {
        handleError(err, res);
      });
  }
);

/**
* Error Handeling for App.
*/
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

/*
* App Listener, Listening to port 8000.
*/
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
