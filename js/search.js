var searchIndex = [];
var searchLoaded = false;
function loadSearchIndex(callback) {
  if (searchLoaded) { if (callback) callback(); return; }
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/search-index.json', true);
  xhr.onload = function() {
    try { searchIndex = JSON.parse(xhr.responseText); searchLoaded = true; }
    catch(e) {}
    if (callback) callback();
  };
  xhr.send();
}
function searchQuery(q) {
  if (!q || q.length < 2 || !searchLoaded) return [];
  var ql = q.toLowerCase();
  var results = [];
  for (var i = 0; i < searchIndex.length; i++) {
    var item = searchIndex[i];
    if (item.t.toLowerCase().indexOf(ql) !== -1 ||
        item.d.toLowerCase().indexOf(ql) !== -1) {
      results.push({ t: item.t, d: item.d, u: item.u });
      if (results.length >= 20) break;
    }
  }
  return results;
}