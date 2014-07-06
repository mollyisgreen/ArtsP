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

var Artist = mongoose.model('Artist', {
        name        : String,
        city        : String,
        question    : String,
        description : String,
        answer      : String,
        photoPath   : String,
        feature     : String,
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
        question    : req.body.artistquestion,
        description : req.body.artistdescription,
        answer      : req.body.artistanswer,
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

    var photoPath;

    // find public folders path of artists folder
    db.collection("artists").findOne(
        { '_id' : mongoose.Types.ObjectId(req.params.artist_id) } ,
        { 'photoPath': 1 },
        function (err, result) {
            if (err) throw err;

            photoPath = './public' + result.photoPath;
            console.log(photoPath);

            // if artist has a photo, delete photo from public folder
            if(result.photoPath){
                fs.unlink(photoPath, function (err) {
                    if (err) res.send(err);
                    console.log('successfully deleted artist photo');
                });
            }

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
    );

}


exports.saveChange = function(req, res){

    db.collection("artists").update(
        { '_id' : mongoose.Types.ObjectId(req.params.artist_id) } ,
        {
            $set: {
                'name'      : req.body.name,
                'city'      : req.body.city,
                'description' : req.body.description,
                'question'   : req.body.question,
                'answer'    : req.body.answer,
                'date'      : new Date(req.body.date)
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
                    discoverlink2      : req.body.discoverlink2,
                    discoverlink2type  : req.body.discoverlink2type,
                    discoverlink3      : req.body.discoverlink3,
                    discoverlink3type  : req.body.discoverlink3type
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
        // is req.files sufficient? should i go deeper into that?
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


/*
exports.savePhoto = function(req, res){

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
*/
