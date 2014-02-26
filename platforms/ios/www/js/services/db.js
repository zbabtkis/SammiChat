app.service('DB', ['$rootScope', '$window', '$q', function($rootScope, $window, $q) {
	var _db =  null
	  , API = {};

	var _NS          = "SammiApp"
	  , _version     = "1.0"
	  , _description = "SammiApp Data Storage"
	  , _size        = 100000
	  , _readyEvent  = 'deviceready';

	// Create DB.
	this.initialize = function() {
		document.addEventListener(_readyEvent, function() {
			_db = $window.openDatabase(
				_NS, 
				_version,
				_description,
				_size
			); 
			$rootScope.$emit('dbready');
		});
	};

	API.query = function(op) {
		var args  = [].slice.call(arguments, 1)
		  , d     = $q.defer();

		_db.transaction(function(tx) {
			op.apply(API, [tx].concat(args));
		}, d.reject, d.resolve);

		return d.promise;
	};

	API.QUERY = function(tx, query) {
		var args = [].slice.call(arguments,1);
		console.log(args);
		tx.executeSql.apply(tx, args);
	};

	API.CREATE_TABLE = function(tx, name, schema, success, err) {
		var query = []; 

		// Add column for each schema field
		for(var field in schema) {
			if(schema.hasOwnProperty(field)) {
				query.push(
					[field]
						// Append field params to field array.
						.concat(schema[ field ])
						// Build string of field name + params
						.join(' ')
				);	
			}
		}

		tx.executeSql("CREATE TABLE IF NOT EXISTS " + 
			name + 
			" (" + 
			query.join(',') + 
			")"
		, [], success, err);	
	};

	// Check if DB already exists.
	this.exists = function() {
		return !!_db;
	};

	this.requestDB = function() {
		var d = $q.defer();

		if(this.exists()) {
			d.resolve(API);
		} else {
			$rootScope.$on('dbready', function() {
				d.resolve(API);
			});
		}

		return d.promise;
	};
}]);

