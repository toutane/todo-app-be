const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectsSchema = new Schema({
  project_id: Number,
  project_name: String,
  project_icon: String,
  project_url: String,
});

const Projects = mongoose.model('projects', projectsSchema);

module.exports = Projects;