
module.exports = {


    processPost:function(body,req,res,db,jwt,certString,sgMail) 
    {
       console.log("In processPost method:" + req.url);
       switch(req.url)
       {
            case '/api/reset':
                this.processReset(body,req,res);
                break;
            case '/api/authenticate':
                console.log("In the authenticate case.");
                this.processAuthentication(body,req,res,db,jwt,certString);
                break;
            case '/api/users/register':
                console.log("In the register case.");
                console.log("Body: "+ body);
                this.postUserToDB(body,req,res,db, jwt, certString, sgMail);
                break;
            case '/api/users/update':
                console.log("In the register case.");
                console.log("Body: "+ body);
                this.updateUser(body,req,res,db, jwt, certString, sgMail);
                break;
            case '/api/courses/create':
                console.log("Got the add post.");
                this.createCourse(body,req,res,db);
                break;
            case '/api/courses/update':
                console.log("Got the add post.");
                this.updateCourse(body,req,res,db);
                break;
            case '/api/assets/upload':
                console.log("Got the upload post.");
                this.uploadAsset(body,req,res,db);
                break;
           default:
                break;
       }
    },
    makeid: function() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      
        for (var i = 0; i < 5; i++)
          text += possible.charAt(Math.floor(Math.random() * possible.length));
      
        return text;
      },

    createCourse: function(body,req,res,db) {
        let courseObject = JSON.parse(body);
        console.log("In Create Course : Course Object: "+ JSON.stringify(courseObject) ) ;
        console.log("About to post new course");

        db.collection('courses').insert(courseObject, function(err,data) {
            if (err) {
                console.log("Error entering course info into the DB");
                res.writeHead(400, { 'Content-Type': 'plain/text' });
                res.end(err);
            }
            else{
                res.writeHead(200, { 'Content-Type': 'plain/text' });
                res.end(JSON.stringify(data ) );
            }
        });
      
    },

    uploadAsset(body,req,res,db) {
        console.log("About to upload the asset.");
       // console.log(JSON.stringify(body ) );

        var tempPath = req.files.file.path;
        targetPath = path.resolve('./uploads/' + req.files.file.name);
        fs.rename(tempPath, targetPath, function(err) {
            if (err) throw err;
            console.log("Upload completed!");
        });
    },

    updateCourse: function(body,req,res,db) {
        let courseObject = JSON.parse(body);
        console.log("In Update Course Info: Course Object: "+ JSON.stringify(courseObject) ) ;
        console.log("ID of existing course: "+ courseObject.id);
        console.log("stringified Object: " + JSON.stringify(courseObject));

        // Convert sections array to a sections object
        // let sectionsObject = {};
        

        db.collection('courses').update({ "id" : courseObject.id }, {"title":courseObject.title,
        "description":courseObject.description,"id":courseObject.id,"sections":courseObject.sections}, function(err,data) {
            if (err) {
                console.log("Error updating course info into the DB");
                res.writeHead(400, { 'Content-Type': 'plain/text' });
                res.end(err.message);
            }
            else{
                res.writeHead(200, { 'Content-Type': 'plain/text' });
                res.end(JSON.stringify(data ) );
            }
        });
        
    
    },

    updateUser: function(body,req,res,db, jwt,certString, sgMail) {
        let userObject = JSON.parse(body);
        let userPas = userObject.password;
        let userJWT = jwt.sign({ password: userPas}, certString );
        console.log("Just before DB UPDATE POST:");
        console.log( JSON.stringify(userObject) );

        db.collection('users').update({ "id" : userObject.id }, {"username":userObject.username,
        "firstname":userObject.firstname,"lastname":userObject.lastname,"password":userObject.password, "email":userObject.email, "id":userObject.id,
            "token":userObject.token, "user_type":userObject.user_type, "verified":userObject.verified}, function(err,data) {
            if (err) {
                console.log("Error updating course info into the DB");
                res.writeHead(400, { 'Content-Type': 'plain/text' });
                res.end(err.message);
            }
            else{
                res.writeHead(200, { 'Content-Type': 'plain/text' });
                res.end(JSON.stringify(data ) );
            }
        });
    },

    postUserToDB: function(body,req,res,db, jwt,certString, sgMail) {
        let userObject = JSON.parse(body);
        let userPas = userObject.password;
        let userJWT = jwt.sign({ password: userPas}, certString );
        userObject.verified = 'false';

        // For production - we can put this back in to remove the passwords
        //userObject.password = "";
        userObject.token = userJWT;
        let verificationID = this.makeid();
        userObject.verificationID = verificationID;

        //console.log(dbObject);


        db.collection('users').insert(userObject, function( err, data ) {    
            if (err) {
                console.log("Error entering user in DB");
                res.writeHead(400, { 'Content-Type': 'plain/text' });
                res.end(err);
            }
            else{
                console.log("Succeeded in entering user in DB");
              
                let activationLink = "localhost:4200/users/activation";
               
                let htmlString = "Welcome to the Reclaiming Loom.<br><br>Verify your <a href='localhost:4200/verify'>account</a> with this verification code: "+userObject.verificationID;

                const msg= {
                        to: 'bartdority@gmail.com',
                        from: 'thewebsite@reclaimingloom.org',
                        subject: 'Welcome to the Reclaiming Loom',
                        type: 'text/html',
                        text: 'Please click on this link to activate your account: ' + userObject.verificationID,
                        html: htmlString
                    };
    
                sgMail.send(msg, function(err,data) {
                    if (err)
                      console.log("Got an error sending the email.");
                      else
                      console.log("Sent the email.");
                });

                res.writeHead(200, { 'Content-Type': 'plain/text' });
                res.end(JSON.stringify(data ) );
            }
            });
    },


    processAuthentication: function(body, req, res, db, jwt, certString) {

        // let params = JSON.parse(body);
        // let comparePW = params.password;
        let userObject = JSON.parse(body);
        let userPas = userObject.password;
        let comparePW = userPas;
        let userJWT = jwt.sign({ password: userPas}, certString );
        //userObject.token = userJWT;

        //params.password = "";
        
        console.log("Params: "+ JSON.stringify(userObject));

        // Scan the db for this user (?)

        let foundUser = db.collection('users').findOne(userObject, function( err, data ) {

            //console.log("MY jwt: "+jwt);

            if (err) {
                console.log("Error looking for user in DB");
                res.writeHead(400, { 'Content-Type': 'plain/text' });
                res.end('');
            }
            else{
                

                if (data)
                {
                    // We found a user with the right Username - that's great.
                    // Now let's compare the JWT
                    console.log("Data Found: " + JSON.stringify(data) );

                    let DBToken = data.token;
                    console.log("DBToken: "+DBToken);

                    let decoded = jwt.verify(DBToken, certString);
                    
                    console.log("Decoded: "+JSON.stringify(decoded));
                    console.log("ComparePW: "+ comparePW);
                    console.log("Decoded Password: "+decoded.password);

                    if (decoded.password == comparePW)
                    {
                        // success!
                        console.log("success!");
                        // generate a real response to authenticate this user
                        res.writeHead(200, { 'Content-Type': 'plain/text' });
                
                        //let jwt = { token: 'fake-jwt-token' };
                        //jwt = DBToken;

                        // I'm not quite sure why we're return the JWT here...
                        console.log("jwt_response: " + DBToken);
                        //let dbTokenObject = { "token": DBToken };
                        //res.end(JSON.stringify(dbTokenObject) );
                        // why not send the whole user object back? - well, it has to be a STRING
                        res.end( JSON.stringify(data) );
                    }
                    else
                    {
                        console.log("Error looking for user in DB");
                        res.writeHead(400, { 'Content-Type': 'plain/text' });
                        res.end('');  
                    }
                    

                
                }
                else
                {
                    console.log("Error looking for user in DB");
                    res.writeHead(400, { 'Content-Type': 'plain/text' });
                    res.end(''); 
                }


            }
        });
    }    

}

