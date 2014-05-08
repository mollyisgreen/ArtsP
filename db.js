var dotenv      = require('dotenv');
dotenv.load();
var crypto      = require('crypto');
var bcrypt      = require('bcrypt-nodejs');
var mongoose    = require('mongoose');
var uristring   = process.env.mongoUriString;
var fs          = require('fs');

mongoose.connect(uristring, function (err, db) {
  console.log ('Succeeded connected to: ' + uristring);
  if (err) {throw err;}
});

var db          = mongoose.connection;


//////////////////////////////////////////////////////////////////////////////////////////

// suggestions
var suggestionSchema = mongoose.Schema({
    content    : String,
    updated_at : Date
}) 
 
var Suggestion = mongoose.model( 'Suggestion', suggestionSchema );


// create a suggestion
exports.submitSuggestion = function(req, res){

    var suggestion = new Suggestion({
        content    : req.body.suggest,
        updated_at : Date.now()   
    });

    suggestion.save(function (err) {
        if (!err) {
            return res.send(suggestion);        
        } else {
            console.log(err);
            return res.send(404, { error: "Suggestion was not saved." });
        }
    });

    return res.send(suggestion);
}


/////////////////////////////////////////////////////////////////////////


// save email
var emailSchema = mongoose.Schema({
    content    : String,
    updated_at : Date
}) 
 
var Email = mongoose.model( 'Email', emailSchema );

exports.saveEmail = function(req, res){
    var email = new Email({
        content    : req.body.EMAIL,
        updated_at : Date.now()   
    });

    email.save(function (err) {
        if (!err) {
            return res.send(email);
        } else {
            console.log(err);
            return res.send(404, { error: "Email was not saved." });
        }
    });

    return res.send(email);
}


////////////////////////  GUIDE EDITING/UPLOADING send    ///////////////


// save email
var guideSchema = mongoose.Schema({
    //TODO: add parts
    guidePath       : String,
    authorEmail : String,
    //author    : String,
    // description  : String,
    // photo: ?,
    // title: String,
    // pages: 
    // price: 
    updated_at : Date
}) 
 
var Guide = mongoose.model( 'Guide', guideSchema );


exports.uploadguide = function(req, res){

    var guide = new Guide({
        // TODO: add parts
        //guidePath    : target_path,
        authorEmail : "ejim@gmail.com",
        updated_at : Date.now()   
    });

    guide.save(function (err) {
        console.log("baby1");
        if (!err) {
            console.log(guide.id);
            // get the temporary location of the file
            var tmp_path = req.files.guide.path;
            // set where the file should actually exists - in this case it is in the "images" directory
            //var target_path = './public/guideuploads/' + req.files.guide.name;
            var target_path = './public/guideuploads/' + guide.id;
            console.log("baby2");
            // move the file from the temporary location to the intended location
            fs.rename(tmp_path, target_path, function(err) {
                if (err) throw err;
                // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
                fs.unlink(tmp_path, function() {
                    if (err) throw err;
                    res.send('File uploaded to: ' + target_path + ' - ' + req.files.guide.size + ' bytes');
                });
            });

            // save guide id to user document
            // save email from session
            db.collection("users").update(
                { "local.email": "ejim@gmail.com" },
                { $push: { guidearray: guide.id } }, 
                function (err, result) {
                    if (err) throw err;
                    console.log("baby3");
                });

            db.collection("guides").update(
                { authorEmail : "ejim@gmail.com" },
                { $set: { guidePath: target_path} }, 
                function (err, result) {
                    if (err) throw err;
                    console.log("baby4;")
                });

            res.redirect('/guide');

            return res.send(guide);
        } else {
            console.log(err);
            return res.send(404, { error: "Guide was not saved." });
        }

    });

}

exports.downloadguide = function(req, res){
    var file = __dirname + '/public/guideuploads/Harvard.pdf';
    res.download(file); // Set disposition and send it.
}


////////////////////////   DASHBOARD RELATED     ////////////////

