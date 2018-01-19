module.exports.set = function(app) {

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


}