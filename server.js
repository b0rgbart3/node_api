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
    
            if (req.url.endsWith('/api/authenticate') ) {
                // get parameters from post request
                console.log("About to authenticate:\n" + body);
    
                let params = JSON.parse(body);
                console.log("Got authentication Request.");
    
                // Scan the db for this user (?)

                let foundUser = db.collection('users').findOne(params, function( err, data ) {

                    if (err) {
                        console.log("Error looking for user in DB");
                        res.writeHead(200, { 'Content-Type': 'plain/text' });
                        res.end('');
                    }
                    else{
                        console.log("Found USER: " + data);

                        // generate a real response to authenticate this user
                        res.writeHead(200, { 'Content-Type': 'plain/text' });

                        let jwt = { token: 'fake-jwt-token' };
                        jwt = JSON.stringify(jwt);

                        console.log("jwt_response: " + jwt);
                        res.end(jwt);

        

                    }
                });
                
            }
    
           else {
            console.log("GOt post: " );
            //postMyData(req,res);
            processForm(req,res, body);
            return;
           }
    
    
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

    });

});



function processForm(req, res, body) {

    console.log("processing the form" + body);
    
    let userObject = JSON.parse(body);
    


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

