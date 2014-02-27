;(function(angular) {

	angular.module('SammiChat')
		.service('updates', ['DB', '$q', function(DB, $q) {
			var updates = new DB.Migration();
			
			updates.migrate(2, function(db) {
				var updates = [
					db.query(db.QUERY, "ALTER TABLE categories" + 
						" RENAME TO vocabularies"),
					db.query(db.QUERY, "ALTER TABLE words" + 
					" RENAME COLUMN category TO vocabulary")
				];

				return $q.all(updates).promise;
			});

			return updates;
		}]);

}).call(this, angular);

