const jwtSecret = "your_jwt_secret"; //This has to be the same key used in the JWTStrategy.

const jwt = require("jsonwebtoken"),
  passport = require("passport");

require("./passport"); //Local passport file.

/**
* Creates JWT that expires in 7 days using HS256 Algorithm.
* @param {object} user
* @returns user object and jwt
*/
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, //Username encoded in the JWT.
    expiresIn: "7d", //Specifies when token will expire.
    algorithm: "HS256", //Algorithm used to encode the values of the JWT.
  });
};

// Login

/**
 * POST: Allows user to login and generates JWT.
 * @function generateJWTToken
 * @param {*} router 
 * @returns User object with jwt
 * @requires passport
 */
module.exports = (router) => {
  router.post("/login", (req, res) => {
    passport.authenticate("local", { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: "Something is not right.",
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
