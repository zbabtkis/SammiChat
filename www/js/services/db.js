angular.module('Storage', [])
	.service('DB', ['$rootScope', '$window', '$q', function($rootScope, $window, $q) {
	var _db =  null
	  , API = {};

	var _NS          = "SammiApp"
	  , _version     = ""
	  , _description = "SammiApp Data Storage"
	  , _size        = 100000
	  , _readyEvent  = 'deviceready';

	var _updatesComplete = true
	  , _dbReady         = false;

	// Create DB.
	this.initialize = function(migration) {
		document.addEventListener(_readyEvent, function() {
			_db = $window.openDatabase(
				_NS, 
				_version,
				_description,
				_size
			); 

			if(migration) {
				migration.runUpdates();
			}

			_dbready = true;

			if(_updatesComplete) {
				$rootScope.$emit('dbready');
			} else {
				$rootScope.$on('updatesComplete', function() {
					$rootScope.$emit('dbready');
				});
			}
		});
	};

	API.query = function(op) {
		var args  = [].slice.call(arguments, 1)
		  , d     = $q.defer();

		_db.transaction(function(tx) {
			op.apply(API, [tx].concat(args).concat([d]));
		}, d.reject, d.resolve);

		return d.promise;
	};

	API.QUERY = function(tx, query, d) {
		var args = [].slice.call(arguments,1).concat([d.resolve, d.reject]);
		tx.executeSql.apply(tx, args);
	};

	function getEquals(obj, joiner) {
		var fields = Object.keys(values)
		  , eq = fields.map(function(f) { return f + "=" + values[f]; });

		return eq.join(joiner);
	}

	API.INSERT = function(tx, name, values, d) {
		var fields = Object.keys(values).join(',')
		  , vals   = fields.map(function(k) { return values[k]; });

		tx.executeSql("INSERT INTO " 
			+ name
			+ " (" + fields.join(',') + ") "
			+ "VALUES (" +
			+ vals.join(',')
			+ ")"
		, [], d.resolve, d.reject);
	};

	API.SELECT = function(tx, name, fields, where, d) {
		var fields = fields ? fields.join(',') : '*'
		  , where  = where ? " WHERE " + getEquals(where, " AND ") : "";

		tx.executeSql("SELECT " + fields
			+ " FROM " + name + where, [], d.resolve, d.reject);
	};

	API.UPDATE = function(tx, name, values, where, d) {
		var fields = Object.keys(values).join(',')
		  , vals = getEquals(values, " , ")
		  , where  = getEquals(where, " AND ");

		tx.executeSql("UPDATE " 
			+ name
			+ " " + vals + " "
			+ "WHERE" + where 
		, [], d.resolve, d.reject);
	};
		
	API.DELETE = function(tx, name, where, d) {
		tx.executeSql("DELETE FROM " + name 
			+ " WHERE " + getEquals(where, " AND ")
			, [], d.resolve, d.reject);
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
	this.exists = function(early) {
		return !!_dbReady;
	};

	this.UPGRADE = function() {
		_updatesDone = false;	
		return true;
	};

	function upgrade(oldVer, newVer, callback) {
		if(_db.version === oldVer) {
			_db.changeVersion(oldVer, newVer, function() {
				callback(API);
			}, function() {}, function(e) {console.log(e); });

			return true;
		}

		return false;
	}

	this.Migration = function() {
		var migrations = []
		  , versions   = [];

		return {
			migrate: function(version, update) {
				var _this = this;

				versions.push(version);	
				migrations[version] = function() {
					_db.changeVersion(_db.version, version, update, function() {}, _this.fail);
				};
			},

			runUpdates: function() {
				var i = (_db.version === "1.0") ? 0 : _db.version;

				_updatesComplete = false;

				if(_db.version === "") {
					this.success();
				}

				// Remove upgrades that are before current DB version.
				versions = versions.reduce(function(last, ver) { 
						return ver <= i ? last.concat(ver) : last; 
					}, []);

				this.runUpdate();
			},

			version: function() {
				var ind = versions.indexOf(
					Math.min(versions)
				), version = versions[ind];

				versions = versions.slice(ind, 1);

				return version;
			},

			runUpdate: function(update) {
				var version = this.version();

				if(typeof version !== 'undefined') {
					migrations[version](_db)
						.then(this.runUpdate, this.fail);
				} else {
					this.success();
				}
			}, 

			fail: function(e) {
				if(console.error) console.error(e);
			},

			success: function() {
				_updatesComplete = true;
				$rootScope.$broadcast('updatesComplete');
			}
		};
	};
				
	this.requestDB = function() {
		var d = $q.defer();

		if(_dbReady && _updatesComplete) {
			d.resolve(API);
		} else {
			$rootScope.$on('dbready', function() {
				d.resolve(API);
			});
		}

		return d.promise;
	};
}]);

