var JSZip = require("jszip");
var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var path = require('path');


router.get('/play/gallery/download', function( req, res ){
	console.log("want:"+req.param( 'load_scene' ));
	if( req.param('load_scene') !== undefined ){
	
		var db = new sqlite3.Database( GLOBAL.db );
		db.serialize(function() {
			db.get("SELECT * FROM scene WHERE id = ?", req.param('load_scene'), function(err, row) {
				if( err === null ){
							
					var file = path.join( GLOBAL.root, '/public/'+row.location + 'playful.playful' );
					fs.exists( file, function(exists) {
						if(exists){
							fs.stat(file, function(err, stats) {
								if( err === null ){
									fs.open(file, 'r', function(err, fd ){
										var buffer = new Buffer(stats.size);
										fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
											
											//console.log(zip);
											fs.close(fd);
											//console.log(buffer);
											var zip = new JSZip( buffer );
											res.send( ""+zip.generate({type:"base64"}) );
										});
									});
								}
							});						
						}
					});
				}
			});
		});
		
		
	
		//var zip = new JSZip(  );
		//res.send( 200, "load" );
	}
	
});

module.exports = router;