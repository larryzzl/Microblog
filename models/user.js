var mongodb = require('./db');

function User(user) {
	this.name = user.name;
	this.password = user.password;
};
module.exports = User;

User.prototype.save = function save(callback) {
	// save to mongodb
	var user = {
		name: this.name,
		password: this.password,
	};

	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}

		// read all users
		db.collection('users', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			// add index for name property
			collection.ensureIndex('name', {unique: true});
			// save user
			collection.insert(user, {safe: true}, function(err, user) {
				mongodb.close();
				callback(err, user);
			});
		});
	});
};

User.get = function get(username, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}

		// read all users
		db.collection('users', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			//find username
			collection.findOne({name: username}, function(err, doc) {
				mongodb.close();
				if (doc) {
					var user = new User(doc);
					callback(err, user);
				}
				else {
					callback(err, null);
				}
			});
		});
	});
};