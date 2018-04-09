

var repo = function() {
    var mongodb = require("mongodb");
    var db = {};
    var db;

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


    var get = function( req,res,next) {
        dbQuery = req.query;
        res.setHeader('Access-Control-Allow-Origin', ORIGIN_BASEPATH);
              res.setHeader('Access-Control-Allow-Methods', "POST, GET, PUT, UPDATE, DELETE, OPTIONS");
              res.setHeader("Access-Control-Allow-Headers", 
              "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
              db.collection('threads').find(dbQuery).toArray(function(err,docs) {
                  if(err) { handleError(res,err.message, "Failed to get" + resource); }
                  else{
                      res.writeHead(200, {"Content-Type": "application/json"});
          
                      let stringyDocs = JSON.stringify(docs);
          
                      var reverseChronology = [];
                     
                          reverseChronology = sortBy( docs, 'post_date' ).reverse();
                          docs = reverseChronology;
                          res.end( JSON.stringify(docs) );
                    
                  }
              }
        },
    save: function ( object ) {
        console.log('Saving object to the db');
    }

    /*  Revealing Module Pattern thank you Jon Mills */
    return {
        get:get,
        save: save
    }



}

module.exports = repo();

