const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const usersSchema = new Schema({
    user_id: String,
    username: String,
    password: String,
    email: String,
    avatar: String,
    full_name: String,
    location: String,
    join_date: String,
    bio: String,
});

usersSchema.plugin(passportLocalMongoose);

const Users = mongoose.model('user', usersSchema);

module.exports =  Users;