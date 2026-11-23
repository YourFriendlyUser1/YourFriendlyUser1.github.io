let hostname
if (window.location.hostname === "localhost"){
    hostname = "frogiesarcade.win"
}
else {
    hostname = window.location.hostname
}

function loadreviq(){
    let head = document.head;
    let reviq = document.createElement("script");
    reviq.src = `https://js.rev.iq/${hostname}`;
    reviq.defer = true
    reviq.onerror = function() {
        console.log(`error loading reviq (server returned 404 most likely)`);
        if (window.location.pathname.includes("reviq.html")){
            document.getElementById("tag").innerText = `error loading reviq (server returned 404 most likely)`
        }
        loadadsterra();
        if (document.getElementById("topad")){
            document.getElementById("topad").remove()
        }
        if (document.getElementById("adleft")){
            document.getElementById("adleft").remove()
        }
        let head = document.head;
        let reviq = document.createElement("script");
        reviq.src = `https://js.rev.iq/ads.frogiesarcade.net`;
        reviq.defer = true
        head.appendChild(reviq);
    };
    head.appendChild(reviq);
    reviq.onload = function() {
        if (window.location.pathname.includes("reviq.html")){
            document.getElementById("tag").innerText = `loaded https://js.rev.iq/${window.location.hostname}`
        }
    }
}

function loadadsterra(){
    let adsterradiv
    adsterradiv = document.getElementById("adsterra")
    let socialbar = document.createElement("script");
    socialbar.src = `//chinesecongressawake.com/71/46/22/714622a1d9a8ad941d1e530653441605.js`;
    socialbar.defer = true
    let popunder = document.createElement("script");
    popunder.src = `//chinesecongressawake.com/ff/da/0b/ffda0b987b791b5a889894b0574b8d22.js`;
    popunder.defer = true
    if (adsterradiv) { 
        adsterradiv.appendChild(socialbar);
        adsterradiv.appendChild(popunder);
    }
    let adsterracalcdiv
    adsterracalcdiv = document.getElementById("adsterracalc")
    if (adsterracalcdiv) { adsterracalcdiv.appendChild(socialbar) }
}
loadreviq();