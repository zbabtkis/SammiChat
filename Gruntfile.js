module.exports = function(grunt) {
	grunt.initConfig({
		uglify: {
			app: {
				files: {
					'www/build/app.js': [
						'www/js/services/DB.js',
						'www/js/app.js',
						'www/js/factories/Vocabulary.js',
						'www/js/factories/Word.js',
						'www/js/services/Speak.js',
						'www/js/directives/directives.js',
						'www/js/controllers/WordCtrl.js',
						'www/js/controllers/VocabularyCtrl.js',
						'www/js/update.js'
					],
					'www/build/deps.js': [
						"www/phonegap-desktop.js",
						"www/components/angular/angular.js",
						"www/components/angular-route/angular-route.js",
						"www/components/angular-ui-router/release/angular-ui-router.js",
						"www/components/angular-animate/angular-animate.js",
						"www/components/ionic/release/js/ionic.js",
						"www/components/ionic/release/js/ionic-angular.js"
					]
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('build', ['uglify']);
};
