
/**
 * Module dependencies.
 */


db = require('./db');
var dotenv = require('dotenv');
dotenv.load();

var flash = require('connect-flash');
var express = require('express');
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
	app.use(require('prerender-node').set('prerenderToken', 'ujBPewAcfG8JKKgBWYfe'));
	app.use(express.static(path.join(__dirname, 'public')));

 	// Handle 404
  	app.use(function(req, res) {
    	res.status(400);
     	res.render('404.html', {title: '404: File Not Found'});
  	});
  
  	// Handle 500
  	app.use(function(error, req, res, next) {
    	res.status(500);
     	res.render('500.html', {title:'500: Internal Server Error', error: error});
  	});

});


require('./routes/index.js')(app, passport);
require('./routes/dashboard.js')(app, passport);
require('./passport')(passport);


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/*
app.post('/submitSuggestion', db.submitSuggestion);
app.post('/saveEmail', db.saveEmail);
app.get('/users', user.list);
*/

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
app.post('/savePhoto/:artist_id', db.savePhoto);
app.post('/saveVisualContent/:artist_id', db.saveVisualContent);
app.post('/saveTextFeature/:artist_id', db.saveTextFeature);
app.post('/saveEmbedFeature/:artist_id', db.saveEmbedFeature);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});



