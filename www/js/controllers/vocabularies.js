;(function(angular) {

	angular.module('SammiChat')
		.controller('vocabularyCtrl', [
			'$scope', 
			'$location', 
			'Vocabulary', 

		function($scope, $location, Vocabulary) {

		// Create new vocabulary to edit (not part of list yet).
		$scope.newVocabulary = new Vocabulary();

		// Holds list of all vocabularies.
		$scope.vocabularies  = [];

		// Load all Categories.
		Vocabulary.query()
			.then(function(data) {
				$scope.vocabularies = data;
			});

		/**
		 * Navigate to vocab word list.
		 *
		 * @param {VocabularyResource} voc
		 */
		$scope.setVocabulary = function(voc) {
			$location.path('/' + voc.id);
		};

		/**
		 * Save vocabulary to list and DB.
		 *
		 * @param {VocabularyResource} voc
		 */
		$scope.saveVocabulary = function(voc) {

			// Trim extra white space around voc name
			voc.label = voc.label.trim();

			// Don't save if if vocabulary is blank
			if(!voc.label) return;

			// Add to vocab rendered list.
			$scope.vocabularies.push(voc);

			// Reset new vocab field.
			$scope.newVocabulary = new Vocabulary();	

			// Persist vocab to DB.
			voc.save();
		};

		/**
		 * Remove vocab from rendered list and DB.
		 *
		 * @param {VocabularyResource} voc
		 */
		$scope.deleteVocabulary = function(voc) {

			// Finds index of this vocabulary in list
			
			var ind = $scope.vocabularies.indexOf(voc);

			// Removes this vocab from rendered list
			$scope.vocabularies.splice(ind, 1);

			// Removes vocab from DB.
			voc.delete();
		};


		/**
		 * Edit vocab term
		 *
		 * @param {VocabularyResource} voc
		 */
		$scope.editVocabulary = function(voc) {

			// use voc as new vocabulary input value
			$scope.newVocabulary = angular.copy(voc);

			// Remove from rendered array and DB.
			$scope.deleteVocabulary(voc);
		};

		// Buttons for vocab list interaction.
		$scope.btns = [
			{
				text: 'Edit',
				type: 'button-calm',
				onTap: $scope.editVocabulary 
			},
			{
				text: 'Delete',
				type: 'button-assertive',
				onTap: $scope.deleteVocabulary 
			}
	  ];

	}]);

}).call(this, angular);
