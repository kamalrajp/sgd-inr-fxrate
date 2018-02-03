// Storage 
// Tip : To check the value in background page console 
// chrome.storage.sync.get('ALL_TIME_HIGH_DATE', function(data){console.log(data)});
function getStorageValue(key, callback) {
    chrome.storage.sync.get(key, callback); 
}

function setStorageValue(key,value) {
    var obj = {};
    obj[key] = value;
    chrome.storage.sync.set(obj, function() {
        // Notify that we saved.
        console.log('Settings saved', key);
    });
}