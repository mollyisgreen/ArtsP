var dotenv      = require('dotenv');
dotenv.load();
var crypto      = require('crypto');
var bcrypt      = require('bcrypt-nodejs');
var mongoose    = require('mongoose');
//var uristring   = process.env.mongoUriString;
var uristring   = process.env.MONGOLAB_URI;
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
    Artist.find(function(err, artists) {
        if (err)
            res.send(err)

            res.json(artists); // return all todos in JSON format
    });
}


exports.createArtist = function(req, res){
    // create an artist, information comes from AJAX request from Angular
    Artist.create({
        name : req.body.text,
        done : false
    }, function(err, artist) {
        if (err)
            res.send(err);

        // get and return all artists after you create another
        Artist.find(function(err, artists) {
            if (err)
                res.send(err)
            res.json(artists);
        });
    });
}


exports.deleteArtist = function(req, res){
    Artist.remove({
        _id : req.params.artist_id
        }, function(err, artist) {
            if (err)
                res.send(err);

            // get and return all the todos after you create another
            Artist.find(function(err, artists) {
                if (err)
                    res.send(err)
                res.json(artists);
            });
    });
}








