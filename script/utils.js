/**
 * Created by lance on 16/8/9.
 */
//project utils use model(class)
Object.keys = Object.keys?Object.keys:function(o){
  if(typeof o !== "object") throw TypeError();
  var result = [];
  for (var prop in 0){
    if(o.hasOwnProperty(prop))
      result.push(prop);
  }
  return result;
};
var Utils = {};
Utils.EventUtil = {
  addHandler: function (element, type, handler, /* optional */isCatch) {
    //加工事件捕获机制
    isCatch = isCatch ? isCatch : false;
    if(element.addEventListener){
      element.addEventListener(type,handler,isCatch);
    }else if(element.attachEvent){
      if (isCatch){
        elementToDrag.setCapture();
      }
      element.attachEvent("on"+type, handler);
    }
  },
  removeHandler: function (element,type,handler) {
    if (element.removeEventListener) {
      element.removeEventListener(type,handler,false);
    }else if (element.detachEvent) {
      element.detachEvent("on"+type,handler);
    }
  }
};
Utils.TypeCheck = {
  isHtmlElement: function(ele){
    return {}.toString.call(ele).indexOf("object") >= 0 && {}.toString.call(ele).indexOf("HTML") > 0 &&
      {}.toString.call(ele).indexOf("Element") > 0;
  }
};
Utils.classNameHandler = {
  addClass: function(ele, className){
    //console.log({}.toString.call(ele));
    //if (Object.toString.call(ele));
    //防重复添加
    if (ele.className.indexOf(className) >= 0)
      return;
    ele.className = ele.className.length>0? ele.className+" "+className : className;
  },
  replaceClass: function(ele, oldClassName, newClassName){
    ele.className = ele.className.replace(oldClassName, newClassName);
  },
  removeClass: function(ele, className){
    className = ele.className.indexOf(className) > 0 ? " "+className : className;
    ele.className = ele.className.replace(className, "");
  },
  contains: function(ele, className){
    return ele.className.indexOf(className) >= 0;
  }
};
//表单验证控件
Utils.FormVerificationModel = (function(){
  function phoneVerify(value){
    return /^1[34578][0-9]{9}$/.test(value);
  }
  function emailVerify(value){
    return /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,5}$/.test(value);
  }
  function stuNoVerify(value){
    return /^[1-2](\d){11}$/.test(value);
  }
  return{
    verify: function(ele, value){
      var type = ele.getAttribute("name");
      value = value ? value : ele.value;
      //经历综合筛选

      //经历分支筛选
      switch(type){  //第二版本添加密码的验证
        case "email":
          return emailVerify(value);
          break;
        case "phone":
          return phoneVerify(value);
          break;
        case "stuNo":
          return stuNoVerify(value);
      }
      return true;
    }
  }
}());
/*构建ajax处理函数,传参数
* @param1: url String
* @param2: method String
* @param3: handler Object{}   eg: ["sucCallback":"", "timeoutCallback": "","errorCallBack": ""];
*
* */
Utils.ajaxModel = (function(){
  var responseListener = null;
  var responseFilter = null;
  function addUrlParams(url, params){
    if(Object.keys(params).length === 0)
      return url;
    url += (url.indexOf("?") === -1 ? "?":"&");
    for(var k in params){
      url += encodeURIComponent(k) + "=" + encodeURIComponent(params[k]);
      url += "&";
    }
    return url.slice(0, url.length-1);
  }
  function defaultResponseFilter(responseText, handlerObj){ //返回非JSON类数据
    try {
      JSON.parse(responseText);
    }catch(e){
      if(handlerObj && handlerObj.errorCallBack)
        handlerObj.errorCallBack();
      return false;
    }
    return true;
  }
  //handlerObj 中应包含成功处理函数  超时函数
  function queryHandler(partUrl, method, params, handlerObj, /* optional */mainUrl){
    var request = new XMLHttpRequest();
    var timeOut = false;
    mainUrl = mainUrl?mainUrl:"http://127.0.0.1:8080/codeiu/";
    var timer = setTimeout(function(){
      timeOut = true;
      request.abort();
      if (handlerObj.timeoutCallback)
        handlerObj.timeoutCallback();
    }, 10000);
    request.open(method, addUrlParams(mainUrl+partUrl, params), true);
    if(method === "POST")
      request.setRequestHeader("Content-Type", "application/x-www-form-urlencode");
    request.onreadystatechange = function(){
      if (request.readyState !== 4) return;
      if (timeOut) return;
      clearTimeout(timer);
      if(request.status === 200){
        var responseText = request.responseText;
        if ((responseFilter && responseFilter()) || defaultResponseFilter(responseText, handlerObj)){   //Filter success
          responseListener ? responseListener(responseText):null;   //Listener
          handlerObj.sucCallback(responseText);
        }
      }
    };
    request.send(null);
  }
  function setResponseListener(func){
    responseListener = func;
  }
  return {
    queryHandler: queryHandler,
    setResponseListener: setResponseListener
  }
})();
/*
* 有个问题,就是formSerialize返回的结果无法与queryHandler的请求参数部分的参数合作,这和可以进行适当的解决
* */
Utils.formSerialize = function(form){
  var parts = [],
    field = null,
    i,
    len,
    j,
    optLen,
    option,
    optValue;
  for(i = 0, len = form.elements.length; i < len; i++){
    field = form.elements[i];

    switch (field.type){
      case "select-one":
      case "select-multiple":
        if(field.name.length){
          for (j = 0, optLen = field.options.length; j < optLen; j++){
            option = field.options[j];
            if(option.selected){
              optValue = "";
              if(option.hasAttribute){
                optValue = (option.hasAttribute("value") ? option.value : option.text);
              }else{
                optValue = (option.attributes["value"].specified ? option.value : option.text);   // for ie
              }
              parts.push(encodeURIComponent(field.name)+"="+encodeURIComponent(optValue));
            }
          }
        }
        break;
      case undefined:
      case "file":
      case "submit":
      case "reset":
      case "button":
        break;
      case "radio":
      case "checkbox":
        if(!field.checked)
          break;
      default:
        if(field.name.length){ //field without name will not upload
          parts.push(encodeURIComponent(field.name)+"="+encodeURIComponent(field.value));
        }
    }
  }
  return parts.join("&");
};
Utils.Json2Dom = (function(){
  function inputFill(input, value){
    var i,
      j;
    switch (input.type){
      case "radio":
        if(!input.length && value === input.value){
          input.checked = "checked";
          break;
        }
        for(i = 0; i < input.length; i++){
          if(value === input[i].value){
            input[i].checked = "checked";
            break;
          }
        }
        break;
      case "checkbox":
        if (Object.prototype.toString.call(value).indexOf("Array") < 0)
          throw new Error("checkbox value require a Array");
        if(!input.length && !value[0] && value[0] === input.value){
          input.checked = "checked";
          break;
        }
        for(i = 0; i < input.length; i++){
          for(j = 0; j < value.length; j++)
            if(value === input[i].value)
              input[i].checked = "checked";
        }
        break;
      case "text":
        input.value = value;
        if(value.trim() !== ""){
          input.placeholder = "";
        }
        break;
      default:
        console.log("unFill input type:"+input.type);
    }
  }
  function selectFill(select, value){
    var options = select.options,
      i,
      j;
    if(select.multiple){
      if(!value.length)
        throw new TypeError("multiple select value require a Array type");
      for (i = 0; i < options.length; i++){
        for(j = 0; j < value.length; j++)
          if(options.value == value[i])
            options[i].selected = "selected";
      }
    }else{
      for (i = 0; i < options.length; i++)
        if(value == options[i].value) {
          options[i].selected = "selected";
          break;
        }
    }
  }
  function json2Form(data, form, filter){
    var formEle = null,
      tagName;
    for(var name in data){
      if(data.hasOwnProperty(name) && form[name]){
        formEle = form[name];
        tagName = formEle.length?formEle[0].tagName:formEle.tagName;
        switch (formEle.tagName){
          case "INPUT":
            inputFill(formEle, data[name]);
            break;
          case "SELECT":
            selectFill(formEle, data[name]);
            break;
          case "TEXTAREA":
            formEle.value = data[name];
            break;
          default:
            console.log("unFill form element: " + tagName);
        }
      }
    }
  }

  //当数据元素需要分组(li)显示时
  function fillAsLis(eleContainer, dataArray){
    var li = null,
      i = 0,
      fragment = document.createDocumentFragment();
    for(;i < dataArray.length; i++){
      li = document.createElement("li");
      li.innerHTML = dataArray[i];
      fragment.appendChild(li);
    }
    eleContainer.appendChild(fragment);
  }

  //数据元素直接显示
  function fillAsInnerHtml(eleContainer, str){
    eleContainer.innerHTML = str;
  }

  //填充规则: 可给出容器(container), 根据 className=j2d-dataKey 寻找匹配的项
  //                    如找出多项,则依次填充   若对应数据符合seperate规则,创建li元素一项一项包含在填充给容器
  //                    seperate: data值分割符, 处理需要li填充的场景 默认作数组处理
  //                    filter函数,对于不需要填充的键(key) 返回false 同时工具给予key 和 data 以及 container参数填充,方便调用者进行相关操作
  function jsonToElements(container, data, /* optional */seperater, /* optional */filter){
    var dataItem = null,
      targetContainerEles = null,
      key = null,
      value = "",
      j = "";

    //params check
    if(Object.prototype.toString.call(container).indexOf("Element") < 0){
      throw Error("param container need a HtmlElement");
      return;
    }

    //loop the data
    for(key in data){
      if(filter && !filter(key, data, container))
        continue;
      targetContainerEles = container.querySelectorAll(".j2d-"+key);
      if (targetContainerEles == null || !targetContainerEles.length)
        continue;
      value = data[key];

      //处理多htmlEle元素的时候(默认所有都当做多元素处理)
      for(j = 0; j < targetContainerEles.length; j++){
        if(seperater){  //is give seperater
          if(value.indexOf(seperater) > 0)
            fillAsLis(targetContainerEles[j], value.split(seperater));
          else
            fillAsInnerHtml(targetContainerEles[j], value);
        }else{
          if(Object.prototype.toString.call(value).indexOf("Array") >= 0)
            fillAsLis(targetContainerEles[j], value);
          else
            fillAsInnerHtml(targetContainerEles[j], value);
        }
      }
    }
  }


  /**
   * @param1: table[Element] the container of the data
   * @param2: data[[]Array][Array] the data will been filled with sequence
   * @param3: filter[Function] escape the data item will not fill
   * **/
  function jsonToTableRow(table, data, /* optional */filter){
    var dataItem = null,
      tr = null,
      td = null,
      fragment = document.createDocumentFragment(),
      i = 0,
      j = 0;
    for(;i < data.length; i++){
      dataItem = data[i];
      tr = document.createElement("tr");
      for(j = 0; j < dataItem.length; j++){
        if(filter && !filter(dataItem))
          continue;
        td = document.createElement("td");
        td.innerHTML = dataItem[j];
        tr.appendChild(td);
      }
      fragment.appendChild(tr);
    }
    table.appendChild(fragment);
  }
  return {
    json2Form: json2Form,
    jsonToElements: jsonToElements,
    jsonToTableRow: jsonToTableRow
  }
}());