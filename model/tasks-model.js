const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tasksSchema = new Schema({
    // username: String,
    // googleId: String,
    // thumbnail: String
});

const Tasks = mongoose.model('tasks', tasksSchema);

module.exports = Tasks;