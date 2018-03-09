var repo = function() {

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


    get: function(id) {
        console.log('Getting object ' + id);
        return  the object;
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

