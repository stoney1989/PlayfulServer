
$( function(){

	var img0 = $( document.createElement('canvas') );
	img0.insertBefore( $('#submit') );	
	var imgData0 = new Image();
	imgData0.src = '/images/canvas.png';
	img0.attr('width', imgData0.width);
	img0.attr('height', imgData0.height);	
	img0[0].getContext("2d").drawImage(imgData0, 0, 0);
	
	var img1 = $( document.createElement('canvas') );
	img1.insertBefore( $('#submit') );	
	var imgData1 = new Image();
	imgData1.src = '/images/canvas.png';
	img1.attr('width', imgData1.width);
	img1.attr('height', imgData1.height);	
	img1[0].getContext("2d").drawImage(imgData1, 0, 0);


	$('#submit').click(function(){
	
		var zip = new JSZip();
		var img = zip.folder("images");	
		//zip.folder("zip");
		
		//console.log( img0[0].toDataURL('image/png') );
		var dataString0 = img0[0].toDataURL('image/png');
		var dataString1 = img1[0].toDataURL('image/png');
		img.file("image0.png", dataString0.substr(dataString0.indexOf(',')+1), {base64: true});
		img.file("image1.png", dataString1.substr(dataString1.indexOf(',')+1), {base64: true});
		
		var content = zip.generate({type:"blob"});
		
		//console.log( content.type );
		
		//var zip2 = new JSZip();
		//zip2.load(content);
	
		var formData = new FormData();
		formData.append("name", "Groucho");
		formData.append("scene", "GrouchoScene");
		formData.append("email", "Groucho@asdf.ch");
		formData.append("file", content);
		
		$.ajax({
		  url: "/upload",
		  type: "POST",
		  data: formData,
		  processData: false,  // tell jQuery not to process the data
		  contentType: false   // tell jQuery not to set contentType
		});
		
	});
});