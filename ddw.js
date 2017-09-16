
module.exports = {

    processPost:function(body,req,res,db,jwt,certString) 
    {
        console.log("got a post to the api");
        
                    if (req.url.endsWith('/api/reset') ) {
                        processReset(body,req,res);
        
                    }
                    if (req.url.endsWith('/api/authenticate') ) {
                        // get parameters from post request
                        console.log("About to authenticate:\n" + body);
            
                        let params = JSON.parse(body);
                        let comparePW = params.password;
                        params.password = "";
                        
                        console.log("Params: "+ JSON.stringify(params));
            
                        // Scan the db for this user (?)
        
                        let foundUser = db.collection('users').findOne(params, function( err, data ) {
        
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
                                        let dbTokenObject = { "token": DBToken };
                                        res.end(JSON.stringify(dbTokenObject) );
        
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
            
                   else {
                    console.log("GOt post: " );
                    //postMyData(req,res);
        
                    console.log("Request url: "+ req.url);
        
                    processForm(req,res, body);
                    return;
                   }
    }
   
}