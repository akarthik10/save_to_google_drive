var notif_login=true;
var notif_error=true;
var notif_succ=false;
var def_action="2";
var instant_queue=true;



self.port.on("analyze", function(body, link){

    if(link[link.length-1]=='/')
        link=link.substring(0, link.length - 1);
    if(link.indexOf("http://")!=0)
        link="http://"+link;
    $('.tabs').hide();
    $('.current').toggleClass("current").toggleClass("single-link");
    $('.itemsel').each(function(){
        $(this).remove();
    });
    $('#tab4').fadeIn();
    $('#lab4').toggleClass("single-link").toggleClass("current");
    var ans=body.match(/"(http:\/\/.*?)"/gi);
    var relative=body.match(/"(\/.*?)"/gi);
    
    for(var a=0;a<ans.length; a++){
        var type="Link";
        ans[a]=ans[a].substring(1,ans[a].length-1);
        if(ans[a].indexOf("//")==0){ans[a]="http:"+ans[a];}
        if(ans[a].indexOf(".jpg") >0 || ans[a].indexOf(".gif") >0 || ans[a].indexOf(".png") >0) {type="Image";}
        $('#tab4').append('<div class="itemsel" link="'+ans[a]+'"><div class="checktick"><input type="checkbox" class="cbox"/></div><div class="status">Type: '+type+'</div>'+ans[a]+'</div>');
    }

    for(var l=0; l<relative.length; l++)
    {

        if(relative[l][2]!="."){
            if(relative[l][1]=='/' && relative[l][2]=='/')
                {
                    relative[l]="http:"+relative[l].substring(1,relative[l].length-1);
                }
            else
        relative[l]=link+relative[l].substring(1,relative[l].length-1);
        
        var type="Link";
        if(relative[l].indexOf(".jpg") >0 || relative[l].indexOf(".gif") >0 || relative[l].indexOf(".png") >0) {type="Image";}
        $('#tab4').append('<div class="itemsel" link="'+relative[l]+'"><div class="checktick"><input type="checkbox" class="cbox"/></div><div class="status">Type: '+type+'</div>'+relative[l]+'</div>');
        }
    }

    $('.itemsel').on('click', function(){
        if(! $(this).children('.checktick').children('input').prop('checked'))
       {
        $(this).css("background", "#3E6D8E");
        $(this).children('.checktick').children('input').prop('checked', true);

        }
    else{
        $(this).css("background", "#2D2D2D");
        $(this).children('.checktick').children('input').prop('checked', false);
    }



    });

    $('.cbox').on('click', function(){
        $(this).prop('checked', !$(this).prop('checked'));
    });

    if($('.itemsel').length>0)
    {
        $('#submit6').show();

    }

    

    
});

$('#submit6').on('click', function(){


    var added=0;
    $('.itemsel').each(function(){
        if($(this).children('.checktick').children('input').prop('checked'))
        {
            $('#tab2').append('<div class="item" link="'+$(this).attr("link")+'"><div class="closebtn">X</div><div class="status">Status: Queued</div>'+$(this).attr("link")+'</div>');
            self.port.emit("alink",$(this).attr("link") )
            $(this).fadeOut(500, function(){
    $(this).remove();
    });
            added=1;
        }
    });

    if(added){
        $('#submit6').attr("value","Added");
        setInterval(function(){$('#submit6').attr("value", "Add selected links"); },3500);
        if(instant_queue){
            self.port.emit("queuestart", $('.item').first().attr("link"));
        }
    }
    else{
        $('#submit6').attr("value","Select atleast one link");
        setInterval(function(){$('#submit6').attr("value", "Add selected links"); },3500);
    }

    if($('.item').length>0){
        $('.emptyq').fadeOut(500);
    }

    if(instant_queue==false && $('.item').length>0)
    {
        $('#submit5').show();

    }
});



self.port.on("inqueue", function(link){
    $('#tab2').append('<div class="item" link="'+link+'"><div class="closebtn">X</div><div class="status">Status: Queued</div>'+link+'</div>');
    if(instant_queue==true){
    $('#submit5').slideDown(400);
    }
    $('.emptyq').fadeOut();
});

self.port.on("reddify", function(text){
   
   $('.itemproc').first().children(".status").html("Status: "+text);
   $('.itemproc').first().children(".closebtn").slideDown(500);
   $('.itemproc').first().removeClass('itemproc').addClass('itemerror');
   
    if($('.item').size()!=0 && text!="Error, please login"){
    self.port.emit('queuestart', $('.item').first().attr("link") );
    $('#submit5').slideUp(400);
    }
    else {
   $('#submit5').slideDown(400);
}

});

self.port.on("bluify", function(){
    if($('.item').size()!=0){
        $('.emptyq').fadeOut(500);
    }
   $('.item').first().children(".status").text("Status: Saving link content..");
   $('.item').first().children(".closebtn").slideUp(500);
   $('.item').first().removeClass('item').addClass('itemproc');
   $('#submit5').slideUp(400);
});

self.port.on("queuecomplete", function(link){
    self.port.emit("delink",$('.itemproc').first().attr("link") );
    
    $('.itemproc').first().children(".status").html("Status: Saved");
   $('.itemproc').first().removeClass('itemproc').addClass('itemcomplete').fadeOut(1800, function(){
    $(this).remove();
    });

   if($('.item').size()!=0){
    self.port.emit('queuestart', $('.item').first().attr("link") );
    $('#submit5').slideUp(400);
}
else{

    if($('.item').size()==0 && $('.itemproc').size()==0 && $('.itemerror').size()==0){
        $('.emptyq').fadeIn(1500);
    }
    else{
        $('#submit5').slideUp(400);
    }
}
    
});

$('#submit4').bind('click', function(){
   
    $('.itemsel').each(function(){
        $(this).remove();
    });
    self.port.emit('analyzeclick');

});

$('#close').bind('click', function(){
    self.port.emit('closepanel');
});


$('#submit5').bind('click', function(){
    $('.itemerror').each(function(){
        $(this).removeClass('itemerror').addClass('item');
        $(this).children(".status").text("Status: Queued");
    });

    if($('.item').size()!=0){
    self.port.emit('queuestart', $('.item').first().attr("link") );
}

});
var again=0;

$('#save').bind('click', function(){
 
 // var orig=$('#save').attr("value");
var settsv={notif_login:null, notif_error:null, notif_succ:null, instant_queue:null, def_action:null};

settsv.notif_login=$('#notif_login').is(':checked');
settsv.notif_error=$('#notif_error').is(':checked');
settsv.notif_succ=$('#notif_succ').is(':checked');
settsv.instant_queue=$('#instant_queue').is(':checked');
settsv.def_action=$('#def_action').val();
self.port.emit("save", settsv);
if(again==0){
again=1;
$('#save').attr("value", "Saved");
setInterval(function(){$('#save').attr("value", "Save"); again=0; },1500);
}

});


self.port.on("init", function(sett){

    notif_login=sett.notif_login;
    notif_error=sett.notif_error;
    notif_succ=sett.notif_succ;
    def_action=sett.def_action;
    instant_queue=sett.instant_queue;
    $('#notif_login').prop("checked", notif_login);
    $('#notif_error').prop("checked", notif_error);
    $('#notif_succ').prop("checked", notif_succ);
    $('#instant_queue').prop("checked", instant_queue);
    $('#def_action').val(def_action);
});



self.port.on("blank", function(){
   $('#notification').slideUp(250);
});



self.port.on("fromclip", function(text){
    if(text.indexOf('http://')!=0 && text.indexOf('https://')!=0) {
        text = 'http://'+text;
    }
    var patt=/^https?:\/\/[^.\n\t]*\..*/i;
    if(!patt.test(text)){
        self.port.emit("shown", "Invalid link. Please try again.");
    }
    else{    
    self.port.emit("alink", text );
    $('#tab2').append('<div class="item" link="'+text+'"><div class="closebtn">X</div><div class="status">Status: Queued</div>'+text+'</div>');
    if(instant_queue){
     self.port.emit('queuestart', text );
    }
    self.port.emit("shown", "Link added to queue.");
    $('.emptyq').fadeOut(1500);
    }
});

function showNotif(text){
    $('#notification').text(text);
    $('#notification').slideDown(250);
}

$('.tlink').each(function(index){

$(this).bind("click", function(){
	$('.tabs').hide();
	$('.current').toggleClass("current").toggleClass("single-link");
	$('#t'+$(this).attr("id")).fadeIn();
	$('#l'+$(this).attr("id")).toggleClass("single-link").toggleClass("current");
	//alert('Clicked t'+$(this).attr("id"));
});
});

$('#submit2').bind('click', function(){
    self.port.emit('login');

});

$('#submit3').bind('click', function(){
    var orig = $('#submit3').attr("value");
    $('#notification').slideUp(250);
    var link = $('#field').attr('value');
    if(link.indexOf('http://')!=0 && link.indexOf('https://')!=0) {
        link = 'http://'+link;
    }
    var patt=/^https?:\/\/[^.\n\t]*\..*/i;
    if(!patt.test(link)){
    $('#notification').text("Invalid link. Please try again. ");
    $('#notification').slideDown(250);
    $('#submit3').attr("value", "Invalid link. Try again.").delay(3500).queue(function(){
        $('#submit3').attr("value", orig)
    });
    }
    else{    
 
    self.port.emit("alink", $('#field').attr("value") );
    var ne = $('#tab2').append('<div class="item" link="'+$('#field').attr("value")+'"><div class="closebtn">X</div><div class="status">Status: Queued</div>'+$('#field').attr("value")+'</div>');
    if(instant_queue){
     self.port.emit('queuestart', $('#field').attr("value") );
    }
    $('#field').attr("value", "");
    $('#submit3').attr("value", "Added").delay(1500).queue(function(){
        $('#submit3').attr("value", orig)
    });
        
                
        
    }
    
});




$('.tabs').hide();
$('#tab1').fadeIn();
$('#lab1').toggleClass("single-link").toggleClass("current");


$(document).ready(function() {
    
    

    $("#field").keyup(function() {
        $("#x").fadeIn();
        if ($.trim($("#field").val()) == "") {
            $("#x").fadeOut();
        }

    });
    
    $("#x").click(function() {
        $("#field").val("");
        $(this).hide();
    });

    $('.closebtn').live('click',function() {
        self.port.emit("delink", $(this).parents("div:first").attr("link"));;
    $(this).parents("div:first").remove();
    if($('.item').size()==0 && $('.itemproc').size()==0 && $('.itemerror').size()==0){
        $('.emptyq').fadeIn(1500);
        $('#submit5').hide();
    }
});

    $('.field').each(function() {
    var default_value = this.value;
    $(this).focus(function() {
    	$('#notification').slideUp(250);
        if(this.value == default_value) {
            this.value = '';
        }
    });
    $(this).blur(function() {
        if(this.value == '') {
            this.value = default_value;
        }
    });
});

});