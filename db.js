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
        name        : String,
        city        : String,
        question    : String,
        answer      : String,
        photoPath   : String,
        feature     : String,
        // date : Date,
        date        : String
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

    console.log(req.body.artistdate);
    var dateLong = req.body.artistdate;
    var dateShort = dateLong.substring(0, 10);
    console.log(dateShort);

    // create an artist, information comes from AJAX request from Angular
    var artist = new Artist({
        name        : req.body.artistname,
        city        : req.body.artistcity,
        question    : req.body.artistquestion,
        answer      : req.body.artistanswer,
        feature     : req.body.artistfeature,
        date        : dateShort
    });

    artist.save(function(err, artist) {
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

exports.editArtist = function(req, res){

    Artist.find({
        _id : req.params.artist_id
        }, function(err, artist) {
            if (err)
                res.send(err);
        res.json(artist);
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


exports.saveChange = function(req, res){
    var dateLong = req.body.date;
    var dateShort = dateLong.substring(0, 10);

    db.collection("artists").update(
        { '_id' : mongoose.Types.ObjectId(req.params.artist_id) } ,
        {
            $set: {
                'name'      : req.body.name,
                'city'      : req.body.city,
                'question'   : req.body.question,
                'answer'    : req.body.answer,
                'date'      : dateShort
            }
        },
        function (err, result) {
            if (err) throw err;
        });
}

exports.changeDate = function(req, res){
    console.log(req.body.date);
    var dateLong = req.body.date;
    var dateShort = dateLong.substring(0, 10);
    console.log(dateShort);

    db.collection("artists").update(
        { '_id' : mongoose.Types.ObjectId(req.params.artist_id) } ,
        {
            $set: {
                'date'      : dateShort
            }
        },
        function (err, result) {
            if (err) throw err;
        });
}


exports.saveTextFeature = function(req, res){
    db.collection("artists").update(
        { '_id' : mongoose.Types.ObjectId(req.params.artist_id) } ,
        {
            $set: {
                'feature'      : req.body.feature
            }
        },
        function (err, result) {
            if (err) throw err;
        });
}



exports.savePhoto = function(req, res){
/*
    db.collection("artists").update(
        { '_id' : mongoose.Types.ObjectId(req.params.artist_id) } ,
        // is req.files sufficient? should i go deeper into that?
        { $set: { 'photo' : req.files } },
        function (err, result) {
            if (err) throw err;
        }
    );
*/
    console.log(req.files.file.path);

    // get the temporary location of the file
    var tmp_path = req.files.file.path;
    var target_path = './public/artistphotos/' + req.params.artist_id + '.png';
    var saved_path = '/artistphotos/' + req.params.artist_id + '.png';
    
    // move the file from the temporary location to the intended location
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            if (err) throw err;
            res.send('File uploaded to: ' + target_path + ' - ' + req.files.file.size + ' bytes');
        });
    });

    db.collection("artists").update(
        { '_id' : mongoose.Types.ObjectId(req.params.artist_id) } ,
        // is req.files sufficient? should i go deeper into that?
        { $set: { 'photoPath' : saved_path } },
        function (err, result) {
            if (err) throw err;
        }
    );

}