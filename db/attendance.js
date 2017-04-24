var mongoose = require('mongoose');

var AttendanceSchema = new mongoose.Schema({
  instructor:{
    type: String //email of instructor
  },
  course: {
    type: String
  },
  attendance: {
    type: Number
  }

});

var Attendance = mongoose.model('Attendance', AttendanceSchema);

module.exports = Attendance;
