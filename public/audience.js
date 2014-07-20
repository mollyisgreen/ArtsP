// today's date in milliseconds
var pageDate = new Date();
var currentMonth = pageDate.getMonth() + 1;
var currentDate = pageDate.getDate();
var currentYear = pageDate.getFullYear();
var todayInMill = Date.parse(currentMonth + '/' + currentDate + '/' + currentYear);

// first/release date of atom review
var firstPostMill = Date.parse("6/25/2014");

/*
var vimeoWidth = 444;
var vimeoHeight = 250;
var bandcampSize = 250;
*/

var vimeoWidth = 500;
var vimeoHeight = 281;
var bandcampSize = 281;

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

	$http.get('/show/' + $routeParams.date)
		.success(function(data) {
			$scope.artist = data;

			// if artist doesn't exist, redirect
			if ($scope.artist[0]) {
				// prerender SEO
				$scope.$parent.seo = {
			        pageTitle : $scope.artist[0].name,
			        pageDescription: 'Showcasing the artist of the day: ' + $scope.artist[0].name
			    };

			    $scope.bioPhotoPath = "https://atomreview.s3.amazonaws.com/biopic" + $scope.artist[0]._id;
			    
			} else {
				$location.path('/');
			}


			// only relevant feature is visible
			if($scope.artist[0].embedlink) {
				// safe iframe src link
				$scope.iframesrc = $sce.trustAsResourceUrl($scope.artist[0].embedlink);
				document.getElementById('imagefeature').style.display = 'none'; 
				document.getElementById('textfeature').style.display = 'none'; 
			} else if($scope.artist[0].textfeature) {
				document.getElementById('iframefeature').style.display = 'none';
				document.getElementById('imagefeature').style.display = 'none';  
			}
			else {
				$scope.visualFeaturePath = "https://atomreview.s3.amazonaws.com/visualfeature" + $scope.artist[0]._id;
				document.getElementById('iframefeature').style.display = 'none'; 
				document.getElementById('textfeature').style.display = 'none'; 
			}


			$scope.releaseDate = $routeParams.date;

			// yesterday
			$scope.next = ($scope.releaseDate - 86400000);
			// tomorrow
			$scope.previous = (parseInt($scope.releaseDate) + 86400000);
/*
			// if on today's page, hide button that allows you to go to tomorrow's content
			if($scope.releaseDate == todayInMill)
				document.getElementById('previous').style.display = 'none'; 

			// if on first day's page, hide button that allows you to go further into past
			if($scope.releaseDate == firstPostMill)
				document.getElementById('next').style.display = 'none'; 
*/


		})
		.error(function(data) {
			console.log('Error: ' + data);
	});


})

.controller('discoverController', function($scope, $routeParams, $http, $sce, $location) {

	var discoverMillisecond = todayInMill;
	$scope.endOfList = false;
	$scope.artistList = [];

	$http.get('/show/' + discoverMillisecond)
		.success(function(data) {
			$scope.artist = data;
			$scope.artist[0].discoverlink1 = $sce.trustAsResourceUrl($scope.artist[0].discoverlink1);

			if($scope.artist[0].discoverlink1type=="vimeo"){
				$scope.artist[0].discoverwidth1 = vimeoWidth;
				$scope.artist[0].discoverheight1 = vimeoHeight;
			} else {
				$scope.artist[0].discoverwidth1 = bandcampSize;
				$scope.artist[0].discoverheight1 = bandcampSize;				
			}


			$scope.artist[0].discoverlink2 = $sce.trustAsResourceUrl($scope.artist[0].discoverlink2);

			if($scope.artist[0].discoverlink2type=="vimeo"){
				$scope.artist[0].discoverwidth2 = vimeoWidth;
				$scope.artist[0].discoverheight2 = vimeoHeight;
			} else {
				$scope.artist[0].discoverwidth2 = bandcampSize;
				$scope.artist[0].discoverheight2 = bandcampSize;				
			}

			$scope.artist[0].discoverlink3 = $sce.trustAsResourceUrl($scope.artist[0].discoverlink3);

			if($scope.artist[0].discoverlink3type=="vimeo"){
				$scope.artist[0].discoverwidth3 = vimeoWidth;
				$scope.artist[0].discoverheight3 = vimeoHeight;
			} else {
				$scope.artist[0].discoverwidth3 = bandcampSize;
				$scope.artist[0].discoverheight3 = bandcampSize;				
			}

			$scope.artistList.push($scope.artist[0]);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});

	$scope.myPagingFunction = function() {
	    
	    discoverMillisecond -= 86400000;

	    $http.get('/show/' + discoverMillisecond)
			.success(function(data) {
				$scope.artist = data;
				console.log(data);

				// if artist doesn't exist, stop scrolling
				if ($scope.artist[0]) {
					$scope.artist[0].discoverlink1 = 
					$sce.trustAsResourceUrl($scope.artist[0].discoverlink1);

					if($scope.artist[0].discoverlink1type=="vimeo"){
						$scope.artist[0].discoverwidth1 = vimeoWidth;
						$scope.artist[0].discoverheight1 = vimeoHeight;
					} else {
						$scope.artist[0].discoverwidth1 = bandcampSize;
						$scope.artist[0].discoverheight1 = bandcampSize;				
					}


					$scope.artist[0].discoverlink2 = $sce.trustAsResourceUrl($scope.artist[0].discoverlink2);

					if($scope.artist[0].discoverlink2type=="vimeo"){
						$scope.artist[0].discoverwidth2 = vimeoWidth;
						$scope.artist[0].discoverheight2 = vimeoHeight;
					} else {
						$scope.artist[0].discoverwidth2 = bandcampSize;
						$scope.artist[0].discoverheight2 = bandcampSize;				
					}


					$scope.artist[0].discoverlink3 = $sce.trustAsResourceUrl($scope.artist[0].discoverlink3);

					if($scope.artist[0].discoverlink3type=="vimeo"){
						$scope.artist[0].discoverwidth3 = vimeoWidth;
						$scope.artist[0].discoverheight3 = vimeoHeight;
					} else {
						$scope.artist[0].discoverwidth3 = bandcampSize;
						$scope.artist[0].discoverheight3 = bandcampSize;				
					}

					$scope.artistList.push($scope.artist[0]);
			    } else {
					$scope.endOfList = true;
				}
			})
			.error(function(data) {
				console.log('Error: ' + data);
				$scope.endOfList = true;
		});

	};


});