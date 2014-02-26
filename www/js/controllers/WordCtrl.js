/**
 * SammiChat.WordCtrl
 * Manages state of words in a Vocabulary
 *
 * @param $scope Current scope inherited from VocabularyCtrl
 * @param $routeParams Holds information about current app state (category id)
 * @param $rootScope Top level scope accessible across controllers
 * @param Word Word model -- can be persisted, changed and removed
 * @param Speak Service allowing speach through SpeachSynthesis API
 */

;(function(angular) {

	angular.module('SammiChat')
		.controller('WordCtrl', ['$injector', function($injector) {
		var $scope       = $injector.get('$scope')
		  , $routeParams = $injector.get('$routeParams')
		  , $rootScope   = $injector.get('$rootScope')
		  , Word         = $injector.get('Word')
		  , Vocabulary   = $injector.get('Vocabulary')
		  , Speak        = $injector.get('Speak');

		// Load vocab object from vocab ID 
		Vocabulary.queryOne({id:$routeParams.vocabId})
			.then(function(cat) {
				$scope.vocabulary = cat;
			});	

		// New word to be written to -- not saved to DB yet.
		$scope.newWord = new Word();

		// Whether or not a category ID is available
		$scope.noVocabulary = !!$routeParams.vocabId;

		// Default statement text.
		$rootScope.currentStatement = "";

		// Hold all words in vocab.
		$scope.words = [];

		// Get all words for current vocabulary ID
		$scope.load = function() {
			var cat = $scope.category;

			// If a category hasn't been set, we can't load words yet.
			if(!cat) return;

			Word.query({category: cat.id})
				.then(function(words) {
					$scope.words = words; 
				}); 
		};

		// Load all words once category has been loaded
		$scope.$watch('category', $scope.load);

		// Remove all words in this category from DB.
		$scope.clear = function() {
			$scope.words.forEach(function(word) {
				word.delete();
			});
		};

		// Add or update a word in list and DB
		$scope.saveWord = function(word) {
			if(!word.text) return;

			// Get rid of any extra whitespace
			word.text = word.text.trim();

			// if word hasn't been persisted to DB, create new row.
			if(word.isNew) {

				// Word vocab is in current vocab route
				word.category = $scope.category.id;

				// Add word to rendered list
				$scope.words.push(word);
			}

			word.save();

			// Reset new word field and create new word to write to.
			$scope.newWord = new Word();
		};

		$rootScope.say = function(word) {
			Speak.request()
				.then(function(say) {
					say(word);
				});
		};

		/**
		 * Add word to statement string and set it as active.
		 *
		 * @param {WordResource} word
		 */
		$scope.selectWord = function(word) {
			var ind;

			if(!word.active) {
				$rootScope.currentStatement += word.text + ' ';
				$scope.say(word.text);
				word.active = true;
			} else {
				$rootScope.currentStatement = $rootScope.currentStatement
					.replace(word.text + " ", "");
				word.active = false;
			}
		};

		// Read entire statement aloud.
		$scope.readStatement = function() {
			$scope.read($scope.currentStatement);
		};

		// Reset sentence and unmark all selected words. 
		$scope.resetSentence = function() {
			$rootScope.currentStatement = "";
			$scope.words.forEach(function(word) {
				word.active = false;
			});
			$rootScope.$apply();
		};

		/**
		 * Remove word from DB and list
		 *
		 * @param word {WordResource}
		 */
		$scope.deleteWord = function(word) {
			// Find index of array in list of current words.
			var ind = $scope.words.indexOf(word);

			// Removes word from DB.
			word.delete();
			
			// Removes word from list.
			$scope.words.splice(ind, 1);
		};

		// Buttons in list slide interaction
		$scope.itemButtons = [
			{
				text: 'Edit',
				type: 'button-calm',
				onTap: function(word) {
					scope.newWord = angular.copy(word);
					scope.deleteWord(word);
				}
			},
			{
				text: 'Delete',
				type: 'button-assertive',
				onTap: $scope.deleteWord 
			}
		];

		// Allows user to open vocab menu with callback.
		$scope.toggleMenu = function() {
			 $scope.sideMenuController.toggleLeft();
		};
	}]);

}).call(this, angular);

