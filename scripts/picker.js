
	$(".image_picker_image").dblclick(function(){
			
			if($(this).hasClass("pick_selected")){
			
				$(this).removeClass("pick_selected");
				var img_src=$(this).attr('src').split(".",1);
				console.log(img_src);
				$("#img_selected option."+img_src).remove();
			
			}
			else{
				$(this).addClass("pick_selected");
				var img_src=$(this).attr('src').split(".",1);
				console.log(img_src);
				$("#img_selected").append("<option class="+img_src+">"+img_src+"</option>");
			}
	
		});