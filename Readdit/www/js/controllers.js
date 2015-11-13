angular.module('readdit.controllers', [])

//-- Side Menu Controller
.controller('AppCtrl', function($ionicHistory, $ionicSideMenuDelegate, $scope, $state, SubredditService) {
	//-- Scope Definition
	$scope.subs = Array();
	$scope.data = {
		searchText: ''
	};

	$scope.loadSub = function() {
		// Store sub name in local variable
		var newSub = $scope.data.searchText;
		$scope.data.searchText = '';

		// Close Side Menu
		$ionicSideMenuDelegate.toggleLeft();
		
		// Clear History and load subreddit page
		$ionicHistory.nextViewOptions({
			historyRoot: true
		});

		// Save sub to local storage
		SubredditService.addSub(newSub)
			.then(function(subs) {
				$scope.subs = subs;
			}, function(err) {
				console.error(err);
			}
		);

		$state.go('app.subreddit', { sub:newSub });
	}

	$scope.deleteSub = function(sub) {
		SubredditService.removeSub(sub)
			.then(function(subs) {
				$scope.subs = subs;
			}, function(err) {
				console.error(err);
			}
		);
	}
	
	//-- Startup
	SubredditService.loadSubs(['FrontPage', 'News', 'Technology', 'Funny', 'Gaming'])
		.then(function(subs) {
			$scope.subs = subs;
		}
	);
})


//-- Subreddit Controller
.controller('SubredditCtrl', function($ionicLoading, $scope, $stateParams, FeedService) {
	var loadFeed = function(showLoadingDialog) {
		if (showLoadingDialog) {
			$ionicLoading.show({
				template: 'Loading...'
			});
		}

		FeedService.load($stateParams.sub)
			.then(function (feed) {
				$scope.items = feed;

				$scope.$broadcast('scroll.refreshComplete');
				
				if (showLoadingDialog) {
					$ionicLoading.hide();
				}
			}, function (err) {
				console.err(err);

				$scope.$broadcast('scroll.refreshComplete');
				
				if (showLoadingDialog) {
					$ionicLoading.hide();
				}
			}
		);
	}

	//-- Scope Definition
	$scope.data = {
		subreddit: $stateParams.sub
	};

	$scope.doRefresh = function() {
		loadFeed();
	}

	$scope.showPost = function(url) {
		// replace 'www' with 'm' in reddit url to show mobile version
		var mUrl = url.replace("www.reddit.com", "m.reddit.com");

		window.open(mUrl, "_blank", "toolbar=yes,location=no");
	}

	//-- Startup
	loadFeed(true);
});
