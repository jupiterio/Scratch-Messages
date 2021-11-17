var MAX = 20
function xhrGet(url,func) {
    var req = new XMLHttpRequest();
    func(req);
    req.open("get", url, true);
    req.send();
}
document.addEventListener("DOMContentLoaded", function() {
    let user;
    fetch("https://scratch.mit.edu/session/", {headers:{"X-Requested-With":"XMLHttpRequest"}})
        .then(r=>r.json())
        .then(o=>{
            user = o.user;
            if (user) {
                let username = user.username;
                let token = user.token;

                return fetch(`https://api.scratch.mit.edu/users/${username}/messages?limit=40&x-token=${token}`)
            }
        })
        .then(r=>r.json())
        .then(o=>{
            let msgs = document.querySelector("#messages")

            for (let msg of o) {
                let box = document.createElement("div")
                box.classList.add("message")
                let icon = document.createElement("img")
                icon.classList.add("icon")
                let content = document.createElement("div")
                content.classList.add("content")
                let time = document.createElement("div")
                time.classList.add("time")
                let extra = [];

                let profileLink = `<a href="https://scratch.mit.edu/users/${msg.actor_username}/">${msg.actor_username}</a>`;

                switch (msg.type) {
                    case "forumpost":
                        var mainText = _messages.en["messages.forumPostText"];

                        icon.src = "/forum activity.svg";
                        content.innerHTML = formatString(mainText, {"topicLink":`<a href="https://scratch.mit.edu/discuss/topic/${msg.topic_id}/unread/">${msg.topic_title}</a>`})
                        break;
                    case "followuser":
                        var mainText = _messages.en["messages.followText"];

                        icon.src = "/follow.svg";
                        content.innerHTML = formatString(mainText, {"profileLink":profileLink})
                        break;
                    case "addcomment":
                        var commentLink;

                        var mainText;
                        switch (msg.comment_type) {
                            case 0: // project
                                mainText = _messages.en["messages.projectComment"];

                                commentLink = `<a href="https://scratch.mit.edu/projects/${msg.comment_obj_id}/#comments-${msg.comment_id}">${msg.comment_obj_title}</a>`
                                break;
                            case 1: // profile
                                mainText = _messages.en["messages.profileComment"];
                                var commentText = formatString(msg.comment_obj_title == user.username ? _messages.en["messages.profileSelf"] : _messages.en["messages.profileOther"], {"username": msg.comment_obj_title})

                                commentLink = `<a href="https://scratch.mit.edu/users/${msg.comment_obj_title}/#comments-${msg.comment_id}">${commentText}</a>`
                                break;
                            default:
                                var mainText = "{profileLink} commented in {commentLink}"

                                commentLink = `${msg.comment_obj_title} object with id ${msg.comment_obj_id} (Comment ${msg.comment_id})`
                        }

                        if (msg.commentee_username == user.username){
                            mainText = _messages.en["messages.commentReply"];
                        }

                        icon.src = "/comment.svg";
                        content.innerHTML = formatString(mainText, {"profileLink":profileLink,"commentLink":commentLink});

                        let profilePic = document.createElement("img");
                        profilePic.classList.add("profile-pic")
                        profilePic.src = `https://cdn2.scratch.mit.edu/get_image/user/${msg.actor_id}_32x32.png`
                        extra.push(profilePic);

                        let commentDiv = document.createElement("div");
                        commentDiv.classList.add("comment")
                        commentDiv.innerHTML = msg.comment_fragment
                        extra.push(commentDiv);

                        break;
                    case "curatorinvite":
                        var mainText = _messages.en["messages.curatorInviteText"];

                        icon.src = "/studio invite - curate.svg";
                        content.innerHTML = formatString(mainText, {
                            "actorLink": profileLink,
                            "studioLink": `<a href="https://scratch.mit.edu/studios/${msg.gallery_id}/">${msg.title}</a>`,
                            "tabLink": `<a href="https://scratch.mit.edu/studios/${msg.gallery_id}/curators/">${_messages.en["messages.curatorTabText"]}</a>`
                        })

                        break;
                    case "studioactivity":
                        var mainText = _messages.en["messages.studioActivityText"];

                        icon.src = "/studio activity.svg";
                        content.innerHTML = formatString(mainText, {
                            "studioLink": `<a href="https://scratch.mit.edu/studios/${msg.gallery_id}/">${msg.title}</a>`
                        })

                        break;
                    case "loveproject":
                        var mainText = _messages.en["messages.loveText"];

                        icon.src = "/love it.svg";
                        content.innerHTML = formatString(mainText, {
                            "profileLink": profileLink,
                            "projectLink": `<a href="https://scratch.mit.edu/projects/${msg.project_id}/">${msg.title}</a>`
                        })

                        break;
                    case "favoriteproject":
                        var mainText = _messages.en["messages.favoriteText"];

                        icon.src = "/fav it.svg";
                        content.innerHTML = formatString(mainText, {
                            "profileLink": profileLink,
                            "projectLink": `<a href="https://scratch.mit.edu/projects/${msg.project_id}/">${msg.project_title}</a>`
                        })

                        break;
                    default:
                        img.src = "/forum activity.svg";
                        content.innerText = msg.type + " " + JSON.stringify(msg);
                }

                time.innerText = ago(msg.datetime_created);

                box.appendChild(icon)
                box.appendChild(content)
                box.appendChild(time)

                for (let ex of extra) {
                    box.appendChild(ex);
                }

                msgs.appendChild(box)
            }

            browser.runtime.sendMessage({type:"refresh"});
        })
        .catch(e=>console.error(e))
});

function formatString(text, format) {
    for (let k in format) {
        if (format.hasOwnProperty(k)) {
            let key = k.replace(/([^a-z0-9])/ig, "\\$1")
            text = text.replace(new RegExp(`\\{${key}\\}`, "g"), format[k])
        }
    }
    return text;
}

var monthDays = [
    31,
    28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
]

function isLeapYear(year) {
  return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
}

function ago(dddd) {
    var today = new Date();
    var actDate = new Date(dddd);
    var timeDiff = Math.abs(actDate.getTime() - today.getTime());

    var totalSecs = timeDiff/1000
    var secs = Math.floor(totalSecs)%60;

    var totalMins = totalSecs/60;
    var mins = Math.floor(totalMins)%60;

    var totalHours = totalMins/60;
    var hours = Math.floor(totalHours)%24;

    var days = today.getUTCDate() - actDate.getUTCDate();

    var monthsUpToToday = (today.getUTCFullYear()-1)*12 + today.getUTCMonth()
    var monthsUpToAct = (actDate.getUTCFullYear()-1)*12 + actDate.getUTCMonth()
    var months = monthsUpToToday - monthsUpToAct

    if (days < 0) {
        var lastMonth = today.getUTCMonth() - months;
        lastMonth = lastMonth == -1 ? 11 : lastMonth;
        var lastMonthDays = lastMonth == 1 && isLeapYear(today.getUTCFullYear()) ? 29 : monthDays[lastMonth];

        days = lastMonthDays + days;
        months -= 1;
    }

    var years = today.getUTCFullYear() - actDate.getUTCFullYear()

    var text = `${secs} sec${secs > 1 ? "s" : ""} ago`

    if (mins > 0) {
        text = `${mins} min${mins > 1 ? "s" : ""} ago`
    }

    if (hours > 0) {
        text = `${hours} hour${hours > 1 ? "s" : ""} ago`
    }

    if (days > 0) {
        text = `${days} day${days > 1 ? "s" : ""} ago`
    }

    if (months > 0) {
        text = `${months} month${months > 1 ? "s" : ""} ago`
    }

    if (years > 0) {
        text = `${years} year${years > 1 ? "s" : ""} ago`
    }

    return text;
}
