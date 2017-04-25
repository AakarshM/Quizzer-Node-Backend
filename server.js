var express = require('express');
var http = require('http');
var methodOverride = require('method-override');
var path = require('path')
var bodyParser = require('body-parser');
var { student, teacher, client, pastquestions, attendance } = require('./db/mongoose.js')
var socketio = require('socket.io');
var { studentAuth, teacherAuth } = require('./middleware.js')
var mongoose = require('mongoose');

//Initialize express and socket.io
var app = express();
var server = http.createServer(app);
var io = socketio(server);
var publicPath = path.join(__dirname, './public');
app.use(methodOverride());
app.use(bodyParser.json());
app.use(express.static(publicPath));
var arrayOfRooms = ['F']; //dummy F


//Create ROUTES:
app.get('/root', function (req, res) {
  res.send('Root view');
});


//*****************   STUDENT sign up and login method ROUTES    *****************

//SIGNUP STUDENT
app.post('/students', function (req, res) {
  var body = req.body;  //{email, password}
   var stu = new student(
       {
           email: body.email,
           password: body.password
       }
   );
   stu.save().then(function () {
       return stu.generateAuthToken();
   }).then(function (token) {
       res.header('x-auth', token).send("");
   }).catch((e) => {
     console.log(e);
       res.status(400).send(e)
   })
});


//LOGIN STUDENS
app.post('/students/login', function (req, res) {
  var email = req.body.email;
var password = req.body.password;
student.findByCredentials(email, password).then((user) => {
     user.generateAuthToken().then((token) => {
       console.log(token);
        res.header('x-auth', token).send(user);
    });
}).catch((e) => {
    res.status(401).send()
});
});

//LOGOUT students
app.delete('/users/me/token', function (req, res) {
    req.user.removeToken(req.token).then(()=> {
        res.status(200).send(); //all ok
    }).catch((e) => {
        res.status(400).send()
    });
});


//*****************   TEACHER sign up and login method ROUTES    *****************

//TEACHER SIGN UP
app.post('/teachers', function (req, res) {
  var body = req.body; //get the JSON from request body.
  var newTeacher = new teacher(body);
  newTeacher.save().then(function () {
        return newTeacher.generateAuthToken();
    }).then(function (token) {
        res.header('x-auth', token).send("User created and logged in");
    }).catch((e) => {
        res.status(400).send(e)
    });
});


//LOGIN TEACHERS
app.post('/teachers/login', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    teacher.findByCredentials(email, password).then((user) => {
         user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    }).catch((e) => {
        res.status(401).send(e); //User not found and/or wrong credentials
    });
});



//*****************   STUDENT INFO                   *********************

app.get('/student/info', studentAuth, function(req, res){
  var currentStudent = req.currentStudent;
  var current_email = currentStudent.email;
  //var urlParams = req.query;
  student.findOne({email: current_email}).then(function(student){
    res.json(student);
    //res.json(student);
  }).catch(function(e){
    console.log(e);
    res.status(400).send(e);
  });
});

app.get('/student/info/attendance', function (req, res) {
  var course = req.query.course;
  var instructor = req.query.instructor; //email

  attendance.findOne({
    course: course,
    instructor: instructor,
  }).then((resp)=>{
    if(!resp){
      res.send("nill");
    } else{
      res.send(JSON.stringify(resp));
    }
  }).catch((e)=>{
    res.status(400).send(e);
  });

});


//*****************   TEACHER INFO                   *********************

app.get('/student/info/m', function(req, res){
  var currentStudent = req.currentStudent;
  var current_email = currentStudent.email;
  var urlParams = req.query;
  teacher.findOne({email: current_email}).then(function(student){
    res.json(student);
  }).catch(function(e){
    res.status(400).send(e);
  });

});



//********** ARCHIVE QUESTIONS ****************************

app.post('/teachers/archive', teacherAuth, function (req, res) { //create new archive
  var currentTeacher = req.currentTeacher;
  var current_email = currentTeacher.email;
  var course = req.body.course;
  var archiveObject = {
    instructor: current_email,
    course: course,
    questions: []
  }
  var newArchive = new pastquestions(archiveObject);
  newArchive.save().then(function (archive) {
    teacher.findOneAndUpdate({email: current_email}, {
      $push: {
        "courses": course
      }
    }).then(function () {
      var newAttendance = new attendance({
          instructor: current_email,
          course: course,
          attendance: 0
      });
      newAttendance.save().then(()=>{
        res.json(archive);
      });

    });
  });
});

app.put('/teachers/archive', teacherAuth, function(req, res){
  var currentTeacher = req.currentTeacher;
  var current_email = currentTeacher.email;
  var course = req.body.course;
  var question = req.body.question;
  var options = req.body.options;
  var answer = req.body.answer;
  if(!course || !options || !answer || !question){
    res.status(400).send("One of the parameters not provided");
  }
  var questionObject = {
    question: question,
    options: options,
    answer: answer
  };
  pastquestions.findOneAndUpdate({
    course: course,
    instructor: current_email
  }, {
      $push: {
        "questions": questionObject
      }
  }).then(function (questions_archive){
    res.status(200).send(questions_archive);
  }).catch(function(e){
    res.status(400).send(e);
  });

});

app.get('/classlist/teacher', teacherAuth, function (req, res) {
    var currentTeacher = req.currentTeacher;
    var email = currentTeacher.email;
    teacher.findOne({email: email}).then(function (teacherProfile) {
      var coursesArray = teacherProfile.courses;
      coursesArray.sort();
      var objectToSend = {
          classList: coursesArray
      }
      res.json(objectToSend);
    })

});

app.get('/pastquestions/', teacherAuth, function (req, res) {
  var currentTeacher = req.currentTeacher;
  var email = currentTeacher.email;
  pastquestions.find({
    instructor: email
  }).then((response) => {
    res.json(response);
  });
});


////////// ANSWER MANAGER

app.get('/classlist', studentAuth, function (req, res) {
    var currentStudent = req.currentStudent;
    var email = currentStudent.email;
    student.findOne({email: email}).then(function (studentProfile) {
      var archivesArray = studentProfile.archives;
      var arrayToSend = [];
      var instructorArray = [];
      archivesArray.forEach(function(specificArchive){
          arrayToSend.push(specificArchive.classname);
          instructorArray.push(specificArchive.teacher);
      });
      //arrayToSend.sort();
      var objectToSend = {
          classList: arrayToSend,
          instructorList: instructorArray
      }
      res.json(objectToSend);
    })

});

app.put('/addclass', studentAuth, function(req, res){
    var currentStudent = req.currentStudent;
    var email = currentStudent.email;
    var body = req.body;
    var class_name = body.className;
    var teacher = body.teacher;
    var classObject = {
      classname: class_name,
      teacher: teacher,
      answers: [],
      score: 0,
      total: 0
    }
    student.findOneAndUpdate({email: email},
      {$push:
        {"archives": classObject
        }
      }, {safe: true, new: true}).then(function(student){
          res.json(student);
    });

});

app.put('/questionanswered', studentAuth, function (req, res) {
      var body = req.body; //body provides, answer, points given (1 or 2), class
      var answer = body.answer;
      var points = body.points;
      var className = body.className;
      var currentStudent = req.currentStudent;
      var email = currentStudent.email;

      student.findOneAndUpdate({email: email, "archives.classname": className}, {
          $push:{
            "archives.$.answers": answer
          },
          $inc:{
            "archives.$.score": points
          }
      }, {new: true}).then(function (stu) {
          res.json(stu);
      });

});

app.post('/summaryclass', studentAuth, function (req, res) {
      var currentStudent = req.currentStudent;
      var className = req.body.className;
      student.findOne({email: currentStudent.email, "archives.classname": className}).then(function (student) {
            var archivesArray = student.archives;
            var classObject = archivesArray.filter(function (item){
                return item.classname == className;
            })
            res.json(classObject[0]);
      });
});

app.put('/questionasked', teacherAuth, function (req, res) {
  var className = req.body.course;
  var teacher = req.currentTeacher.email; //email

/*  student.update({
    'archives.classname': className,
    'archives.teacher': teacher
  }, {
      $inc: {
        'archives.$.total': 1 //# questions
      }
  },  {multi: true}).then(function (result) {
    res.json(result);
      //res.status(200).send();
  })*/
  attendance.findOneAndUpdate({
    instructor: teacher,
    course: className
  }, {
    $inc:{
      attendance: 1
    }
  }).then((resp)=>{
    res.json(resp);
  });
});


////////////////////////////////////////////


///////SESSIONS
//app.use('/createSession', express.static('./public/createsession.html'))

  io.on('connection', function(socket){
    socket.emit('testConnection', 'Connected!');
    console.log('User connected');

    socket.on('disconnect', function () {
       console.log("User has disconnected");
       socket.emit('studentLeft', {
         status: "student left"
       });
    })

      //GRAPH SOCKET:
      socket.on('joinGraph', function (data) {
          socket.join(data.id); //data = {id: room_id}
          socket.emit('joinedGraph');
      });

      //TEACHER SOCKET:
      socket.on('createConnection', function(data){ //data received from 'on'
        var roomData = data.room; // {room: id, classname: cs123}
        var roomID = roomData;
        arrayOfRooms.push(data);
          socket.join(roomID);
      });

      socket.on('closeConnection', function(data){ //teacher closes session
          var roomName = data.room; //not class name, but room ID (ex F)
          var roomObject = arrayOfRooms.filter(function (specificRoom) {
                return specificRoom.room == roomName;
          });
          var indexOfRoomObject = arrayOfRooms.indexOf(roomObject);
          arrayOfRooms.splice(indexOfRoomObject, 1);
          socket.emit('roomClosed', {}); //success
      });

      socket.on('join', function (data) { //data is {room: id, classname: cs123}
        var roomFound = arrayOfRooms.filter(function (roomObject) {
          return roomObject != 'F' && roomObject.room == data.room && roomObject.classname == data.classname;
        })
        console.log(roomFound);
        if(roomFound.length > 0){
          socket.join(data.room);
          socket.emit('successJoiningRoom', {server: 'Successfully joined room'});
          io.to(data.room).emit('student', '');
        } else{
          socket.emit('failedJoiningRoom', {server: 'Room does not exist, unable to join or wrong classroom'});
        }

      });
      socket.on('sendQuestion', function (questionParams) {
          var question = questionParams.question;
          var options = questionParams.options; //array
          var room = questionParams.room;
          io.to(room).emit('receiveQuestion', {question: question, options: options}); //send out question
      });

      socket.on('removeQuestion', function(data){
        var room = data.room;
        var correct_ans = data.correct_answer;
          io.to(room).emit('closeQuestion',
          {server: "Time limit has passed, your final answer was sent",
          correct_answer: correct_ans
            });
          io.to(room).emit('closedGraph');
      });

      socket.on('disconnectStudent', function (data) {
        io.to(data.room).emit('studentLeft', {
          status: "student left"
        });
      });

      socket.on('sendAnswer', function(answerParams){ //answer received by server
        console.log(answerParams);
          var answer = answerParams.answer;
          var room = answerParams.room;
          io.to(room).emit('studentAnswer', {answer: answer}); //will be used for graph
      });

      socket.on('previouslyAnsweredSendAnswer', function (answerParams) {
        var answer = answerParams.answer; //new answer
        var previous = answerParams.previous;
        var room = answerParams.room;
        io.to(room).emit('studentPreviouslyAnswered', {
          answer: answer,
          previous: previous
        });
      })


      socket.on('studentJoined', function(data){
        console.log("data");
      })


  });



//*****************   TEACHER session management   *****************


//Create server
server.listen(3000, function () {
  console.log("Listening on 3000");
})
