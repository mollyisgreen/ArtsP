
// redirect to https
function redirectSec(req, res, next) {
    if (req.headers['x-forwarded-proto'] == 'http') { 
        res.redirect('https://' + req.headers.host + req.path);
    } else {
        return next();
    }
}

module.exports = function(app, passport) {

	// allows http redirection
	app.get('/', redirectSec, function(req, res){
	  res.render('index.html', { title: 'Express' } );
	});

	app.get('/about', function(req, res){
	  res.render('about.html', { title: 'Express' });
	});

	app.get('/questionnaire', function(req, res){
	  res.render('questionnaire.html', { title: 'Express' });
	});

	app.get('/venue', function(req, res){
	  res.render('venue.html', { title: 'Express' });
	});

	app.get('/corporate', function(req, res){
	  res.render('corporate.html', { title: 'Express' });
	});

	app.get('/signupAttempt', function(req, res){
	  res.render('signupAttempt.html', { title: 'Express' });
	});

	app.get('/loginAttempt', function(req, res){
	  res.render('loginAttempt.html', { title: 'Express' });
	});

	app.get('/purchasedharvard', function(req, res){
		if (req.cookies.remember) {
	  		res.render('purchasedharvard.html', { title: 'Express' });
		} else {
			res.redirect("/");
		}
	});

	// process the signup form
	app.post('/signup', 
		passport.authenticate('local-signup', {
		successRedirect : '/dashboard',
		failureRedirect : '/signupAttempt',
		failureFlash: true
	}));

	// login
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/dashboard',
		failureRedirect : '/loginAttempt',
		failureFlash : true
	}));

	app.get('/logout', function(req, res){
  		req.logout();
  		res.redirect('/');
	});

};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}


