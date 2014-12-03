var express = require('express');
var router = express.Router();

var glob = require('glob');

var sqlite3 = require('sqlite3').verbose();

router.get('/content', function(req, res) {
	var db = new sqlite3.Database( GLOBAL.db );
	
	
	db.serialize(function() {
		var rows = [];
		db.each("SELECT * FROM scene", function(err, row) {
			
			// glob('',{},function( err, files ){
			
				
			// });
			//console.log( row.timestamp );
			rows.push( row );
			
			
			//console.log( row.name + ' ,' + row.nickname + ' ,' + row.location);
		}, function(err, rowcount ){
			res.render( 'index', { scenes: rows } );		
		});
		
	});		
	db.close();
	
	
	
	
});

module.exports = router;
