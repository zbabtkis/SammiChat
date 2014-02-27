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
			}, function() {}, function(e) { console.log(e); });
		});
	}]);

	angular.module('SammiChat')
		.factory('Vocabulary', ['DB', '$q', function(DB, $q) {
		var Vocabulary = function(options) {
			this.id = null;
			this.label = "";
			this.isNew = true;
			angular.extend(this, options);
		}	

		Vocabulary.prototype.save = function() {
			var entry = { label: this.label }
			  , _this = this;
		
			DB.requestDB().then(function(db) {
				var q = _this.isNew 
					? db.query(db.INSERT, 'vocabularies', entry) 
					: db.query(db.UPDATE, 'vocabularies', entry, {id: _this.id});

				function onSuccess(tx, results) {
					_this.id = results.insertId;
				}

				function onError(e) {
					console.log(e);
				}

				q.then(onSuccess, onError);
			});
		};

		Vocabulary.prototype.delete = function() {
			var _this = this;

			DB.requestDB().then(function(db) {
				var qs = [
					db.query(db.DELETE, "vocabularies", {id: _this.id}),
					db.query(db.DELETE, 'words', {vocabulary: _this.id})
				];

				function onError(e) {
					console.log(e);
				}

				function onSuccess(tx, results) {
					// Can do stuff with results here later.
				}

				$.all(qs).then(onError, onSuccess);
			});
		};

		Vocabulary.query = function(query) {
			var filter = ""
			  , _this  = this
			  , d      = $q.defer();
		
			DB.requestDB().then(function(db) {
				var q = query && query.id
					? db.query(db.SELECT, 'vocabularies', null, {id: query.id})
					: db.query(db.SELECT, 'vocabularies');

				function onSuccess(tx, results) {
					var buffer = [];

					for(var i = 0; i < results.rows.length; i++) {
						buffer.push(new Vocabulary(results.rows.item(i)));
					}

					d.resolve(buffer);
				}

				function onError(err) {
					if(console.error) console.error(err);
				}

				q.then(onSuccess, onError);
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

