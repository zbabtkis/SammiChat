module.exports = function(grunt) {
	grunt.initConfig({
		uglify: {
			app: {
				files: {
					'www/build/app.js': [
						'www/js/index.js',
						'www/js/services/speak.js',
						'www/js/services/db.js',
						'www/js/services/word.js',
						'www/js/services/category.js'
					],
					'www/build/deps.js': [
						"www/phonegap.js",
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
