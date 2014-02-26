;(function(angular) {
	angular.module('SammiChat')
		.directive('sentenceReset', function() {
		return {
			restrict: "A",
			link: function(scope, elem, attrs) {
				elem.bind('click', scope.resetSentence);
			}
		};
	});

	angular.module('SammiChat')
		.directive('ngEnter', function () {
		return {
			link: function (scope, elements, attrs) {
				function doAction(evt) {
					if (evt.which === 13) {
						scope.$apply(function() {
							scope.$eval(attrs.ngEnter);
						});
						evt.preventDefault();
					}
				}

				elements.bind('keydown keypress', doAction); 
			}
		};
	});
}).call(this, angular);

