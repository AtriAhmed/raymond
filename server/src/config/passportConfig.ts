const User = require("../models/User");
const userController = require("../controllers/users");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;

module.exports = (passport: any) => {
  //  ======================== Passport Session Setup ============================
  // required for persistent login sessions passport needs ability to serialize and unserialize users out of session
  // used to serialize the user for the session
  passport.serializeUser((user: any, done: any) => {
    done(null, user._id);
  });

  // used to deserialize the user

  passport.deserializeUser(async (id: any, done: any) => {
    const user = await User.findById(id);

    if (user) {
      done(null, user.toJSON());
    } else {
      done(null, false);
    }
  });

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password", passReqToCallback: true },
      async (req: any, username: string, password: string, done: any) => {
        if (req.user) {
          done(null, req.user);
          return;
        }

        try {
          const user = await User.findOne({ email: { $regex: new RegExp("^" + username + "$", "i") } });

          console.log("from local", user);

          if (!user) {
            done(null, false, {
              errors: [
                {
                  status: "404",
                  title: "User Not Found",
                  detail: "User not found.",
                },
              ],
            });
            return;
          }

          const match = await bcrypt.compare(password, user.password);
          if (match) {
            if (!user.active) {
              done(null, false, {
                errors: [
                  {
                    status: "404",
                    title: "Suspended",
                    detail: "User account is suspended.",
                  },
                ],
              });
              return;
            }
            delete user.password;

            console.log(user);

            done(null, user);
            return;
          } else {
            done(null, false, {
              errors: [
                {
                  status: "401",
                  title: "Invalid Credentials",
                  detail: "Invalid credentials.",
                },
              ],
            });
            return;
          }
        } catch (err) {
          done(err);
          return;
        }
      }
    )
  );
};

export {};
