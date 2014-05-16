// public/core.js
var editor = angular.module('editor', ['ngRoute'])

.config(function($routeProvider) {
  	$routeProvider
	    .when('/', {
	      controller:'mainController',
	      templateUrl:'list'
	    })
	    .when('/edit/:artistId', {
	      controller:'editController',
	      templateUrl:'edit'
	    })
	    .otherwise({
	      redirectTo:'/'
    });
})

.controller('mainController', function($scope, $http) {
	$scope.formData = {};

	// when landing on the page, get all artists and show them
	$http.get('/artists')
		.success(function(data) {
			$scope.artists = data;
			console.log(data);
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});

	// when submitting the add form, send the text to the node API
	$scope.createArtist = function() {
		
		$http.post('/createArtist', $scope.formData)
			.success(function(data) {
				// clear the form so our user is ready to enter another
				$scope.formData = {};
				$scope.artists = data;
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};


	// delete an artist after checking it
	$scope.deleteArtist = function(id) {
		$http.delete('/artists/' + id)
			.success(function(data) {
				$scope.artists = data;
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

})

.controller('editController', function($scope, $http) {

	// edit an artist
	$scope.artist = function(id) {
		$http.get('/artist/' + id)
			.success(function(data) {
				$scope.artists = data;
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

});
