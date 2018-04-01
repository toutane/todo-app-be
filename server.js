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
const session = require("cookie-session");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const app = express();

const Users = require("./model/users-model");

// CORS options
const corsOptions = {
  credentials: true,
  origin: [
    'http://localhost:3000',
    'http://192.168.1.47:3000'
  ],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// connect to mongodb
mongoose.connect(keys.mongodb.dbURI, () => {
  console.log("connected to mongodb");
});

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ keys: ["secretkey1", "secretkey2", "..."] }));

// Configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

// authentication

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(Users.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

app.get("/", (req, res) => {
  res.send("todo-app-be");
});

// user register

app.post('/register', function(req, res, next) {
  console.log('registering user');
  Users.register(new Users({username: req.body.username, email: req.body.email, full_name: req.body.full_name, user_id: shortid.generate()}), req.body.password, function(err, data) {
    if (err) {
      console.log('error while user register!', err);
      return next(err);
    }
    console.log('user registered!');
    res.send({"user register: ": data.username});
  });
});

// user login

app.post('/login', passport.authenticate('local'), function(req, res) {
  // res.redirect('/');
  console.log(`user ${req.user.username} successfully log`)
  res.send(req.user);
});

// user logout

app.get('/logout', function(req, res) {
  console.log(req.user)
  req.logout();
  res.redirect('/');
});

// projects api

app.get("/projects", (req, res) => {
  // console.log(req.user.username)
  res.append("Content-Type", "application/json");
  Projects.find({}).then(data => {
    console.log(data);
    res.send(data);
  });
});

app.post("/projects", bodyParser.json(), (req, res) => {
  console.log("req.user: ", req.user);
  if (!req.user) {
    res.send({})
  }
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
        const project = Object.assign({}, req.body, {user_id: req.user.user_id })
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
  console.log({ project_name: req.body.project_name });
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
  // res.send(projects)
});

// tasks api

app.get("/tasks", (req, res) => {
  res.append("Content-Type", "application/json");
  Tasks.find({}).then(data => {
    console.log(data);
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
  console.log({ tasks_id: req.body.id });
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

app.listen(3001, () => {
  console.log("BE of todo-app listening on port 3001, Ctrl+C to stop");
});
