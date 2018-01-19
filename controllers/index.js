module.exports.set = function(app, db) {

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
// app.get('/api/material', function(req,res,next) { getResources('materials',req,res,next);});
app.get('/api/materials', function(req,res,next) { getResources('materials', req,res,next);});
app.get('/api/allmaterialsbytype', function(req,res,next) { getAllMaterialsByType(req,res,next);});

app.get('/api/classregistrations', function(req,res,next) { getResources('classregistrations',req,res,next);});
app.get('/api/instructors',  function(req,res,next) { getInstructors(req,res,next);});
app.get('/api/students',  function(req,res,next) { getStudents(req,res,next);});
app.get('/api/threads', function(req,res,next) { getResources('threads',req,res,next);});

app.get('/api/chats/whosin', function(req,res,next) { getWhosIn(req,res,next);});

app.get('/api/avatars*', function(req,res,next) { 
    console.log("About to call get avatars.");
    getResources('avatars',req,res,next);});

// app.get('/courseimages*', function(req,res,next) { 
//         console.log("About to call get resources -- for courseimages.");
//         getCourseImages(req,res,next);});

app.get('/api/classregistrations*', function(req,res,next) { 
           // console.log("About to call get classregistrations.");
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


}