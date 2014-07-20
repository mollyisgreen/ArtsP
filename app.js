
/**
 * Module dependencies.
 */


db = require('./db');
var dotenv = require('dotenv');
dotenv.load();

var flash = require('connect-flash');
var express = require('express');
var crypto = require('crypto');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var https = require('http');
var path = require('path');
var fs = require('fs');
var app = express();
var passport = require('passport');



app.configure(function() {

	// all environments
	app.set('port', process.env.PORT || 3000);
	app.set('views', path.join(__dirname, 'views'));
	app.engine('.html', require('ejs').__express);
	app.set('view engine', 'html');
	
  app.use(require('prerender-node').set('prerenderToken', 'ujBPewAcfG8JKKgBWYfe'));
	app.use(express.cookieParser('secret'));
	app.use(express.favicon());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.logger('dev'));
	app.use(express.json());
	app.use(express.urlencoded());


	// required for passport
	app.use(express.session({ secret: 'passportbaby' })); // session secret
	app.use(flash()); // use connect-flash for flash messages stored in session
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions

	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
  //app.use(express.static(process.cwd() + './public'));


 	// Handle 404
  	app.use(function(req, res) {
    	res.status(400);
     	res.render('error.html', {title: '404: File Not Found'});
  	});
  
  	// Handle 500
  	app.use(function(error, req, res, next) {
    	res.status(500);
     	res.render('error.html', {title:'500: Internal Server Error', error: error});
  	});


});

require('./routes/index.js')(app, passport);
require('./routes/dashboard.js')(app, passport);
require('./passport')(passport);


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


//app.get('/users', user.list);
app.get('/artists', db.getArtists);
app.post('/createArtist', db.createArtist);
// TODO: should pass artist_id to db.deleteArtist but haven't gotten around yet
app.delete('/artists/:artist_id', db.deleteArtist);
app.get('/artist/:artist_id', db.editArtist);
// didn't create db.previewArtist b/c has same functionality as editArtist
app.get('/preview/:artist_id', db.editArtist);
app.get('/show/:date', db.indexArtist);
app.post('/saveChange/:artist_id', db.saveChange);
app.post('/changeDate/:artist_id', db.changeDate);
//app.post('/savePhoto/:artist_id', db.savePhoto);
app.post('/saveVisualFeature/:artist_id', db.saveVisualFeature);
app.post('/saveTextFeature/:artist_id', db.saveTextFeature);
app.post('/saveEmbedFeature/:artist_id', db.saveEmbedFeature);
app.post('/saveDiscoverLinks/:artist_id', db.saveDiscoverLinks);



// amazon s3
var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
var AWS_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;
var S3_BUCKET = process.env.S3_BUCKET


app.get('/sign_s3', function(req, res){

    var object_name = req.query.s3_object_name;
    var mime_type = req.query.s3_object_type;

    var now = new Date();
    var expires = Math.ceil((now.getTime() + 10000)/1000); // 10 seconds from now
    var amz_headers = "x-amz-acl:public-read";

    var put_request = "PUT\n\n"+mime_type+"\n"+expires+"\n"+amz_headers+"\n/"+S3_BUCKET+"/"+object_name;

    var signature = crypto.createHmac('sha1', AWS_SECRET_KEY).update(put_request).digest('base64');
    signature = encodeURIComponent(signature.trim());
    signature = signature.replace('%2B','+');

    var url = 'https://'+S3_BUCKET+'.s3.amazonaws.com/'+object_name;

    var credentials = {
        signed_request: url+"?AWSAccessKeyId="+AWS_ACCESS_KEY+"&Expires="+expires+"&Signature="+signature,
        url: url
    };
    res.write(JSON.stringify(credentials));

    res.end();
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});



