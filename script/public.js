/**
 * Created by lance on 16/9/18.
 */

//此文件装载项目相关公用组件:  回到顶部,顶部用户消息显示


//用户信息toggle显示部分
(function (){
  var toggleBtn = document.querySelector("a.click-toggle");
  if(!toggleBtn)
    return;
  var showHiddenModel = toggleBtn.nextElementSibling;
  var isShow = false;
  function documentLis(){
    Utils.EventUtil.addHandler(document,"click",function(event){
      if(isShow){
        showHiddenModel.style.visibility = "hidden";
        isShow = !isShow;
      }
    });
  }
  function eventLisInit(){
    Utils.EventUtil.addHandler(toggleBtn.parentNode,"click",function(event){
      if(!isShow){
        showHiddenModel.style.visibility = "visible";
        isShow = !isShow;
        event.stopPropagation();
        documentLis();
      }
    });
  }
  function init(){
    eventLisInit();
  }
  init();
})();

//mobile下拉框显示部分
(function(){
  var navBar = document.querySelector(".nav-bar");
  var mobileNav = document.querySelector(".mobile-nav");
  if(!navBar || !mobileNav)
    return;
  var isOpen = false;
  function showNav(event){
    if (isOpen){
      mobileNav.style.height = "0";
    }else{
      mobileNav.style.height = "200px";
    }
    isOpen = !isOpen;
    event.stopPropagation();
    Utils.EventUtil.addHandler(document,"click",showNavByDoc);
  }
  function showNavByDoc(){
    if (isOpen){
      mobileNav.style.height = "0";
      isOpen = !isOpen;
    }
  }
  function eventLisInit(){
    Utils.EventUtil.addHandler(navBar,"click",showNav);
  }
  eventLisInit();
})();
//回到顶部功能模块
(function (){
  var btn = document.querySelector(".backToTop");
  if(!btn)
    return;
  function toTop(){
    var top = window.scrollY;
    var timer = setTimeout(function(){
      top = top - 25;
      window.scrollTo(0, top);
      if(top <= 0){
        clearTimeout(timer);
        initEleDis();
      }else{
        timer = setTimeout(arguments.callee,1);
      }
    },1);
  }
  function wheelHandler(event){
    var curTop = window.scrollY;
    if (curTop > 130){
      btn.style.visibility = "visible";
    }else{
      btn.style.visibility = "hidden";
    }
  }
  function eventLisInit(){
    Utils.EventUtil.addHandler(document, "wheel", wheelHandler);
    Utils.EventUtil.addHandler(document, "touchmove", wheelHandler);
    Utils.EventUtil.addHandler(btn, "click", toTop);
  }
  function initEleDis(){
    btn.style.visibility = "hidden";
    if (window.scrollY > 130){
      btn.style.visibility = "visible";
    }
  }
  function init(){
    if (!btn)
      return;
    initEleDis();
    eventLisInit();
  }
  init();
}());
//-----------------------------------------------------------
var PublicNamespace = PublicNamespace || {};
(function(namespace, undefined){
  function generateNavLists(id, userK, tutor_id, tId){
    var li = null,
      a,
      i,
      data = [],
      fragment = document.createDocumentFragment();
    data.push({href: "/codeiu/PageJump?page=userInfo&uk="+userK+"&id="+id, innerText: "个人信息"});
    if(userK === 1){
      data.push({href: "/codeiu/PageJump?page=taskRelease", innerText: "任务发布"});
      data.push({href: "/codeiu/PageJump?page=tutorReportForms", innerText: "控制台"});
    }else{
      data.push({href: "/codeiu/PageJump?page=taskList", innerText: "我的任务"});
      if (tutor_id === 0){
        data.push({href: "/codeiu/PageJump?page=tutorList", innerText: "选择导师"});
      }
      if(tId !== 0 && tId !== 1 && tId !== 2){
        data.push({href: "/codeiu/PageJump?page=teamInfo&id="+tId, innerText: "我的团队"});
      }
    }
    data.push({href: "/codeiu/uacc?operate=logout", innerText: "退出"});
    for(i = 0; i < data.length; i++){
      li = document.createElement("li");
      a = document.createElement("a");
      a.href = data[i].href;
      a.innerText = data[i].innerText;
      li.appendChild(a);
      fragment.appendChild(li);
    }
    return fragment;
  }
  function initPcNav(data){
    var container = namespace.userInfoNavInitModel.pcNav,
      nameC = container.querySelector(".name"),
      teamNameC = container.querySelector(".team-name"),
      ul = container.querySelector(".show-hidden");
    nameC.innerText = data.name;
    if (data.kind === 1)
      teamNameC.innerText = "导师";
    else
      teamNameC.innerText = (data.tId===0||data.tId===1||data.tId===2)? "" : data.teamName;
    ul.appendChild(generateNavLists(data.id, data.kind, data.tutor_id, data.tId));

  }
  function initMobileNav(data){
    var ul = namespace.userInfoNavInitModel.mobileNav.querySelector("ul"),
      nameC = ul.querySelector(".name"),
      teamNameC = ul.querySelector(".team-name");
    nameC.innerText = data.name;
    if (data.kind === 1)
      teamNameC.innerText = "导师";
    else
      teamNameC.innerText = (data.tId===0||data.tId===1||data.tId===2)? "" : data.teamName;
    ul.appendChild(generateNavLists(data.kind, data.tutor_id, data.tId));
  }
  function updateRequest(callbackFunc){
    Utils.ajaxModel.queryHandler("uacc?operate=basicUinfo","GET", {}, callbackFunc);
  }
  namespace.userInfoNavInitModel = namespace.userInfoNavInitModel || {};
  namespace.userInfoNavInitModel.data = null;
  namespace.userInfoNavInitModel.pcNav = document.querySelector("span.nav");
  namespace.userInfoNavInitModel.mobileNav = document.querySelector("section.mobile-nav");
  namespace.userInfoNavInitModel.dataReadyCallBack = null;
  namespace.userInfoNavInitModel.requestResultHandler = function(responseText){
    var data = JSON.parse(responseText),
      dataReadyCallBack = namespace.userInfoNavInitModel.dataReadyCallBack,
      i;
    if(data.id === 0)  //unlogined
      return;
    namespace.userInfoNavInitModel.data = data;
    initPcNav(data);
    initMobileNav(data);
    if (dataReadyCallBack){
      if(Object.prototype.toString.call(dataReadyCallBack).indexOf("Array") >= 0){
        for(i = 0; i < dataReadyCallBack.length; i++)
          dataReadyCallBack[i]();
      }else
        dataReadyCallBack();
    }
    if(data.isMsg != 0)
      namespace.messageHandlerModel.start();
  };
  namespace.userInfoNavInitModel.init = function(dataReadyCallBack){
    namespace.userInfoNavInitModel.dataReadyCallBack = dataReadyCallBack;
    updateRequest({sucCallback: namespace.userInfoNavInitModel.requestResultHandler});
  };

  namespace.unloginedHandlerModel = namespace.unloginedHandlerModel || {};
  namespace.unloginedHandlerModel.topMessageContainer = document.querySelector("section.top-message");
  namespace.unloginedHandlerModel.responseListener = function(responseText){
    var data = JSON.parse(responseText),
      topMessageContainer = namespace.unloginedHandlerModel.topMessageContainer,
      p = null;
    if (data.errorMsg == "unlogined" && topMessageContainer && topMessageContainer.id.indexOf("topM-warning") < 0){
      topMessageContainer.id = "topM-warning";
      p = topMessageContainer.querySelector(".warning-p");
      if(p)
        p.innerHTML = "您已离线,请重新<a href='/codeiu/PageJump?page=login&sourcePage="+encodeURIComponent(window.location.href)+"'>登录</a>";
    }
  };
  namespace.unloginedHandlerModel.init = function(){
    Utils.ajaxModel.setResponseListener(namespace.unloginedHandlerModel.responseListener);
  };

  //现阶段系统消息主要为入队申请,默认入队申请将发送至每一个队员账户,因为现阶段没有队长(创建者)与队员之分
  namespace.messageHandlerModel = namespace.messageHandlerModel || {};
  namespace.messageHandlerModel.container = document.querySelector(".systemMessage");
  namespace.messageHandlerModel.data = [];
  namespace.messageHandlerModel.display = function(data){
    document.querySelector(".top-message").id = "topM-sysMsg";
    var itemContainer = namespace.unloginedHandlerModel.topMessageContainer.querySelector(".msg-item-container"),
      li = null,
      i = 0;
    for(i = 0; i <  data.length; i++){
      li = document.createElement("li");
      li.className = "msg-item";
      li.setAttribute("data-index", ""+i);
      li.innerHTML = "<h5>入队申请(<em class=\"teamName\">"+data[i].messageContent.substring(data[i].messageContent.indexOf("-codeiu-")+8, data[i].messageContent.lastIndexOf("-codeiu-"))+"</em>)</h5>"+
        "<p>from <i class=\"stuName\">"+data[i].messageContent.substring(0, data[i].messageContent.indexOf("-codeiu-"))+"</i></p>";
      itemContainer.appendChild(li);
    }
    Utils.EventUtil.addHandler(itemContainer,"click", function(event){
      var target = event.target;
      if(target.tagName == "H5")
        target = target.parentNode;
      if(target.tagName !== "LI")
        return;
      var curItemLi = itemContainer.querySelector(".mi-cur");
      if(curItemLi === target){
        return;
      }
      if(curItemLi)  //一开始没有点击的时候
        Utils.classNameHandler.removeClass(curItemLi, "mi-cur");
      Utils.classNameHandler.addClass(target, "mi-cur");
      namespace.messageHandlerModel.displayContent(target.getAttribute("data-index"));
    });
    Utils.EventUtil.addHandler(namespace.messageHandlerModel.container.querySelector(".msgContent"), "click", namespace.messageHandlerModel.displayContentClickHandler);
  };
  namespace.messageHandlerModel.displayContent = function(index){
    var p1 = document.createElement("p"),
      p2 = document.createElement("p"),
      a = document.createElement("a"),
      container = namespace.messageHandlerModel.container.querySelector(".msgContent"),
      data = namespace.messageHandlerModel.data[index],
      teamName = data.messageContent.substring(data.messageContent.indexOf("-codeiu-")+8, data.messageContent.lastIndexOf("-codeiu-"));
    container.innerHTML = "";
    p1.innerHTML = "您的同学<a href=\"#\">"+data.messageContent.substring(0, data.messageContent.indexOf("-codeiu-"))+"</a>请求加入您的团队("+teamName+")。";
    p2.innerHTML = "<a href=\"javascript: void(0)\" class=\"btn\" id=\"message-agree\">同意</a><a href=\"javascript: void(0)\" class=\"btn\" id=\"message-refuse\">拒绝</a>";
    a.href = "javascript: void(0)";
    a.id = "message-mark";
    a.className = "btn markReaded";
    a.innerText = "标记为已读";
    container.appendChild(p1);
    container.appendChild(p2);
    container.appendChild(a);
    container.setAttribute("data-mid", data.id);
  };
  namespace.messageHandlerModel.displayContentClickHandler = function(event){
    var target = event.target;
    if(target.tagName !== "A")
      return;
    var mid = namespace.messageHandlerModel.container.querySelector(".msgContent").getAttribute("data-mid");
    //根据相关点击对象进行筛选并开启ajax请求
    switch (target.id){
      case "message-agree":
        Utils.ajaxModel.queryHandler("uacc", "GET", {operate: "teamAddResponseHandler", target: "agree", mId: mid}, {sucCallback: namespace.messageHandlerModel.contentARMRequestResHandler});
        break;
      case "message-refuse":
        Utils.ajaxModel.queryHandler("uacc", "GET", {operate: "teamAddResponseHandler", target: "refuse", mId: mid}, {sucCallback: namespace.messageHandlerModel.contentARMRequestResHandler});
        break;
      case "message-mark":
        Utils.ajaxModel.queryHandler("uacc", "GET", {operate: "teamAddResponseHandler", target: "mark", mId: mid}, {sucCallback: namespace.messageHandlerModel.contentARMRequestResHandler});
    }
  };
  namespace.messageHandlerModel.contentARMRequestResHandler = function(responseText){  //上函数三个请求的相应处理集合为一个
    var data = JSON.parse(responseText),
      liContainer = null;
    if(data.errorKey && data.errorKey == "0")
      return;
    namespace.messageHandlerModel.container.querySelector(".msgContent").innerHTML = "";
    liContainer = namespace.messageHandlerModel.container.querySelector(".msg-item-container");
    liContainer.removeChild(liContainer.querySelector(".mi-cur"));
    if(liContainer.children.length === 0){
      document.querySelector(".top-message").id = "";
    }
  };
  namespace.messageHandlerModel.responseHandler = function(responseText){
    var data = JSON.parse(responseText);
    if(!data.length || data.length<=0)
      return;
    //开始真正的初始化
    namespace.messageHandlerModel.data = data;
    namespace.messageHandlerModel.display(data);
    namespace.messageHandlerModel.displayElementScrollHandlerModel.init();
  };
  namespace.messageHandlerModel.displayElementScrollHandlerModel = namespace.messageHandlerModel.displayElementScrollHandlerModel || {};
  namespace.messageHandlerModel.displayElementScrollHandlerModel.init = function(){
    var ulContainer = namespace.messageHandlerModel.container.querySelector(".msg-item-container");
    Utils.EventUtil.addHandler(ulContainer, "mouseenter", namespace.messageHandlerModel.displayElementScrollHandlerModel.enterHandler);
    Utils.EventUtil.addHandler(ulContainer, "mouseleave", namespace.messageHandlerModel.displayElementScrollHandlerModel.leaveHandler);
  };
  namespace.messageHandlerModel.displayElementScrollHandlerModel.enterHandler = function(event){
    document.body.style.overflowY = "hidden";
  };
  namespace.messageHandlerModel.displayElementScrollHandlerModel.leaveHandler = function(event){
    document.body.style.overflowY = "auto";
  };
  namespace.messageHandlerModel.start = function(){
    //延迟加载此功能, 等待页面其他项"加载完毕"
    var timer = setTimeout(function(){
      Utils.ajaxModel.queryHandler("uacc", "GET", {operate: "allMessage"}, {sucCallback: namespace.messageHandlerModel.responseHandler});
      clearTimeout(timer);
    }, 1000);
  };
}(PublicNamespace));//右上角用户信息及mobile nav信息显示

//弹出框工厂应该重新设计,采用对象字面量的参数形式  需求,给出弹出关闭选项(函数)可进行关闭按钮绑定,暴露出表单控件(如果有)
function popupFactory2(){
  var popupModel, formEle, dialogFra, globalCloseClassName;
  function closePopup(event){
    if(event != undefined && event.target.className.indexOf(globalCloseClassName) < 0)
      return;
    Utils.classNameHandler.removeClass(popupModel, "popupShow");
    Utils.classNameHandler.removeClass(dialogFra, "dialog-show");
    document.body.style.overflowY = "auto";
  }
  function initPopup(htmlCode, closeBtnClassName, btnClickHandHandler){
    function initDom(){
      var fragmentEle = document.createElement("div");
      document.body.appendChild(fragmentEle);
      fragmentEle.innerHTML = htmlCode;
      popupModel = fragmentEle.firstElementChild;
      formEle = popupModel.querySelector("form");
      dialogFra = popupModel.firstElementChild;
    }
    function initEveLis(){
      if(closeBtnClassName){
        globalCloseClassName = closeBtnClassName;
        [].forEach.call(popupModel.parentNode.querySelectorAll("."+closeBtnClassName),function(ele){
          console.log(ele);
          Utils.EventUtil.addHandler(ele, "click", closePopup);
        });
        for(var key in btnClickHandHandler){
          if(btnClickHandHandler.hasOwnProperty(key)){
            var eles = popupModel.querySelectorAll(key);
            [].forEach.call(eles, function(ele){
              Utils.EventUtil.addHandler(ele, "click", btnClickHandHandler[key]);
            });
          }
        }
      }
    }

    initDom();
    initEveLis();
  }
  return {
    popup: function(){
      Utils.classNameHandler.addClass(popupModel, "popupShow");
      Utils.classNameHandler.addClass(dialogFra, "dialog-show");
      document.body.style.overflowY = "hidden";
    },
    init: function(htmlCode, closeBtnClassName, btnClickHandHandler){
      initPopup(htmlCode, closeBtnClassName, btnClickHandHandler);
      this.self = popupModel;
      this.form = formEle;
      this.self = popupModel;
    },
    closePopup: closePopup
  }
}



function popupFactory(){
  var popupModel, formEle, dialogFra, submitInfo;
  function closePopup(){
    Utils.classNameHandler.removeClass(popupModel, "popupShow");
    Utils.classNameHandler.removeClass(dialogFra, "dialog-show");
    document.body.style.overflowY = "auto";
  }
  //btnClickAndHandler: 只针对点击事件的按钮以及处理函数的绑定
  function initPupop(htmlCode, closeBtnsClassName, submitBtn){  //init the popup dom ele(single)
    function initDom(){
      var fragmentEle = document.createElement("div");
      document.body.appendChild(fragmentEle);
      fragmentEle.innerHTML = htmlCode;
      popupModel = fragmentEle.firstElementChild;
      formEle = popupModel.querySelector("form");
      dialogFra = popupModel.firstElementChild;
    }
    function formSubmit(){
      //by ajax

      //closePopup
      closePopup();
    }
    function initEveLis(){
      if(closeBtnsClassName){
        [].forEach.call(popupModel.parentNode.querySelectorAll(closeBtnsClassName),function(ele){
          console.log(ele);
          Utils.EventUtil.addHandler(ele, "click", closePopup);
        });
      }
      //reviewDialog层事件阻止传播
      Utils.EventUtil.addHandler(dialogFra, "click", function(event){
        event.stopPropagation();
      });

      //弹出层表单提交事件处理
      Utils.EventUtil.addHandler(popupModel.querySelector(submitBtn), "click", formSubmit);

      if(formEle && submitBtn){
        [].forEach.call(popupModel.parentNode.querySelectorAll(submitBtn),function(ele){
          //Utils.EventUtil.addHandler(ele, "click", closePopup);
        });
      }
    }
    initDom();
    initEveLis();

  }
  return {
    /*
     * @param1: the HTML code String
     * @param2: the close button class/id [String,String]
     * @param3: the init action value of form
     * */
    init: function(htmlCode, closeBtnsClassName, submitBtn){
      initPupop(htmlCode, closeBtnsClassName, submitBtn);
      this.self = popupModel;
    },
    setSubmitInfo: function(submitInfo){
      formEle.setAttribute("action",submitInfo);
    },
    secTitle: function(title){
      popupModel.querySelector(".prHeader").firstElementChild.innerHTML = title;
    },
    popup: function(){
      Utils.classNameHandler.addClass(popupModel, "popupShow");
      Utils.classNameHandler.addClass(dialogFra, "dialog-show");
      document.body.style.overflowY = "hidden";
    },
    self: popupModel
  }
}