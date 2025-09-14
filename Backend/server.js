import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";

const app = express();
dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
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
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "Sessions",
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
      done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  // console.log("Serialized User:", user);
  done(null, user);
});
passport.deserializeUser((user, done) => {
  console.log("Deserialized User:", user);
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

app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.user);
    res.send({ user: req.user });
  } else {
    console.log("No user authenticated");
    res.status(401).send({ user: null });
  }
});

app.listen(3000, () => {
  console.log("Server Running on Port 3000");
});

// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import { GoogleGenAI } from "@google/genai";
// import session from "express-session";
// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import mongoose from "mongoose";
// import MongoStore from "connect-mongo";
// import { User } from "./models/User.js";
// import { Goal } from "./models/Goal.js";

// const app = express();

// //Load environment variables from .env file
// dotenv.config();

// //Database Connection
// mongoose
//   .connect(process.env.MONGODB_URI)
//   .then(() => {
//     console.log("Database Connnected Successfully");
//   })
//   .catch((err) => {
//     console.log("Database Connection Failed");
//   });

// //Allow resources to be shared between different origins from Frontend to Backend of different URLs
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

// //Parses JSON object to the request body
// app.use(express.json());

// //If there is no session then it will create one
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET, //Uses the secret key to sign the session ID cookie
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: false },
//     store: MongoStore.create({
//       mongoUrl: process.env.MONGODB_URI,
//       collectionName: "sessions",
//     }),
//   })
// );

// //Initialise passport
// app.use(passport.initialize());

// //Let us access the session using request object
// app.use(passport.session());

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "http://localhost:3000/auth/google/callback",
//     },
//     (accessToken, refreshToken, profile, done) => {
//       User.findOne({ googleId: profile.id })
//         .then((existingUser) => {
//           if (existingUser) {
//             return done(null, existingUser);
//           } else {
//             const userData = {
//               googleId: profile.id,
//               displayName: profile.displayName,
//               email: profile.emails[0].value,
//               photo: profile.photos[0].value,
//             };
//             new User(userData)
//               .save()
//               .then((newUser) => {
//                 console.log("New User Created");
//                 return done(null, newUser);
//               })
//               .catch((err) => {
//                 console.log("New User Not Created");
//                 return done(err, null);
//               });
//           }
//         })
//         .catch((err) => done(err, null));
//     }
//   )
// );

// //Store user data in session
// passport.serializeUser((user, done) => {
//   done(null, user._id);
// });

// //Fetch the user data from session
// passport.deserializeUser((user, done) => {
//   User.findById(user)
//     .then((user) => {
//       done(null, user);
//     })
//     .catch((err) => {
//       done(err, null);
//     });
// });

// app.get("/", async (req, res) => {
//   if (req.isAuthenticated()) {
//     try {
//       const userData = await Goal.findOne({ user: req.user._id });
//       res.send({ user: req.user, goal: userData });
//     } catch (err) {
//       console.log(err.message);
//     }
//   } else {
//     res.send({ user: null, goal: null });
//   }
// });

// app.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", {
//     successRedirect: "http://localhost:5173/",
//     failureRedirect: "http://localhost:5173/",
//   })
// );

// app.get("/logout", (req, res) => {
//   req.logout(() => {
//     res.redirect("http://localhost:5173/");
//   });
// });

// app.post("/storeTasks", async (req, res) => {
//   try {
//     const response = await new Goal({
//       user: req.user._id,
//       title: req.body.goal.title,
//       duration: req.body.goal.duration,
//       tasks: Array.from(req.body.goal.tasks, (task, ind) => ({
//         day: ind + 1,
//         task: task,
//         completed: false,
//       })),
//       startDate: new Date(),
//       endDate: new Date().setDate(
//         new Date().getDate() + req.body.goal.duration
//       ),
//       streak: 0,
//       tasksCompleted: 0,
//     }).save();
//   } catch (err) {
//     console.log(err.message);
//   }
// });

// app.post("/saveCheckIn", async (req, res) => {
//   try {
//     const response = await Goal.findOne({ user: req.user._id });
//     response.tasks[req.body.day - 1].completed = req.body.task;
//     response.tasksCompleted = req.body.day;
//     if (req.body.task) {
//       response.streak[req.body.day - 1] = 1;
//     } else {
//       response.streak[req.body.day - 1] = 0;
//     }
//     response.tasks[req.body.day - 1].timeSpent = req.body.timeSpent;
//     if (!response.tasks[req.body.day - 1].changed) {
//       await response.save();
//       res.send({ message: "Check-In saved successfully" });
//     } else {
//       res.send({ message: "Check-In already saved for today" });
//     }
//   } catch (err) {
//     console.log(err.message);
//   }
// });

// app.post("/gemini", async (req, res) => {
//   const message = req.body.message;
//   try {
//     const ai = new GoogleGenAI({
//       apiKey: process.env.GEMINI_API_KEY,
//     });
//     const response = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: message,
//     });
//     res.send({ apireply: response.text });
//   } catch (err) {
//     console.log(err.message);
//     res.send({ message: "api error" });
//   }
// });

// app.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });
