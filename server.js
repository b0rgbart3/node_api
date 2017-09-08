var http = require('http');
var formidable = require("formidable");
var util = require("util");
var url = require('url');


var server = http.createServer(function(req, res) {

    // Cross Origin Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");

    //var queryData = url.parse(req.url, true).query;

    // POST DATA
    if (req.method.toLowerCase() == 'post') {
        processForm(req,res);
        return;
    }
    
    // GET DATA
    if (req.method.toLocaleLowerCase() == 'get') {
        let data = {};
        let responseData;

        switch(req.url)
        {
            case '/users':
                data = { data: { users: ['Bart','James']}};
                responseData = JSON.stringify(data);
                res.end(responseData);
                console.log("get: ", responseData);
                break;

            case '/languages':
                data = {
                    data: {
                        languages: [
                            'English',
                            'Spanish',
                            'German',
                            'Other'
                        ]
                    }
                };
                responseData = JSON.stringify(data);
                res.end(responseData);
                console.log("get: ", responseData);
                break;

            default: 
                console.log("get: got called with no object ref name");
                res.end();
                
                break;
        }


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

