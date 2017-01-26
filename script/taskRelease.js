/**
 * Created by lance on 2016/9/29.
 */
var formControlHandlerModel = (function(){
  var mainWrapper = document.querySelector("#main-container");
  function addANormalIn(target, basicInfo){
    var fragment = document.createDocumentFragment(),
      input = document.createElement("input"),
      label = document.createElement("label"),
      num = parseInt(target.getAttribute("data-curNum"));
    num++;
    input.type = "text";
    input.name = basicInfo+"-"+num;
    fragment.appendChild(document.createElement("br"));
    fragment.appendChild(label);
    fragment.appendChild(input);
    target.setAttribute("data-curNum", num);
    target.parentNode.insertBefore(fragment, target);
    input.focus();
  }
  function addALinkIn(target, basicInfo){
    var fragment = document.createDocumentFragment(),
      nameInput = document.createElement("input"),
      linkInput = document.createElement("input"),
      label = document.createElement("label"),
      num = parseInt(target.getAttribute("data-curNum"));
    num++;
    nameInput.type = "text";
    nameInput.name = basicInfo + "-" + num;
    nameInput.placeholder = "链接文字";
    linkInput.type = "text";
    linkInput.name = "";
    linkInput.placeholder = "链接地址";
    fragment.appendChild(document.createElement("br"));
    fragment.appendChild(label);
    fragment.appendChild(nameInput);
    fragment.appendChild(linkInput);
    target.setAttribute("data-curNum", num);
    target.parentNode.insertBefore(fragment, target);
    nameInput.focus();
  }
  function clickHandler(event){
    console.log("OK");
    var target = event.target;
    if (target.tagName !== "A")
      return;
    var taskBasicInfo = target.parentNode.getAttribute("data-basicInfo");
    if(taskBasicInfo === "task-referInfo-name")
      addALinkIn(target, taskBasicInfo);
    else
      addANormalIn(target, taskBasicInfo);
  }
  function initEventLis(){
    Utils.EventUtil.addHandler(mainWrapper, "click", clickHandler);
  }
  return {
    init: function(){
      initEventLis();
    }
  }
}());
var formContentUpdateModel = (function(){
  var form = document.querySelector("form"),
    taskName = null; //for check
  function formCheck(){
    var flag = true,
      isErrorPartScrollTo = false;
    [].forEach.call(form, function(ele){
      if (!ele.id.includes("task-") || ele.tagName === "SELECT" || ele.tagName === "TEXTAREA")
        return;
      var targetInName,
        text = ele.parentNode.previousElementSibling.lastElementChild.innerText;
      //截止日期选择表单元素
      /*
       ele.parentNode.previousElementSibling.lastElementChild.innerText = "不能为空"
       */

      if(ele.id === "task-deadline"){
        if (ele.value !== "" && ele.value.split("-").length === 1){
          console.log(ele.value.split("-"));
          ele.parentNode.previousElementSibling.lastElementChild.innerText = "截止日期不能小于当前日期";
          isErrorPartScrollTo?null:window.location.href = "#" + ele.parentNode.previousElementSibling.id;
          isErrorPartScrollTo = true;
          flag = false;
          return;
        }else{
          ele.parentNode.previousElementSibling.lastElementChild.innerText = text.replace("截止日期不能小于当前日期","");
        }
      }
      targetInName = ele.previousElementSibling.innerText;
      if (Utils.classNameHandler.contains(ele.parentNode,"referLink"))
        targetInName = "参考链接";
      if (ele.value === ""){
        ele.parentNode.previousElementSibling.lastElementChild.innerText = targetInName.slice(0,4) + "不能为空!";
        isErrorPartScrollTo?null:window.location.href = "#" + ele.parentNode.previousElementSibling.id;
        isErrorPartScrollTo = true;
        flag = false;
      }else
        ele.parentNode.previousElementSibling.lastElementChild.innerText = text.replace(targetInName.slice(0,4) + "不能为空!","");
    });
    return flag;
  }
  function clearLastConstruct(){
    var name = "";
    [].forEach.call(form, function(ele){
      name = "";
      if (ele.name.indexOf("task-") >= 0){
        if (ele.name.indexOf("task-referInfo-name") >= 0) {
          name = "referInfo";
        }else
          name = ele.name.split("-")[1];
        form[name].value = "";
      }
    });
  }
  function forReConstructor(){
    clearLastConstruct();
    var name,
      value;
    [].forEach.call(form, function(ele){
      name = "";
      value = "";
      if (ele.name.indexOf("task-") >= 0){
        ele.disabled = "disabled";
        if (ele.name.indexOf("task-referInfo-name") >= 0) {
          name = "referInfo";
          value = "<a href='" + ele.nextElementSibling.value + "'>" + ele.value + "</a>";
        }else{
          name = ele.name.split("-")[1];
          value = ele.value;
        }
      }
      if (name && value)
        form[name].value = form[name].value ? form[name].value + "|||" + value : value;
    });
  }
  function taskCheckRequestHandler(responseText){
    var data = JSON.parse(responseText);
    if(data && "length" in data){  //the response data is correct
      taskName = data;
      var nameCheckR = taskNameExistCheck();
      if(formCheck() && taskNameExistCheck()) {
        forReConstructor();
        form.submit();
      }
    }
  }
  function taskNameExistCheck(){
    var curName = form.name.value,
      exitNames = taskName;
    console.log(exitNames);
    form.name.parentNode.previousElementSibling.lastElementChild.innerText = form.name.parentNode.previousElementSibling.lastElementChild.innerText.replace("此任务名在您的历史任务中已存在", "");
    if(("$$"+(exitNames.join("$$"))+"$$").indexOf("$$"+curName+"$$") >= 0){  //the name has exist
      form.name.parentNode.previousElementSibling.lastElementChild.innerText = "此任务名在您的历史任务中已存在";
      window.location.href = "#" + form.name.parentNode.previousElementSibling.id;
      return false;
    }
    return true;
  }
  //for task name exist check and handler
  function beforeSubmitHandler(event){
    event.preventDefault();
    if (formCheck() && taskName && taskNameExistCheck()){
      forReConstructor();
      event.target.submit();
    }else
      Utils.ajaxModel.queryHandler("tcc?operate=allTaskTitle", "GET", {}, {sucCallback: taskCheckRequestHandler});
  }
  function initEveLis(){
    Utils.EventUtil.addHandler(form, "submit", beforeSubmitHandler);
  }
  return {
    init: function(){
      initEveLis();
    }
  }
}());
var formCalendarInModel = (function(){
  var dateIn = document.querySelector("#task-deadline");
  //第二个位可选的强制值 可选
  function displayOrDisappear(ele, value) {
    console.log("get");
    if (!value) {
      if (ele.style.display === "block" || !ele.style.display) {
        value = "none";
      }else{
        value = "block";
      }
    }
    ele.style.display = value;
  }
  //数据过滤函数 可选
  /**
   * param date {} year,month,day all can selected
   */
  function dataFilter(date) {
    var curDate = new Date();
    if (date.year && date.month) {
      if (date.year < curDate.getFullYear()){
        return false;
      }
      if (date.year === curDate.getFullYear() && date.month < (curDate.getMonth()+1)){
        return false;
      }
      if (date.day && date.month === (curDate.getMonth()+1) && date.day < curDate.getDate()){
        return false;
      }
    }
    return true;
  }
  //错误输入回调函数
  function errorCallBack(){
    dateIn.value = "截止日期小于当前日期";
  }
  return {
    init: function(){
      var wrapper = document.querySelector(".calenderWrapper");
      var calenderCtr = document.querySelector("#calenderControl");
      console.log(dataFilter.errorCallBack);
      var calender = new CalendarModule(dateIn, dataFilter, errorCallBack, function () {
        console.log("callBack Func");
      });
      calender.dom.style.display = "none";
      calender.insertBefore(wrapper);
      calenderCtr.addEventListener("click",function (event) {
        console.log(event.target);
        displayOrDisappear(calender.dom);
      });
      dateIn.addEventListener("focus",function (event) {
        displayOrDisappear(calender.dom, "block");
      });
    }
  }
}());
var pageInit = pageInit || {};
(function (namespace, undefined){
  namespace.initStage = namespace.initStage || {};
  namespace.initStage.init = function(){
    Utils.ajaxModel.queryHandler("tcc?operate=allStage", "GET", {}, {"sucCallback": namespace.initStage.responseHandler});
  };
  namespace.initStage.responseHandler = function(responseText){
    var data = JSON.parse(responseText),
      select = document.forms[0].stage,
      i = 0,
      listKV = {},
      key,
      option;
    if(data[0].errorMsg == 1)
      window.location = "PageJump?page=taskStageCreate";
    for(i = 0; i < data.length; i++){
      listKV[data[i].id] = data[i].name;
    }
    for(key in listKV){
      option = document.createElement("option");
      option.value = key;
      option.innerText = listKV[key];
      select.appendChild(option);
    }
  };
  namespace.formSCheckModel = namespace.formSCheckModel || {};
  namespace.formSCheckModel.titles = null;
  namespace.formSCheckModel.responseHandler = function(responseText){
    var titles = JSON.parse(responseText);
    //if(titles.)
  };
  namespace.formSCheckModel.init = function(){

  };
}(pageInit));
function init(){
  PublicNamespace.userInfoNavInitModel.init();
  PublicNamespace.unloginedHandlerModel.init();
  pageInit.initStage.init();
  formCalendarInModel.init();
  formControlHandlerModel.init();
  formContentUpdateModel.init();
}
init();