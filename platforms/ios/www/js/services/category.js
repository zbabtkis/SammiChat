app.run(['DB', function(DB) {
	DB.requestDB().then(function(db) {	
		/**db.query(
			db.QUERY,
			"DROP TABLE categories"
		);
		*/
		db.query(
			db.CREATE_TABLE,
			'categories', {
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

app.factory('Category', ['DB', '$q', function(DB, $q) {
	var Category = function(options) {
		this.id = null;
		this.label = "";
		angular.extend(this, options);
	}	

	Category.prototype.isNew = true;

	Category.prototype.save = function() {
		var _this = this;
	
		DB.requestDB().then(function(db) {
			if(_this.isNew) {
				db.query(db.QUERY,
					"INSERT INTO categories " + 
					"(label) " +
					"VALUES " +
					"('" + _this.label + "')", 
					[], function(tx, results) {
					_this.id = results.insertId;
				}, function(tx, e) { console.log(e);});
			} else { db.query(db.QUERY,
					"UPDATE categories " + 
					"set label=" + _this.label,
					" WHERE id=" + _this.id
				); 
			}
		});
	};

	Category.prototype.delete = function() {
		var _this = this;

		DB.requestDB().then(function(db) {
			db.query(db.QUERY,
				"DELETE FROM categories " +
				"WHERE id=" + _this.id
			);

			db.query(db.QUERY, "DELETE FROM words" + 
				"WHERE category=" + _this.id
			);
		});
	};

	Category.query = function(query) {
		var filter = ""
		  , _this  = this
		  , d      = $q.defer();
	
		DB.requestDB().then(function(db) {
			if(query && query.id) {
				filter = " WHERE id='" + 
					query.id + "'";

				db.query(db.QUERY,
					"SELECT * FROM categories" + 
					filter, [],
					function(tx, results) {
						var buffer = [];

						for(var i = 0; i < results.rows.length; i++) {
							buffer.push(new Category(results.rows.item(i)));
						}

						d.resolve(buffer);
					},
					function(tx, err) { 
						console.log(err);
					}
				);
			} else {
				db.query(db.QUERY,
					"SELECT * FROM categories",
					[],
					function(tx, results) {
						var buffer = [];

						for(var i = 0; i < results.rows.length; i++) {
							buffer.push(new Category(results.rows.item(i)));
						}

						d.resolve(buffer);
					}
				);
			}
		});

		return d.promise;
	};

	Category.queryOne = function() {
		var d = $q.defer();
		Category.query.apply(Category, arguments)
			.then(function(data) {
				if(data.length) {
					d.resolve(data[0]);
				} else {
					d.reject();
				}
			});

		return d.promise;
	};

	return Category;
}]);
