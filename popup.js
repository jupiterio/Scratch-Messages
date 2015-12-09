var MAX = 20
function xhrGet(url,func) {
	var req = new XMLHttpRequest();
	func(req);
	req.open("get", url, true);
	req.send();
}
document.addEventListener("DOMContentLoaded", function() {
	xhrGet("http://scratch.mit.edu/session",function(req){
		req.onload = function(){
			var jsonR = JSON.parse(req.responseText);
			if (jsonR.user) {
				var username = jsonR.user.username; console.log("Logged in: "+username);
				xhrGet("https://scratch.mit.edu/messages/",function(req){
					req.onload = function(){
						var textR = req.responseText;
						var unread = textR.match(/<ul class="unread">([\s|\S]*?)<\/ul>/g)[0].replace(/\n/g,"");
						var read = textR.match(/<ul class="read">([\s|\S]*?)<\/ul>/g)[0].match(/<h3>Today<\/h3>([\s|\S]*?)<h3>/)[0].replace(/\n/g,"");
						read = '<ul class="read">' + read.substring(0,read.length-4)  + '</ul>';
						document.querySelector("#messages").innerHTML = (unread + read).replace(/href="\//g,'target="_blank" href="https://scratch.mit.edu/');
						xhrGet("https://api.scratch.mit.edu/proxy/users/"+username+"/activity/count",function(req){
							req.onload = function(){
								var jsonR = JSON.parse(req.responseText);
								chrome.browserAction.setBadgeBackgroundColor({color:"#f9a739"});
								if(jsonR.msg_count>0){
									chrome.browserAction.setBadgeText({text:jsonR.msg_count.toString()});
								}else{
									chrome.browserAction.setBadgeText({text:""});
								}
							}
						});
					};
				});
			}else{ console.error("Not logged in"); document.getElementById("messages").innerHTML = "Not logged in"; }
		}
	});
});