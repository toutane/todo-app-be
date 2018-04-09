const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectsSchema = new Schema({
  user_id: String,
  project_id: String,
  project_color: String,
  project_name: String,
  project_icon: String,
  project_url: String,
});

const Projects = mongoose.model('project', projectsSchema);

module.exports = Projects;