const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectsSchema = new Schema({
    // username: String,
    // googleId: String,
    // thumbnail: String
});

const Projects = mongoose.model('projects', projectsSchema);

module.exports = Projects;