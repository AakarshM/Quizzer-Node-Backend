//var bcrypt = require('bcryptjs');
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
var hash = bcrypt.hashSync("pass", salt);
var hash2 = bcrypt.hashSync("pass", salt);

console.log(salt +  "   " + hash)

var boolcheck = bcrypt.compareSync("pass", hash)
var boolcheck2 = bcrypt.compareSync("pass", hash2)
console.log(boolcheck)
console.log(boolcheck2)
