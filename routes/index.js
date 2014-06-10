
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

	app.get('/list', function(req, res){
	  res.render('list.html', { title: 'Express' });
	});

	app.get('/show', function(req, res){
	  res.render('show.html', { title: 'Express' });
	});

	app.get('/edit', function(req, res){
	  	res.render('edit.html', { title: 'Express' });
	});

	app.get('/editordashboard', function(req, res){
	  	res.render('editordashboard.html', { 
	  		user : req.user // get the user out of session and pass to template
	  	});
	});

	app.get('/login', function(req, res){
	  res.render('login.html', { title: 'Express' });
	});

/*
	app.get('/signup', function(req, res){
	  res.render('signup.html', { title: 'Express' });
	});

	app.get('/signupAttempt', function(req, res){
	  res.render('signupAttempt.html', { title: 'Express' });
	});

	app.get('/loginAttempt', function(req, res){
	  res.render('loginAttempt.html', { title: 'Express' });
	});

	// process the signup form
	app.post('/signup', 
		passport.authenticate('local-signup', {
		successRedirect : '/editordashboard',
		failureRedirect : '/signup',
		failureFlash: true
	}));
*/

	app.get('/purchasedharvard', function(req, res){
		if (req.cookies.remember) {
	  		res.render('purchasedharvard.html', { title: 'Express' });
		} else {
			res.redirect("/");
		}
	});

	// login
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/editordashboard',
		failureRedirect : '/login',
		failureFlash : true
	}));

	app.get('/logout', function(req, res){
  		req.logout();
  		res.redirect('/');
	});

};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	console.log("asdlkfjasdf");

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}


