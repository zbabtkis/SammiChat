;(function(angular) {

	angular.module('SammiChat')
		.service('DatabaseMigrator', ['$q', 'DB', function($q, DB) {
			var oneToOneDotOne = $q.defer();

			DB.requestDB()
				.then(function(db) {
					db.changeVersion('1.0', '1.1', function() {
						var updates = [
							db.query(db.QUERY, "ALTER TABLE categories" + 
								" RENAME TO vocabularies"),
							db.query(db.QUERY, "ALTER TABLE words" + 
							" RENAME COLUMN category TO vocabulary")
						];

						$q.all(updates)
							.then(function(d) {
								oneToOneDotOne.resolve(db);
							});

					});
				});	

			oneToOneDotOne.then(function(db) {
				// Next upgrade goes here.
				db.updatesComplete();
			});
		}]);

}).call(this, angular);

