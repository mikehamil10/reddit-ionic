angular.module('readdit', [
	'ionic',
	
	'readdit.controllers',
	'readdit.filters',
	'readdit.services'])


.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})


.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider

	// Side Nav State
  .state('app', {
		url: '/app',
		abstract: true,
		templateUrl: 'templates/menu.html',
		controller: 'AppCtrl'
	})
  
	// Subreddit (Post List) State
	.state('app.subreddit', {
    url: '/subreddit/:sub',
    views: {
      'menuContent': {
        templateUrl: 'templates/post-list.html',
        controller: 'SubredditCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/subreddit/frontpage');
});
