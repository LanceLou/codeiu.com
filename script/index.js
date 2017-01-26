/**
 * Created by lance on 16/8/9.
 */

var IndexNameSpace = IndexNameSpace || {};

(function(namespace, undefined){
  function getDataByAjax(partUrl, method, params, callbackFunc, mainUrl){
    Utils.ajaxModel.queryHandler(partUrl, method, params, callbackFunc, mainUrl);
  }
  /**
   * construct the query String after ? and ex ?
   * **/
  function constructQueryParams(params){
    console.log(params);
    var qString = "";
    if (Object.prototype.toString.call(params) === "[object Object]"){
      for(var key in params){
        qString += encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
        qString += "&";
      }
      qString = qString.slice(0, qString.length-1);
    }
    console.log(qString);
    return qString;
  }
  namespace.scrollLoader = (function(){
    var document = null;
    var loadTarget = [];
    var viewPortHeight = window.innerHeight - 50;   //设施缓冲距离,不要一达到值就触发
    function eleShow(ele){
      //  scrollLoad-leftToRight   scrollLoad-bottomToTop   scrollLoad-rightToLeft
      console.log(ele.className);
      ele.className.replace(/(scrollLoad\-leftToRight|scrollLoad\-bottomToTop|scrollLoad\-rightToLeft)/g,function(match){
        console.log(match);
        Utils.classNameHandler.replaceClass(ele, match, match+"-show");
        ele.style.opacity = "1";
        ele.style.filter = "opacity(1)";
      });
    }
    function wheelHandler(){
      console.log("OK");
      for (var i in loadTarget){
        var loadEle = loadTarget[i];
        var top = loadEle.getBoundingClientRect().top;
        if (top < viewPortHeight){
          eleShow(loadEle);
          loadTarget.splice(loadTarget.indexOf(loadEle),1);
          i--;
          if (loadTarget.length === 0){
            console.log("000");
            Utils.EventUtil.removeHandler(document, "wheel",wheelHandler);
          }
        }
      }
    }
    function hideLoader(){
      for (var i = 0; i < loadTarget.length; i++){
        loadTarget[i].style.opacity = "0";
        loadTarget[i].style.filter = "opacity(0)";
      }
    }
    function initEventLis(){
      Utils.EventUtil.addHandler(document, "wheel", wheelHandler);
      Utils.EventUtil.addHandler(document, "touchmove", wheelHandler);
    }
    function pageLoadShow(){   //检测是否有页面一加载就显示在视口的元素
      for (var i in loadTarget){
        var loadEle = loadTarget[i];
        var top = loadEle.getBoundingClientRect().top;
        if (top < viewPortHeight){
          eleShow(loadEle);
          loadTarget.splice(loadTarget.indexOf(loadEle),1);
          i--;
        }
      }
    }
    function init(doc, loadEles){
      document = doc;
      loadTarget = loadEles;
      hideLoader();
      setTimeout(function(){
        pageLoadShow();
        initEventLis();
      },1000);
    }
    var scrollLoader = {};
    scrollLoader.init = init;
    return scrollLoader;
  }());
  namespace.pageInit = namespace.pageInit || {};
  namespace.pageInit.initLogStatus = function(status){
    var allAnchrs = namespace.banerProgesssModel.welcomeModel.querySelectorAll("a.pjA");
    allAnchrs[0].href = allAnchrs[0].href + constructQueryParams({"page":"userInfo"});
    if (status[2] === "1"){  //是导师
      allAnchrs[1].innerText = "任务发布";
      allAnchrs[1].href = allAnchrs[1].href + constructQueryParams({"page":"taskRelease"});
      allAnchrs[2].innerText = "查看报表";
      allAnchrs[2].href = allAnchrs[2].href + constructQueryParams({"page":"tutorReportForms"});
    }else{
      allAnchrs[1].href = allAnchrs[1].href + constructQueryParams({"page":"taskList"});
      allAnchrs[2].href = allAnchrs[2].href + constructQueryParams({"page":"tutorList"});
    }
  };
  namespace.pageInit.welcomeInfoInit = function(){
    var allAnchrs = namespace.banerProgesssModel.welcomeModel.querySelectorAll("a.pjA");
    getDataByAjax("uacc?operate=basicUinfo","GET", {}, {sucCallback: function(responseText){
      console.log(responseText);
      var data = JSON.parse(responseText);
      if (data["status"] !== 1)
        return;
      if(data["tutor_id"] !== 0)
        Utils.classNameHandler.addClass(allAnchrs[2], "noEvent");
      var logUrl = data["logUrl"]?data["logUrl"]:"http://og4j2atko.bkt.clouddn.com/human-128.png";
      document.querySelector("#userName").innerHTML = "Welcome: "+data["name"];
      document.querySelector("#userLog").style.backgroundImage = "url("+logUrl+")";
    }});
  };
  namespace.pageInit.initPageStatus = function(status){  //界面初始化
    //根据当前用户的登录状态进行页面初始化
    var baseData = []; //["status", "userId", "userKind"]
    if (status)
      baseData = status.split("-");
    else
      baseData = document.querySelector("#ses-bed-state").value.split("-");
    if(baseData[0]=="0")
      return;
    document.body.id = "logined";
    namespace.pageInit.initLogStatus(baseData);
    namespace.pageInit.welcomeInfoInit();
  };

  namespace.loginModel = namespace.loginModel || {};
  namespace.loginModel.form = null;
  namespace.loginModel.initVerifyCode = function(){
    var verificationImage = document.querySelector("#verificationCodeImg");
    function changeVerificationImg(event){
      var target = event.target;
      target.setAttribute("src", target.getAttribute("data-default"));
      setTimeout(function(){
        target.setAttribute("src", "/codeiu/VerificationCode?param="+Math.random());
      },10);
    }
    function initEventLis(){
      Utils.EventUtil.addHandler(verificationImage, "click", changeVerificationImg);
    }
    initEventLis();
  };
  namespace.loginModel.paramsVerify = function(form){
    var result = true;
    if(!Utils.FormVerificationModel.verify(form.email)){
      form.email.previousElementSibling.setAttribute("data-confirm", "邮箱格式不对");
      result = false;
    }
    if(form.password.value === ""){
      form.password.previousElementSibling.setAttribute("data-confirm", "密码不能为空");
      result = false;
    }
    if(form.vc.value === ""){
      form.vc.previousElementSibling.setAttribute("data-confirm", "验证码不能为空");
      result = false;
    }
    return result;
  };
  namespace.loginModel.responseErrorStatusHandler = function(status){
    var localForm = namespace.loginModel.form,
      emailErrorMsg = "",
      passwordErrorMsg = "",
      vcErrorMsg = "";
    switch (status){
      case 2:
        emailErrorMsg = "邮箱还未验证";
        break;
      case 3:
        passwordErrorMsg = "密码不正确";
        break;
      case 4:
        passwordErrorMsg = "密码过短";
        break;
      case 5:
        emailErrorMsg = "用户不存在";
        break;
      case 6:
        emailErrorMsg = "邮箱格式不对";
        break;
      case 7:
        vcErrorMsg = "验证码不正确";
    }
    if(emailErrorMsg !== "")
      localForm.email.previousElementSibling.setAttribute("data-confirm",emailErrorMsg);
    if(passwordErrorMsg !== "")
      localForm.password.previousElementSibling.setAttribute("data-confirm", passwordErrorMsg);
    if(vcErrorMsg !== "")
      localForm.vc.previousElementSibling.setAttribute("data-confirm", vcErrorMsg);
  };
  namespace.loginModel.paramsUpload = function(params){
    getDataByAjax("uacc?operate=login&"+params, "POST", {}, {sucCallback: namespace.loginModel.responseHandler});
  };
  namespace.loginModel.responseHandler = function(responseText){
    console.log(responseText);
    var response = JSON.parse(responseText);
    if(response.status === 1){
      namespace.pageInit.initPageStatus("1-"+response.id+"-"+response.kind);
      return;
    }
    namespace.loginModel.responseErrorStatusHandler(response.status);
  };
  namespace.loginModel.submitHandler = function(event){
    event.preventDefault();
    var form = namespace.banerProgesssModel.loginModel.querySelector("form");
    form.email.previousElementSibling.setAttribute("data-confirm","");
    form.password.previousElementSibling.setAttribute("data-confirm","");
    form.vc.previousElementSibling.setAttribute("data-confirm","");
    namespace.loginModel.form = form;
    if(namespace.loginModel.paramsVerify(form)){
      namespace.loginModel.paramsUpload(Utils.formSerialize(form));
    }
  };

  namespace.registModel = namespace.registModel || {};
  namespace.registModel.form = null;
  namespace.registModel.email = "";
  namespace.registModel.getEmailOfficePage = function(email){
    var officePage = "mail.foxmail.com";
    officePage = email.replace(/^[\w.]{1,}@/g, function(matcher){
      if(matcher.indexOf("hotmail") > 0)
        return "http://www.";
      if(matcher.indexOf("outlook") > 0)
        return "http://www.";
      if(matcher.indexOf("126.com") > 0)
        return "http://www.";
      return "http://www.mail.";
    });
    return officePage;
  };
  namespace.registModel.emailVerifyNotice = function(email){
    namespace.banerProgesssModel.toEmailVerifyNoticer();
    var link = namespace.banerProgesssModel.emailVnoticeModel.querySelector("A");
    link.href = namespace.registModel.getEmailOfficePage(email);
  };
  namespace.registModel.paramsVerify = function(form){
    var result = true;
    if(!Utils.FormVerificationModel.verify(form.email)){
      form.email.previousElementSibling.setAttribute("data-confirm","邮箱格式不对");
      result = false;
    }
    if(form.stuNo && form.stuNo.name === "stuNo" && !Utils.FormVerificationModel.verify(form.stuNo)){
      form.stuNo.previousElementSibling.setAttribute("data-confirm","学号格式不对");
      result = false;
    }
    if(form.name.value === ""){
      form.name.previousElementSibling.setAttribute("data-confirm","姓名不能为空");
      result = false;
    }
    if(form.invCode && form.invCode.name === "invCode" && form.invCode.value === ""){
      form.invCode.previousElementSibling.setAttribute("data-confirm","邀请码不能为空");
      result = false;
    }
    if(form.password.value.length < 8){
      form.password.previousElementSibling.setAttribute("data-confirm","密码不能少于8个字符");
      result = false;
    }
    if(form.passwordC.value !== form.password.value){
      form.passwordC.previousElementSibling.setAttribute("data-confirm","两次密码不一致");
      result = false;
    }
    return result;
  };
  namespace.registModel.paramsUpload = function(params){
    var operation = "";
    if(params.indexOf("stuNo") === 0)
      operation = "stuRegist";
    else
      operation = "tutorRegist";
    getDataByAjax("uacc?operate="+operation+"&"+params, "POST", {}, {sucCallback: namespace.registModel.responseHandler});
  };
  namespace.registModel.responseErrorStatusHandler = function(status){
    console.log("error");
    var form = namespace.registModel.form;
    var emailErrorMsg = "",
      stuOrInvCodeErrorMsg = "";
    switch (status){
      case 2:
        emailErrorMsg = "邮箱已被使用";
        break;
      case 3:
        stuOrInvCodeErrorMsg = "无效的邀请码";
        break;
    }
    if(emailErrorMsg !== "")
      form.email.previousElementSibling.setAttribute("data-confirm", emailErrorMsg);
    if(stuOrInvCodeErrorMsg !== "")
      form.invCode?form.invCode.previousElementSibling.setAttribute("data-confirm", stuOrInvCodeErrorMsg):null;
  };
  namespace.registModel.responseHandler = function(responseText){
    var response = JSON.parse(responseText);
    if(response.status === 1){
      //namespace.pageInit.initPageStatus("1-"+response.id+"-"+response.kind);
      //注册完成提示邮箱验证
      namespace.registModel.emailVerifyNotice(namespace.registModel.email);
      return;
    }
    namespace.registModel.responseErrorStatusHandler(response.status);
  };
  namespace.registModel.regMethodCHandler = function(event){
    var target = event.target;
    if (target.tagName !== "SPAN" || target.className.indexOf("cur") >= 0)
      return;
    var inWraper = target.parentNode.parentNode;
    var form = inWraper.querySelector("form");
    var label = form.querySelector("label");   //first
    var input = form.querySelector("input");   //first
    if (target.className.indexOf("stu")>=0){
      Utils.classNameHandler.removeClass(target.nextElementSibling, "cur");
      label.innerText = "学号 :";
      label.setAttribute("data-confirm","");
      input.id = input.name = "stuNo";
    }else{
      Utils.classNameHandler.removeClass(target.previousElementSibling, "cur");
      label.innerText = "邀请号 :";
      label.setAttribute("data-confirm","");
      input.id = input.name = "invCode";
    }
    Utils.classNameHandler.addClass(target, "cur");
  };
  namespace.registModel.submitHandler = function(event){
    event.preventDefault();
    var form = namespace.banerProgesssModel.registerModel.querySelector("form");
    form.stuNo?form.stuNo.previousElementSibling.setAttribute("data-confirm",""):null;
    form.email.previousElementSibling.setAttribute("data-confirm","");
    form.name.previousElementSibling.setAttribute("data-confirm","");
    form.password.previousElementSibling.setAttribute("data-confirm","");
    form.passwordC.previousElementSibling.setAttribute("data-confirm","");
    namespace.registModel.form = form;
    if(namespace.registModel.paramsVerify(form)){
      namespace.registModel.email = form.email.value;
      namespace.registModel.paramsUpload(Utils.formSerialize(form));
    }
  };

  namespace.banerProgesssModel = namespace.banerProgesssModel || {};
  namespace.banerProgesssModel.curShow = null;
  namespace.banerProgesssModel.welcomeModel = document.querySelector(".welcome-m");
  namespace.banerProgesssModel.loginModel = document.querySelector(".login-m");
  namespace.banerProgesssModel.registerModel = document.querySelector(".register-m");
  namespace.banerProgesssModel.emailVnoticeModel = document.querySelector(".emailVerifyNotice-m");
  namespace.banerProgesssModel.hiddenCurBannerShow = function(){
    namespace.banerProgesssModel.curShow = document.querySelector(".curShow");
    Utils.classNameHandler.removeClass(namespace.banerProgesssModel.curShow, "curHiddenToShow");
    Utils.classNameHandler.addClass(namespace.banerProgesssModel.curShow, "curShowToHidden");
  };
  namespace.banerProgesssModel.showBannerModel = function(showModel){
    var timer = setTimeout(function(){
      Utils.classNameHandler.removeClass(namespace.banerProgesssModel.curShow, "curShow");
      Utils.classNameHandler.addClass(showModel, "curShow");
      Utils.classNameHandler.addClass(showModel, "curHiddenToShow");
      clearTimeout(timer);
    },990);
  };
  namespace.banerProgesssModel.toWelcome = function(){
    namespace.banerProgesssModel.hiddenCurBannerShow();
    namespace.banerProgesssModel.showBannerModel(namespace.banerProgesssModel.welcomeModel);
  };
  namespace.banerProgesssModel.toLogin = function(){
    namespace.banerProgesssModel.hiddenCurBannerShow();
    namespace.banerProgesssModel.showBannerModel(namespace.banerProgesssModel.loginModel);
  };
  namespace.banerProgesssModel.toRegister = function(){
    namespace.banerProgesssModel.hiddenCurBannerShow();
    namespace.banerProgesssModel.showBannerModel(namespace.banerProgesssModel.registerModel);
  };
  namespace.banerProgesssModel.toEmailVerifyNoticer = function(){
    namespace.banerProgesssModel.hiddenCurBannerShow();
    namespace.banerProgesssModel.showBannerModel(namespace.banerProgesssModel.emailVnoticeModel);
  };
  namespace.banerProgesssModel.introModelClickHandler = function(event){
    console.log(event.target);
    var target = event.target;
    if(target.tagName !== "A")
      return;
    if(target.id === "loginBtn"){
      namespace.banerProgesssModel.toLogin();
    }else{
      namespace.banerProgesssModel.toRegister();
    }
  };

  namespace.introLoaderModel = namespace.introLoaderModel || {};
  namespace.introLoaderModel.init = function(scope, targetEleClass){
    //scrollLoad-leftToRight   scrollLoad-bottomToTop   scrollLoad-rightToLeft
    var loadEles = [];
    for(var i = 0; i < targetEleClass.length; i++){
      var eles = scope.querySelectorAll("."+targetEleClass[i]);
      for (var j = 0; j < eles.length; j++)
        loadEles = loadEles.concat(eles[j]);
    }
    namespace.scrollLoader.init(document, loadEles);
  }
}(IndexNameSpace));


//http://www.cnblogs.com/hustskyking/p/how-to-achieve-loading-module.html
function initEventLis(){
  var introModel = document.querySelector(".intro-m");
  Utils.EventUtil.addHandler(introModel, "click", IndexNameSpace.banerProgesssModel.introModelClickHandler);

  var login = document.querySelector("#login");
  Utils.EventUtil.addHandler(login, "click", IndexNameSpace.loginModel.submitHandler);

  var regMethods = document.querySelector("#reg-method");
  Utils.EventUtil.addHandler(regMethods, "click", IndexNameSpace.registModel.regMethodCHandler);

  var reg = document.querySelector("#register");
  Utils.EventUtil.addHandler(reg, "click", IndexNameSpace.registModel.submitHandler);

}
function initScrollLoadHandler(){
  var classKinds = ["scrollLoad-leftToRight","scrollLoad-bottomToTop","scrollLoad-rightToLeft"];
  IndexNameSpace.introLoaderModel.init(document, classKinds);
}
function init(){
  initScrollLoadHandler();
  IndexNameSpace.pageInit.initPageStatus();
  IndexNameSpace.loginModel.initVerifyCode();
  initEventLis();
}
init();
