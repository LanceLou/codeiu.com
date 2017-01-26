/**
 * Created by lance on 2016/9/24.
 */

var UserInfoNamespace = UserInfoNamespace || {};

(function(namespace, undefined){
  function getDataByAjax(partUrl, method, params, callbackFunc, mainUrl){
    Utils.ajaxModel.queryHandler(partUrl, method, params, callbackFunc, mainUrl);
  }
  namespace.uId = null;
  namespace.pageInitModel = namespace.pageInitModel || {};
  namespace.pageInitModel.initBannerUserInfo = function(){
    console.log(PublicNamespace.userInfoNavInitModel.data);
    var banner = document.querySelector("div.info-show"),
      data = PublicNamespace.userInfoNavInitModel.data,
      imgC = banner.querySelector("div.user-avatar"),
      nameC = banner.querySelector("h2"),
      aWordIntro = banner.querySelector("h4"),
      icon = data.logUrl?data.logUrl:"http://ww1.sinaimg.cn/large/ad5d774bjw1f9nzbaii0yj203k03kmx0.jpg";
    console.log(icon);
    imgC.style.backgroundImage = "url('" + icon + "')";
    nameC.innerText = data.name?data.name:nameC.innerText;
    aWordIntro.innerText = data.aWordIntro?data.aWordIntro:aWordIntro.innerText;
    document.querySelector("#uploadPreview").src = icon;
    if(data.kind == 0){
      var navA = document.querySelector("#tutor-anchor"),
        tutSet = document.querySelector("#tut-set"),
        tutForStuList = document.querySelector("#tutForStuList");
      navA.parentNode.removeChild(navA);
      tutSet.parentNode.removeChild(tutSet);
      tutForStuList.parentNode.removeChild(tutForStuList);
    }
    if(data.kind == 1)
      namespace.infoChangeModel.teamModel.viewByStatusIsTutor();
    UserInfoNamespace.pageInitModel.initTeamView();
  };
  namespace.pageInitModel.selectOptionsFill = function(data){
    var i,
      j,
      selectName,
      select,
      optionsDatas,   //all options data in a options
      fragment,  //options fragment[documentFragment]
      optionV,
      form = document.forms[0];
    data = data[0];
    for(selectName in data){
      fragment = document.createDocumentFragment();
      select = form[selectName];
      optionsDatas = data[selectName];
      if(selectName === "university")
        optionV = "no";
      else
        optionV = "id";
      for(i = 0; i < optionsDatas.length; i++){
        var option = document.createElement("option");
        option.value = optionsDatas[i][optionV];
        option.innerText = optionsDatas[i].name;
        fragment.appendChild(option);
      }
      select.appendChild(fragment);
    }
  };
  namespace.pageInitModel.userDetailRequestHandler = function(responseText){
    if(!responseText)  //responseText in null
      return;
    var data = JSON.parse(responseText),
      i;
    //if(dat)
    namespace.infoChangeModel.oldData = data;
    if(data.tId === 2){
      data.teamName = "";
    }
    Utils.Json2Dom.json2Form(data, document.forms[0]);
    var selects = document.forms[0].querySelector("select");
    for(i = 0; i < selects.length; i++){
      selects.setAttribute("data-defaultIndex", selects.value);
    }
  };
  namespace.pageInitModel.pageSelectElementsInitHandler = function(responseText){
    if(!responseText)
      return;
    var data = JSON.parse(responseText);
    namespace.pageInitModel.selectOptionsFill(data);
    getDataByAjax("uacc?operate=userInfoDetail", "get", {}, {sucCallback: namespace.pageInitModel.userDetailRequestHandler});
  };
  namespace.pageInitModel.initFormValues = function(){
    getDataByAjax("uacc?operate=infoPageAllSelectOptions", "get", {}, {sucCallback: namespace.pageInitModel.pageSelectElementsInitHandler});
  };
  namespace.pageInitModel.initTeamView = function(){
    var data = PublicNamespace.userInfoNavInitModel.data;
    if (data.tutor_id === 0)
      namespace.infoChangeModel.teamModel.viewByStatusNoTutor();
    else if(data.tId === 0)
      namespace.infoChangeModel.teamModel.viewByStatusUnJoin();
    else if (data.tId === 1)
      namespace.infoChangeModel.teamModel.viewByStatusRequestNoResponse();
    else if (data.tId === 2)
      namespace.infoChangeModel.teamModel.viewByStatusRequestRefused();
    else
      namespace.infoChangeModel.teamModel.viewByStatusJoined();
  };
  namespace.infoChangeModel = namespace.infoChangeModel || {};
  namespace.infoChangeModel.oldData = null;
  namespace.infoChangeModel.editImply = document.querySelector(".editImply");
  namespace.infoChangeModel.timerN = null;

  namespace.infoChangeModel.fileUploadHandler = namespace.infoChangeModel.fileUploadHandler || {};
  namespace.infoChangeModel.fileUploadHandler.progressBar = document.querySelector("#progress-bar");
  namespace.infoChangeModel.fileUploadHandler.progressNumC = namespace.infoChangeModel.fileUploadHandler.progressBar.querySelector("i");
  namespace.infoChangeModel.fileUploadHandler.lockSpan = document.querySelector(".avatar-up");
  namespace.infoChangeModel.fileUploadHandler.FilesAdded = function(up, files){
    //设置预览:
    document.querySelector("#uploadPreview").src = window.URL.createObjectURL(files[0].getSource().getSource());
  };
  namespace.infoChangeModel.fileUploadHandler.UploadProgress = function(up, file){
    var percent = file.percent + "%",
      lockSpan = namespace.infoChangeModel.fileUploadHandler.lockSpan;
    //lock operate area
    if(!Utils.classNameHandler.contains(lockSpan, "lock"))
      Utils.classNameHandler.addClass(lockSpan, "lock");
    namespace.infoChangeModel.fileUploadHandler.progressBar.style.width = percent;
    namespace.infoChangeModel.fileUploadHandler.progressNumC.innerText = percent;
  };
  namespace.infoChangeModel.fileUploadHandler.FileUploaded = function(up, file, info){
    var domain = up.getOption('domain'),
      res = JSON.parse(info),
      sourceLink = domain + "/" +res.key,
      lockSpan = namespace.infoChangeModel.fileUploadHandler.lockSpan;
    console.log(sourceLink);
    //update database data
    namespace.infoChangeModel.uploadEdit("logUrl", sourceLink, {sucCallback: function(responseText){
      //notice
      var data = JSON.parse(responseText);
      if(data.status === "1")
        namespace.infoChangeModel.Notify("头像更新成功");
      else
        namespace.infoChangeModel.Notify("与数据服务器通信失败","error");
    },timeoutCallback: function(){
      namespace.infoChangeModel.Notify("网络异常","error");
    }});
    //end animation and mask
    if(Utils.classNameHandler.contains(lockSpan, "lock"))
      Utils.classNameHandler.removeClass(lockSpan, "lock");
  };
  namespace.infoChangeModel.fileUploadHandler.Error = function(up, err, errTip){
    namespace.infoChangeModel.Notify(errTip, "error");
  };
  namespace.infoChangeModel.teamModel = namespace.infoChangeModel.teamModel || {};
  namespace.infoChangeModel.teamModel.container = document.querySelector(".team-join-create");
  namespace.infoChangeModel.teamModel.viewByStatusUnJoin = function(){
    Utils.classNameHandler.addClass(namespace.infoChangeModel.teamModel.container.parentNode, "no-team");
  };
  namespace.infoChangeModel.teamModel.viewByStatusJoined = function(){
    var container = namespace.infoChangeModel.teamModel.container;
    Utils.classNameHandler.removeClass(container.parentNode, "no-team");
    container.nextElementSibling.firstElementChild.href = container.nextElementSibling.firstElementChild.href + PublicNamespace.userInfoNavInitModel.data.tId;
    container.nextElementSibling.firstElementChild.innerText = PublicNamespace.userInfoNavInitModel.data.teamName;
    Utils.classNameHandler.addClass(container.parentNode, "in-team");
  };
  namespace.infoChangeModel.teamModel.viewByStatusNoTutor = function(){
    var container = namespace.infoChangeModel.teamModel.container;
    Utils.classNameHandler.addClass(container, "join-for-answer");
    container.lastElementChild.innerHTML = "请先选择导师,再创建或加入团队";
  };
  namespace.infoChangeModel.teamModel.viewByStatusRequestNoResponse = function(){
    var container = namespace.infoChangeModel.teamModel.container;
    Utils.classNameHandler.addClass(container, "join-for-answer");
    container.lastElementChild.innerHTML = "您的消息已发送给目标团队成员";
  };
  namespace.infoChangeModel.teamModel.viewByStatusRequestRefused = function(){
    var container = namespace.infoChangeModel.teamModel.container;
    Utils.classNameHandler.addClass(namespace.infoChangeModel.teamModel.container.parentNode, "no-team");
    container.lastElementChild.innerHTML = "您的请求已被对方团队成员拒绝,请重新操作!";
  };
  namespace.infoChangeModel.teamModel.viewByStatusIsTutor = function(){
    var li = namespace.infoChangeModel.teamModel.container.parentNode;
    if(li)
      li.parentNode.removeChild(li);
  };

  namespace.infoChangeModel.teamModel.teamCreateInit = function(){
    var container = namespace.infoChangeModel.teamModel.container,
      input = container.firstElementChild;
    container.parentNode.id = "no-team-create";
    input.setAttribute("placeholder", "请输入团队名, 回车完成创建");
    input.focus();
    Utils.EventUtil.addHandler(input, "keyup", function(event){
      if(event.keyCode === 13 && input.value.trim().length !== 0){
        namespace.infoChangeModel.teamModel.teamCreateRequest(input.value);
      }
    });
    Utils.EventUtil.addHandler(input, "blur", function(event){
      container.parentNode.id = "";
    });
  };
  namespace.infoChangeModel.teamModel.teamCreateRequest = function(teamName){
    Utils.ajaxModel.queryHandler("uacc", "GET", {operate: "teamCreate", "name": teamName}, {sucCallback: function(responseText){
      var data = JSON.parse(responseText);
      if(data.errorKey !== undefined && data.errorMsg === "1"){
        namespace.infoChangeModel.teamModel.teamNameHasExistHandler();
        return;
      }
      namespace.infoChangeModel.teamModel.createSuccessHandler(data);
    }});
  };
  namespace.infoChangeModel.teamModel.teamNameHasExistHandler = function(){
    var container = namespace.infoChangeModel.teamModel.container;
    namespace.infoChangeModel.Notify("团队名已存在,请另选!!!","error");
    container.lastElementChild.innerText = "团队名已存在,请另选!!!";
  };

  namespace.infoChangeModel.teamModel.createSuccessHandler = function(teamInfo){ //创建团队成功,更改为有团队的状态,并提示创建成功
    namespace.infoChangeModel.teamModel.viewByStatusJoined();
    var container = namespace.infoChangeModel.teamModel.container;
    container.lastElementChild.innerText = "";
    container.nextElementSibling.firstElementChild.href = "/codeiu/PageJump?page=teamInfo&id="+teamInfo.id;
    container.nextElementSibling.firstElementChild.innerText = teamInfo.name;
    namespace.infoChangeModel.Notify("团队创建成功!!!");
  };

  //blur search for team join-----------
  namespace.infoChangeModel.teamModel.teamJoinModel = namespace.infoChangeModel.teamModel.teamJoinModel || {};
  namespace.infoChangeModel.teamModel.teamJoinModel.popupObject = null;
  namespace.infoChangeModel.teamModel.teamJoinModel.noticeP = null;
  namespace.infoChangeModel.teamModel.teamJoinModel.curTeamEle = null; //当前选中团队显示块
  namespace.infoChangeModel.teamModel.teamJoinModel.searchResultContainer = null;
  namespace.infoChangeModel.teamModel.teamJoinModel.eventLisInit = function() {   //负责管理整个弹出框的事件初始化
    var container = namespace.infoChangeModel.teamModel.teamJoinModel.popupObject.self.firstElementChild;
    Utils.EventUtil.addHandler(container, "click", namespace.infoChangeModel.teamModel.teamJoinModel.clickEventHandlerInPopup);
    Utils.EventUtil.addHandler(container.querySelector("#teamSearchIn"), "keyup", function(event){
      if(event.keyCode === 13 && event.target.value.trim() !== ""){
        namespace.infoChangeModel.teamModel.teamJoinModel.startTeamBlurSearchInPopup(event.target.value);
      }
    });
  };
  namespace.infoChangeModel.teamModel.teamJoinModel.clickEventHandlerInPopup = function(event){
    var target = event.target,
      value = "",
      noticeC = namespace.infoChangeModel.teamModel.teamJoinModel.noticeP,
      curTeamEle = namespace.infoChangeModel.teamModel.teamJoinModel.curTeamEle;
    if(target.className === "searchTeamBtn" || target.parentNode.className === "searchTeamBtn"){
      value = target.previousElementSibling?target.previousElementSibling.value:target.parentNode.previousElementSibling.value;
      if(value.trim() !== ""){
        namespace.infoChangeModel.teamModel.teamJoinModel.startTeamBlurSearchInPopup(value);
      }
    }
    if (target.tagName === "LI" && target.getAttribute("data-teamId") !== null && curTeamEle !== target){
      if(curTeamEle !== null)
        Utils.classNameHandler.removeClass(curTeamEle, "selected");
      namespace.infoChangeModel.teamModel.teamJoinModel.curTeamEle = target;
      Utils.classNameHandler.addClass(target, "selected");
      noticeC.innerHTML = "已选团队: " + target.getAttribute("data-name");
    }
    if (target.tagName === "P" && target.parentNode.tagName === "LI" && curTeamEle !== target.parentNode){
      if(curTeamEle !== null)
        Utils.classNameHandler.removeClass(curTeamEle, "selected");
      namespace.infoChangeModel.teamModel.teamJoinModel.curTeamEle = target.parentNode;
      Utils.classNameHandler.addClass(target.parentNode, "selected");
      noticeC.innerHTML = "已选团队: " + target.parentNode.getAttribute("data-name");
    }
  };
  namespace.infoChangeModel.teamModel.teamJoinModel.startTeamBlurSearchInPopup = function(key){
    Utils.classNameHandler.addClass(namespace.infoChangeModel.teamModel.teamJoinModel.popupObject.self.querySelector(".resultTeamListContainer"), "block-loading-animate");
    Utils.ajaxModel.queryHandler("uacc", "GET", {operate: "teamSearch", "key": key}, {sucCallback: namespace.infoChangeModel.teamModel.teamJoinModel.teamBlurResearchResponseHandlerInPopup})
  };
  namespace.infoChangeModel.teamModel.teamJoinModel.teamBlurResearchResponseHandlerInPopup = function(responseText){
    var data = JSON.parse(responseText),
      timer = null;
    if(data.length !== "undefined") {
      timer = setTimeout(function () {
        namespace.infoChangeModel.teamModel.teamJoinModel.teamBlurResearchDisplayInPopup(data);
        clearTimeout(timer);
      }, 1000);
    }
  };
  namespace.infoChangeModel.teamModel.teamJoinModel.teamBlurResearchDisplayInPopup = function(data){
    var noticeC = namespace.infoChangeModel.teamModel.teamJoinModel.noticeP,
      container = namespace.infoChangeModel.teamModel.teamJoinModel.searchResultContainer,
      i = 0;
    namespace.infoChangeModel.teamModel.teamJoinModel.curTeamEle = null;
    Utils.classNameHandler.removeClass(namespace.infoChangeModel.teamModel.teamJoinModel.popupObject.self.querySelector(".resultTeamListContainer"), "block-loading-animate");
    noticeC.innerHTML = "";
    container.innerHTML = "";
    if(data.length === 0){
      noticeC.innerHTML = "无匹配结果";
      return;
    }
    for(i = 0; i < data.length; i++){
      var li = document.createElement("li");
      li.setAttribute("data-teamId", data[i].teamId);
      li.setAttribute("data-name", data[i].teamName);
      li.innerHTML = "<p>"+data[i].teamName+"</p> <p>团队成员: "+data[i].memberName.join(",")+"</p> <i></i>";
      container.appendChild(li);
    }
    noticeC.innerHTML = "请点击对应方块选择团队";
  };
  namespace.infoChangeModel.teamModel.teamJoinModel.cancelTeamJoinHandler = function(){

  };
  namespace.infoChangeModel.teamModel.teamJoinModel.teamJoinResponseHandler = function(responseText){
    var data = JSON.parse(responseText);
    if(data.errorKey === "1"){
      namespace.infoChangeModel.teamModel.viewByStatusRequestNoResponse();
      namespace.infoChangeModel.Notify("申请成功,请静等回复");
    }else{
      namespace.infoChangeModel.Notify("处理失败");
    }
    namespace.infoChangeModel.teamModel.teamJoinModel.popupObject.closePopup();
  };
  namespace.infoChangeModel.teamModel.teamJoinModel.teamJoinHandlerInPopup = function(){
    var noticeC = namespace.infoChangeModel.teamModel.teamJoinModel.noticeP,
      curTeamEle = namespace.infoChangeModel.teamModel.teamJoinModel.curTeamEle;
    if(curTeamEle === null){
      noticeC.innerHTML = "请先搜索团队且选中团队";
      return;
    }
    Utils.ajaxModel.queryHandler("uacc", "GET", {operate: "teamAddApplication", teamId: curTeamEle.getAttribute("data-teamid")}, {sucCallback: namespace.infoChangeModel.teamModel.teamJoinModel.teamJoinResponseHandler});
  };
  namespace.infoChangeModel.teamModel.teamJoinModel.initPopup = function(){
    var html = '<section class="popupReview click-close-pr"> ' +
      '<div class="reviewDialog"> ' +
      '<div class="prHeader"> 团队搜索 ' +
      '<button class="close-popup click-close-pr">×</button> ' +
      '</div> ' +
      '<!-- search-result-show: 当开启搜索时显示 --> ' +
      '<div class="prContent" id="search-result-show"> ' +
      '<input type="text" id="teamSearchIn" placeholder="请输入对方团队姓名"><a href="javascript: void(0)" class="searchTeamBtn"><i class="fa fa-search" aria-hidden="true"></i></a> ' +
      '<div class="resultTeamListContainer"> ' +
      '<ul> ' +
      '</ul> ' +
      '</div> ' +
      '</div> ' +
      '<div class="prBtns"> ' +
      '<p id="team-search-select-notice"></p> ' +
      '<a href="javascript:void (0)" class="btn cancel click-close-pr">取消</a> ' +
      '<a href="javascript:void (0)" class="btn submit-pr">加入</a></div> ' +
      '</div> ' +
      '</section>';
    var popupReviewModel = popupFactory2();
    namespace.infoChangeModel.teamModel.teamJoinModel.popupObject = popupReviewModel;
    popupReviewModel.init(html, "click-close-pr", {".submit-pr": namespace.infoChangeModel.teamModel.teamJoinModel.teamJoinHandlerInPopup});
    namespace.infoChangeModel.teamModel.teamJoinModel.searchResultContainer = popupReviewModel.self.querySelector(".resultTeamListContainer > ul");
    namespace.infoChangeModel.teamModel.teamJoinModel.noticeP = popupReviewModel.self.querySelector("#team-search-select-notice");
  };
  namespace.infoChangeModel.teamModel.teamJoinModel.teamJoinInit = function(){
    var popupObject = namespace.infoChangeModel.teamModel.teamJoinModel.popupObject,
      popEle = null,
      timer = null;
    if(popupObject === null){
      namespace.infoChangeModel.teamModel.teamJoinModel.initPopup();
      namespace.infoChangeModel.teamModel.teamJoinModel.eventLisInit();
      timer = setTimeout(function(){
        namespace.infoChangeModel.teamModel.teamJoinModel.popupObject.popup();
        clearTimeout(timer);
      }, 100);
    }else{
      popupObject = namespace.infoChangeModel.teamModel.teamJoinModel.popupObject;
      popEle = popupObject.self;
      popEle.querySelector("#teamSearchIn").value = "";
      popEle.querySelector(".resultTeamListContainer").firstElementChild.innerHTML = "";
      popEle.querySelector("#team-search-select-notice").innerHTML = "";
      popupObject.popup();
    }
  };
  //end blur search form team join


  namespace.infoChangeModel.Notify = function(msg, type){
    var li = document.createElement("li"),
      i = document.createElement("i");
    li.innerText = msg;
    i.innerText = "×";
    if (type === "error"){
      li.className = "error";
    }
    namespace.infoChangeModel.editImply.appendChild(li);
    var timer = setTimeout(function () {
      li.parentNode.removeChild(li);
    }, 5000);
  };
  namespace.infoChangeModel.loadingDisplayStart = function(){
    if(!Utils.classNameHandler.contains(document.body, "launching"))
      Utils.classNameHandler.addClass(document.body, "launching");
  };
  namespace.infoChangeModel.loadingDisplayEnd = function(){
    if(Utils.classNameHandler.contains(document.body, "launching"))
      Utils.classNameHandler.removeClass(document.body, "launching");
  };
  namespace.infoChangeModel.editVerify = function(formEle, value){
    var span = formEle.parentNode.nextElementSibling,
      result = true;
    if (value === formEle.getAttribute("placeholder") || "" === value || namespace.infoChangeModel.oldData[formEle.name] == value) {
      result = false;
      span.firstElementChild.innerText = "未修改或为空";
    } else if(Utils.FormVerificationModel.verify(formEle, value)){
      Utils.classNameHandler.removeClass(span,"error-in");
      result = true;
    }else{
      result = false;
    }
    if (!result)
      Utils.classNameHandler.addClass(span,"error-in");
    return result;
  };
  /**
   * @param1 target update target name
   * @param2 value value
   * @callback {success: func, timeout: func}
   * **/
  namespace.infoChangeModel.uploadEdit = function(updateTarget, value, callback){
    var kind = PublicNamespace.userInfoNavInitModel.data.kind;
    var operate = "stuUpdate";
    if(kind === 1)
      operate = "tutorUpdate";
    var params = {updateTarget: updateTarget, operate: operate};
    params[updateTarget] = value;
    getDataByAjax("uacc?", "POST", params, callback);
  };
  namespace.infoChangeModel.lockInput = function(input){
    var target = input.parentNode.parentNode;
    if(target.tagName === "LI" && !Utils.classNameHandler.contains(target, "lock")){
      Utils.classNameHandler.addClass(target, "lock");
      Utils.classNameHandler.removeClass(target, "unlock");
    }
  };
  namespace.infoChangeModel.unlockInput = function(input){
    var target = input.parentNode.parentNode;
    if(target.tagName === "LI" && !Utils.classNameHandler.contains(target, "unlock")){
      Utils.classNameHandler.addClass(target, "unlock");
      Utils.classNameHandler.removeClass(target, "lock");
    }
  };
  namespace.infoChangeModel.uploadHandler = function(target){
    var li = target.parentNode.parentNode,
      inputEle,
      value;
    inputEle = li.querySelector("input");
    inputEle = inputEle ? inputEle : li.querySelector("textarea");
    inputEle = inputEle ? inputEle : li.querySelector("select");
    value = inputEle.value;
    if(namespace.infoChangeModel.editVerify(inputEle, value)){
      //verify ok
      //start loading display and lock operate area
      namespace.infoChangeModel.loadingDisplayStart();
      namespace.infoChangeModel.lockInput(inputEle);
      namespace.infoChangeModel.uploadEdit(inputEle.name, value, {sucCallback: function(responseText){
        var data = JSON.parse(responseText);
        if(data.status === "1"){
          //edit success
          target.nextElementSibling.innerText = "编辑";
          Utils.classNameHandler.removeClass(target.nextElementSibling, "cancel-edit");
          Utils.classNameHandler.removeClass(target.parentNode.parentNode, "cur-edit");
          namespace.infoChangeModel.oldData[inputEle.name] = value;
          namespace.infoChangeModel.Notify(inputEle.parentNode.previousElementSibling.innerText + "修改成功");
        }else{
          var span = inputEle.parentNode.nextElementSibling;
          span.firstElementChild.innerText = "更新失败";
          Utils.classNameHandler.addClass(span,"error-in");
        }
        //停止进度条加载
        namespace.infoChangeModel.loadingDisplayEnd();
        namespace.infoChangeModel.unlockInput(inputEle);
      }, timeoutCallback: function (){
        namespace.infoChangeModel.Notify("网络异常","error");
        //stop loading
        namespace.infoChangeModel.loadingDisplayEnd();
        namespace.infoChangeModel.unlockInput(inputEle);
      }});
    }
  };
  namespace.infoChangeModel.startEditHandler = function(target){
    if(Utils.classNameHandler.contains(target.parentNode.parentNode,"cur-edit") || target.getAttribute("name") === "email")
      return;
    var tagName = target.tagName,
      li=target.parentNode.parentNode,
      cancelBtn;
    if (tagName === "INPUT" || tagName === "TEXTAREA"){
      cancelBtn = target.parentNode.nextElementSibling.lastElementChild;
    }else{
      cancelBtn = target;
    }
    cancelBtn.innerText = "取消";
    //分为input和textarea
    try {
      li.querySelector("input").focus();
    }catch(error){
      try {
        li.querySelector("textarea").focus();
      }catch(error2){
        li.querySelector("select").focus();
      }
    }
    //console.log(cancelBtn);
    Utils.classNameHandler.addClass(cancelBtn,"cancel-edit");
    Utils.classNameHandler.addClass(target.parentNode.parentNode,"cur-edit");
  };
  namespace.infoChangeModel.cancelEditHandler = function(target) {
    target.innerText = "编辑";
    var inEle = target.parentNode.previousElementSibling.firstElementChild,
      options;
    if (inEle.tagName === "INPUT" || inEle.tagName === "TEXTAREA"){
      inEle.value = namespace.infoChangeModel.oldData[inEle.name];
    }else{
      options = inEle.options;
      for(var i = 0; i < options.length; i++){
        if(options[i].value == namespace.infoChangeModel.oldData[inEle.name]){
          options[i].selected = "selected";
          break;
        }
      }
    }
    Utils.classNameHandler.removeClass(target, "cancel-edit");
    Utils.classNameHandler.removeClass(target.parentNode.parentNode, "cur-edit");
    Utils.classNameHandler.removeClass(target.parentNode,"error-in");
  };


  namespace.infoChangeModel.teamJoinHandler = function(target){
    namespace.infoChangeModel.teamModel.teamJoinModel.teamJoinInit();
  };
  namespace.infoChangeModel.teamCreateHandler = function(target){
    namespace.infoChangeModel.teamModel.teamCreateInit();
  };

  namespace.infoChangeModel.init = function(){
    var wrapper = document.querySelector(".info-details");
    var params = ImageUpload.constructParams("file-upload-btn", "fileUploadWrapper", {
      UploadProgress: namespace.infoChangeModel.fileUploadHandler.UploadProgress,
      FileUploaded: namespace.infoChangeModel.fileUploadHandler.FileUploaded,
      Error: namespace.infoChangeModel.fileUploadHandler.Error,
      FilesAdded: namespace.infoChangeModel.fileUploadHandler.FilesAdded
    });
    ImageUpload.init(params, wrapper.querySelector("#up_load"));
    Utils.EventUtil.addHandler(wrapper, "click", function(event){
      var target = event.target;
      var tagName = target.tagName;
      //不是目标
      if(tagName !== "INPUT" && tagName !== "A" && tagName !== "TEXTAREA")
        return;
      if(target.parentNode.tagName === "DIV")
        return;
      //如果是编辑btn
      if(target.innerText === "编辑" || tagName === "INPUT" || tagName === "TEXTAREA"){
        namespace.infoChangeModel.startEditHandler(target);
        return;
      }
      //如果是取消btn
      if (target.innerText === "取消"){
        namespace.infoChangeModel.cancelEditHandler(target);
        return;
      }
      //如果是保存btn
      if (target.innerText === "保存")
        namespace.infoChangeModel.uploadHandler(target);
      if(Utils.classNameHandler.contains(target, "t-create"))
        namespace.infoChangeModel.teamCreateHandler(target);
      if(Utils.classNameHandler.contains(target, "t-join"))
        namespace.infoChangeModel.teamJoinHandler(target);

      event.stopPropagation();
      if(target.id !== "toTeam")
        event.preventDefault();
    });
    Utils.EventUtil.addHandler(wrapper.querySelector("#file-uploader"),"change", function(event){
      fileUploadHandler(this.files[0]);
    });
  }

}(UserInfoNamespace));


function init(){
  PublicNamespace.userInfoNavInitModel.init(UserInfoNamespace.pageInitModel.initBannerUserInfo);
  PublicNamespace.unloginedHandlerModel.init();
  UserInfoNamespace.pageInitModel.initFormValues();
  UserInfoNamespace.infoChangeModel.init();
}
init();