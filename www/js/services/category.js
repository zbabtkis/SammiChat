;(function(angular) {
	angular.module('Storage')
		.run(['DB', function(DB) {
		DB.requestDB().then(function(db) {	
			/**db.query(
				db.QUERY,
				"DROP TABLE categories"
			);
			*/
			db.query(
				db.CREATE_TABLE,
				'vocabularies', {
					id: [
						"INTEGER", 
						"NOT NULL", 
						"PRIMARY KEY",
						"AUTOINCREMENT"
					],
					label: [
						"varchar(255)",
					]
			});
		});
	}]);

	angular.module('SammiChat')
		.factory('Vocabulary', ['DB', '$q', function(DB, $q) {
		var Vocabulary = function(options) {
			this.id = null;
			this.label = "";
			angular.extend(this, options);
		}	

		Vocabulary.prototype.isNew = true;

		Vocabulary.prototype.save = function() {
			var _this = this;
		
			DB.requestDB().then(function(db) {
				if(_this.isNew) {
					db.query(db.QUERY,
						"INSERT INTO vocabularies " + 
						"(label) " +
						"VALUES " +
						"('" + _this.label + "')", 
						[], function(tx, results) {
						_this.id = results.insertId;
					}, function(tx, e) { console.log(e);});
				} else { db.query(db.QUERY,
						"UPDATE vocabularies " + 
						"set label=" + _this.label,
						" WHERE id=" + _this.id
					); 
				}
			});
		};

		Vocabylary.prototype.delete = function() {
			var _this = this;

			DB.requestDB().then(function(db) {
				db.query(db.QUERY,
					"DELETE FROM vocabularies " +
					"WHERE id=" + _this.id
				);

				db.query(db.QUERY, "DELETE FROM words" + 
					"WHERE vocabulary=" + _this.id
				);
			});
		};

		Vocabulary.query = function(query) {
			var filter = ""
			  , _this  = this
			  , d      = $q.defer();
		
			DB.requestDB().then(function(db) {
				if(query && query.id) {
					filter = " WHERE id='" + 
						query.id + "'";

					db.query(db.QUERY,
						"SELECT * FROM vocabularies" + 
						filter, [],
						function(tx, results) {
							var buffer = [];

							for(var i = 0; i < results.rows.length; i++) {
								buffer.push(new Vocabulary(results.rows.item(i)));
							}

							d.resolve(buffer);
						},
						function(tx, err) { 
							console.log(err);
						}
					);
				} else {
					db.query(db.QUERY,
						"SELECT * FROM vocabularies",
						[],
						function(tx, results) {
							var buffer = [];

							for(var i = 0; i < results.rows.length; i++) {
								buffer.push(new Vocabulary(results.rows.item(i)));
							}

							d.resolve(buffer);
						}
					);
				}
			});

			return d.promise;
		};

		Vocabulary.queryOne = function() {
			var d = $q.defer();
			Vocabulary.query.apply(Vocabulary, arguments)
				.then(function(data) {
					if(data.length) {
						d.resolve(data[0]);
					} else {
						d.reject();
					}
				});

			return d.promise;
		};

		return Vocabulary;
	}]);

}).call(this, angular);

