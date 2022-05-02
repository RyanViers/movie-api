/*****Load Express Framework*****/
const express = require("express");
const app = express(); //Encapsulates Express's functionality to configure web server.
const port = process.env.PORT || 8080;

/*****Import Mongoose, modles.js, and the Movies and Users models.*****/
const mongoose = require("mongoose");
const Models = require("./models.js");
const cors = require("cors");
const Movies = Models.Movie;
const Users = Models.User;

/*****Express-Validator*****/
const { check, validationResult } = require("express-validator");

/*****Allows Mongoose to connect to a database.*****/
mongoose.connect(
  process.env.CONNECTION_URI || "mongodb://localhost:27017/myFlixDB",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

/*****Import Middleware Libraries: Morgan, Body-Parser, and UUID.*****/
const morgan = require("morgan"), //Imports express and morgan modules locally to file.
  bodyParser = require("body-parser"),
  uuid = require("uuid");

/*****Middleware Invoked*****/
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use((req, res, next) => {
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "X-Requested_With");
  res.header("Cross-Origin-Embedder-Policy", "unsafe-none");
  next()
});

/*****CORS to limit origins for application*****/
/*let allowedOrigins = ['/*http://localhost:8080*/ //', '/*http://testsite.com*///'];*/
/*app.use(cors({
	origin: (origin, callback) => {
		if(!origin) return callback(null, true);
		if(allowedOrigins.indexOf(origin) === -1){//If a specific origin is not found on the list of allowed origins.
			let message = 'The CORS policy for this application does not allow access from origin ' + origin;
			return callback(new Error(message), false);
		}
		return callback(null, true);
	}
}));*/

/*****Authentication*****/
let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

/*****Serving Static Files*****/
app.use(express.static("public"));

/*****Error Handeling Function*****/
const handleError = (error, res) => {
  console.error(error);
  res.status(500).send("Error: " + error);
};

/*app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});*/
/*****CREATE Requests*****/

/*CREATE a new user.*/
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

/*****READ Requests*****/

/*Default Page*/
app.get("/", (req, res) => {
  res.status(200).send("This Is The New Default Page");
});

/*READ data about all users.*/
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
      });
  }
);

/*READ data about specific user by username.*/
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

/*READ list of data about all movies.*/
app.get("/movies", (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      handleError(err, res);
    });
});

/*READ movie data about specific movie by title.*/
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

/*READ genre data by genre name.*/
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

/*READ director data by director name.*/
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

/*****UPDATE Requests*****/

/*UPDATE user info by username.*/
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

/*UPDATE user's movie list by adding a new movie.*/
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

/*****DELETE Requests*****/

/*DELETE movie from user's favorite list.*/
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

/*DELETE user from users list by username.*/
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

/*Error Handeling*/
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

/*App Listener*/
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
