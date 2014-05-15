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

//////////////////////////////////////////////////////////////////////////////////////////

var Artist = mongoose.model('Artist', {
        name : String
});

exports.getArtists = function(req, res){
    // use mongoose to get all todos in the database
    Artist.find(function(err, todos) {
        if (err)
            res.send(err)

            res.json(todos); // return all todos in JSON format
    });
}



















