var express = require('express');
var router = express.Router();

var glob = require('glob');

var sqlite3 = require('sqlite3').verbose();

router.get('/play/gallery', function(req, res) {
	var db = new sqlite3.Database( GLOBAL.db );
	
	
	db.serialize(function() {
		var rows = [];
		db.each("SELECT * FROM scene ORDER BY id DESC LIMIT ?", [ GLOBAL.maxScenesOnFrontPage ], function(err, row) {
			rows.push( row );		
		}, function(err, rowcount ){
			res.render( 'index', { scenes: rows, host: req.headers.host } );		
		});
		
	});		
	db.close();
	
	
	
	
});

module.exports = router;
