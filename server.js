let projects = require("./db/default-projects");
// let tasks = require("./db/default-tasks");
const Tasks = require("./model/tasks-model");
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const keys = require("./config/keys");
const bodyParser = require("body-parser");
const app = express();

// connect to mongodb
mongoose.connect(keys.mongodb.dbURI, () => {
  console.log("connected to mongodb");
});

app.use(cors());

app.get("/", (req, res) => {
  res.send("👨🏻‍💻BE <---> todo-app");
});

// projects api

app.get("/projects", (req, res) => {
  res.append("Content-Type", "application/json");
  res.send(projects);
});

app.post("/projects", bodyParser.json(), (req, res) => {
  projects = [...projects, req.body];
  // projects.push(req.body);
  console.log(projects);
  res.send(req.body);
});

app.delete("/projects", bodyParser.json(), (req, res) => {
  projects = projects.filter(e => e.project_name !== req.body.project_name);
  res.send(req.body.project_name);
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
  Tasks.findOne({ "tasks_title": req.body.tasks_title }).then(currentTask => {
    console.log(currentTask);
    if (currentTask) {
      console.log("error task already exist: ", currentTask.tasks_title);
      res.status(208).send({
        error: true,
        message: `Task "${currentTask.tasks_title}" already exist`,
      });
    } else {
      new Tasks(req.body)
        .save((err, newTask) => {
          if (err) { return err }
          console.log("created new task: ", newTask);
          res.status(201).send({
            error: false,
            message: `Task "${newTask.tasks_title}" succesfully created`,
          });          
        });
        // .then();
    }
  });
});

app.delete("/tasks", bodyParser.json(), (req, res) => {
  tasks = tasks.filter((e, i) => i !== req.body.id);
  res.send(req.body.tasks_title);
});

app.listen(3001, () => {
  console.log("BE of todo-app listening on port 3001, Ctrl+C to stop");
});
