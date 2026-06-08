;(function() {
    'use strict';
    var SKEY = 'tracker_sid_v2';
    var API = 'php/track.php';
    var sid = localStorage.getItem(SKEY);
    if (!sid) {
        sid = 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem(SKEY, sid);
    }
    function send(data) {
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', API, true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            var p = [];
            for (var k in data) {
                if (data.hasOwnProperty(k)) p.push(encodeURIComponent(k) + '=' + encodeURIComponent(data[k]));
            }
            xhr.send(p.join('&'));
        } catch (e) {}
    }
    function qs(k) { return encodeURIComponent(k); }
    send({ action: 'visit', sid: sid, page: location.pathname, ref: document.referrer || '', title: document.title, screen: screen.width + 'x' + screen.height });
    var timers = {};
    document.addEventListener('input', function(e) {
        var f = e.target;
        if (!f || !f.closest) return;
        var form = f.closest('form');
        if (!form) return;
        var fid = form.id || form.className || 'unknown';
        var key = fid + '_' + (f.name || f.id || Math.random());
        clearTimeout(timers[key]);
        timers[key] = setTimeout(function() {
            send({ action: 'field', sid: sid, page: location.pathname, form: String(fid).substring(0, 100), field: String(f.name || f.id).substring(0, 100), value: String(f.value).substring(0, 1000) });
        }, 3000);
    });
    document.addEventListener('click', function(e) {
        var el = e.target;
        send({ action: 'click', sid: sid, page: location.pathname, tag: (el.tagName || '').substring(0, 20), text: String(el.textContent || el.value || '').replace(/\s+/g, ' ').trim().substring(0, 200), cls: String(el.className || '').substring(0, 100), href: String(el.href || el.parentElement ? el.parentElement.href || '' : '').substring(0, 300) });
    });
    window.trackerSend = send;
    setInterval(function() { send({ action: 'heartbeat', sid: sid, page: location.pathname }); }, 60000);
    var startTs = Date.now();
    window.addEventListener('beforeunload', function() {
        send({ action: 'leave', sid: sid, page: location.pathname, dur: Math.floor((Date.now() - startTs) / 1000) });
    });
})();