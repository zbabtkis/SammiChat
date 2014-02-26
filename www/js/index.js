/**
 * SammiApp
 * SammiApp main application logic
 *
 * @author      Zachary Babtkis <zackbabtkis@gmail.com>
 * @license     MIT
 * @date        February 25 2014
 * @build       1.1.2
 */

;(function(angular) {
	var app = angular.module('SammiChat', [
		'storage', 
		'ngRoute', 
		'ionic', 
		'ionic.ui.sideMenu']);

	app.config(['$routeProvider', function($routeProvider) {

		// Set up app routes.
		$routeProvider
			.when('/', {
				templateUrl: 'views/instructions.html',
				controller: 'WordCtrl'
			})
			.when('/:vocabId', {
				templateUrl: 'views/words.html',
				controller: 'WordCtrl'
			})
			.otherwise({
				redirectTo: '/'
			});	
	}]);

	app.run(['$rootScope', 'DB', 'Speak', function($rootScope, DB, Speak) {

		// Create or open DB for Read/Write
		DB.initialize();
		
		// Setup SpeechSynthesis behavior
		Speak.initialize();
	}]);

}).call(this, angular);

