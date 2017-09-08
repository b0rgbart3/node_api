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
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");

    //var queryData = url.parse(req.url, true).query;

    // POST DATA
    if (req.method.toLowerCase() == 'post') {
        console.log("GOt post");
        processForm(req,res);
        return;

    }
    
    // GET DATA
    if (req.method.toLocaleLowerCase() == 'get') {
        let data = {};
        let responseData;

        switch(req.url)
        {
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



function processForm(req, res) {

        console.log("processing the form");
        
    // Do the Legwork of processing the incoming form - and put it into the form object
    
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields) {

        fields.id = 'ABC123';
       
        console.log('posted fields: \n');
       
        var data = JSON.stringify({fields: fields});
        console.log(data);

        db.collection('users').insertOne(fields, function(err, result) {
            if (err)
                {
                    handleError(res,err.message, "Failed to post user");
                }
                else{
                    console.log("New User Info Posted to Mongo!");
                }
        });


        res.writeHead(200, { 'content-type': 'text/plain' });
               
        res.end(data);

    });

    
}

var port = 3100;
server.listen(port);
console.log("server listening on port " + port);

