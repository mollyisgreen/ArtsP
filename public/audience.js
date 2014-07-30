// today's date in milliseconds
/*
var pageDate = new Date();
var currentMonth = pageDate.getMonth() + 1;
var currentDate = pageDate.getDate();
var currentYear = pageDate.getFullYear();
var todayInMillOld = Date.parse(currentMonth + '/' + currentDate + '/' + currentYear);
*/
var todayInMillOld = Date.parse('8/5/2014');
var todayInMill;

// skip weekends
var dayOfWeek = pageDate.getDay();
if (dayOfWeek == 0) {
	// If Sunday, go back two days worth of milliseconds
	todayInMill = todayInMillOld - 172800000;
} else if (dayOfWeek == 6) {
	// If Saturday, go back one days worth of milliseconds
	todayInMill = todayInMillOld - 86400000;
} else {
	todayInMill = todayInMillOld;
}

/* if not skipping weekends: 
var todayInMill = Date.parse(currentMonth + '/' + currentDate + '/' + currentYear);
*/ 

// first/release date of atom review
var firstPostMill = Date.parse("8/1/2014");


var vimeoWidth = 500;
var vimeoHeight = 281;
var bandcampSize = 281;

var audience = angular.module('audience', ['ngRoute', 'angularFileUpload', 'infinite-scroll',
	'angulartics', 'angulartics.google.analytics', 'angulartics.scroll'])

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
	   	.when('/spaerror', {
	      templateUrl:'spaerror'
	    })
	    .when('/', {
	    	redirectTo: '/show/' + todayInMill,
	      	//controller:'indexController',
	      	//templateUrl:'show'
	    })
	    .otherwise({
	      redirectTo:'/spaerror'
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
			        pageDescription: 'Showcasing one indie artist per day: ' + $scope.artist[0].name,
			        pageCaption: $scope.artist[0].answer
			    };

			    //$scope.bioPhotoPath = "https://atomreview.s3.amazonaws.com/biopic" + $scope.artist[0]._id;
			    
			} else {
				$location.path('/error');
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

			// don't show second question if doesn't exist
			if(!($scope.artist[0].question2)) {
				// safe iframe src link
				document.getElementById('question2').style.display = 'none'; 
			} 

			$scope.releaseDate = $routeParams.date;

			var dateFromMill = new Date(parseInt($scope.releaseDate));
			var dayOfWeekFromMill = dateFromMill.getDay();

			// yesterday
			$scope.next;
			// tomorrow
			$scope.previous


			if (dayOfWeekFromMill==1) {
				// if Monday and trying to go back in time, skip to Friday (or 3 days worth of milliseconds)
				$scope.next = ($scope.releaseDate - 259200000);
				$scope.previous = (parseInt($scope.releaseDate) + 86400000);
			} else if (dayOfWeekFromMill==5) {
				// if Friday and trying to go forward in time, skip to Monday (or 3 days worth of milliseconds)
				$scope.previous = (parseInt($scope.releaseDate) + 259200000);
				$scope.next = ($scope.releaseDate - 86400000);
			} else {
				$scope.next = ($scope.releaseDate - 86400000);
				$scope.previous = (parseInt($scope.releaseDate) + 86400000);
			}


			/* not skipping weekends 
			// yesterday
			$scope.next = ($scope.releaseDate - 86400000);
			// tomorrow
			$scope.previous = (parseInt($scope.releaseDate) + 86400000);
			*/


			// if on today's page, hide button that allows you to go to tomorrow's content
			if($scope.releaseDate == todayInMill)
				document.getElementById('previous').style.display = 'none'; 

			// if on first day's page, hide button that allows you to go further into past
			if($scope.releaseDate == firstPostMill)
				document.getElementById('next').style.display = 'none'; 

		})
		.error(function(data) {
			console.log('Error: ' + data);
	});


})

.directive('addthisToolbox', function() {
    return {
        
        restrict: 'A',
        transclude: true,
        replace: true,
        template: '<div ng-transclude></div>',
        link: function ($scope, element, attrs) {
            // Dynamically init for performance reason
            // Safe for multiple calls, only first call will be processed (loaded css/images, popup injected)
            // http://support.addthis.com/customer/portal/articles/381263-addthis-client-api#configuration-url
            // http://support.addthis.com/customer/portal/articles/381221-optimizing-addthis-performance
            addthis.init();
            // Ajax load (bind events)
            // http://support.addthis.com/customer/portal/articles/381263-addthis-client-api#rendering-js-toolbox
            // http://support.addthis.com/customer/portal/questions/548551-help-on-call-back-using-ajax-i-lose-share-buttons
            addthis.toolbox($(element).get());
        }
    }
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

		var dateFromMill = new Date(parseInt(discoverMillisecond));
		var dayOfWeekFromMill = dateFromMill.getDay();

		if (dayOfWeekFromMill==1) {
			// if Monday and trying to go back in time, skip to Friday (or 3 days worth of milliseconds)
			discoverMillisecond -= 259200000;
		} else {
			 discoverMillisecond -= 86400000;
		}

	    //discoverMillisecond -= 86400000;

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