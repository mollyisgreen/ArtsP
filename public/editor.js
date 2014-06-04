
var editor = angular.module('editor', ['ngRoute', 'angularFileUpload'])

.config(function($routeProvider) {
  	$routeProvider
	    .when('/', {
	      controller:'indexController',
	      templateUrl:'show'
	    })
	    .when('/edit', {
	      controller:'mainController',
	      templateUrl:'list'
	    })
	    .when('/edit/:artistId', {
	      controller:'editController',
	      templateUrl:'edit'
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

	$http.get('/show/' + ($routeParams.date || dateMill))
		.success(function(data) {
			$scope.artist = data;
			$scope.releaseDate = ($routeParams.date || dateMill);
			console.log(data);
		})
		.error(function(data) {
			console.log('Error: ' + data);
	});

/*
	// save interview/profile edits
	$scope.nextArtist = function(pageDate) {

		console.log(pageDate);
		var newDate = new Date(pageDate);
		console.log(newDate);

		newDate.setDate(newDate.getDate() - 1);
		console.log(newDate);
		var newDateProper = newDate.toLocaleDateString();
		console.log(newDateProper);
		
		return newDateProper;
	};
*/
})


.controller('mainController', function($scope, $http) {
	$scope.formData = {};

	// when landing on the page, get all artists and show them
	$http.get('/artists')
		.success(function(data) {
			$scope.artists = data;
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

	// save interview/profile edits
	$scope.changeDate = function(id, artist) {
		var index = $scope.artists.indexOf(artist);

		console.log($scope.artists.indexOf(artist));
		
		$http.post('/changeDate/' + id, $scope.artists[index])
			.success(function(data) {
				$scope.artist = data;
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

})

.controller('editController', function($scope, $routeParams, $http, $upload) {
	
	// hide all feature embedding options
	$scope.textfeature = true;
	$scope.embedfeature = true;
	$scope.imagefeature = true;


	$http.get('/artist/' + $routeParams.artistId)
		.success(function(data) {
			$scope.artist = data;
			console.log(data);
		})
		.error(function(data) {
			console.log('Error: ' + data);
	});

	// save interview/profile edits
	$scope.saveChange = function(id, index) {
		$http.post('/saveChange/' + id, $scope.artist[index])
			.success(function(data) {
				$scope.artist = data;
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	// save feature edits
	$scope.saveTextFeature = function(id, index) {
		$http.post('/saveTextFeature/' + id, $scope.artist[index])
			.success(function(data) {
				$scope.artist = data;
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};


	$scope.onFileSelect = function($files) {
		console.log($files[0]);

	    //$files: an array of files selected, each file has name, size, and type.
	    // FOR MULTIPLE FILES
	    // for (var i = 0; i < $files.length; i++) {
	      // var file = $files[i];
	    $scope.upload = $upload.upload({
	        url: 'savePhoto/' + $scope.artist[0]._id, //upload.php script, node.js route, or servlet url
	        // method: 'POST' or 'PUT',
	        // headers: {'header-key': 'header-value'},
	        // withCredentials: true,
	        // data: {myObj: $scope.artist[0].photo},
	        // file: file,
	        file: $files[0], // or list of files: $files for html5 only
	        /* set the file formData name ('Content-Desposition'). Default is 'file' */
	        //fileFormDataName: myFile, //or a list of names for multiple files (html5).
	        /* customize how data is added to formData. See #40#issuecomment-28612000 for sample code */
	        //formDataAppender: function(formData, key, val){}
	      }).progress(function(evt) {
	        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
	      }).success(function(data, status, headers, config) {
	        // file is uploaded successfully
	        console.log(data);
	      });
	      //.error(...)
	      //.then(success, error, progress); 
	      //.xhr(function(xhr){xhr.upload.addEventListener(...)})// access and attach any event listener to XMLHttpRequest.
	    }
  	//};

});
