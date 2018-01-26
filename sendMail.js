
var helper = require('sendgrid').mail;
var from_email = new helper.Email('thewebsite@reclaimingloom.org');
var to_email = new helper.Email('bartdority@gmail.com');
var subject = 'Hello World from the SendGrid Node.js Library!';
var content = new helper.Content('text/plain', 'OK Ive gone back to plain email messages');
var mail = new helper.Mail(from_email, subject, to_email, content);

var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
var request = sg.emptyRequest({
  method: 'POST',
  path: '/v3/mail/send',
  body: mail.toJSON(),
});



var sendMail = function() {
    sg.API(request, function(error, response) {
    console.log(response.statusCode);
    console.log(response.body);
    console.log(response.headers);
    });
}

var doSomething = function() {
    console.log('The doSomething funciton got called.');
}

module.exports.sendMail = sendMail;
module.exports.doSomething = doSomething;




