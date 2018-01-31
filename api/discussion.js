module.exports = function(server) {



/*  Discussion Socket 
-----------------------------------*/


var io = require('socket.io')(server);
io.sockets.on('connection', function(socket){
    console.log('Socket connected');
  //  socket.emit('discussionsocketevent', { hello: 'world' });  

    socket.on('enter', function( user, classID, sectionNumber ) {
      console.log('got a message from the frontend: ' + user.username);
      console.log('Class #' + classID);
      console.log('Section #' + sectionNumber);
      this.broadcast.emit('userentering', {'user': user, 'classID': classID, 'sectionNumber': sectionNumber });

    });

    socket.on('newthread', function( threadObject ) {
        console.log('got a new thread from the frontend: ' + JSON.stringify(threadObject));
   
        this.broadcast.emit('newthread', {'threadObject': threadObject });
  
      });   

    socket.on('deletethread', function( threadObject ) {
        console.log('A thread was deleted: ' + JSON.stringify(threadObject));
   
        this.broadcast.emit('deletethread', {'threadObject': threadObject });
  
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

}