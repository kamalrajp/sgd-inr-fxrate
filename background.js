// Variables 
const BASE_URL = 'https://www.dbs.com.sg/personal/';
const PATH = 'rates-online/foreign-currency-foreign-exchange.page?pid=sg-pweb-dbs-home-foreign-currency-converter';

const DEFAULT_RATE = '00.00';

const COLOR_RED = [255, 0, 0, 255];
const COLOR_GREEN = [0, 150, 0, 255];
const COLOR_ALLTIME_HIGH = [255, 191, 0, 255];

const ERR_FETCHING =  'Error in fetching the rate';
const ERR_CONNECTING = 'Error connecting..';

const KEY_ALLTIME_HIGH = 'ALL_TIME_HIGH';
const KEY_ALLTIME_HIGH_DATE = 'ALL_TIME_HIGH_DATE';

var currentRate = 0.0;
var previousRate = 0.0;
var allTimeHighRate = 0.0;

// On Installed 
chrome.runtime.onInstalled.addListener(function () {
    onExtensionInstalled();
});

// On Alarm
chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === "RATE") {
    // Set the Previous rate to current rate;
     previousRate = currentRate;
     // Get the rate from web     
     getSGDToINRRate(BASE_URL + PATH);
  }
});


//********************************************************* 
//      Helper methods
//*********************************************************
function onExtensionInstalled() {
    // Storage 
     setStorageValue(KEY_ALLTIME_HIGH, DEFAULT_RATE);
     setStorageValue(KEY_ALLTIME_HIGH_DATE, new Date().toString());

    // Set the alarm Run it every four hours
    chrome.alarms.create("RATE", { delayInMinutes: 1, periodInMinutes: 120 });
    // Get the rate for the first time 
    getSGDToINRRate(BASE_URL + PATH);
}

// Gets the current rate by scraping
function getSGDToINRRate(_url) {
    $.ajax({
        url: _url,
        success: function(data) {
            handleRateResponse(data);
        },
        error: function(xhr,status,error) {
            console.log(ERR_CONNECTING + ":" + xhr.statusText);
            handleError(ERR_CONNECTING); 
        }
    })
}

function handleRateResponse(data) {
    var noImage = $(data.replace(/<img[^>]*>/g, ''));
    var fxRate = $(noImage).find('tr[name=indianrupee]').find('.column3').text();
    if(fxRate) {
        currentRate = (100 / fxRate).toFixed(2);
        // Post process
        postProcess(currentRate);
    } else {
        handleError(ERR_FETCHING); 
    }
}

function postProcess(rate) {
    getStorageValue(KEY_ALLTIME_HIGH , function(data){
        // Check if currentRate  > ALL_TIME_HIGH
         allTimeHighRate = data.ALL_TIME_HIGH;

         if(currentRate > allTimeHighRate) {
             setStorageValue(KEY_ALLTIME_HIGH,currentRate);
             setStorageValue(KEY_ALLTIME_HIGH_DATE,new Date().toString());
             applyBadgeText(currentRate, COLOR_ALLTIME_HIGH);
         } else {
            var _color = (currentRate < previousRate) ? COLOR_RED : COLOR_GREEN;
            applyBadgeText(currentRate, _color);
         }
    });
     
}

function handleError(ERR){
    applyBadgeText(DEFAULT_RATE,COLOR_RED);  
    setTitle(ERR);
}

// Applies the badge text
function applyBadgeText(_text, _color) {
    chrome.browserAction.setBadgeBackgroundColor({ color: _color });
    chrome.browserAction.setBadgeText({text: _text});

    // Set the time when we did the last update 
    setTitle('Last refreshed: ' + new Date().toLocaleTimeString()); 
}

// Set the Extensions tooltip
function setTitle(_title) {
    chrome.browserAction.setTitle({title:_title});
}
