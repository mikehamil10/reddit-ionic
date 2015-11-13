angular.module('readdit.services', [])

//-- Module-Level Constants
.constant('Constants', {
	SUB_KEY: 'readdit.subs'
})


.service('FeedService', function ($http, $q) {
	return {
		/**
		* Loads and returns a list of posts from the RSS feed of a given subreddit
		*
		* @param subreddit Name of the subreddit to load
		* @returns {Promise} A promise object
		*/
		load: function (subreddit) {
			var def   = $q.defer(),
				feedUrl = 'https://www.reddit.com/' + ((subreddit === 'frontpage') ? '.rss' : 'r/' + subreddit + '/.rss');

			console.log("loading RSS feed for:", feedUrl);

			$http.jsonp('https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=25&callback=JSON_CALLBACK&q=' + encodeURIComponent(feedUrl))
				.then(function(res) {
					def.resolve(res.data.responseData.feed.entries);
				}, function(err) {
					def.reject(err);
				}
			);

			return def.promise;
		}
	}
})


.service('SubredditService', function($q, Constants, LocalStorage) {
	return {
		/**
		* Loads saved subreddits from local storage (or create default sub list if necessary)
		*
		* @param defaultSubs An array of subreddits to make the defaults if there's not already a list in LocalStorage
		* @returns {Promise} A promise object
		*/
		loadSubs: function(defaultSubs) {
			var def   = $q.defer(),
			savedSubs = LocalStorage.getArray(Constants.SUB_KEY);
			
			if (savedSubs.length < 1) {
				savedSubs = defaultSubs;
				LocalStorage.setArray(Constants.SUB_KEY, savedSubs);
			}

			def.resolve(savedSubs);
			return def.promise;
		},

		/**
		* Adds a new Subreddit to the list of saved subs in LocalStorage.
		*
		* @param subName The name of the new Subreddit to store
		* @returns {Promise} A promise object
		*/
		addSub: function(subName) {
			var def   = $q.defer(),
			savedSubs = LocalStorage.getArray(Constants.SUB_KEY),
			foundSub  = false;

			for (var i = 0; i < savedSubs.length; i++) {
				if (savedSubs[i] === subName) {
					foundSub = true;
					def.reject("The Subreddit '" + subName + "' already exists!");
				}
			}

			if (!foundSub) {
				savedSubs.unshift(subName);
				LocalStorage.setArray(Constants.SUB_KEY, savedSubs);
				def.resolve(savedSubs);
			}

			return def.promise;
		},

		/**
		* Removes a previously saved Subreddit from LocalStorage.
		*
		* @param subName The name of the new Subreddit to remove
		* @returns {Promise} A promise object
		*/
		removeSub: function(subName) {
			var def   = $q.defer(),
			savedSubs = LocalStorage.getArray(Constants.SUB_KEY),
			foundSub  = false;

			for (var i = 0; i < savedSubs.length; i++) {
				if (savedSubs[i] === subName) {
					foundSub = true;
					savedSubs.splice(i, 1);
					LocalStorage.setArray(Constants.SUB_KEY, savedSubs);
					def.resolve(savedSubs);
				}
			}

			if (!foundSub) {
				def.reject("The Subbreddit '" + subName + "' was not found in local storage!");
			}

			return def.promise;
		}
	}
})


.service('LocalStorage', function($window) {
	return {
		get: function(key, defaultValue) {
			return $window.localStorage[key] || defaultValue;
		},

		set: function(key, value) {
			$window.localStorage[key] = value;
		},

		remove: function(key) {
			if (key in $window.localStorage) {
				$window.localStorage.removeItem(key);
			}
		},

		getArray: function(key) {
			if ($window.localStorage[key]) {
				return $window.localStorage[key].split('|');
			}

			return Array();
		},
    
		setArray: function(key, value) {
			var arrayString = '';

			for (var i = 0; i < value.length; i++) {
				arrayString += value[i];

				if (i < value.length - 1) {
					arrayString += '|';
				}
			}

			$window.localStorage[key] = arrayString;
		},
	
		getObject: function(key) {
			return JSON.parse($window.localStorage[key] || '{}');
		},

		vasetObject: function(key, value) {
			$window.localStorage[key] = JSON.stringify(value);
		}
	}
});