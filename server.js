var http = require('http');
var https = require('https');
var url = require('url');
var mongodb = require("mongodb");
var bodyParser = require("body-parser");
var formidable = require("formidable");
var sortBy = require('lodash').sortBy;
// JWT stuff
var fs = require('fs');
var jwt = require('jsonwebtoken');
var tempPassword;
var path = require('path'),
fs = require('fs');
var logger = require('./logger');
var url = require('url');
var multer  = require('multer');
var easyimg = require('easyimage');
var im = require('imagemagick');
var sanitize = require("sanitize-filename");

var cert;
var certString;
var server;

let ssl_options = {};

let ORIGIN_BASEPATH = "";
let AVATAR_PATH = "";

let local = true;
cert = fs.readFileSync('.bsx');
certString = cert.toString();

AVATAR_PATH = 'https://recloom.s3.amazonaws.com/avatars';

if (local) { 
    ORIGIN_BASEPATH = "http://localhost:4200";
    //AVATAR_PATH = 'http://localhost:3100/avatars/';
    
}
else {
    
   ORIGIN_BASEPATH = "https://thawing-reaches-29763.herokuapp.com";
 //   AVATAR_PATH = 'https://young-bastion-45095.herokuapp.com';   
  //   ORIGIN_BASEPATH = "https://ddworks.org/dist/";
     // AVATAR_PATH = 'https://ddwork.org:8000/avatars/';
    let ssl_options = {
        key:fs.readFileSync('./ssl/privkey.pem'),
        cert:fs.readFileSync('./ssl/allchange.pem')
    };
}
// ORIGIN_BASEPATH = "https://thawing-reaches-29763.herokuapp.com";

UPLOAD_PATH = 'https://recloom.s3.amazonaws.com/';


const querystring = require('querystring');

var express = require('express');
var app = express();
gm = require('gm').subClass({imageMagick: true});

if (local) {
    server = http.createServer(app);
} else {
//    server = https.createServer(ssl_options,app);
server = http.createServer(app);
}

// var S3_CREDS = {
//     "aws_access_key_id" : "AKIAIE52WOYO3ZPCPT3Q",
//     "aws_secret_acces_key" : "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"
// }
var aws = require('aws-sdk');
//aws.config.loadFromPath('./config.json');
aws.config.update({accessKeyId: 'AKIAIE52WOYO3ZPCPT3Q', secretAccessKey: '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'});

var multerS3 = require('multer-s3');
var s3 = new aws.S3({ apiVersion: '2006-03-01',
region: 'us-west-1'
});
// credentials: {S3_CREDS}


// Chatroom Logins
var chatroom = [];


function staticValue (value) {
    return function (req, file, cb) {
      cb(null, value)
    }
  }

//var MAU = require('./modify-and-upload');

app.use(function(req, res, next) { //allow cross origin requests

    res.setHeader('Access-Control-Allow-Origin', ORIGIN_BASEPATH);
    // var whitelist = ['localhost:4200', 'https://thawing-reaches-29763.herokuapp.com']
    // var host = req.get('host');

    // whitelist.forEach(function(val, key){
    //     if (host.indexOf(val) > -1){
    //       res.setHeader('Access-Control-Allow-Origin', host);
    //     }
    //   })
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");

    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", true);
    next();
});


app.use(logger);
// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(urlencodedParser);

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        let userId = req.query.userid;
        // console.log("Query: " + JSON.stringify(req.query) );

        // console.log("Got a Query UserID: " + userId);
        // console.log("Request URL" + req.url );

        var destinationDir = UPLOAD_PATH + 'uploads/' + userId;
        if (!fs.existsSync(destinationDir)) {
            fs.mkdirSync(destinationDir);
        }
        // put the assets in a subfolder of the Users ID #
        cb(null, destinationDir);
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
    }
});


var storeCourseImage = multerS3( {
    s3: s3,
    bucket: 'recloom',
    metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname });
      },
    acl: 'public-read-write',
    key: function (req, file, cb) {
        // cb(null, Date.now().toString())
        cb(null, 'courseimages/' + req.query.id + '/' +sanitize( file.originalname) ); 
    }
});


// var storeCourseImage= multer.diskStorage({ //multers disk storage settings
//     destination: function (req, file, cb) {
//         let id = req.query.id;

//         var destinationDir = UPLOAD_PATH + 'courseimages/' + id;
//         if (!fs.existsSync(destinationDir)) {
//             fs.mkdirSync(destinationDir);
//         }
//         // put the courseimage in a subfolder of the Course ID #
//         cb(null, destinationDir);
//     },
//     filename: function (req, file, cb) {
//         // var datetimestamp = Date.now();
//        // var newfilename = datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]; 
//        cb(null, file.originalname);   
       
//     }
// });



var storeBookImage= multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        let id = req.query.id;

        var destinationDir = UPLOAD_PATH + 'bookimages/' + id;
        if (!fs.existsSync(destinationDir)) {
            fs.mkdirSync(destinationDir);
        }
        // put the courseimage in a subfolder of the Course ID #
        cb(null, destinationDir);
    },
    filename: function (req, file, cb) {
        // var datetimestamp = Date.now();
       // var newfilename = datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]; 
       cb(null, file.originalname);   
       
    }
});



var storeDocFile = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        let id = req.query.id;

        var destinationDir = UPLOAD_PATH + 'docfiles/' + id;
        if (!fs.existsSync(destinationDir)) {
            fs.mkdirSync(destinationDir);
        }
        // put the courseimage in a subfolder of the Course ID #
        cb(null, destinationDir);
    },
    filename: function (req, file, cb) {
        // var datetimestamp = Date.now();
       // var newfilename = datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]; 
       cb(null, file.originalname);   
       
    }
});


var upload = multer({ //multer settings
    storage: storage
}).single('file');



var uploadCourseImage = multer({ //multer settings
    storage: storeCourseImage
}).single('file');



var uploadBookImage = multer({ //multer settings
    storage: storeBookImage
}).single('file');

// var uploadDocImage = multer({ //multer settings
//     storage: storeDocImage
// }).single('file');



// var uploadDocFile = multer({ //multer settings
//     storage: storeDocFile
// }).single('file');

var getSeries = function(req,res,next) {
    dbQuery = {};
    //dbQuery = {'series' : true};
  
    console.log("My db query: " + JSON.stringify(dbQuery) );

    res.setHeader('Access-Control-Allow-Origin', ORIGIN_BASEPATH);
    res.setHeader('Access-Control-Allow-Methods', "POST, GET, PUT, UPDATE, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
    db.collection('series').find(dbQuery).toArray(function(err,docs) {
        if(err) { handleError(res,err.message, "Failed to get" + resource); }
        else{
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end( JSON.stringify(docs ) );
        }
    });
}
var getStudents = function (req,res,next) {
    console.log("Getting Students Only");
    dbQuery = {};
        if (req.query.id && req.query.id != 0)
        {
            // ruh roh - what is this enrollments business?  Is this outdated?
            dbQuery = {'enrollments.class_id': req.query.id, 'enrollments.roles':'student' };
            // console.log("dbQuery == " + JSON.stringify(dbQuery) );
        }
        console.log("My db query: " + JSON.stringify(dbQuery) );

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', "POST, GET, PUT, UPDATE, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", 
        "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
        db.collection('users').find(dbQuery).toArray(function(err,docs) {
            if(err) { handleError(res,err.message, "Failed to get" + resource); }
            else{
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end( JSON.stringify(docs ) );
                // console.log( JSON.stringify(docs));
            }
        });
};

var getInstructors = function (req,res,next) {
    console.log("Getting Instructors Only");
    dbQuery = {};
    
        // if (req.query.id && req.query.id != 0)
        // {
           // dbQuery = {'enrollments.class_id': req.query.id, 'enrollments.roles':'instructor' };
            // console.log("dbQuery == " + JSON.stringify(dbQuery) );
  
            dbQuery = {'instructor' : true};
  
        console.log("My db query: " + JSON.stringify(dbQuery) );

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', "POST, GET, PUT, UPDATE, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", 
        "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
        db.collection('users').find(dbQuery).toArray(function(err,docs) {
            if(err) { handleError(res,err.message, "Failed to get" + resource); }
            else{
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end( JSON.stringify(docs ) );
               // console.log( JSON.stringify(docs));
            }
        });
};

var getWhosIn = function(req,res,next) {
    let whosIn = [];
    console.log('Finding out whos in the chatroom: ');
    if (req.query.id && req.query.id != 0)
    {
        whosIn = chatroom[req.query.id];

    } 
    if (!whosIn) { whosIn = []};
    console.log('Whosin: ' + whosIn);
    let whosInObject = { userIDs : whosIn };
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', "POST, GET, PUT, UPDATE, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
    res.writeHead(200, {"Content-Type": "application/json"});

    res.end( JSON.stringify(whosInObject) );
};

var getUserByEmail = function( req, res, next ) {
    if (req.query.email && req.query.email != "") {
        dbQuery = {'email':req.query.email };
        db.collection('users').find(dbQuery).toArray(function(err,docs) {
            if(err) { handleError(res,err.message, "Failed to get user by email"); }
            else {
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end( JSON.stringify(docs) );
            }
        });
    }
}

// var getCourseImages = function(req,res,next) {
//     console.log("Getting courseimage");

//     /* Here is an instance where I am creating a unique method for this particular resource.
//        -- it's because it's for course images -- which we need in other components -- 
//        so we're accessing the image URL as a standalone request.  (but it's not it's own collection).
       
//        Wondering right now why this is necessary - because all of the course data should have alread
//        been loaded in when the course object was loaded in.
//        */

    
// }



var getAllMaterialsByType = function(req,res,next) {

    console.log("Getting all the materials, organized by type ");
    dbQuery = {};
    book = [];
    doc = [];

    // Use the power of queries to get exactly what we want from the Mongo DB Call
 
    dbQuery1 = { 'type' : 'book' };
    dbQuery2 = { 'type' : 'doc' };
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', "POST, GET, PUT, UPDATE, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");


    db.collection(resource).find(dbQuery1).toArray(function(err,doc) {
        if(err) { handleError(res,err.message, "Failed to get books" ); }
        else{
            book = doc;
            db.collection(resource).find(dbQuery1).toArray(function(err,docs) {
                if(err) { handleError(res,err.message, "Failed to get docs" ); }
                else {
                    doc = doc;

                    materials = [];
                    materials['book'] = book;
                    materials['doc'] = doc;
                    res.writeHead(200, {"Content-Type": "application/json"});
                    res.end( JSON.stringify(materials) );
                }
            } );

            

             }
             
        } );
    
}




var deleteResource = function(resource,req,res,next) {

    let resourceId = req.query.id;
    console.log('Removing ' + resource + ', with id of of: ' + resourceId);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', "POST, GET, PUT, UPDATE, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
    db.collection(resource).remove({"id": resourceId }, function(err,data){
        if (err) {
            handleError(res,err.message, "Failed to remove resource:" + resource + ":" + resourceId);
            res.writeHead(400,{"Content-Type": "application/json"});
            res.end();
        }
        else{
            console.log('Successfully removed ' + resource + ' id: ' + resourceId );
            res.writeHead(200, { 'Content-Type': 'plain/text' });
            res.end();
           
        } 
      });
};



// I made this seperate from putResource because Users need the JWT
var makeid= function() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  };

var chatLogin = function(req,res,next) {
    let user = req.body.user;
    let classID = req.body.classID;
    
    if (!chatroom[classID]) { chatroom[classID] = []; }
    if (!chatroom[classID].includes(user)) {
    chatroom[classID].push(user); }
    console.log('User '+user+', entered chatroom: '+ classID);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', "POST, GET, PUT, UPDATE, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end();
};

var putUser = function(req,res,next) {
    let resourceObject = req.body;
    // console.log("PUTTING THE USER");
    let userPas = resourceObject.password;
    let userJWT = jwt.sign({ password: userPas}, certString );
    resourceObject.verified = 'false';
    resourceObject.token = userJWT;
    let verificationID = makeid();
    resourceObject.verificationID = verificationID;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', "POST, GET, PUT, UPDATE, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");

    if (req.query.id && req.query.id != 0)
    {
        dbQuery = {'id':req.query.id };
        delete resourceObject._id;
        try {
        db.collection('users').replaceOne({ "id" : resourceObject.id },
           resourceObject);
           res.sendStatus(200);
           res.end();
        } catch (e) {
            console.log("Error entering resource into the DB");
            res.sendStatus(450);
            res.end(e.message);
        } 
    } else {
        // console.log ( 'Inserting Resource into DB ' );
        db.collection('users').insert(resourceObject, function(err,data) {
            if (err) {
                console.log("Error entering resource into the DB");
                res.writeHead(400, { 'Content-Type': 'plain/text' });
                res.end(err);
            }
            else{
                // console.log("Wrote: "+JSON.stringify(data));
                res.writeHead(200, { 'Content-Type': 'plain/text' });
                res.end(JSON.stringify(data ) );
            }
        });
    }
}



var putResource = function(resource, req,res,next) {
    let resourceObject = req.body;

    console.log("Putting resource: "+ resource);
    console.log("Putting object: "+ JSON.stringify( resourceObject ) );
    res.setHeader('Access-Control-Allow-Origin', ORIGIN_BASEPATH );
    res.setHeader('Access-Control-Allow-Methods', "POST, GET, PUT, UPDATE, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");

    if (req.query.id && req.query.id != 0)
    {
        dbQuery = {'id':req.query.id };
        delete resourceObject._id;

        try {
        db.collection(resource).update({ "id" : resourceObject.id },
           resourceObject, {upsert: true});
           res.sendStatus(200);
           res.end();
        } catch (e) {
            console.log("Error entering resource into the DB");
            res.sendStatus(450);
            res.end(e.message);
        }
    
 
    }

  
};
var returnSuccess = function( req,res,next) {
    res.setHeader('Access-Control-Allow-Origin', ORIGIN_BASEPATH );
    res.setHeader('Access-Control-Allow-Methods', "POST, GET, PUT, UPDATE, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
    res.writeHead(200, { 'Content-Type': 'plain/text' });
    res.end();
};

// var controllers = require('./controllers');
// controllers.set(app, db);



app.get('/api/finduser*', function(req,res,next) {
    console.log('finding user by email.');
    getUserByEmail(req,res,next);
  });
  
  
  app.get('/api/book', function(req,res,next) { getResources('book',req,res,next);});
  app.get('/api/doc', function(req,res,next) { getResources('doc',req,res,next);});
  app.get('/api/classes', function(req,res,next) { getResources('classes',req,res,next);});
  app.get('/api/studentClasses', function(req,res,next) { getStudentClasses( req, res, next); });
  app.get('/api/instructorClasses', function(req,res,next) { getInstructorClasses( req, res, next); });
  app.get('/api/courses', function(req,res,next) { getResources('courses',req,res,next);});
  app.get('/api/usersettings', function(req,res,next) { getResources('usersettings',req,res,next);});
  app.get('/api/users', function(req,res,next) { getResources('users',req,res,next);});
  app.get('/api/assets', function(req,res,next) { getResources('assets',req,res,next);});
  app.get('/api/materials', function(req,res,next) { getResources('materials', req,res,next);});
  app.get('/api/allmaterialsbytype', function(req,res,next) { getAllMaterialsByType(req,res,next);});
  app.get('/api/classregistrations', function(req,res,next) { getResources('classregistrations',req,res,next);});
  app.get('/api/instructors',  function(req,res,next) { getInstructors(req,res,next);});
  app.get('/api/students',  function(req,res,next) { getStudents(req,res,next);});
  app.get('/api/series', function(req,res,next) { getSeries(req,res,next);});
  app.get('/api/threads', function(req,res,next) { getResources('threads',req,res,next);});
  app.get('/api/chats/whosin', function(req,res,next) { getWhosIn(req,res,next);});
  app.get('/api/avatars*', function(req,res,next) { 
      console.log("About to call get avatars.");
      getResources('avatars',req,res,next);});
  
  app.get('/api/classregistrations*', function(req,res,next) { 
              getResources('classregistrations',req,res,next);});
  
  
      var getResources = function(resource,req,res,next) {
  
          console.log("Getting resource " + resource);
          dbQuery = {};
      
          // Use the power of queries to get exactly what we want from the Mongo DB Call
          if (req.query.id && req.query.id !== 0)
          {
              dbQuery = {'id':req.query.id };
              if (req.query.type && req.query.type !== '')
              {
                  dbQuery['type'] = req.query.type;
              } 
          } else {
              if (req.query.type && req.query.type !== '')
              {
                  dbQuery = {'type':req.query.type };
              } 
          }
          
          if (req.query.classID && (req.query.classID != 0) && req.query.sectionNumber) {
              dbQuery={'classID': req.query.classID, 'sectionNumber': req.query.sectionNumber };
              console.log('sectionNumber: ' + req.query.sectionNumber);
          }
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', "POST, GET, PUT, UPDATE, DELETE, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", 
          "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
          db.collection(resource).find(dbQuery).toArray(function(err,docs) {
              if(err) { handleError(res,err.message, "Failed to get" + resource); }
              else{
                  res.writeHead(200, {"Content-Type": "application/json"});
      
                  let stringyDocs = JSON.stringify(docs);
      
                  var reverseChronology = [];
                  if (resource === 'threads') {
                      reverseChronology = sortBy( docs, 'post_date' ).reverse();
                      docs = reverseChronology;
                      res.end( JSON.stringify(docs) );
                  } else {
                  res.end( JSON.stringify(docs ) ); }
              }
          });
      };
  
  
      var getInstructorClasses = function (req,res,next) {
          console.log("Getting Classes for a specific instructor");
          dbQuery = {};
          if (req.query.id && req.query.id != 0)
          {
              dbQuery = {'instructors.user_id': req.query.id };
             
          }
      
          res.setHeader('Access-Control-Allow-Origin', ORIGIN_BASEPATH);
              res.setHeader('Access-Control-Allow-Methods', "POST, GET, PUT, UPDATE, DELETE, OPTIONS");
              res.setHeader("Access-Control-Allow-Headers", 
              "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
              db.collection('classes').find(dbQuery).toArray(function(err,docs) {
                  if(err) { handleError(res,err.message, "Failed to get" + resource); }
                  else{
                      res.writeHead(200, {"Content-Type": "application/json"});
                      res.end( JSON.stringify(docs ) );
                      // console.log( JSON.stringify(docs));
                  }
              });
      };
      
      
      var getStudentClasses = function (req,res,next) {
          console.log("Getting Classes for a specific student");
          dbQuery = {};
          if (req.query.id && req.query.id != 0)
          {
              dbQuery = {'students.user_id': req.query.id };
             
          }
      
          res.setHeader('Access-Control-Allow-Origin', ORIGIN_BASEPATH);
              res.setHeader('Access-Control-Allow-Methods', "POST, GET, PUT, UPDATE, DELETE, OPTIONS");
              res.setHeader("Access-Control-Allow-Headers", 
              "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
              db.collection('classes').find(dbQuery).toArray(function(err,docs) {
                  if(err) { handleError(res,err.message, "Failed to get" + resource); }
                  else{
                      res.writeHead(200, {"Content-Type": "application/json"});
                      res.end( JSON.stringify(docs ) );
                      // console.log( JSON.stringify(docs));
                  }
              });
      };
  



app.options('/api/doc', function(req, res, next){
    returnSuccess( req, res, next ); });
app.options('/api/docimages', function(req, res, next){
returnSuccess( req, res, next );
});
app.options('/api/book', function(req, res, next){
                returnSuccess( req, res, next ); });
app.options('/api/bookimages', function(req, res, next){
    returnSuccess( req, res, next );
});
                
app.options('/courseimages', function(req, res, next){
    returnSuccess( req, res, next ); });

app.options('/api/studentClasses', function(req, res, next){
    returnSuccess( req, res, next ); });

app.options('/api/instructorClasses', function(req, res, next){
        returnSuccess( req, res, next ); });

app.options('/api/finduser', function(req, res, next){
    returnSuccess( req, res, next ); });

app.options('/api/users', function(req, res, next){
    returnSuccess( req, res, next ); });

app.options('/api/courses', function(req, res, next){
        returnSuccess( req, res, next ); });

app.options('/api/classes', function(req, res, next){
        returnSuccess( req, res, next ); });

app.options('/api/allmaterialsbytype', function(req, res, next){
            returnSuccess( req, res, next ); });

app.options('/api/series', function(req, res, next){
                returnSuccess( req, res, next ); });

app.options('/api/materials', function(req, res, next){
    returnSuccess( req, res, next ); });
     
app.options('/api/materialimages', function(req, res, next){
    returnSuccess( req, res, next );
});
app.options('/api/materialfiles', function(req, res, next){
    returnSuccess( req, res, next );
});
app.options('/api/docfiles', function(req, res, next){
    returnSuccess( req, res, next );
});
app.options('/api/classregistrations', function(req, res, next){
    returnSuccess( req, res, next );
});
app.options('/api/threads', function(req, res, next){
    returnSuccess( req, res, next ); });

app.options('/api/chats/enter', function(req, res, next){
        returnSuccess( req, res, next ); });

app.options('/api/chats/whosin*', function(req, res, next){
        returnSuccess( req, res, next ); });

app.options('/api/usersettings', function(req, res, next){
    res.header('Access-Control-Allow-Origin',  ORIGIN_BASEPATH );
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,UPDATE,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.sendStatus(200);
  });
app.options('/api/assets', function(req, res, next){
    res.header('Access-Control-Allow-Origin', ORIGIN_BASEPATH );
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,UPDATE,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.sendStatus(200);
  });
app.options('/api/avatar', function(req, res, next){
    res.header('Access-Control-Allow-Origin', ORIGIN_BASEPATH );
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,UPDATE,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.sendStatus(200);
  });

app.options("/*", function(req, res, next){
    res.header('Access-Control-Allow-Origin', ORIGIN_BASEPATH );
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,UPDATE,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.sendStatus(200);
  });

app.put('/api/book', jsonParser, function(req,res,next) { putResource('book', req, res, next);}); 
app.put('/api/doc', jsonParser, function(req,res,next) { putResource('doc', req, res, next);});  
app.put('/api/classes', jsonParser, function(req,res,next) { putResource('classes', req, res, next);});
app.put('/api/courses', jsonParser, function(req,res,next) { putResource('courses', req, res, next);});
app.put('/api/usersettings', jsonParser, function(req,res,next) { putResource('users', req, res, next);});
app.put('/api/materials', jsonParser, function(req,res,next) { putResource('materials', req, res, next);});
app.put('/api/series', jsonParser, function(req,res,next) { putResource('series', req,res,next); });
app.put('/api/threads', jsonParser, function(req,res,next) { putResource('threads', req, res, next);});
app.put('/api/users', jsonParser, function(req,res,next) { putUser( req, res, next);});
app.put('/api/classregistrations', jsonParser, function(req,res,next) { putResource('classregistrations', req, res, next);});

app.put('/api/chats/enter', jsonParser, function(req,res,next) {
    console.log('Got a chatroom entry request');
    chatLogin( req, res, next);});


app.post('/api/authenticate', jsonParser, function(req,res,next) {
    processAuthentication( req, res, next);
});



app.post('/api/assets', function(req, res, next) {
    upload(req,res,function(err){
        console.log(req.file);
        if(err){
             res.json({error_code:1,err_desc:err});
             return;
        }
         res.json({error_code:0,err_desc:null});
    });
});

// Can I restore this?

var storeAvatar = multerS3( {
    s3: s3,
    bucket: 'recloom',
    shouldTransform: true,
    acl: 'public-read-write',
    metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
    gm: {                                 // [Optional]: define graphicsmagick options
        width: 400,                         // doc: http://aheckmann.github.io/gm/docs.html#resize
        height: 400,
        options: '!',
        format: 'jpg'                       // Default: jpg
    },

    key: function(req, file, cb) {
            cb(null, 'avatars/' + req.query.userid + '/' + file.originalname);
          },

 });



// multer.diskStorage({ //multers disk storage settings
//     destination: function (req, file, cb) {
//         let userId = req.query.userid;

//         var destinationDir = UPLOAD_PATH + 'avatars/' + userId;
//         if (!fs.existsSync(destinationDir)) {
//             fs.mkdirSync(destinationDir);
//         }
//         // put the assets in a subfolder of the Users ID #
//         cb(null, destinationDir);
//     },
//     filename: function (req, file, cb) {
//         var datetimestamp = Date.now();
//        cb(null, file.originalname); 
        
       
//     }
// });
var uploadAvatar = multer({ //multer settings
    storage: storeAvatar
}).single('file');


app.post('/api/avatars*', urlencodedParser, function(req,res,next) {
    // cropAvatar(req,res);
    
    
    uploadAvatar(req,res,function(err){
        // console.log("The uploaded file: " + JSON.stringify(req.file ) );
   
        // Let's store the recently updated filename in the db so we can remember it.
       let userId = req.query.userid;
       let filename = req.file.originalname;
       let avatar_URL = AVATAR_PATH + '/' + userId + '/' + filename;
       //let processingPath = './public/avatars/' + userId + '/' + filename;
       //let square = 'png:' + AVATAR_PATH + userId + '/' + 'test.png';

       console.log("JUST SAVED: " + avatar_URL);

    //    gm(processingPath)
    //    .resize(500, 500 + '^')
    //    .gravity('center')
    //    .extent(500, 500)
    //    .write(processingPath, function (err) {
    //        if (err) console.log(err);
    //      if (!err) console.log('done');
    //    });
    //    gm(avatar_URL)
    //    .resize(175, 175 + '^')
    //    .gravity('center')
    //    .extent(175, 175)
    //    .write(square, function (err){
    //     //  if (that.callback && typeof(that.callback) === 'function'){
    //     //    that.callback(err, that.publicPathOfThumb);
    //     //  }
    //    }); 

       // cropAvatar(avatar_URL);
        // db.collection('avatars').update({'id':userId.toString()}, { 'id':userId.toString(), 'filename': req.file.filename}, {upsert:true}, function(err,data) {
        //     if (err) {
        //         console.log("Error saving avatar filename in DB");
        //         res.writeHead(400, { 'Content-Type': 'plain/text' });
        //         res.end(err);
        //     }

       // });

    //    var mau = new MAU(avatar_URL, function(err, newImagePath){
    //     if(err){ res.render('index', { 
    //       status: 'Error uploading' }); 
    //     }
    //     res.render('index', {
    //       status: 'Finished uploading',
    //       newImage: newImagePath
    //     });
    //  });

        if(err){
             res.json({error_code:1,err_desc:err});
             return;
        }
         res.json({error_code:0,err_desc:null});
    });

    
});

var cropAvatar = function (avatar_URL) {
    
    easyimg.info(avatar_URL).then(
        function(file) {
          console.log(file);
        }, function (err) {
          console.log(err);
        }
      );

};

app.post('/api/courseimages', jsonParser, function(req,res,next) {
    uploadCourseImage(req,res,function(err){
       console.log("The uploaded file: " + JSON.stringify( sanitize(req.file) ) );
   
        var dest = sanitize(req.file.destination);

        if(err){
             res.json({error_code:1,err_desc:err});
             return;
        }
         res.json({error_code:0,err_desc:null});
    });
});

app.post('/api/bookimages', jsonParser, function(req,res,next) {
    uploadBookImage(req,res,function(err){
        console.log("The uploaded file: " + JSON.stringify(req.file ) );
   
        var dest = req.file.destination;

        if(err){
            console.log('not able to post image.');
             res.json({error_code:1,err_desc:err});
             return;
        }
         res.json({error_code:0,err_desc:null});
    });
});



var storeMaterialImage = multerS3( {
    s3: s3,
    bucket: 'recloom',
    metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
    acl: 'public-read-write',
    key: function (req, file, cb) {
        // cb(null, Date.now().toString())
        cb(null, 'materialimages/' + req.query.id + '/' + file.originalname); 
    }
});

var uploadMaterialImage = multer({ //multer settings
    storage: storeMaterialImage
}).single('file');



app.post('/api/materialimages', jsonParser, function(req,res,next) {
    uploadMaterialImage(req,res,function(err){
        // console.log("The uploaded file: " + JSON.stringify(req.file.originalname ) );
   
        // var dest = req.file.destination;
        // res.setHeader('Access-Control-Allow-Origin', ORIGIN_BASEPATH );
        // res.setHeader('Access-Control-Allow-Methods', "POST, GET, PUT, UPDATE, DELETE, OPTIONS");
        // res.setHeader("Access-Control-Allow-Headers", 
        // "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
        // res.writeHead(200, { 'Content-Type': 'plain/text' });


        if(err){
            console.log('not able to post image.');
            console.log( JSON.stringify(err));

             res.json({error_code:1,err_desc:err});
             return;
        }
         res.json({error_code:0,err_desc:null});
         //returnSuccess( req, res, next );
    });
});

// ContentType: 'application/pdf',
// ContentDisposition: 'inline'

var storeMaterialFile = multerS3( {
    s3: s3,
    bucket: 'recloom',
    contentType: staticValue('application/pdf'),
    contentDisposition: staticValue('inline'),
    metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname });
      },
    acl: 'public-read-write',
    key: function (req, file, cb) {
        // cb(null, Date.now().toString())
        cb(null, 'materialfiles/' + req.query.id + '/' + file.originalname); 
    }
});

var uploadMaterialFile = multer({ //multer settings
    storage: storeMaterialFile
}).single('file');

app.post('/api/materialfiles', jsonParser, function(req,res,next) {
    uploadMaterialFile(req,res,function(err){

        var dest = req.file.destination;
        console.log('got post request: ' + dest);
        
        
        if(err){
            console.log('suffered error');
             res.json({error_code:1,err_desc:err});
             return;
        }
        res.json({error_code:0,err_desc:null});
       // returnSuccess( req, res, next );
       // returnSuccess();
//         res.json({error_code:0,err_desc:null});
    });
});



app.delete('/api/book', jsonParser, function(req,res,next) { deleteResource('book', req,res,next);});
app.delete('/api/doc', jsonParser, function(req,res,next) { deleteResource('doc', req,res,next);});
app.delete('/api/classes', jsonParser, function(req,res,next) { deleteResource('classes', req,res,next);});
app.delete('/api/courses', jsonParser, function(req,res,next) { deleteResource('courses', req,res,next);});
app.delete('/api/users', jsonParser, function(req,res,next) { deleteResource('users', req,res,next);});
app.delete('/api/materials', jsonParser, function(req,res,next) { deleteResource('materials', req,res,next);});
app.delete('/api/threads', jsonParser, function(req,res,next) { deleteResource('threads', req,res,next);});

var path = require('path');

var distDir = __dirname + "/public/";
var frontDir = __dirname + "/dist/";
app.use(express.static(distDir));
app.use(express.static(frontDir));




// var port = 8000;

// LOCAL PORT
// var port = 3100;
// server.listen(port);
//app.listen(port);
//server.listen(port,() => console.log('PORT :: ' + port));

// LIVE PORT
server.listen(process.env.PORT);


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

// var myServerCallBack = function(req,res) {
//     const  testUser = { username: 'test', password: 'test', firstname: 'test', lastname: 'user' };
//     const { headers, method, url } = req;
//     let body = [];

//     req.on('error', (err) => {
//       console.error(err);
//     }).on('data', (chunk) => {
//       body.push(chunk);
//     }).on('end', () => {
//       body = Buffer.concat(body).toString();
//       // At this point, we have the headers, method, url and body, and can now
//       // do whatever we need to in order to respond to this request.

//         // Cross Origin Headers
//         res.setHeader('Access-Control-Allow-Origin', '*');
//         res.setHeader('Access-Control-Allow-Methods', "POST, GET, PUT, UPDATE, DELETE, OPTIONS");
//         res.setHeader("Access-Control-Allow-Headers", 
//         "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
    
//         //var queryData = url.parse(req.url, true).query;
    
//         console.log("In the server: " + req.method);
    
//         // If the req.method == OPTIONS, then this is just the browser "Preflight".. and not the
//         // actual POST, so let's just return  a status of "OK", so that the browser will allow
//         // my CORS request.  FUCK.
        
//         let crudMethod = req.method.toLowerCase();

//         switch (crudMethod) {
//             case 'options':
//                 res.writeHead(200, {"Content-Type": "application/json"});
//                 res.end();
//                 break;
//             case 'post':
//                  console.log("Calling process_post");
//                 process_post.processPost(body,req,res,db,jwt,certString,sgMail);
//                 break;
//             case 'put':
//                 // console.log("Received Put request.");
//                 processPut(body,req,res,db);
//                 break;
//             case 'get':
//                 processGet(body,req,res);
//                 break;
//             case 'delete':
//                 processDelete(body,req,res);
//                 break;
//             default:
//                 break;
//         }
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

//     });
// };


//var server = http.createServer(myServerCallBack);






//server.listen(port);
//console.log("server listening on port " + port);

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
        
        case 'users':
            db.collection('users').remove({"id": resourceId }, function(err,data){
            if (err) {
                handleError(res,err.message, "Failed to remove user");
                res.writeHead(400,{"Content-Type": "application/json"});
                res.end();
            }
            else{
            
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end();
               
            } 
          });

        default:break;
    }
};



var processReset = function(body,req,res) {
    console.log("About to reset a password.");
    
                    // console.log("request body: "+ body);
    //
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
            });
        }
        break;

        case 'users':
            let user_id_query = splitUrl[3];
        
            if (user_id_query) {
                let splitId = splitUrl[3].split(":");
                let userid = splitId[1];

                db.collection('users').find({"id":userid}).toArray(function(err,docs) {
                    if(err) {
                        handleError(res,err.message, "Failed to get User");
                    }
                    else{
                    
                        res.writeHead(200, {"Content-Type": "application/json"});
                        res.end( JSON.stringify(docs ) );
                        // console.log( JSON.stringify(docs));
                       
                    }
                });
            }
            else
            {
            db.collection('users').find({}).toArray(function(err,docs) {
                if(err) {
                    handleError(res,err.message, "Failed to get users");
                }
                else{
                
                    res.writeHead(200, {"Content-Type": "application/json"});
                    res.end( JSON.stringify(docs ) );
                    // console.log( JSON.stringify(docs));
                   
                }
            });
            }
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

var processAuthentication = function(req, res, next) {
    let userObject = req.body;

    console.log("Processing the Authentication.");
    console.log("userObject: "+ JSON.stringify(userObject));
    var cert = fs.readFileSync('.bsx');
    var certString = cert.toString();
        
    let userPas = userObject.password;
    console.log("userPas: "+ userPas);

    let comparePW = userPas;
    let userJWT = jwt.sign({ password: userPas}, certString );
    let queryObject = { "username":userObject.username};

    // console.log("DB: ");
    // console.log(db);

    let foundUser = db.collection('users').findOne(queryObject, function( err, data ) {
    
                //console.log("MY jwt: "+jwt);
    
                if (err) {
                    console.log("Error looking for user in DB");
                    res.writeHead(400, { 'Content-Type': 'plain/text' });
                    res.end('');
                }
                else{
                    
    
                    if (data)
                    {
                        // We found a user with the right Username - that's great.
                        // Now let's compare the JWT
                        console.log("Data Found: " + JSON.stringify(data) );
    
                        let DBToken = data.token;
                        console.log("DBToken: "+DBToken);
    
                        let decoded = jwt.verify(DBToken, certString);
                        
                        console.log("Decoded: "+JSON.stringify(decoded));
                        console.log("ComparePW: "+ comparePW);
                        console.log("Decoded Password: "+decoded.password);
    
                        if (decoded.password == comparePW)
                        {
                            // success!
                            console.log("success!");
                            // generate a real response to authenticate this user
                            res.header('Access-Control-Allow-Origin',  ORIGIN_BASEPATH );
                            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,UPDATE,DELETE,OPTIONS');
                            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

                            
                            res.writeHead(200, { 'Content-Type': 'plain/text' });
                    
                            //let jwt = { token: 'fake-jwt-token' };
                            //jwt = DBToken;
    
                            // I'm not quite sure why we're return the JWT here...
                            console.log("jwt_response: " + DBToken);
                            //let dbTokenObject = { "token": DBToken };
                            //res.end(JSON.stringify(dbTokenObject) );
                            // why not send the whole user object back? - well, it has to be a STRING
                            res.end( JSON.stringify(data) );
                        }
                        else
                        {
                            console.log("Error looking for user in DB");
                            res.writeHead(400, { 'Content-Type': 'plain/text' });
                            res.end('');  
                        }
                        
    
                    
                    }
                    else
                    {
                        console.log("Error looking for user in DB");
                        res.writeHead(400, { 'Content-Type': 'plain/text' });
                        res.end(''); 
                    }
    
    
                }
            });
        };    

