import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";

const app = express();
const port = 8000;
const saltRounds = 10;
env.config();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
  user: "postgres",
  host: "db.qvxnkdzggijciklxjcgg.supabase.co",
  database: "postgres",
  password: process.env.PG_PASSWORD,
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  }
});
db.connect();

app.get("/", (req, res) => {
  res.render("home.ejs");
});



app.get("/register", (req, res) => {
  res.render("register.ejs");
});



app.get("/welcome", (req, res) => {
  
  if (req.isAuthenticated()) {
    res.render("welcome.ejs");
  } else {
    res.render("home.ejs");
  }
});



app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM peopleinfo WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.render("alreadyregistered.ejs");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          const result = await db.query(
            "INSERT INTO peopleinfo (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
          );
          const user = result.rows[0];
          req.login(user, (err) => {
            console.log("success");
            res.redirect("/welcome");
          });
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

passport.use(
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM peopleinfo WHERE email = $1 ", [
        username,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              
              return cb(null, user);
            } else {
              
              return cb(null, false);
            }
          }
        });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      console.log(err);
    }
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
