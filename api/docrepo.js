
var sortBy = require('../node_modules/lodash').sortBy;
var jwt = require('jsonwebtoken');
var fs = require('fs');
var origin = "http://thawing-reaches-29763.herokuapp.com";

var makeid = function() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 5; i++)
      { text += possible.charAt(Math.floor(Math.random() * possible.length)); }
  
    return text;
  }




var docrepo = function() {
    var mongodb = require("mongodb");
    var db = {};
    var db;
    var origin = "http://thawing-reaches-29763.herokuapp.com";
    origin = "*";
    
    var ObjectID = mongodb.ObjectID;
    // this should be set to: process.env.MONGODB_URI
    const MONGODB_URI = 'mongodb://bart:givemedata@ds163360.mlab.com:63360/loomdata';

    mongodb.MongoClient.connect(MONGODB_URI, function (err, database) {

            if (err) {
                console.log(err);
                process.exit(1);
            }
            // Save database object from the callback for reuse.
            db = database;
            console.log("Connected to MLAB");

        });


    var put = function(type, request, response, next, certString) {
        let resourceObject = request.body;
    
        // console.log("Putting resource: "+ resource);
        console.log("Putting object: "+ JSON.stringify( resourceObject ) );
        console.log("Into " + type + " collection.");
        response.setHeader('Access-Control-Allow-Origin', origin );
        response.setHeader('Access-Control-Allow-Methods', "POST, GET, PUT, UPDATE, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", 
        "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
    
        delete resourceObject._id;
    
        if (request.query.id && request.query.id != 0)
        {
            dbQuery = {'id':request.query.id };
            delete resourceObject._id;
            resourceObject.timestamp = Date.now();
    
            try {
            db.collection(type).update( dbQuery, resourceObject, {upsert: true} );
               response.end( JSON.stringify(resourceObject) );
            } catch (e) {
                console.log("Error entering resource into the DB: " + e );
                response.sendStatus(450);
                response.end(e.message);
            } 
        }
        else {

            resourceObject['created_date'] = Date.now();
            //delete resourceObject._id;

            if (type=="users") {
                
                console.log("PUTTING IN A NEW USER!");
                let userPas = resourceObject.password;
                let userJWT = jwt.sign({ password: userPas}, certString );
                resourceObject.token = userJWT;
                resourceObject.verified = 'false';
                
                let verificationID = makeid();
                resourceObject.verificationID = verificationID;
            }
            db.collection(type).insert(resourceObject, function(err,data) {
                if (err) {
                    console.log("Error entering resource into the DB");
    
    
                    response.writeHead(400, { 'Content-Type': 'plain/text' });
                    response.end(err);
                }
                else{
                    // Let's send an email to the new user to welcome them to the Loom!
    
                    // mailer.sendWelcome(resourceObject);
                    console.log('added object to DB: ' + JSON.stringify(data));
                    response.writeHead(200, { 'Content-Type': 'plain/text' });
                    response.end(JSON.stringify(data ) );
                }
              });
           
        }  // close else  
    }; // close put function


    var filter = function(request) {
        var newRequest = {};
        for( var key in request ) {
           
            if (request[key] == "true") { 
                newRequest[key] = true;
            } else {
                if (request[key] == "false") {
                    newRequest[key] = false;
                } else {
                    newRequest[key] = request[key];
                }
            }
        }
        return newRequest;
    } // close filter function

    var get = function( type, request, response ) {
       // console.log('In Doc Repo get method, for type: ' + type);
        if (request.query) {
            request.query = filter(request.query);

            // For announcements - the query will most likely be the class ID - but it could
            // also just be the announcement ID - so we'll need to check
            if (type=='announcements' && request.query && request.query.class_id) {
                // lets convert it to a number
                request.query = { 'class_id': +request.query.class_id };
                console.log('Announcements query: ' + JSON.stringify(request.query));
            }
            // For messages, if the url has more than one ID - then we need to customize the
            // query message so that MONGO will return an object that has both ids
            if (type=='messages'){
                if (request.query && request.query.users) {
                    if (request.query.fresh && request.query.fresh==true) {
                        request.query = {'users':request.query.users, 
                          'freshness': {'user_id':request.query.users,'fresh':true} };
                    } else {
                  //  console.log('user ids were included: ' + request.query.users);
            
                    let userArray = request.query.users.split(',');
                    if (userArray.length > 1) {
                               request.query = {$and : [{'users':userArray[0]}, {'users':userArray[1]} ] }; }
                    }  // close of else
                } // close of if
            } // close of if messages
        
            // Further customizing this API code based on object type - which I'm not a huge fan of
            if (type == 'discussionsettings') {
                if (request.query && request.query.user_id) {
                    request.query = { $and: [{'user_id' : request.query.user_id, 
                    'class_id' : request.query.class_id,
                    'section' : request.query.section }]};
                } else {
                    // get all of them
                    request.query = {};
                }
            }
        console.log('Query = ' + JSON.stringify( request.query ));
    
        db.collection(type).find(request.query).toArray(function(err,docs) {
                  if ( err ) {
                      handleError(err);
                      return null;
                    }
                  else{
                     console.log('Mongo returned: ' + JSON.stringify(docs));

                    // I'm not crazy about putting this code block here - but I want to
                    // sort the data on the server side before sending it back to the client,
                    // and that means I have to have some logic here specific to each type.
                    // var reverseChronology = [];
                    // reverseChronology = sortBy( docs, 'post_date' ).reverse();
                    // docs = reverseChronology;
                    switch(type) {
                        case 'users':
                        var sortedDocs = sortBy( docs, 'username');
                        docs = sortedDocs;
                        break;
                        default: break;
                    }
                    
                    console.log('Returning: ' + JSON.stringify(docs));
                    response.setHeader('Access-Control-Allow-Origin', origin );
                    response.setHeader('Access-Control-Allow-Methods', "POST, GET, PUT, UPDATE, DELETE, OPTIONS");
                    response.setHeader("Access-Control-Allow-Headers", 
                    "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
                    response.writeHead(200, {"Content-Type": "application/json"});
                    response.end( JSON.stringify(docs ) );
                
                    } });  //close of collection

                }// close of if query
            

     } // close of get method
              
     var trash = function (type, request, response, next ) {
        let resourceId = request.query.id;
        
        console.log('Removing ' + type + ', with id of of: ' + resourceId);
         response.setHeader('Access-Control-Allow-Origin', origin );
         response.setHeader('Access-Control-Allow-Methods', "POST, GET, PUT, UPDATE, DELETE, OPTIONS");
         response.setHeader("Access-Control-Allow-Headers", 
         "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");


     
         db.collection(type).remove({"id": resourceId }, function(err,data){
             if (err) {
                 handleError(res,err.message, "Failed to remove resource:" + type + ":" + resourceId);
                 response.writeHead(400,{"Content-Type": "application/json"});
                 response.end();
             }
             else{
                 console.log('Successfully removed ' + type + ' id: ' + resourceId );
                 response.writeHead(200, { 'Content-Type': 'plain/text' });
                 response.end();
                
             } 
           });  // close of collection call
           
    } // close of trash method

    // var save = function ( object ) {
    //         console.log('Saving object to the db');
    //      }

    var authenticate = function ( jwt, certString, request, response, next ) {
        let userObject = request.body;             
         let userPas = userObject.password;
        console.log("userPas: "+ userPas);
        console.log("Processing the Authentication.");
        console.log("userObject: "+ JSON.stringify(userObject));
     
         let comparePW = userPas;
         let userJWT = jwt.sign({ "password": userPas}, certString );
         let queryObject = { "username":userObject.username};
     
         // console.log("DB: ");
         // console.log(db);
        let foundUser = db.collection('users').findOne(queryObject, function( err, data ) {
    
            //console.log("MY jwt: "+jwt);

            if (err) {
                console.log("Error during authentication");
                response.writeHead(400, { 'Content-Type': 'plain/text' });
                response.end('');
            }
            else{
                

                if (data)
                {
                    // We found a user with the right Username - that's great.
                    // Now let's compare the JWT
                    console.log("Data Found: " + JSON.stringify(data) );

                    let DBToken = data.token;
                    console.log("data.token:" + data.token);
                    console.log("DBToken: " + DBToken);

                    let decoded = jwt.verify(DBToken, certString);
                    
                    console.log("Decoded: "+JSON.stringify(decoded));
                    console.log("ComparePW: "+ comparePW);
                    console.log("Decoded Password: "+decoded.password);

                    if (decoded.password == comparePW)
                    {
                        // success!
                        console.log("success!");
                        // generate a real response to authenticate this user
                        response.header('Access-Control-Allow-Origin',  origin );
                        response.header('Access-Control-Allow-Methods', 'GET,PUT,POST,UPDATE,DELETE,OPTIONS');
                        response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
                        response.writeHead(200, { 'Content-Type': 'plain/text' });
                        response.end( JSON.stringify(data) );
                    }
                    else
                    {
                        console.log('decoded JWT doesn\'t match');
                        response.header('Access-Control-Allow-Origin',  origin );
                        response.header('Access-Control-Allow-Methods', 'GET,PUT,POST,UPDATE,DELETE,OPTIONS');
                        response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

                        response.writeHead(404, { 'Content-Type': 'plain/text' });
                        response.end('no match');  
                    }
                
                }
                else
                {
                    response.header('Access-Control-Allow-Origin',  origin );
                    response.header('Access-Control-Allow-Methods', 'GET,PUT,POST,UPDATE,DELETE,OPTIONS');
                    response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

                    console.log("Error looking for user in DB");
                    response.writeHead(404, { 'Content-Type': 'plain/text' });
                    response.end('no user'); 
                }


            }
        });
    }



    var handleError = function( err ) {
            console.log(err);
        }
        
    /*  Revealing Module Pattern thank you Jon Mills */
    return {
     //   setOrigin: setOrigin,
     //   connect: connect,
        get: get,
        put: put,
        trash: trash,
        authenticate: authenticate
    }



}

module.exports = docrepo();

