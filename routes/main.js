var express = require('express');
var router = express.Router();

var sqlite3 = require('sqlite3').verbose();

router.get('/', function(req, res) {
	var db = new sqlite3.cached.Database( GLOBAL.db );
	db.serialize(function() {
		db.each("SELECT * FROM scene", function(err, row) {
			console.log(row.id + ' ,' + row.name + ' ,' + row.nickname + ' ,' + row.location);
		});
	});	
	db.close();
});

module.exports = router;
