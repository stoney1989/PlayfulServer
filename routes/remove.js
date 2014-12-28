var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');

var rimraf = require('rimraf');

var busboy = require('connect-busboy');
var form = require('reformed');


router.post('/play/gallery/remove', busboy( { limits: { fields: 2, parts: 2, fileSize: 0 } } ), form( { hash:{ required: true }, captcha:{ required: true } } ), function( req, res ){
	
	
	if (req.form.error) {
			//console.log('Form error for field "' + req.form.error.key+ '": '+ req.form.error);			
			return res.status(400).send({'error-codes': 'Form error for field "'+ req.form.error.key + '": '+ req.form.error });
	}
	
	var resp_token = req.form.data.captcha;
	var user_ip    = req.connection.remoteAddress;
	
	GLOBAL.checkCaptcha(resp_token, user_ip,  function(s){
		//console.log( req.form.data.hash );
		var db = new sqlite3.Database( GLOBAL.db );
		db.get("SELECT * FROM scene WHERE removehash = ?", [ req.form.data.hash ], function(err, row) {
			
			if( row !== undefined ){
				
				//delete folder
				rimraf('./public/'+row.location, function(err) {
					if (err) {						
						res.status(400).send({'error-codes': 'Cannot delete Folder!'});
					}else{
						//remove scene from db
						db.run("DELETE FROM scene WHERE id = ?", row.id);					
						res.status(200).send({'error-codes': ''});
					}
					db.close();
					
				});
				
				
			}else{				
				res.status(400).send({'error-codes': 'Scene not Found!'});
			}
			
		});		
		
	}, function(s){		
		return res.status(400).send(s);		
	});	
});

router.get('/play/gallery/remove', function( req, res ){
	if( req.param('hash') !== undefined ){
		var db = new sqlite3.Database( GLOBAL.db );
	// res.status(200).send('Scene  Found!');
							// console.log('found!');

	
		db.serialize(function() {			
			db.get("SELECT * FROM scene WHERE removehash = ?", [ req.param('hash') ], function(err, row) {
				if( row !== undefined ){
					//console.log(row);
					//res.status(200).send('Scene  Found!');
					res.render( 'remove', { scene: row, host: req.headers.host } );	
				}else{
					//console.log('not found');
					res.status(404).send('Scene not Found!');
				}
			});			
		});		
		db.close();
		
		// , function(err, rowcount ){
				// res.render( 'index', { scenes: rows, host: req.headers.host } );
				// return res.render( 'remove', {  } );				
			// }
		
	}else{
		res.status(404).send('Scene not Found!');
	}
	
	
	//return res.status(200).send("got it!");
});





module.exports = router;
