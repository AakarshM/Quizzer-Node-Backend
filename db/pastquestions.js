var mongoose = require('mongoose');
var validator = require('validator');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var bcrypt = require('bcryptjs');

var QuestionSchema = new mongoose.Schema({
  instructor:{
    type: String //email of instructor
  },
  course: {
    type: String
  },
  questions: [
    {
      question: {
        type: String
      },
      options: [],
      answer: {
        type: String
      }
    }
  ]
});


var Questions = mongoose.model('Questions', QuestionSchema);
module.exports = Questions;
