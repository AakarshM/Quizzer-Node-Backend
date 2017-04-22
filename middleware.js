var mongoose = require('mongoose');
var { student, teacher, client } = require('./db/mongoose.js')

var get_student = function(req, res, next){
  var token = req.header('x-auth');
    return student.findOne({
        'tokens.token': token
    }).then(function(student){
      if (!student){
        return Promise.reject();
      }
      req.currentStudent = student;
      next();
    }).catch(function(e){
      console.log(e);
      res.status(401).send(e);
    });
}

var get_teacher = function(req, res, next){
  var token = req.header('x-auth');
    return teacher.findOne({
        'tokens.token': token,
        'tokens.access': 'auth'
    }).then(function(teacher){
      if (!teacher){
        return Promise.reject();
      }
      req.currentTeacher = teacher;
      next();
    }).catch(function(e){
      console.log(e);
      res.status(401).send(e);
    });
}


var middleware = {
  studentAuth: get_student,
  teacherAuth: get_teacher
};

module.exports = middleware;
