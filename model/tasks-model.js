const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tasksSchema = new Schema({
    user_id: String,
    project_id: String,
    tasks_id: Number,
    tasks_title: String,
    tasks_description: String,
    tasks_date: String,
    tasks_project: String,
    tasks_project_name: String,    
    tasks_project_icon: String,
    tasks_priority: String,
    tasks_tag: String,
    tasks_card_color: String,
    tasks_card_icon: String
});

const Tasks = mongoose.model('task', tasksSchema);

module.exports = Tasks;