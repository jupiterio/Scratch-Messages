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
						var msg = textR.match(/<ul>([\s|\S]*?)<\/ul>/g)[1].replace(/\n/g,"");
						document.querySelector("#messages").innerHTML = (msg).replace(/href="\//g,'target="_blank" href="https://scratch.mit.edu/');
						chrome.browserAction.setBadgeText({text:""});
					};
					req.onerror = function(e){console.error(e); document.getElementById("messages").innerHTML = e;};
				});
			}else{ console.error("Not logged in"); document.getElementById("messages").innerHTML = "Not logged in"; }
		}
		req.onerror = function(e){console.error(e); document.getElementById("messages").innerHTML = e;};
	});
});