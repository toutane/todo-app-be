// let projects = require("./db/default-projects");
// let tasks = require("./db/default-tasks");
const Projects = require("./model/projects-model");
const Tasks = require("./model/tasks-model");
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const keys = require("./config/keys");
const bodyParser = require("body-parser");
const shortid = require("shortid-36");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const connectEnsureLogin = require("connect-ensure-login");


const Users = require("./model/users-model");

// CORS options
const corsOptions = {
  credentials: true,
  origin: [
    'http://localhost:3000',
    'http://192.168.1.47:3000'
  ],
}

// connect to mongodb
mongoose.connect(keys.mongodb.dbURI, () => {
  console.log("connected to mongodb");
});

passport.use(new LocalStrategy(Users.authenticate()));
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

const app = express();

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressSession(
  {
  secret: 'carlos',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}
));
// Configure passport middleware

app.use(passport.initialize());
app.use(passport.session());


// API routes
app.get("/", (req, res) => {
  res.send("todo-app-be");
});

// user register

app.post('/register', function(req, res, next) {
  console.log('registering user');
  Users.register(new Users({username: req.body.username, email: req.body.email, full_name: req.body.full_name, join_date: req.body.join_date, user_id: shortid.generate()}), req.body.password, function(err, data) {
    if (err) {
      console.log('error while user register!', err);
      return next(err);
    }
    console.log('user registered!');
    res.send({"user register: ": data.username});
  });
});

// user login
// app.post('/login',
//   passport.authenticate('local',
//   function(err, user, info) {
//     if (err) { return next(err); }
//     if (!user) { return res.redirect('/login'); }
//     // req.logIn(user, function(err) {
//     //   if (err) { return next(err); }
//     //   return res.redirect('/users/' + user.username);
//   }),
//   function(req, res, next) {
//     // console.log(err);
//     console.log(`user ${req.user.username} successfully log`)
//     res.send(req.user);
//   }
// );

app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.send({ error: true, message: 'user unknow' }); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.send({ error: false, message: "user logged in", user: req.user.username });
    });
  })(req, res, next);
});

// user logout
app.get('/logout', function(req, res) {
  console.log("GET /logout req.user.user_id ", req.user.user_id);
  const username = req.user.username;
  req.logout();
  res.send({
    message: "User disconnected",
    user: username,
  });
});

// user api
app.get("/user",
  // connectEnsureLogin.ensureLoggedIn(),
  (req, res) => {
  // console.log("GET /user user_id: ", req.user.user_id);
  res.append("Content-Type", "application/json");
  Users.find({ user_id: req.user.user_id }).then(data => {
    res.send(data);
  });
});

// app.put("/user", bodyParser.json(), (req, res) => {
//   Users.updateOne(
//     { user_id: req.user.user_id },
//     { $set: { full_name: req.body.full_name}}.then(x => {
//       res.send("user profile update")
//     })
//   )
// });

// projects api

app.get("/projects",
  // connectEnsureLogin.ensureLoggedIn(),
  (req, res, next) =>
    !req.user
    ? res.status(405).send({error: true, message: 'not logged'})
    : next(),

  (req, res) => {
  console.log("GET /projects user_id: ", req.user.user_id);
  res.append("Content-Type", "application/json");
  Projects.find({ user_id: req.user.user_id }).then(data => {
    res.send(data);
  });
});

app.post("/projects", bodyParser.json(), (req, res) => {
  console.log("POST /projects user_id: ", req.user.user_id);
  Projects.findOne({ project_name: req.body.projects_name }).then(
    currentProject => {
      console.log(currentProject);
      if (currentProject) {
        console.log(
          "error project already exist: ",
          currentProject.project_name
        );
        res.status(208).send({
          error: true,
          message: `Project "${currentProject.project_name}" already exist`
        });
      } else {
        const project = Object.assign({}, req.body, { user_id: req.user.user_id })
        new Projects( project ).save((err, newProject) => {
          if (err) {
            return err;
          }
          console.log("created new project: ", newProject);
          res.status(201).send({
            error: false,
            message: `Project "${newProject.project_name}" succesfully created`
          });
        });
      }
    }
  );
});

app.delete("/projects", bodyParser.json(), (req, res) => {
  Projects.findOneAndRemove(
    { project_name: req.body.project_name },
    (err, project) => {
      if (err) return res.status(500).send(err);
      // Tasks.remove( {task_id: task._id} );
      const response = {
        message: "Project successfully deleted",
        project
      };
      return res.status(200).send(response);
    }
  );
});

// tasks api
app.get("/tasks", (req, res) => {
  res.append("Content-Type", "application/json");
  Tasks.find({}).then(data => {
    res.send(data);
  });
});

app.post("/tasks", bodyParser.json(), (req, res) => {
  Tasks.findOne({ tasks_title: req.body.tasks_title }).then(currentTask => {
    console.log(currentTask);
    if (currentTask) {
      console.log("error task already exist: ", currentTask.tasks_title);
      res.status(208).send({
        error: true,
        message: `Task "${currentTask.tasks_title}" already exist`
      });
    } else {
      new Tasks(req.body).save((err, newTask) => {
        if (err) {
          return err;
        }
        console.log("created new task: ", newTask);
        res.status(201).send({
          error: false,
          message: `Task "${newTask.tasks_title}" succesfully created`
        });
      });
      // .then();
    }
  });
});

app.delete("/tasks", bodyParser.json(), (req, res) => {
  Tasks.findOneAndRemove({ tasks_id: req.body.id }, (err, task) => {
    if (err) return res.status(500).send(err);
    // Tasks.remove( {task_id: task._id} );
    const response = {
      message: "Task successfully deleted",
      task
    };
    return res.status(200).send(response);
  });
});

app.use(function(err, req, res, next) {
  console.error(err.message);
  res.status(err.status || 500);
  res.send(Object.assign({}, err, {error : true}));
});

app.listen(3001, () => {
  console.log("BE of todo-app listening on port 3001, Ctrl+C to stop");
});
