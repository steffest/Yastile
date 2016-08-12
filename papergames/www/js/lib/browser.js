var BROWSER_TYPE = {
    UNKNOWN: {name:"unknown"},
    CHROME:  {name:"chrome"},
    SAFARI:  {name:"safari"},
    WEBKIT:  {name:"webkit"}
};

var OS_TYPE = {
    UNKNOWN: {name:"unknown"},
    ANDROID: {name:"android"},
    IOS:     {name:"ios"},
    WINDOWS: {name:"windows"},
    MACOS:   {name:"macos"},
    LINUX:   {name:"linux"}
};

var Browser = (function(){

    var userAgent = navigator.userAgent;
    var userAgentLC = navigator.userAgent.toLowerCase();
    var platform = navigator.platform;

    var self = {};

    self.isSafari = function(){
        return ((userAgent.search('Safari') > -1 ) && (userAgent.search('Chrome') < 0) && (userAgent.search('Bahlu') < 0));
    };

    self.isChrome = function(){
        return (userAgent.search('Chrome') > -1);
    };

    self.isFireFox = function(){
        return (userAgentLC.indexOf("firefox") != -1);
    };

    self.isInternetExplorer = function(){
        return navigator.appName == 'Microsoft Internet Explorer' || self.isInternetExplorer11orHigher();
    };

    self.isInternetExplorer11orHigher = function(){
        return navigator.appName == 'Netscape' && (new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) != null);
    };

    self.isUIScalable = function() {
        //return false;
        return !(self.isSafari() || self.isIpad());
    };

    self.isIpad = function(){
        return (platform.indexOf("iPad") != -1);
    };

    self.isIpadFullScreen = function(){
        return ((self.isIpad) && !self.isSafari());
    };

    self.isIphone = function(){
        return (platform.indexOf("iPhone") != -1);
    };

    self.isIpod = function(){
        return (platform.indexOf("iPod") != -1);
    };

    self.isAndroid = function(){
        return (userAgentLC.indexOf("android") != -1);
    };

    self.isAndroidPhone = function(){
        return (self.isAndroid() && (userAgentLC.indexOf("mobile") != -1));
    };

    self.isAndroidTablet = function(){
        return (self.isAndroid() && (userAgentLC.indexOf("mobile") == -1));
    };

    self.isPhone = function(){
        return (self.isIphone() || self.isIpod() || self.isAndroidPhone());
    };

    self.isTablet = function(){
        return (self.isAndroidTablet() || self.isIpad());
    };

    self.isMobileDevice = function(){
        return (self.isIOS() || self.isAndroid());
    };

    self.isIOS = function(){
        return (self.isIpad() || self.isIphone() || self.isIpod());
    };

    self.hasWebWorkers = function(){
        return !!window.Worker;
    };

    self.isWindowsPC = function() {
        return (userAgent.match(/Windows/i) && (userAgentLC.indexOf("phone") == -1));
    };

    self.isMacOs = function() {
        return !self.isIOS() && userAgent.match(/Mac OS/i);
    };

    self.isAndroidBrowser = function() {
        return userAgent.match(/Android/i) && !window.videoBridge;
    };

    self.isAndroidApp = function() {
        return userAgent.match(/Android/i) && window.videoBridge;
    };

    self.isPC = function() {
        return (self.isWindowsPC() || self.isMacOs());
    };

    self.hasTouchSupport = function() {
        var result = ("ontouchstart" in window) || // touch events
            (window.Modernizr && window.Modernizr.touch) || // modernizr
            (navigator.msMaxTouchPoints || navigator.maxTouchPoints) > 2; // pointer events
        if (Browser.hasFakeTouchSupport) result = false;
        return result;
    };

    self.isBrowser = function(){
      return document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
    };

    return self;

}());



