/**
 * Created by lance on 2016/10/3.
 */
//var tutorFieldNavModel = (function(){
//  var nav = document.querySelector(".mf-nav");
//  var isAttachToHeader = true;
//  function attachToWin(){
//    nav.id = "attachToWin";
//  }
//  function attachToHeader(){
//    nav.id = "";
//  }
//  function wheelHandler(event){
//    var curTop = window.scrollY;
//    if (isAttachToHeader && curTop >= 55){
//      attachToWin();
//      isAttachToHeader = !isAttachToHeader;
//    }
//    if (!isAttachToHeader && curTop <= 55) {
//      attachToHeader();
//      isAttachToHeader = !isAttachToHeader;
//    }
//  }
//  function initEventLis(){
//    Utils.EventUtil.addHandler(document, "wheel", wheelHandler);
//    Utils.EventUtil.addHandler(document, "touchmove", wheelHandler);
//  }
//  return {
//    init: function(){
//      initEventLis();
//    }
//  }
//}());
var TutorListNamespace = TutorListNamespace || {};
(function(namespace, undefined){
  namespace.noticeC = document.querySelector("#noticeC");
  namespace.notice = function(msg){
    var timer = null;
    namespace.noticeC.innerHTML = "<p>"+ msg +"</p>";
    namespace.noticeC.parentNode.id = "topM-notice";
    timer = setTimeout(function(){
      namespace.noticeEnd();
      clearTimeout(timer);
    }, 3000);
  };
  namespace.noticeEnd = function(){
    namespace.noticeC.innerHTML = "";
    namespace.noticeC.parentNode.id = "";
  };
  //namespace.userTutorStatus = 0; //1: 未选择导师[可选]  3: 可修改导师选择,还未加入且未申请加入[可选]  4: 还未选择方向[不可选] 5: 已加入团队或已发送团队加入请求[不可修改]
  namespace.init = function(){
    var userTutorStatus = document.body.getAttribute("data-status")[0];
    if(userTutorStatus === "1" || userTutorStatus === "3"){
      namespace.tutorSelectOrChangeModel.init();
      if(userTutorStatus === "1")
        namespace.tutorSelectOrChangeModel.status = 1;
    }
  };
  namespace.tutorSelectOrChangeModel = namespace.tutorSelectOrChangeModel || {};
  namespace.tutorSelectOrChangeModel.status = 0; //当前用户是否可选择导师 0: 不可以  1: 可以
  namespace.tutorSelectOrChangeModel.init = function(){
    var userStateC = document.querySelector(".user-state"),
      a = userStateC.lastElementChild;
    if (a !== null){
      Utils.EventUtil.addHandler(a, "click", function(event){
        document.querySelector(".field-tutors").id = ""; //解除禁止选择状态
        namespace.tutorSelectOrChangeModel.status = 1;
      });
    }
  };
  namespace.tutorSelectOrChangeModel.select = function(tutorId){
    if(namespace.tutorSelectOrChangeModel.status === 0)
      return;
    Utils.ajaxModel.queryHandler("uacc", "POST", {operate: "stuSelectTutor", tutorId: tutorId}, {sucCallback: namespace.tutorSelectOrChangeModel.tutorSelectRequestResponseHandler});
  };
  namespace.tutorSelectOrChangeModel.tutorSelectRequestResponseHandler = function(responseText){
    var data = JSON.parse(responseText),
      statusContainer = null;
    if(data.errorKey === "0"){
      namespace.notice("选择失败");
    }else{
      namespace.notice("选择导师: " + data.errorMsg + " 成功");
      document.querySelector(".field-tutors").id = "tutor-selected"; //选择按钮暗化
      namespace.tutorSelectOrChangeModel.status = 0; //不响应导师选择点击事件
      statusContainer = document.querySelector(".user-state");
      if(statusContainer.firstElementChild != null){
        statusContainer.firstElementChild.innerHTML = data.errorMsg;
      }else{
        statusContainer.innerHTML = '您已选择导师 <em>'+ data.errorMsg +'</em><a href="javascript: void(0)">点击</a>更改导师';
        namespace.tutorSelectOrChangeModel.init();
      }
    }
  };


  //namespace.tutorSelectOrChangeModel
}(TutorListNamespace));
var tutorInfoDisplayModel = (function(){
  var container = document.querySelector(".mainWrapper");
  function closeTheTutorDisplayed(curUnwindBar){
    curUnwindBar.style.width = "3%";
    Utils.classNameHandler.removeClass(curUnwindBar, "unwind");
  }
  function unCloseTheTutorDisplay(targetTutor){
    var width = 100 - 3*(targetTutor.parentNode.children.length-1);
    targetTutor.style.width = width + "%";
    Utils.classNameHandler.addClass(targetTutor, "unwind");
  }
  function clickHandler(event){
    var target = event.target;
    if(target.className === "selectBtn"){
      TutorListNamespace.tutorSelectOrChangeModel.select(target.getAttribute("data-tutorId"));
        return;
    }
    if (target.innerText !== "点击展开")
      return;
    var targetTutor = target.parentNode.parentNode.parentNode;
    if (Utils.classNameHandler.contains(targetTutor, "unwind"))
      return;
    var curUnwindBar = targetTutor.parentNode.querySelector(".unwind");
    closeTheTutorDisplayed(curUnwindBar);
    unCloseTheTutorDisplay(targetTutor);
  }
  function initEventLis(){
    Utils.EventUtil.addHandler(container, "click", clickHandler);
  }
  function initBarWidth(){
    var fields = document.querySelectorAll(".field-tutors");
    [].forEach.call(fields, function(ele){
      var children = ele.children;
      var length = children.length;
      var unWindWidth = 100 - 3*(length-1);
      [].forEach.call(children, function(aTutorEle){
        if (Utils.classNameHandler.contains(aTutorEle, "unwind"))
          aTutorEle.style.width = unWindWidth + "%";
        else
          aTutorEle.style.width = "3%";
      });
    });
  }
  return {
    init: function(){
      initBarWidth();
      initEventLis();
    }
  }
}());
function init(){
  //tutorFieldNavModel.init();
  tutorInfoDisplayModel.init();
  PublicNamespace.userInfoNavInitModel.init();
  TutorListNamespace.init();
}
init();