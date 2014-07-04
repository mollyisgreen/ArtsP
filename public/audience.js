// today's date in milliseconds
var pageDate = new Date();
var currentMonth = pageDate.getMonth() + 1;
var currentDate = pageDate.getDate();
var currentYear = pageDate.getFullYear();
var todayInMill = Date.parse(currentMonth + '/' + currentDate + '/' + currentYear);


var audience = angular.module('audience', ['ngRoute', 'angularFileUpload', 
	'angulartics', 'angulartics.google.analytics', 
	'infinite-scroll'])

.config(function($routeProvider, $locationProvider) {
  	$routeProvider
  		.when('/show/:date', {
	      controller:'indexController',
	      templateUrl:'show'
	    })
	    .when('/about', {
	      templateUrl:'about'
	    })
	    .when('/contact', {
	      templateUrl:'contact'
	    })
	    .when('/', {
	    	redirectTo: '/show/' + todayInMill,
	      	//controller:'indexController',
	      	//templateUrl:'show'
	    })
	    .otherwise({
	      redirectTo:'/'
    });

	$locationProvider.hashPrefix('!');
})

.controller('indexController', function($scope, $routeParams, $http, $sce, $location) {

	var firstPostMill = Date.parse("6/25/2014");
	console.log(firstPostMill);
	
	$http.get('/show/' + $routeParams.date)
		.success(function(data) {
			$scope.artist = data;
			console.log(data);

			// if artist doesn't exist, redirect
			if ($scope.artist[0]) {
				// prerender SEO
				$scope.$parent.seo = {
			        pageTitle : $scope.artist[0].name,
			        pageDescription: 'Showcasing the artist of the day: ' + $scope.artist[0].name
			    };
			} else {
				$location.path('/');
			}

			$scope.releaseDate = $routeParams.date;

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

			// only relevant feature is visible
			if($scope.artist[0].embedlink) {
				// safe iframe src link
				$scope.iframesrc = $sce.trustAsResourceUrl($scope.artist[0].embedlink);
				document.getElementById('imagefeature').style.display = 'none'; 
				document.getElementById('textfeature').style.display = 'none'; 
			} else if($scope.artist[0].visualContentPath) {
				document.getElementById('iframefeature').style.display = 'none'; 
				document.getElementById('textfeature').style.display = 'none'; 
			}
			else {
				document.getElementById('iframefeature').style.display = 'none'; 
				document.getElementById('imagefeature').style.display = 'none'; 
			}
		})
		.error(function(data) {
			console.log('Error: ' + data);
	});


})

.controller('discoverController', function($scope, $routeParams, $http, $sce, $location) {

	$scope.images = [1, 2, 3, 4, 5, 6, 7, 8];

	$scope.myPagingFunction = function() {
	    var last = $scope.images[$scope.images.length - 1];
	    for(var i = 1; i <= 8; i++) {
	      $scope.images.push(last + i);
	    }
	};


});