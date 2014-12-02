var util = require('util');
var fs = require('fs');
var mkdirp = require('mkdirp');
var JSZip = require("jszip");

var express = require('express');
var router = express.Router();
var busboy = require('connect-busboy');
var form = require('reformed');

var sqlite3 = require('sqlite3').verbose();

var MAX_SIZE = 8388608;




var busconfig = {
    limits: {
        fields: 30, // max 10 non-multipart fields
        parts:  10, // max 10 multipart fields
        fileSize: MAX_SIZE // files can be at most MAX_SIZE MB each
    }
};


var formconfig = {
    file: {
		multiple: false,
		buffered: true,
		maxSize: {
			size: MAX_SIZE,
			error: ('file size too large (must be '+MAX_SIZE+' MB or less)')
		},
    },
    name:{
		required: true,
		rules: [
               { test: /^.{0,50}$/,
                 error: 'Name must be 50 characters or less' }
             ],
    },
	scene:{
		required: true,
		rules: [
               { test: /^.{0,50}$/,
                 error: 'Scenename must be 50 characters or less' }
             ],
    },
	email:{
		required: true,
		rules: [
               { test: /^.{0,50}$/,
                 error: 'Email must be 50 characters or less' }
             ],
    },
};


var check = function(err, req, res, next) {

    if (!err || (err && err.key)){
        next(); // no error or validation-related error
    }else{
        next(err); // parser or other critical error
    }
};


var process = function(req, res, next) {
     //
    if (req.form.error) {
			console.log('Form error for field "' + req.form.error.key+ '": '+ req.form.error);
             return res.send(400, 'Form error for field "'
                                  + req.form.error.key
                                  + '": '
                                  + req.form.error);
    }
    
    //make directory
	var timestamp = new Date().getTime();
    var path = './public/content/'+req.form.data.name+'/'+timestamp+'/'+req.form.data.scene+'/';
   
    mkdirp( path, function (err) {
		if (err) {
			console.error(err);
		}else{

		
		
			var zip = new JSZip( req.form.data.file.data );
			//console.log(zip);
			
			//writeFile( path+'test.zip', req.form.data.file.data, req.form.data.file.size );
			
			var images = zip.folder("images").file(/.*\.png/);			
			
			
			for(var i = 0; i < images.length; i++ ){
				//console.log(images[i].name);
				var data = images[i].asNodeBuffer();
				//console.log(data);
				writeFile( path+'image'+i+'.png', data, data.length );
			}
			
			var db = new sqlite3.cached.Database( GLOBAL.db );
			db.serialize(function() {
				var stmt = db.prepare("INSERT INTO scene ( id, email, name, nickname, location, timestamp ) VALUES (NULL, ?, ?, ?, ?, ?)");
				stmt.run([ req.form.data.email, req.form.data.scene, req.form.data.name, path, timestamp ]).finalize();
			});
			db.close();
			
		}
    });

    console.log("finished");
    res.send(200, 'Thank you for your form submission!');

};


function writeFile( path, buffer, size ){
    fs.open( path, 'w', '0666', function(err, fd, ri){
		if(err){
			console.error(err);
		}else{		
			fs.write(fd, buffer, 0, size, null, function(err, written, buffer){
				if(err){
					console.error(err);
				}
				fs.close(fd, function( err ){
					if(err){
						console.error(err);
					}
				});
			});
		}
    });
}

router.route('/upload')
.post( busboy( busconfig ), form( formconfig ), check, process  )
.get( function(req, res) { res.render('upload/ajaxupload', {} ); } );

module.exports = router;





