import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";
import { supabase } from "./supabase.js"; // ✅ Supabase client

const app = express();
const port = 8000;
const saltRounds = 10;
env.config();

app.use(
  session({
    secret: SECRETWORD,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

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
    const { data: existingUser, error: checkError } = await supabase
      .from("peopleinfo")
      .select("*")
      .eq("email", email);

    if (checkError) throw checkError;

    if (existingUser.length > 0) {
      res.render("alreadyregistered.ejs");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          const { data: newUser, error: insertError } = await supabase
            .from("peopleinfo")
            .insert([{ email, password: hash }])
            .select()
            .single();

          if (insertError) throw insertError;

          req.login(newUser, (err) => {
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
      const { data: users, error } = await supabase
        .from("peopleinfo")
        .select("*")
        .eq("email", username);

      if (error) throw error;

      if (users.length > 0) {
        const user = users[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            return cb(null, valid ? user : false);
          }
        });
      } else {
        return cb(null, false);
      }
    } catch (err) {
      console.log(err);
      return cb(err);
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
