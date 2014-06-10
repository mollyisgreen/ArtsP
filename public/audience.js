
var audience = angular.module('audience', ['ngRoute', 'angularFileUpload'])

.config(function($routeProvider) {
  	$routeProvider
	    .when('/', {
	      controller:'indexController',
	      templateUrl:'show'
	    })
	    .when('/show/:date', {
	      controller:'indexController',
	      templateUrl:'show'
	    })
	    .otherwise({
	      redirectTo:'/'
    });
})

.controller('indexController', function($scope, $routeParams, $http, $sce) {

	// today's date in milliseconds
	var pageDate = new Date();
	var currentMonth = pageDate.getMonth() + 1;
	var currentDate = pageDate.getDate();
	var currentYear = pageDate.getFullYear();
	var todayInMill = Date.parse(currentMonth + '/' + currentDate + '/' + currentYear);

	var firstPostMill = Date.parse("7/1/2014");
	console.log(firstPostMill);

	// if index, redirect to new url w milliseconds

	$http.get('/show/' + ($routeParams.date || todayInMill))
		.success(function(data) {
			console.log("isthiswhatwhat");
			console.log($routeParams.date);
			$scope.artist = data;
			$scope.releaseDate = ($routeParams.date || todayInMill);
			console.log($scope.releaseDate);

			// safe iframe src link
			$scope.iframesrc = $sce.trustAsResourceUrl($scope.artist[0].embedlink);
			
			// yesterday
			$scope.next = ($scope.releaseDate - 86400000);
			// tomorrow
			$scope.previous = (parseInt($scope.releaseDate) + 86400000);

			// if on today's page, hide button that allows you to go to tomorrow's content
			if($scope.releaseDate == todayInMill)
				document.getElementById('previous').style.display = 'none'; 

			// if on first day's page, hide button that allows you to go further into past
			if($scope.releaseDate == firstPostMill)
				document.getElementById('next').style.display = 'none'; 

			console.log(data);
		})
		.error(function(data) {
			console.log('Error: ' + data);
	});

});