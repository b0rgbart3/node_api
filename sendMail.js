



var sendMail = function(sg, request) {
    sg.API(request, function(error, response) {
    console.log(response.statusCode);
    console.log(response.body);
    console.log(response.headers);
    });
}

var doSomething = function() {
    console.log('The doSomething funciton got called.');
}

module.exports.sendMail = sendMail;
module.exports.doSOmething = doSomething;




