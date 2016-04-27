$(function($){
	$("#Pat_d_close").click(function(){
		$(this).parent().parent().hide();
	})
	$(".t_btn").click(function(){
		var date=$(".dateField").text();
		var time=$(this).text();

		$(".t_btn").removeClass("app_selected");
		$(this).addClass("app_selected");
		$("#hdate").val(date);
		$("#appointment_details").html("<b style='color:grey'>Date: </b>"+date+"<b style='color:grey'> Time: </b>"+time).css("color","white");
		$("#appointment_details").css("disable","disable");
	});

	$("#d_close").click(function(){
		$("#new_patient").slideUp(700);
		$("#overlay").css("display","none");
	});

$(".datepicker").datepicker(
	{
		 dateFormat: "yy-mm-dd"
	});
var dateFormat = $( ".datepicker" ).datepicker( "option", "dateFormat" );
 
// Setter
$( ".datepicker" ).datepicker( "option", "dateFormat", "yy-mm-dd" );
	
    $(".close").click(function(){
        $(".main").slideUp(700);
    });
   /* $(".list").click(function(){
		$(".main").slideDown(700);
	});*/
	

    $(".app_close").click(function(){
        $("#app_main").slideUp(700);
        bookAppointment();
    });
	

	 $("#d_close").click(function(){
	 var overlay = document.getElementById('overlay');
	var specialBox = document.getElementById('specialBox');
        $("#specialBox").slideUp(700);
		overlay.style.display = "none";
		specialBox.style.display = "none";
    });
    
 $('.carousel-stage img').each(function() {
        var maxWidth = 1000;

    
        var width = $(this).width();  
        var height = $(this).height();
        
        var x=maxWidth*(height/width);
		
        $(this).css("width", maxWidth+"px");
        $(this).css("height", x+"px");  
    });





			$(".thumb").dblclick(function(event){
			
			if($(this).hasClass("selected")){
			
				$(this).removeClass("selected");
				var img_src=$(this).attr('src').split(".",1);
				console.log(img_src);
				$("option."+img_src).remove();
			
			}
			else{
				$(this).addClass("selected");
				var img_src=$(this).attr('src').split(".",1);
				$("#img_selected").append("<option class="+img_src+">"+img_src+"</option>");
			}
	
		});
  $(".list li").click(function(){
  		$(".list li").removeClass("list_selected");
  		$(this).addClass("list_selected");
  });

});
(function($){
        $(window).load(function(){
            $(".content").mCustomScrollbar();
        });
    })(jQuery);

