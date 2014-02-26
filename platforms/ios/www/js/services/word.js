app.run(['DB', function(DB) {
	DB.requestDB().then(function(db) {	
		/**db.query(
			db.QUERY,
			"DROP TABLE words"
		);*/
		db.query(
			db.CREATE_TABLE,
			'words', {
				id: [
					"INTEGER", 
					"NOT NULL", 
					"PRIMARY KEY",
					"AUTOINCREMENT"
				],
				category: [
					"int",
					"NOT NULL"
				],
				text: [
					"varchar(255)",
				]
		});
	});
}]);

app.factory('Word', ['DB', '$q', function(DB, $q) {
	var Word = function(options) {
		angular.extend(this, options);
	}	

	Word.prototype.isNew = true;

	Word.prototype.save = function() {
		var _this = this;
	
		DB.requestDB().then(function(db) {
			if(_this.isNew) {
				db.query(db.QUERY,
					"INSERT INTO words " + 
					"(category, text) " +
					"VALUES " +
					"('" + 
					[_this.category,_this.text]
						.join("','") + 
					"')", [], function(tx, results) {
					_this.id = results.insertId;
				}, function(tx, e) { console.log(e);});
			} else { db.query(db.QUERY,
					"UPDATE words " + 
					"set category=" + _this.category,
					", text=" + _this.text,
					" WHERE id=" + _this.id
				); 
			}
		});
	};

	Word.prototype.delete = function() {
		var _this = this;

		DB.requestDB().then(function(db) {
			db.query(db.QUERY,
				"DELETE FROM words " +
				"WHERE id=" + _this.id
			);
		});
	};

	Word.query = function(query) {
		var filter = ""
		  , _this  = this
		  , d      = $q.defer();

		DB.requestDB().then(function(db) {
			if(query && query.category) {
				filter = " WHERE category='" + 
					query.category + "'";

				db.query(db.QUERY,
					"SELECT * FROM words" + 
					filter, [],
					function(tx, results) {
						var buffer = [];

						for(var i = 0; i < results.rows.length; i++) {
							buffer.push(new Word(results.rows.item(i)));
						}

						d.resolve(buffer);
					},
					function(tx, err) { 
						console.log(err);
					}
				);
			} else {
				db.query(db.QUERY,
					"SELECT * FROM words",
					[],
					function(tx, results) {
						var buffer = [];

						for(var i = 0; i < results.rows.length; i++) {
							buffer.push(new Word(results.rows.item(i)));
						}

						d.resolve(buffer);
					}
				);
			}
		});

		return d.promise;
	};

	return Word;
}]);
