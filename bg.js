function refreshBadge(){
    fetch("https://scratch.mit.edu/session/", {headers:{"X-Requested-With":"XMLHttpRequest"}})
        .then(r=>r.json())
        .then(o=>{
            let user = o.user;
            if (user) {
                let username = user.username;

                return fetch(`https://api.scratch.mit.edu/users/${username}/messages/count`)
            }
        })
        .then(r=>r.json())
        .then(o=>{
            chrome.browserAction.setBadgeBackgroundColor({color:"#f9a739"});
            if(o.count > 0){
                chrome.browserAction.setBadgeText({text:o.count.toString()});
            }else{
                chrome.browserAction.setBadgeText({text:""});
            }
        })
        .catch(e=>console.error(e))
}

function clearMessages() {
    chrome.cookies.get({name:"scratchcsrftoken",url:"https://scratch.mit.edu"}, c=>{
        let csrf = c.value
        fetch("https://scratch.mit.edu/site-api/messages/messages-clear/", {method:"POST",headers:{"X-Requested-With":"XMLHttpRequest","X-CSRFToken":csrf},credentials:"same-origin",referrer:"https://scratch.mit.edu/messages"})
            .then(r=>r.text())
            .then(t=>{
                console.log(t);
                refreshBadge();
            })
            .catch(e=>console.error(e))
    });
}

browser.runtime.onMessage.addListener((msg) => {
    switch (msg.type) {
        case "refresh":
            clearMessages();
            break;
        default:

    }
});

refreshBadge()
setInterval(refreshBadge,2*(60*1000))
