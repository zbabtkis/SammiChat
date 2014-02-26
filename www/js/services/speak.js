angular.module('SammiApp')
	.service('Speak', ['$rootScope', '$q', function($rootScope, $q) {
	return {
		initialize: function() {
			var ttsScript;

			if('SpeechSynthesisUtterance' in window) {
				this._say = function(text) {
					var utterance = new SpeechSynthesisUtterance(text);
					window.speechSynthesis.speak(utterance);	
				};
				this._isLoaded = true;
			} else if(window.device && window.device.platform === 'Android') {
				ttsScript = document.createElement('script');
				ttsScript.src = 'tts.js';
				ttsScript.async = true;
				document.body.appendChild(ttsScript);
				
				ttsScript.onload = function() {
					this._isLoaded = true;
					$rootScope.broadcast('ttsLoaded', window.tts.speak);	
				};
			} else {
				this._isLoaded = true;
			}
		},
		_say: function(text) {},
		_isLoaded: false,
		request: function() {
			var d     = $q.defer();

			if(this._isLoaded) {
				d.resolve(this._say);	
			} else {
				$rootScope.$on('ttsLoaded', d.resolve);
			}

			return d.promise;
		}
	};
}]);
