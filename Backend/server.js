import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import Host from "./Schema/Host.js";
import Playlist_Session from "./Schema/Playlist_Session.js";

const app = express();
dotenv.config();

mongoose
  .connect(process.env.MongoDB_URI)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log("Database Connection Failed");
  });

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: process.env.Session_Secret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    store: MongoStore.create({
      mongoUrl: process.env.MongoDB_URI,
      collectionName: "sessions",
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.Google_Client_ID,
      clientSecret: process.env.Google_Client_Secret,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      Host.findOne({ email: profile.emails[0].value })
        .then((currentHost) => {
          if (currentHost) {
            return done(null, currentHost);
          } else {
            new Host({
              name: profile.displayName,
              email: profile.emails[0].value,
              playlist_session_id: null,
            })
              .save()
              .then((newHost) => {
                return done(null, newHost);
              })
              .catch((err) => {
                return done(err, null);
              });
          }
        })
        .catch((err) => {
          console.log(err);
          return done(err, null);
        });
    }
  )
);

passport.serializeUser((user, done) => {
  // console.log("Serialized User:", user);
  done(null, user);
});
passport.deserializeUser((user, done) => {
  // console.log("Deserialized User:", user);
  done(null, user);
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173",
    successRedirect: "http://localhost:5173",
  })
);

app.get("/", async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const r1 = await Host.find({
        _id: req.user._id,
        playlist_session_id: { $ne: null },
      });
      if (r1.length !== 0) {
        const r2 = await Host.findById(req.user._id).populate(
          "playlist_session_id"
        );
        res.send({ user: req.user, session: r2 });
      } else {
        res.send({ user: req.user, session: null });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Error Fetching Session", error: err });
    }
  } else {
    res.status(401).send({ user: null });
  }
});

app.post("/save-playlist-name", async (req, res) => {
  if (req.isAuthenticated()) {
    const { playlistName } = req.body;
    try {
      const r1 = await Playlist_Session({
        name: playlistName,
        host_id: req.user._id,
      }).save();
      try {
        const r2 = await Host.findByIdAndUpdate(req.user._id, {
          playlist_session_id: r1._id,
        });
        res
          .status(200)
          .send({ message: "Playlist Saved", data: r1 + " " + r2 });
      } catch (err) {
        console.log(err);
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Error Saving Playlist", error: err });
    }
  }
});

app.post("/save-playlist", async (req, res) => {
  if (req.isAuthenticated()) {
    const { playlist } = req.body;
    try {
      const r1 = await Host.findById(req.user._id);
      const r2 = await Playlist_Session.findByIdAndUpdate(
        r1.playlist_session_id,
        {
          $push: { songs_queue: playlist },
        }
      );
      res.status(200).send({ message: "Playlist Songs Saved", data: r2 });
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .send({ message: "Error Saving Playlist Songs", error: err });
    }
  }
});

app.get("/playlist", async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const r1 = await Host.findById(req.user._id).populate(
        "playlist_session_id"
      );
      res.status(200).send({ data: r1 });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Error Fetching Playlist", error: err });
    }
  } else {
    res.status(401).send({ message: "Unauthorized" });
  }
});

app.get("/user/playlist/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const r1 = await Playlist_Session.find({ session_id: id });
    res.status(200).send({ data: r1 });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error Fetching Playlist", error: err });
  }
});

app.listen(3000, () => {
  console.log("Server Running on Port 3000");
});
