#  Movie-API

## **_Description_**

This application was developed for a Full-Stack Web Development course at CareerFoundry. The API allows a user access
to a database. The user can create an account and login to the application.  Once the user is logged in, he receives 
a JWT token allowing him to query to database and make requests.  These requests will give the user information data on
movies and other users on the database.  The user can also add or delete movies to a list of favorite movies.  Any user
can also delete their profile by username.

### Essential Features

    Return a list of all movies to the user
    Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user
    Return data about a genre (description) by name/title (e.g., “Comedy”)
    Return data about a director (bio, birthdate, death) by name
    Allow new users to register
    Allow users to update their user info (username, password, email, date of birth)
    Allow users to add a movie to their list of favorites
    Allow users to remove a movie from their list of favorites
    Allow existing users to deregister

### Technical Requirements

    The API must be a Node.js and Express application.
    The API must use REST architecture, with URL endpoints corresponding to the data operations listed above
    The API must use at least three middleware modules, such as the body-parser package for reading data from requests and morgan for logging.
    The API must use a “package.json” file.
    The database must be built using MongoDB.
    The business logic must be modeled with Mongoose.
    The API must provide movie information in JSON format.
    The API must include user authentication and authorization code.
    The API must include data validation logic.
    The API must meet data security regulations.
    The API source code must be deployed to a publicly accessible platform like GitHub.
    The API must be deployed to Heroku.

## **_Technology Used_**

    This RESTful API uses Express, Node.js, and MongoDB for the backend structure.  This allows for the frontend to be designed with either React using
    the MERN stack (MongoDB, Express, React, and Node.js), or Angular using the MEAN stack (MongoDB, Express, Angular, Node.js).

#### **_This RESTful API uses:_**

    -Express
    -Node.js
    -MongoDB
    -JavaScript
    -CSS

#### **_Dependencies_**

    -Express
    -Passport
    -Mongoose
    -CORS
    -Body-Parser
    -Bcrypt
    -Morgan
    -UUID
    -JSON Web Token
    -Nodemon
    
#### **_Documentation_**

    -JSDocs
    
## **_LINKS_**

  **[Movie-API](https://ryan-viers-movie-app.herokuapp.com/)**

  **[Documentation-Page](https://ryan-viers-movie-app.herokuapp.com/documentation.html)**

  **[GitHub](https://github.com/RyanViers/movie-api)**
