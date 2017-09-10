var http = require('http');
var formidable = require("formidable");
var util = require("util");
var url = require('url');
var mongodb = require("mongodb");
var bodyParser = require("body-parser");

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


var server = http.createServer(function(req, res) {

    // Cross Origin Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', "POST, GET, PUT, UPDATE, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");

    //var queryData = url.parse(req.url, true).query;

    //console.log("In the server: " + req.method);

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
       console.log("GOt post: " );
       //postMyData(req,res);
       processForm(req,res);
       return;

    }
    
    // GET DATA
    if (req.method.toLocaleLowerCase() == 'get') {
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

   // res.end();

});

function postMyData(req,res) {
    var data = JSON.stringify(req);
    console.log(data);
    db.collection('users').insertOne(data, function(err, result) {
        if (err)
            {
                handleError(res,err.message, "Failed to post user");
            }
            else{
                console.log("New User Info Posted to Mongo: "+result);
            }
    });

}

function processForm(req, res) {

        console.log("processing the form" + req);
    
        
    // Do the Legwork of processing the incoming form - and put it into the form object
    
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields) {
       
        console.log(util.inspect({fields: fields}));

        console.log('posted fields:' + JSON.stringify(fields));
        
        var data = JSON.stringify(util.inspect({fields: fields}));
        console.log(data);
        //console.log('Request: '+req.body);


        db.collection('users').insertOne(fields, function(err, result) {
            if (err)
                {
                    handleError(res,err.message, "Failed to post user");
                }
                else{
                    console.log("New User Info Posted to Mongo!");
                }
        });


        //res.writeHead(200, { 'content-type': 'text/plain' });
               
        //res.end(data);
        res.end();
    });

    
}

var port = 3100;
server.listen(port);
console.log("server listening on port " + port);

