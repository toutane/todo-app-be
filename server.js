let projects = require("./db/default-projects");
let tasks = require("./db/default-tasks");
const cors = require("cors");
const express = require("express");
const mongoose = require('mongoose');
const keys = require('./config/keys');
const bodyParser = require("body-parser");
const app = express();

// connect to mongodb
mongoose.connect(keys.mongodb.dbURI, () => {
  console.log('connected to mongodb');
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
  res.send(tasks);
});

app.post("/tasks", bodyParser.json(), (req, res) => {
  tasks = [...tasks, req.body];
  console.log(tasks);
  res.send(req.body);
});

app.delete("/tasks", bodyParser.json(), (req, res) => {
  tasks = tasks.filter((e, i) => i !== req.body.id)
  res.send(req.body.tasks_title);
});

app.listen(3001, () => {
  console.log("BE of todo-app listening on port 3001, Ctrl+C to stop");
});
