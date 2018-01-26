

var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);

var buildPlain = function( contentObject ) {
    var output = '';
    for (var key in contentObject) {
        
        output +=  contentObject[key]["headline"] + "\n";
        output +=  contentObject[key]["paragraph"] + "\n\n";
    }
    return output;
}
var buildHTML= function( contentObject ) {
    var output = '';
    for (var key in contentObject) {
        if (contentObject[key]["headline"]) {      
        output +=  "<h1>" + contentObject[key]["headline"] + "</h1>";}
        output +=  "<p>" + contentObject[key]["paragraph"] + "</p>";
    }
    return output;
}

var sendWelcome = function( resourceObject ) {
    
    var headline = "Welcome to the Reclaiming Loom, " + resourceObject.firstname + ".";
    var paragraph = "Your account has been successfully created.  You can now LOG IN to the Loom " +
    "by going to https://https://thawing-reaches-29763.herokuapp.com/login and entering the " +
    "credentials you used to create your account.";
    var paragraph2 = "Thank you for joining the Reclaiming Loom!";

    var welcomeEmail = [
      {
        "headline": headline,
        "paragraph": paragraph,
        }, 
        {
           "headline": null,
           "paragraph": paragraph2 
        }
    ];
    var textBody = buildPlain( welcomeEmail );
    var htmlBody = buildHTML( welcomeEmail );

    var myMailBody = {
        "personalizations": [
          {
            "to": [
              {
                "email": resourceObject.email
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
            "value": textBody
          },
          {
              "type": "text/html",
              "value": htmlBody
          }
        ]
      };

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

var sendMail = function(req) {
    user_email = req.body.email;

    console.log("In SendMail: email==" + user_email);

    var htmlBody = "<h1 style='color:#334488;'>Helloo, there " + user_email + "!</h1>" +
     "<p>Now I am including parameters in my emails</p>";
    
    var textBody = "Hello there " + user_email + "\nNow I am including parameters in my emails.";


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
            "value": textBody
          },
          {
              "type": "text/html",
              "value": htmlBody
          }
        ]
      };

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



