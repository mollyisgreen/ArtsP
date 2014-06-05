
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

.controller('indexController', function($scope, $routeParams, $http) {

	// today's date in milliseconds
	var pageDate = new Date();
	var currentMonth = pageDate.getMonth() + 1;
	var currentDate = pageDate.getDate();
	var currentYear = pageDate.getFullYear();
	var dateMill = Date.parse(currentMonth + '/' + currentDate + '/' + currentYear);

	// if index, redirect to new url w milliseconds

	$http.get('/show/' + ($routeParams.date || dateMill))
		.success(function(data) {
			console.log("isthiswhatwhat");
			console.log($routeParams.date);
			$scope.artist = data;
			$scope.releaseDate = ($routeParams.date || dateMill);
			console.log($scope.releaseDate);
			
			// yesterday
			$scope.next = ($scope.releaseDate - 86400000);
			// tomorrow
			$scope.previous = (parseInt($scope.releaseDate) + 86400000);

			console.log(data);
		})
		.error(function(data) {
			console.log('Error: ' + data);
	});

});