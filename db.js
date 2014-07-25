var dotenv      = require('dotenv');
dotenv.load();
var crypto      = require('crypto');
var bcrypt      = require('bcrypt-nodejs');
var mongoose    = require('mongoose');
var uristring   = process.env.MONGOLAB_URI;
var fs          = require('fs');

mongoose.connect(uristring, function (err, db) {
  console.log ('Succeeded connected to: ' + uristring);
  if (err) {throw err;}
});

var db          = mongoose.connection;

//////////////////////////////////////////////////////////////////////////////////////////

var Artist = mongoose.model('Artist', {
        name        : String,
        city        : String,
        question1    : String,
        question2   : String,
        answer1     : String,
        answer2     : String,
        description : String,
        date        : Date
});


exports.getArtists = function(req, res){
    // use mongoose to get all todos in the database
    Artist.find(function(err, artists) {
        if (err)
            res.send(err)

        res.json(artists); // return all todos in JSON format
    });
}

// find artist for given date
exports.indexArtist = function(req, res){

    // millisecond for date you want to find
    var millConvert = new Date(+req.params.date);
    var searchDate = millConvert.toISOString();

    Artist.find({
        date : searchDate
        }, function(err, artist) {
            if (err)
                res.send(err);
        res.json(artist);
    });
}


exports.createArtist = function(req, res){

    // create an artist, information comes from AJAX request from Angular
    var artist = new Artist({
        name        : req.body.artistname,
        city        : req.body.artistcity,
        question1    : req.body.artistquestion1,
        question2    : req.body.artistquestion2,
        description : req.body.artistdescription,
        answer1      : req.body.artistanswer1,
        answer2      : req.body.artistanswer2,
        date        : req.body.artistdate
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

// go to edit artist page from list
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

    // delete artist from database
    Artist.remove({_id : req.params.artist_id}, 
        function(err, artist) {
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

    db.collection("artists").update(
        { '_id' : mongoose.Types.ObjectId(req.params.artist_id) } ,
        {
            $set: {
                'name'      : req.body.name,
                'city'      : req.body.city,
                'description' : req.body.description,
                'question1'   : req.body.question1,
                'answer1'    : req.body.answer1,
                'question2'   : req.body.question2,
                'answer2'    : req.body.answer2,
                'date'      : new Date(req.body.date),
                'category'  : req.body.category
            }
        },
        function (err, result) {
            if (err) throw err;
        });
}

exports.changeDate = function(req, res){

    db.collection("artists").update(
        { '_id' : mongoose.Types.ObjectId(req.params.artist_id) } ,
        { $set: {
            'date'      : new Date(req.body.date)
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
            $set: { textfeature      : req.body.textfeature },
            $unset: { 
                        embedlink: "",
                        embedheight: "",
                        embedwidth: ""
                    }
        },
        function (err, result) {
            if (err) throw err;
        });
}

exports.saveDiscoverLinks = function(req, res){
    db.collection("artists").update(
        { '_id' : mongoose.Types.ObjectId(req.params.artist_id) } ,
        {
            $set: {
                    discoverlink1      : req.body.discoverlink1,
                    discoverlink1type  : req.body.discoverlink1type,
                    discoverlink1description  : req.body.discoverlink1description,
                    discoverlink2      : req.body.discoverlink2,
                    discoverlink2type  : req.body.discoverlink2type,
                    discoverlink2description  : req.body.discoverlink2description,
                    discoverlink3      : req.body.discoverlink3,
                    discoverlink3type  : req.body.discoverlink3type,
                    discoverlink3description  : req.body.discoverlink3description
            }
        },
        function (err, result) {
            if (err) throw err;
        });
}


exports.saveEmbedFeature = function(req, res){
    db.collection("artists").update(
        { '_id' : mongoose.Types.ObjectId(req.params.artist_id) } ,
        {
            $set: {
                    embedlink      : req.body.embedlink,
                    embedheight    : req.body.embedheight,
                    embedwidth     : req.body.embedwidth
            },
            $unset: { textfeature: "" }
        },
        function (err, result) {
            if (err) throw err;
        });
}


exports.saveVisualFeature = function(req, res){

    db.collection("artists").update(
        { '_id' : mongoose.Types.ObjectId(req.params.artist_id) } ,
        { 
            $unset: { textfeature: "",
                        embedlink: "",
                        embedheight: "",
                        embedwidth: ""
                    }
        },
        function (err, result) {
            if (err) throw err;
        }
    );

}