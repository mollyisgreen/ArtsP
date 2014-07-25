var vimeoWidth = 444;
var vimeoHeight = 250;
var bandcampSize = 250;


var editor = angular.module('editor', ['ngRoute', 'angularFileUpload'])

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
	    .when('/preview/:artistId', {
	      controller:'editController',
	      templateUrl:'preview'
	    })
	    .otherwise({
	      redirectTo:'/'
    });
})


.controller('mainController', function($scope, $http, $location) {

	$scope.formData = {};

	// when landing on the page, get all artists and show them
	$http.get('/artists')
		.success(function(data) {
			$scope.artists = data;

			// variables for editor pagination, ng-repeat
			$scope.pageSize = 10;
			$scope.currentPage = 0;
			$scope.numberOfPages=function(){
		        return Math.ceil(data.length/$scope.pageSize);                
		    }
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
				$location.path('#/');
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	// save interview/profile edits
	$scope.changeDate = function(id, artist) {
		var index = $scope.artists.indexOf(artist);
		
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

// startFrom filter for ng-repeat, allows pagination
.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
})

.controller('editController', function($scope, $routeParams, $http, $upload, $sce) {
	
	// hide all feature embedding options
	$scope.textfeature = true;
	$scope.embedfeature = true;
	$scope.imagefeature = true;

	$http.get('/artist/' + $routeParams.artistId)
		.success(function(data) {
			$scope.artist = data;
			console.log(data);
			// only relevant feature is visible
			if($scope.artist[0].embedlink) {
				// safe iframe src link
				$scope.iframesrc = $sce.trustAsResourceUrl($scope.artist[0].embedlink);
				//document.getElementById('imagefeatureDisplay').style.display = 'none'; 
				//document.getElementById('textfeatureDisplay').style.display = 'none'; 
			} else if($scope.artist[0].textfeature) {
				//document.getElementById('imagefeatureDisplay').style.display = 'none';  
				//document.getElementById('iframefeatureDisplay').style.display = 'none';
			}
			else {
				$scope.visualFeaturePath = "https://atomreview.s3.amazonaws.com/visualfeature" + $scope.artist[0]._id;
				//document.getElementById('iframefeatureDisplay').style.display = 'none'; 
				//document.getElementById('textfeatureDisplay').style.display = 'none'; 
			}

			// don't show second question if doesn't exist
			if(!($scope.artist[0].question2)) {
				// safe iframe src link
				document.getElementById('question2').style.display = 'none'; 
			} 

			$scope.discoveriframe1 = $sce.trustAsResourceUrl($scope.artist[0].discoverlink1);
			$scope.discoveriframe2 = $sce.trustAsResourceUrl($scope.artist[0].discoverlink2);
			$scope.discoveriframe3 = $sce.trustAsResourceUrl($scope.artist[0].discoverlink3);

			if($scope.artist[0].discoverlink1type=="vimeo"){
				$scope.artist[0].discoverwidth1 = vimeoWidth;
				$scope.artist[0].discoverheight1 = vimeoHeight;
			} else {
				$scope.artist[0].discoverwidth1 = bandcampSize;
				$scope.artist[0].discoverheight1 = bandcampSize;				
			}

			if($scope.artist[0].discoverlink2type=="vimeo"){
				$scope.artist[0].discoverwidth2 = vimeoWidth;
				$scope.artist[0].discoverheight2 = vimeoHeight;
			} else {
				$scope.artist[0].discoverwidth2 = bandcampSize;
				$scope.artist[0].discoverheight2 = bandcampSize;				
			}

			if($scope.artist[0].discoverlink3type=="vimeo"){
				$scope.artist[0].discoverwidth3 = vimeoWidth;
				$scope.artist[0].discoverheight3 = vimeoHeight;
			} else {
				$scope.artist[0].discoverwidth3 = bandcampSize;
				$scope.artist[0].discoverheight3 = bandcampSize;				
			}

			$scope.bioPhotoPath = "https://atomreview.s3.amazonaws.com/biopic" + $scope.artist[0]._id;

		})
		.error(function(data) {
			console.log('Error: ' + data);
	});

	// save interview/profile edits
	$scope.saveChange = function(id, index) {

		$http.post('/saveChange/' + id, $scope.artist[0])
			.success(function(data) {
				$scope.artist = data;
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	// upload artist's bio pic
	$scope.uploadBioPic = function(id) {

		var s3upload = new S3Upload({
				s3_object_name: 'biopic'+id,
			    file_dom_selector: 'biopic',
			    s3_sign_put_url: '/sign_s3',
			    onProgress: function(percent, message) {
			        $('#status').html('Upload progress: ' + percent + '% ' + message);
			    },
			    onFinishS3Put: function(public_url) {
			        $('#status').html('Upload completed. Uploaded to: '+ public_url);
			        $("#avatar_url").val(public_url);
			        $("#preview").html('<img src="'+public_url+'" style="width:300px;" />');
			    },
			    onError: function(status) {
			        console.log(status);
			    }
			});
	};

	// save feature edits
	$scope.saveTextFeature = function(id, index) {
		$http.post('/saveTextFeature/' + id, $scope.artist[0])
			.success(function(data) {
				$scope.artist = data;
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};


	$scope.saveEmbedFeature = function(id, index) {
		$http.post('/saveEmbedFeature/' + id, $scope.artist[0])
			.success(function(data) {
				$scope.artist = data;
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	$scope.uploadVisualFeature = function(id) {

		var s3upload = new S3Upload({
				s3_object_name: 'visualfeature'+id,
			    file_dom_selector: 'visualfeature',
			    s3_sign_put_url: '/sign_s3',
			    onProgress: function(percent, message) {
			        $('#status').html('Upload progress: ' + percent + '% ' + message);
			    },
			    onFinishS3Put: function(public_url) {
			        $('#status').html('Upload completed. Uploaded to: '+ public_url);
			        $("#avatar_url").val(public_url);
			        $("#preview").html('<img src="'+public_url+'" style="width:300px;" />');
			    },
			    onError: function(status) {
			        console.log(status);
			    }
			});

		$http.post('/saveVisualFeature/' + id)
			.success(function(data) {
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};


	$scope.saveDiscoverLinks = function(id, index) {
		$http.post('/saveDiscoverLinks/' + id, $scope.artist[0])
			.success(function(data) {
				$scope.artist = data;
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

});
