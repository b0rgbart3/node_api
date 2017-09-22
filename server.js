var http = require('http');

var url = require('url');
var mongodb = require("mongodb");
var bodyParser = require("body-parser");


// JWT stuff
var fs = require('fs');
var jwt = require('jsonwebtoken');
var cert = fs.readFileSync('.bsx');
var certString = cert.toString();
var tempPassword;

var process_post = require('./process_post');
const querystring = require('querystring');
// var nodemailer = require('nodemailer');

// var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'doritydesignworks@gmail.com',
//       pass: '(#T8maIArn[]'
//     }
//   });
//   var mailOptions = {
//     from: 'doritydesignworks@gmail.com',
//     to: 'bartdority@gmail.com',
//     subject: 'Sending Email using Node.js',
//     type: 'text/html',
//     text: 'That was easy!',
//     content: '<h1>That</h1><p>was easy</p>'
//   };

//   transporter.sendMail(mailOptions, function(error, info){
//     if (error) {
//       console.log(error);
//     } else {
//       console.log('Email sent: ' + info.response);
//     }
//   });

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
        
        let crudMethod = req.method.toLowerCase();

        switch (crudMethod) {
            case 'options':
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end();
                break;
            case 'post':
                // console.log("Calling process_post");
                process_post.processPost(body,req,res,db,jwt,certString,sgMail);
                break;
            case 'put':
                // console.log("Received Put request.");
                processPut(body,req,res,db);
                break;
            case 'get':
                processGet(body,req,res);
                break;
            case 'delete':
                processDelete(body,req,res);
                break;
            default:
                break;
        }
        // if (req.method == "OPTIONS")
        // {
        //     res.writeHead(200, {"Content-Type": "application/json"});
        //     res.end();
        // }
    
        // // POST DATA
        // if (req.method.toLowerCase() == 'post') {
        //     console.log("Calling process_post");
        //     process_post.processPost(body,req,res,db,jwt,certString,sgMail);

        // }        
        // // GET DATA
        // if (req.method.toLocaleLowerCase() == 'get') {
        //     processGet(body,req,res);
    
        // };

    });
};


var server = http.createServer(myServerCallBack);





var port = 3100;
server.listen(port);
console.log("server listening on port " + port);

var processPut = function(body,req,res,db) {
    // console.log("Processing the put, req.url="+req.url);
    switch(req.url)
    {
         case '/api/classes/create':
            createClass(body,req,res,db);
            break;
        case '/api/classes/update':
            console.log("Calling update method.");
            updateClass(body,req,res,db);
        default: 
            break;
    }
};  

var createClass = function(body,req,res,db) {
    let classObject = JSON.parse(body);
     console.log("In Create Class : Class Object: "+ JSON.stringify(classObject) ) ;
    // console.log("About to post new class");

    db.collection('classes').insert(classObject, function(err,data) {
        if (err) {
            console.log("Error entering course info into the DB");
            res.writeHead(400, { 'Content-Type': 'plain/text' });
            res.end(err);
        }
        else{
            console.log("Wrote: "+JSON.stringify(data));
            res.writeHead(200, { 'Content-Type': 'plain/text' });
            res.end(JSON.stringify(data ) );
        }
    });
  
};

var updateClass = function(body,req,res,db) {
    let classObject = JSON.parse(body);
    console.log("In Update Class Info: Class Object: "+ JSON.stringify(classObject) ) ;
    console.log("ID of existing course: "+ classObject.id);
    console.log("stringified Object: " + JSON.stringify(classObject));

    db.collection('classes').update({ "id" : classObject.id },
       {"title":classObject.title,"description":classObject.description,"course":classObject.course, 
       "id":classObject.id, "start":classObject.start, "end":classObject.end}, 
       function(err,data) {
        if (err) {
            console.log("Error updating course info into the DB");
            res.writeHead(400, { 'Content-Type': 'plain/text' });
            res.end(err.message);
        }
        else{
            res.writeHead(200, { 'Content-Type': 'plain/text' });
            console.log("Wrote: "+JSON.stringify(data));
            res.end(JSON.stringify(data ) );
        }
    });
    

};


var processDelete = function(body,req,res) {
    let splitUrl = req.url.split("/");
    let resource = splitUrl[2];
    let resource_id_query = splitUrl[3];
    let splitId = splitUrl[3].split(":");
    let resourceId = splitId[1];
    let idString = "" + resourceId;

    //console.log("About to delete resource#:"+resourceId);

    switch(resource)
    {
        case 'classes':
        // console.log("About to delete a class: " + idString);
        db.collection('classes').remove({"id": resourceId }, function(err,data){
            if (err) {
                handleError(res,err.message, "Failed to remove course");
                res.writeHead(400,{"Content-Type": "application/json"});
                res.end();
            }
            else{
            
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end();
               
            } 
          });
            break;

        case 'courses':
          // console.log("About to delete a course: " + idString);
          db.collection('courses').remove({"id": resourceId }, function(err,data){
            if (err) {
                handleError(res,err.message, "Failed to remove course");
                res.writeHead(400,{"Content-Type": "application/json"});
                res.end();
            }
            else{
            
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end();
               
            } 
          });
        break;

        default:break;
    }
};



var processReset = function(body,req,res) {
    console.log("About to reset a password.");
    
                    // console.log("request body: "+ body);
    
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

    let splitUrl = req.url.split("/");
    let resource = splitUrl[2];

    switch(resource)
    {
        case 'classes':
        db.collection('classes').find({}).toArray(function(err,docs) {
            if(err) {
                handleError(res,err.message, "Failed to get classes");
            }
            else{
            
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end( JSON.stringify(docs ) );
                // console.log( JSON.stringify(docs));
               
            }
        });
       
        break;
        case 'courses':
        // console.log("Got a request for course info.");
        let resource_id_query = splitUrl[3];

        if (resource_id_query) {
            let splitId = splitUrl[3].split(":");
            let courseid = splitId[1];
            // console.log("Got a request for course id:" + courseid);
            db.collection('courses').find({"id":courseid}).toArray(function(err,docs) {
                if(err) {
                    handleError(res,err.message, "Failed to get courses");
                }
                else{
                
                    res.writeHead(200, {"Content-Type": "application/json"});
                    res.end( JSON.stringify(docs ) );
                    // console.log( JSON.stringify(docs));
                   
                }
            });
         }
        else {
        db.collection('courses').find({}).toArray(function(err,docs) {
            if(err) {
                handleError(res,err.message, "Failed to get courses");
            }
            else{
            
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end( JSON.stringify(docs ) );
                // console.log( JSON.stringify(docs));
               
            }
            })
        }
        break;

        case 'users':
            db.collection('users').find({}).toArray(function(err,docs) {
                if(err) {
                    handleError(res,err.message, "Failed to get users");
                }
                else{
                
                    res.writeHead(200, {"Content-Type": "application/json"});
                    res.end( JSON.stringify(docs ) );
                    // console.log( JSON.stringify(docs));
                   
                }
            })
           
            break;

        case 'languages':
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
            // console.log("get: ", responseData);
            break;

        default: 
           // console.log("get: got called with no object ref name");
           // console.log(resource);
            res.end();
            
            break;
    }
};

var handleError = function(res,msg,result) {
    console.log("Error: "+ msg + ", " + result);
    res.writeHead(400);
    res.end();

}