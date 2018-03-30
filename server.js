// let projects = require("./db/default-projects");
// let tasks = require("./db/default-tasks");
const Projects = require("./model/projects-model");
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
  Projects.find({}).then(data => {
    console.log(data);
    res.send(data);
  });
});

app.post("/projects", bodyParser.json(), (req, res) => {
  Projects.findOne({ "project_name": req.body.projects_name }).then(currentProject => {
    console.log(currentProject);
    if (currentProject) {
      console.log("error project already exist: ", currentProject.project_name);
      res.status(208).send({
        error: true,
        message: `Project "${currentProject.project_name}" already exist`,
      });
    } else {
      new Projects(req.body)
        .save((err, newProject) => {
          if (err) { return err }
          console.log("created new project: ", newProject);
          res.status(201).send({
            error: false,
            message: `Project "${newProject.project_name}" succesfully created`,
          });          
        });
      }
    });
  });

app.delete("/projects", bodyParser.json(), (req, res) => {
  console.log({ "project_name": req.body.project_name });
  Projects.findOneAndRemove({ "project_name": req.body.project_name }, (err, project) => {  
    if (err) return res.status(500).send(err);
    // Tasks.remove( {task_id: task._id} );
    const response = {
        message: "Project successfully deleted",
        project
    };
    return res.status(200).send(response);
});
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
  console.log({ "tasks_id": req.body.id });
  Tasks.findOneAndRemove({ "tasks_id": req.body.id }, (err, task) => {  
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
