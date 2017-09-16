var http = require('http');
var formidable = require("formidable");
var util = require("util");
var url = require('url');
var mongodb = require("mongodb");
var bodyParser = require("body-parser");


// JWT stuff
var fs = require('fs');
var jwt = require('jsonwebtoken');
var cert = fs.readFileSync('.bsx');
var certString = cert.toString();
var tempPassword;

var ddw = require('./ddw');

ddw.dosomething();


// I'm using SENDGRID -- with a 'free' account - 
// but this could be replaced with NodeMailer when it's on a live produciton server
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


var makeid = function() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }

var ObjectID = mongodb.ObjectID;
                    // this should be set to: process.env.MONGODB_URI
const MONGODB_URI = 'mongodb://bart:givemedata@ds163360.mlab.com:63360/loomdata';

var db;


// Connect to the database before starting the application server.
mongodb.MongoClient.connect(MONGODB_URI, function (err, database) {

    if (err) {
        console.log(err);
        process.exit(1);
      }

    // Save database object from the callback for reuse.
    db = database;
    console.log("Connected to MLAB");

});

var myServerCallBack = function(req,res) {
    const  testUser = { username: 'test', password: 'test', firstname: 'test', lastname: 'user' };
    const { headers, method, url } = req;
    let body = [];

    req.on('error', (err) => {
      console.error(err);
    }).on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      // At this point, we have the headers, method, url and body, and can now
      // do whatever we need to in order to respond to this request.

        // Cross Origin Headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', "POST, GET, PUT, UPDATE, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", 
        "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
    
        //var queryData = url.parse(req.url, true).query;
    
        console.log("In the server: " + req.method);
    
        // If the req.method == OPTIONS, then this is just the browser "Preflight".. and not the
        // actual POST, so let's just return  a status of "OK", so that the browser will allow
        // my CORS request.  FUCK.
        
        if (req.method == "OPTIONS")
        {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end();
        }
    
        // POST DATA
        if (req.method.toLowerCase() == 'post') {

            ddw.processPost(body,req,res,db,jwt,certString);

        }        
        // GET DATA
        if (req.method.toLocaleLowerCase() == 'get') {
            processGet(body,req,res);
    
        };

    });
};


var server = http.createServer(myServerCallBack);



function processForm(req, res, body) {

    console.log("processing the form" + body);
    
    let userObject = JSON.parse(body);
    let userPas = userObject.password;
    let userJWT = jwt.sign({ password: userPas}, certString );
    userObject.password = "";
    userObject.token = userJWT;


        db.collection('users').insertOne(userObject, function(err, result) {
            if (err)
                {
                    console.log("Failed: "+err.message);
                }
                else{
                    console.log("New User Info Posted to Mongo!");
                }
        });

        res.end();

    
}

var port = 3100;
server.listen(port);
console.log("server listening on port " + port);




var processReset = function(body,req,res) {
    console.log("About to reset a password.");
    
                    console.log("request body: "+ body);
    
                    //let sentObject = JSON.parse(body);
                    //let emailInQuestion = sentObject.email;
    
                    // Create a temporary random password
                    tempPassword = makeid();
    
                    // Save the temporary password in the database
                    // let foundUser = db.collection('users').findOne(params, function(err,data){
    
                    // });
    
                     // Send the user an email with a password reset link in it.
                     // This is the 'SendGrid' approach...
    
                    // const msg= {
                    //     to: 'bartdority@gmail.com',
                    //     from: 'b0rgBart3@gmail.com',
                    //     subject: 'You requested a reset',
                    //     text: 'Your reset key is: ' + tempPassword,
                    //     html: '<strong>Your reset key is:</strong>' + tempPassword
                    // };
    
                    // sgMail.send(msg);
                   
                    // transporter.sendMail(mailOptions, (error, info) => {
                    //     if (error) {
                    //         return console.log(error);
                    //     }
                    //     console.log('Message sent: %s', info.messageId);
                    //     // Preview only available when sending through an Ethereal account
                    //     console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    
                    // });
};



var processGet = function(body,req,res) {
    let data = {};
    let responseData;

    switch(req.url)
    {
        case '/courses':
        db.collection('courses').find({}).toArray(function(err,docs) {
            if(err) {
                handleError(res,err.message, "Failed to get courses");
            }
            else{
            
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end( JSON.stringify(docs ) );
                console.log( JSON.stringify(docs));
               
            }
        })
       
        break;

        case '/users':
            db.collection('users').find({}).toArray(function(err,docs) {
                if(err) {
                    handleError(res,err.message, "Failed to get users");
                }
                else{
                
                    res.writeHead(200, {"Content-Type": "application/json"});
                    res.end( JSON.stringify(docs ) );
                    console.log( JSON.stringify(docs));
                   
                }
            })
           
            break;

        case '/languages':
            data = {
                data: {
                    languages: [
                        'English',
                        'Spanish',
                        'German',
                        'Other'
                    ]
                }
            };
            responseData = JSON.stringify(data);
            res.end(responseData);
            console.log("get: ", responseData);
            break;

        default: 
            console.log("get: got called with no object ref name");
            res.end();
            
            break;
    }
};

var handleError = function(res,msg,result) {
    console.log("Error: "+ msg + ", " + result);
    res.writeHead(400);
    res.end();

}