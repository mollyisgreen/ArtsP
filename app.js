
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
var stripe = require("stripe")(process.env.stripePublicKey);


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
	app.use(express.static(path.join(__dirname, 'public')));

});


require('./routes/index.js')(app, passport);
require('./routes/dashboard.js')(app, passport);
require('./routes/guide.js')(app, passport);
require('./passport')(passport);


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.post('/submitSuggestion', db.submitSuggestion);
app.post('/saveEmail', db.saveEmail);
app.post('/uploadguide', db.uploadguide);
app.get('/downloadguide', db.downloadguide);
app.get('/users', user.list);


// STRIPE
app.post('/charge', function(req, res){
	// Set your secret key: remember to change this to your live secret key in production
	// See your keys here https://manage.stripe.com/account
	//stripe.setApiKey(config.stripeSecretKey);
	stripe.setApiKey(process.env.stripeSecretKey);

	// Get the credit card details submitted by the form
	var stripeToken = req.body.stripeToken;
	
	var charge = stripe.charges.create({
	  amount: 500, // amount in cents, again
	  currency: "usd",
	  card: stripeToken,
	  description: "payinguser@example.com"
	}, function(err, charge) {
	  if (err && err.type === 'StripeCardError') {
	    // The card has been declined
	  }
	});

	var twentyMin = 60 * 1000 * 20;
  	res.cookie('remember', 1, { maxAge: twentyMin });

	res.redirect("/purchasedharvard");
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
