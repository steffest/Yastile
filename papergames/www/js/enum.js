var VERSION = "0.01";
var buildNumber = VERSION;
var isApp = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;

var touchData = {};

var maxTapDelay = 180; // threshold when a tap counts as a tap (and not a "hold")
var minSwipeDistance = 40; // threshold when a swipe counts as a swipe and not a tap;

var userData = {};
