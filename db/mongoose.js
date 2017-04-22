var mongoose = require('mongoose');

//Import models
var student = require('./students.js');
var teacher = require('./teachers.js');
var pastquestions = require('./pastquestions.js');

//Set up MongoDB
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/Classmate');

//Export object containing properties.
var db = {};
db.client = mongoose;
db.student = student;
db.teacher = teacher;
db.pastquestions = pastquestions;

module.exports = db;
