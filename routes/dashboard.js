module.exports = function(app, passport) {

	app.get('/dashboard', isLoggedIn, function(req, res) {
		res.render('dashboard.html', {
			user : req.user // get the user out of session and pass to template
		});
	});


};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect
	res.redirect('/loginAttempt');
}


