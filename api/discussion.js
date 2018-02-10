module.exports = function(jsonParser, server, app, basepath, db) {





var returnSuccess = function( req,res,next) {
  res.setHeader('Access-Control-Allow-Origin', basepath );
  res.setHeader('Access-Control-Allow-Methods', "POST, GET, PUT, UPDATE, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", 
  "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
  res.writeHead(200, { 'Content-Type': 'plain/text' });
  res.end();
};



/*  Discussion Socket Methods
-----------------------------------*/

var io = require('socket.io')(server);
io.sockets.on('connection', function(socket){
 //   console.log('Socket connected');

    socket.on('enter', function( user, classID, sectionNumber ) {
    //  console.log('got a message from the frontend: ' + user.username);
    //  console.log('Class #' + classID);
    //  console.log('Section #' + sectionNumber);
      this.broadcast.emit('userentering', {'user': user, 'classID': classID, 'sectionNumber': sectionNumber });

    });

    socket.on('newthread', function( threadObject ) {
       // console.log('got a new thread from the frontend: ' + JSON.stringify(threadObject));
   
        this.broadcast.emit('newthread', threadObject );
  
      });   

    socket.on('updatethread', function( threadObject) {
        this.broadcast.emit('updatethread',  threadObject );
    });

    socket.on('deletethread', function( threadObject ) {
     //   console.log('A thread was deleted: ' + JSON.stringify(threadObject));
   
        this.broadcast.emit('deletethread', threadObject );
  
      });   
    //   foundDiscussion = findDiscussion(classID, sectionNumber);

    //   if (foundDiscussion) {
    //       foundDiscussion.push(user);
    //   }
    //   if (!discussions[classID][sectionNumber]) {
    //       discussions[classID] = [];
    //     discussion[sectionNumber] = [];}
    //   discussion[classID][sectionNumber].push(user);
    //   socket.broadcast.emit('message', user.username + ' has joined the discussion');
    // });
  
    // socket.on('whosin', function( classID, sectionNumber ) {
    //   if (discussion[classID][sectionNumber]) {
    //     socket.emit('whosinresponse', discussion[classID][sectionNumber] );
    //   }
    // });
});


/*
  ------------------------------------*/


/*  Discussion API Methods
-----------------------------------*/




}