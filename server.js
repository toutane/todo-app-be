const projects = require('./db/default-projects')
const cors = require ('cors')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(cors());

app.get('/', (req, res) => {
  res.send('👨🏻‍💻BE <---> todo-app')
})

app.get('/projects', (req, res) => {
  res.append('Content-Type', 'application/json');
  res.send(projects);
})

app.post('/projects', bodyParser.json() , (req, res) => {
  projects.push(req.body);
  // console.log(projects);
  res.send(req.body);
})

app.delete('/projects', bodyParser.json() ,(req, res) => {
  [...projects].filter(
    e => e.project_name !== req.body.project_name
  )
  res.send(req.body.project_name);
  // res.send(projects)
})

app.listen(3001, () => {
  console.log('BE of todo-app listening on port 3001, Ctrl+C to stop')
})