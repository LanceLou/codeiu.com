/**
 * Created by lance on 2016/9/26.
 */
var UserInfoNamespace = UserInfoNamespace || {};
(function(namespace, undefined){
  namespace.endLoading = function(){
    document.body.id = "";
    document.body.style.overflowY = "auto";
  };
  namespace.bannerInfoInitModel = namespace.bannerInfoInitModel || {};
  namespace.bannerInfoInitModel.init = function(data){
    var container = document.querySelector(".info-show");
    container.querySelector(".user-avatar").style.backgroundImage = "url('" + data.logUrl + "')";
    container.querySelector(".user-name").innerText = data.name;
    container.querySelector(".single-intro").innerText = data.aWordIntro;
  };
  namespace.pageinfoModel = namespace.pageinfoModel || {};
  namespace.pageinfoModel.uk = 0;
  namespace.pageinfoModel.init = function(){
    var search = window.location.search,
      uk = search.slice(search.lastIndexOf("uk=")+3,search.lastIndexOf("&")),
      id = search.slice(search.lastIndexOf("id=")+3);
    namespace.pageinfoModel.uk = uk;
    Utils.ajaxModel.queryHandler("uacc", "GET", {operate: "userTotalInfo", uk: uk, id: id}, {sucCallback: namespace.pageinfoModel.requestResponseHandler});
  };
  namespace.pageinfoModel.requestResponseHandler = function(responseText){
    var data = JSON.parse(responseText),
      timer = null;
    if(data.email !== null && data.email.length !== 0){
      namespace.bannerInfoInitModel.init(data);
      Utils.Json2Dom.jsonToElements(document.querySelector(".main-info-display"), data, null, function(key, data, container){
        if(key === "personPageUrl" && container.querySelector(".j2d-personPageUrl") != null){
          container.querySelector(".j2d-personPageUrl").href = data[key];
        }
        if(key === "teamName" && namespace.pageinfoModel.uk == "0" && container.querySelector(".j2d-teamName") != null){
          container.querySelector(".j2d-teamName").href = "/codeiu/PageJump?page=teamInfo&id="+data["tId"];
        }
        if(key === "teamName" && namespace.pageinfoModel.uk == "1" && container.querySelector(".j2d-teamName") !== null){
          container.querySelector(".j2d-teamName").innerHTML = "导师无团队";
          return false;
        }
        return true;
      });
      timer = setTimeout(function(){
        namespace.endLoading();
        clearTimeout(timer);
      }, 1000);
    }

  };

}(UserInfoNamespace));
var userInfoShow_basicAndUniInfoTransform = (function(){
  var mainWrapper = document.querySelector("div.main-info-display"),
  blocks = {
    "basic": mainWrapper.querySelector(".basic-info-show"),
    "university": mainWrapper.querySelector(".university-info-show")
  };
  function showAndHidden(target, showTarget){
    target.previousElementSibling ? Utils.classNameHandler.removeClass(target.previousElementSibling,"cur-label") : Utils.classNameHandler.removeClass(target.nextElementSibling,"cur-label");
    Utils.classNameHandler.addClass(target, "cur-label");
    for(var key in blocks){
      if (key === showTarget) {
        blocks[key].id = "show";
      }
      else {
        blocks[key].id = "hidden";
      }
    }
  }
  function initEveLis(){
    Utils.EventUtil.addHandler(mainWrapper, "click", function(event){
      var target = event.target;
      console.log(target);
      if(!Utils.classNameHandler.contains(target,"label") || Utils.classNameHandler.contains(target,"cur-label"))
        return;
      showAndHidden(target, target.getAttribute("data-target"));
    });
  }
  return {
    init: function(){
      initEveLis();
    }
  }
}());
function init(){
  userInfoShow_basicAndUniInfoTransform.init();
}
init();
PublicNamespace.userInfoNavInitModel.init(UserInfoNamespace.pageinfoModel.init);