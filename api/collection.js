class Collection {

    constructor(type, db, basepath) {
      this.type = type;
      this.db = db;
      this.basepath = basepath;
    }
    setHeader(res) {
        res.setHeader('Access-Control-Allow-Origin', this.basepath);
        res.setHeader('Access-Control-Allow-Methods', "POST, GET, PUT, UPDATE, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", 
        "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
    }

    getAll(req,res,next) {
         dbQuery = {};
         this.setHeader(res);
         this.dbGet(req,res,next,dbQuery);
    }
    getObject(id, req, res, next) {
        // get an object with a specific id#
        dbQuery = { 'id' : id};
        this.setHeader(res);
        this.dbGet(req,res,next,dbQuery);
    }

    dbGet(req,res,next, dbQuery) {
        this.db.collection(this.type).find(dbQuery).toArray(function(err,docs) {
            if(err) { handleError(res,err.message, "Failed to get" + this.type); }
            else{
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end( JSON.stringify(docs ) );
            }
        });
    }
    
    putObject(req,res,next) {
        // put my putting code here
    }

    options(req,res,next) {
        this.returnSuccess( req,res,next ); }
    
    returnSuccess( req,res,next) {
        this.setHeader(res);
            res.writeHead(200, { 'Content-Type': 'plain/text' });
            res.end();
        };
}




module.exports = Collection;

