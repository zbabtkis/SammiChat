app.service('Speak', function($rootScope) {
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
			var _this = this;

			return new Promise(function(resolve) {
				if(_this._isLoaded) {
					resolve(_this._say);	
				} else {
					$rootScope.$on('ttsLoaded', resolve);
				}
			});
		}
	};
});
