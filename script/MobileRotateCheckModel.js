/**
 * Created by lance on 2016/10/4.
 */
var mobile_rotateCheckModel = (function(){
  var unScreenHorizonHandler,
    screenHorizonHandler;

  function rotatePrompt(){
    document.body.className = "mobile";
  }
  function initMobileDeviceCheck(){
    var userAgent = window.navigator.userAgent.toLowerCase();
    var isIos = userAgent.indexOf("iphone") >= 0;
    var isAndroidPhone = userAgent.indexOf("android") >= 0;
    var isWindowsPhone = userAgent.indexOf("windows") >= 0;
    var isIpad = userAgent.indexOf("ipad") >= 0;
    if (isAndroidPhone || isIos || isIpad || isWindowsPhone){
      if (window.screen.orientation && window.screen.orientation.angle === 0)
        rotatePrompt();
    }
    window.addEventListener("orientationchange", function(event){
      if(window.screen.orientation.angle !== 0)
        screenHorizonHandler();
      else
        unScreenHorizonHandler();
    });
  }
  return {
    init: function(){
      console.log("get");
      initMobileDeviceCheck();
    },
    setUnScreenHorizonHandler: function(func){
      unScreenHorizonHandler = func;
    },
    setScreenHorizonHandler: function(func){
      screenHorizonHandler = func;
    }
  }
}());