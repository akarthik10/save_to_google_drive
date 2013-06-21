var widgets=require("widget");
var data=require("self").data;
var panels = require('panel');
var pageWorkers = require("page-worker");
var notifications = require("notifications");
var queueStarted=false;
var isOn=false;
var windows = require("windows").browserWindows;
var data = require("self").data;
var ss = require("simple-storage");
var clipboard = require("clipboard");
var tabs = require("tabs");
var cm = require("context-menu");


function SanitizeHTML(aHTMLString){
  var html = document.implementation.createDocument("http://www.w3.org/1999/xhtml", "html", null),
    body = document.createElementNS("http://www.w3.org/1999/xhtml", "body");
  html.documentElement.appendChild(body);

  body.appendChild(Components.classes["@mozilla.org/feed-unescapehtml;1"]
    .getService(Components.interfaces.nsIScriptableUnescapeHTML)
    .parseFragment(aHTMLString, false, null, body));

  return body.innerHTML;
}

function showN(text){
	notifications.notify({
  			title: "Save to Google Drive",
  			text: text,
  			});
}




exports.main=function(){

var panel = panels.Panel({
  		width: 450,
  		height: 500,
  		contentURL: data.url('widget/widget.html'),
  		contentScriptFile: [data.url('widget/jquery-1.8.3.min.js'), data.url('widget/ui.js')]
	});

cm.Item({
  label: "Save Image to Google Drive",
  context: cm.SelectorContext("img"),
  image: data.url('widget/gd_on.png'),
  contentScript: 'self.on("click", function (node, data) { self.postMessage(node.src); });',
  onMessage: function (src) {
  	panel.port.emit("fromclip", src);
    showN("Image added to queue");

  }
});

cm.Item({
  label: "Analyze page links",
  image: data.url('widget/gd_on.png'),
  contentScript: 'self.on("click", function (node, data) { self.postMessage("analyze"); });',
  onMessage: function (action) {
  	tab=tabs.activeTab;
					tab.attach({
					  contentScript: "self.postMessage([document.body.innerHTML, window.location.host]);",
					  onMessage: function(data)
					  {
						panel.port.emit("analyze", data[0], data[1]);		
					  }
					});
	panel.show();

  }
});

cm.Item({
  label: "Save Link Content to Google Drive",
  image: data.url('widget/gd_on.png'),
  context: cm.SelectorContext("a[href]"),
  contentScript: 'self.on("click", function (node, data) { self.postMessage(node.href); });',
  onMessage: function (src) {
  	panel.port.emit("fromclip", src);
    showN("Link added to queue");
    
  }
});


	var widget = widgets.Widget({
		id:'gd-switch-btn',
		label:'Save to Google Drive!',
		contentURL: data.url('widget/gd_on.png'),
		contentScriptWhen: 'ready',
		contentScriptFile: data.url('widget/widget.js'),
		panel:panel		
	});

	

	panel.port.on('login', function(){
		
		tabs.open("https://accounts.google.com/ServiceLogin?service=writely");
			panel.hide();
	});
	    	


		panel.port.on('queuestart', function(url){
			if(queueStarted==false){
				queueStarted=true;
				pageWorker.contentURL="about:blank";
				pageWorker.contentURL="http://docs.google.com/viewer?a=sv&url="+url;
				pageWorker.l=url;
				panel.port.emit("bluify");
				}
     	});




		panel.port.on('clicked', function(text){
			pageWorker.contentURL="about:blank";
			pageWorker.contentURL="http://docs.google.com/viewer?a=sv&url="+text;
			pageWorker.l=text;
			panel.port.emit("bluify");
		});




	if(typeof(ss.storage.links)==='undefined'){
	    	ss.storage.links=[];
	    }
	    else{
	    	for(var i=0; i<=ss.storage.links.length-1; i++){
	    		panel.port.emit("inqueue", ss.storage.links[i]);
	    		}
	    }


	if(typeof(ss.storage.settobj)==='undefined'){
	    	ss.storage.settobj={
	    		notif_login: true,
	    		notif_error: true,
	    		notif_succ: false,
	    		def_action: "2",
	    		instant_queue: true
	    	}	

	    	panel.port.emit("init", ss.storage.settobj);

	    }
	    else{
	    	panel.port.emit("init", ss.storage.settobj);
	    }

	    panel.port.on("save", function(settsv){
		ss.storage.settobj.notif_login=settsv.notif_login;
		ss.storage.settobj.notif_error=settsv.notif_error;
		ss.storage.settobj.notif_succ=settsv.notif_succ;
		ss.storage.settobj.instant_queue=settsv.instant_queue;
		ss.storage.settobj.def_action=settsv.def_action;
		panel.port.emit("init", ss.storage.settobj);
	});

	panel.port.on('alink', function(urlk){			
			ss.storage.links.push(urlk);
		

	});

	

	panel.port.on('delink', function(urlk){			
			ss.storage.links.splice(ss.storage.links.indexOf(urlk), 1);
		
	});





	pageWorker = pageWorkers.Page({
  	contentScript: 'self.port.emit("pagecontent", document.body.innerHTML, document.URL)',
	});

	
	pageWorker.port.on("savesuccessful", function(){
		notifications.notify({
  			title: "Send to Google Drive",
  			text: "Your link content was saved successfully.",
  			});
	});

	pageWorker.port.on("pagecontent", function(pagecontent, link){
	
		

		if(link=="about:blank" || link==""){
		 panel.port.emit("blank");
		 queueStarted=false;
		}


		else if(link.indexOf("ServiceLogin")!=-1){
			panel.port.emit("Not Logged In");
			queueStarted=false;
			if(ss.storage.settobj.notif_login){
			 showN("Error: Please login and retry.");
			}
			panel.port.emit("reddify", "Error, please login");
		}

		else if(pagecontent.indexOf("Your file has been saved")==-1){
			panel.port.emit("Not Saved");
			queueStarted=false;
			panel.port.emit("reddify", "Error, file too large or Invalid link");
			if(ss.storage.settobj.notif_error){
			showN("Error : Either your file is too large (> 25 MB) or the link is invalid.");
			}
		}
		
		
		else{
				if(pagecontent.indexOf("Your file has been saved to Google Docs")!=-1){
				panel.port.emit("Save Successful");
				panel.port.emit("queuecomplete", pageWorker.l);
				queueStarted=false;
					if(ss.storage.settobj.notif_succ){
					showN("Your file was successfully saved.");
					}
				}

			}
	});


widget.port.on('right-click', function(){
	
	if(ss.storage.settobj.def_action=="1"){
		panel.show();
	}
	else if(ss.storage.settobj.def_action=="2"){
		panel.port.emit("fromclip", clipboard.get("text"));
	}
	else if(ss.storage.settobj.def_action=="3"){
					tab=tabs.activeTab;
					tab.attach({
					  contentScript: "self.postMessage([document.body.innerHTML, window.location.host]);",
					  onMessage: function(data)
					  {
					    panel.port.emit("analyze", data[0], data[1]);
					  }
					});
			panel.show();		
	}
	});

	panel.port.on('closepanel', function(){

		panel.hide();
	});

panel.port.on('analyzeclick', function(){
			
			tab=tabs.activeTab;
					tab.attach({
					  contentScript: "self.postMessage([document.body.innerHTML, window.location.host]);",
					  onMessage: function(data)
					  {
					  	
						panel.port.emit("analyze", data[0], data[1]);					  }
					});
				
		
     

	});

		panel.port.on("shown", function(notif){
			showN(notif);
		});

};



