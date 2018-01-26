
// var helper = require('sendgrid').mail;
// var from_email = new helper.Email('thewebsite@reclaimingloom.org');
// var to_email = new helper.Email('bartdority@gmail.com');
// var subject = 'Hello World from the SendGrid Node.js Library!';
// var content = new helper.Content('text/html', '<h1>Hello HTML World</h1><p>This is an <strong>html</strong> email!');

// const msg = {
//     to: 'bartdority@gmail.com',
//     from: 'info@reclaimingloom.org',
//     subject: 'sending with SendGrid',
//     text: 'This is just plain text.',
//     html: '<h1>Hello HTML World</h1><p>This is an <strong>html</strong> email!',
// };

//var mail = new helper.Mail(from_email, subject, to_email, content);




var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);



var sendMail = function(req) {
    user_email = req.body.email;

    console.log("In SendMail: email==" + user_email);

    var htmlBody = "<h1 style='color:#333366;'>Helloo, there " + user_email + "!</h1>" +
     "<p>Now I am including parameters in my emails</p>";

    var myMailBody = {
        "personalizations": [
          {
            "to": [
              {
                "email": user_email
              }
            ],
            "subject": "Combined Email"
          }
        ],
        "from": {
          "email": "info@reclaimingloom.org"
        },
        "content": [
          {
            "type": "text/plain",
            "value": "This is plain text!"
          },
          {
              "type": "text/html",
              "value": htmlBody
          }
        ]
      }

    var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: myMailBody,
      });
      

    sg.API(request, function(error, response) {
    console.log(response.statusCode);
    console.log(response.body);
    console.log(response.headers);
    });
}



module.exports.sendMail = sendMail;



