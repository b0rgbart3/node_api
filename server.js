var http = require('http');
var formidable = require("formidable");
var util = require("util");

var server = http.createServer(function(req, res) {

    // Cross Origin Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");

    // POST DATA
    if (req.method.toLowerCase() == 'post') {
        processForm(req,res);
        return;
    }
    
    // GET DATA
    if (req.method.toLocaleLowerCase() == 'get') {
        var data = {
            data: {
                languages: [
                    'English',
                    'Spanish',
                    'German',
                    'Other'
                ]
            }
        };
        var responseData = JSON.stringify(data);
        res.end(responseData);
        console.log("get: ", responseData);
        return;
    };

    res.end();

});

function processForm(req, res) {

    // Do the Legwork of processing the incoming form - and put it into the form object
    
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields) {

        fields.id = 'ABC123';
       
        console.log('posted fields: \n');
       
        var data = JSON.stringify({fields: fields});
        console.log(data);

        res.writeHead(200, { 'content-type': 'text/plain' });
               
        res.end(data);

    });

    
}

var port = 3100;
server.listen(port);
console.log("server listening on port " + port);

