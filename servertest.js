var express = require('express');
var path = require('path');
var app = express();

// app.get('/', function(reqeust, response) {
//     response.sendFile(__dirname + '/public/index.html');
// });

// This is express built in middlewear
app.use(express.static('public'));


app.listen(3000);


