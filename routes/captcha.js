var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();



//GLOBAL.captchaSessionTime = 1;

GLOBAL.useCaptchaSession = function( resp_token, success, error ){
	console.log('use session');
	var db = new sqlite3.Database( GLOBAL.db );
	db.serialize(function() {
		db.get("SELECT * FROM captcha_session WHERE token = ?", resp_token, function(err, row) {
			if( err === null ){
				var time = new Date().getTime();
				console.log('time:'+row.timestamp);
				if( time - row.timestamp <= GLOBAL.captchaSessionTime ){											
					console.log('captcha used');
					success();
				}else{
					console.log('session timeout');
					error({'error-codes':'Captcha: Session Timeout (Server)'});									
				}		
				db.run("DELETE FROM captcha_session WHERE token = ?", row.token);
				db.close();
			}else{
				//console.log('db error');
				error({'error-codes':'database error'});				
				db.close();
			}
		});
	});
	

}

GLOBAL.checkCaptcha = function( resp_token, user_ip, success, error ){
	//var PUBLIC_KEY  = '6Ld5j_8SAAAAADdyhgzdoSKe6LRR8c75rW5F9RWr';
	var secret = '6Ld5j_8SAAAAAO2v2MEpAXoF2B3_IyUNr-cmAZkR';
	
	var https = require('https');
	
	var url = "https://www.google.com/recaptcha/api/siteverify";
	url += "?secret="+secret;
	url += "&response="+resp_token;
	url += "&remoteip="+user_ip;
	
	//console.log(url);
	
	https.get(url, function(res){
		res.setEncoding('utf8');		
		
		res.on('data', function(d) {
			var data =  JSON.parse(d);			
			
			if( data.success === true){				
				success(data);
			}else{
				data['error-codes'] = 'Captcha: '+data['error-codes']+' (success:false)';
				error(data);
			}			
		});
		
	}).on('error', function(){
		var e = { success: false, 'error-codes': ['Captcha: Connection Error']};
		error(e);
	});	
};

router.route('/play/gallery/captchacheck').get( function( req, res ){
	if( req.param('token') !== undefined  ){
	
		var user_ip    = req.connection.remoteAddress;
	
		GLOBAL.checkCaptcha( req.param('token'), user_ip, function(s){
			var db = new sqlite3.Database( GLOBAL.db );
			db.serialize(function() {
				var stmt = db.prepare("INSERT INTO captcha_session ( token, timestamp ) VALUES (?, ?)");
				stmt.run([ req.param('token'), new Date().getTime() ]).finalize();
			});
			db.close();
			res.status(200).send(s);
		}, function(s){		
			res.status(400).send(s);		
		});	
	}else{
		res.status(400).send({'error-codes':'Error: No Captcha token'});
	}
	
} );

module.exports = router;