var xhrGet = function(url,func,async) {
	var req = new XMLHttpRequest();
	func(req);
	req.open("get", url, async);
	req.send();
}
function refreshBadge(){
	xhrGet("http://scratch.mit.edu/session",function(req){
		req.onload = function(){
			var jsonR = JSON.parse(req.responseText);
			if (jsonR.user) {
				var username = jsonR.user.username; console.log("Logged in: "+username);
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
				},true);
			}else{ console.error("Not logged in"); }
		}
	},true);
}
refreshBadge()
setInterval(refreshBadge,2*(60*1000))