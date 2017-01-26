/**
 * Created by lance on 2016/11/15.
 */
var LoginNameSpace = LoginNameSpace || {};
(function(namespace, undefined){
  namespace.formModel = namespace.formModel || {};
  namespace.formModel.form = document.forms[0];
  namespace.formModel.formCheck = function(){
    console.log("OK");
    var lForm = namespace.formModel.form,
      name,
      ele = null,
      label = null,
      errorMsg = "";
    result = true;
    for (name in lForm){
      ele = lForm[name];
      if (!lForm.hasOwnProperty(name) || !ele || ele.type !== "text" && ele.type !== "password")
        continue;
      errorMsg = "";
      if (ele.value.trim() === ""){
        result = false;
        errorMsg = "不能为空";
      }else if (!Utils.FormVerificationModel.verify(ele, ele.value)) {
        result = false;
        errorMsg = "格式不正确";
      }
      label = ele.previousElementSibling;
      if (errorMsg)
        label.setAttribute("data-error", label.getAttribute("data-error-name")+""+errorMsg);
      else
        label.setAttribute("data-error", "");
    }
    console.log(result);
    return result;
  };
  namespace.formModel.responseHandler = function(responseText){
    var data = JSON.parse(responseText),
      label = namespace.formModel.form["vc"],
      targetLink = document.querySelector("#loginedTargetPage").value;
    targetLink = targetLink?targetLink:"/codeiu";
    if(data.status === 1){
      window.location.href = targetLink;
    }else{
      namespace.formModel.responseErrorStatusHandler(data.status);
    }
  };
  namespace.formModel.responseErrorStatusHandler = function(status){
    var localForm = namespace.formModel.form,
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
      localForm.email.previousElementSibling.setAttribute("data-error",emailErrorMsg);
    if(passwordErrorMsg !== "")
      localForm.password.previousElementSibling.setAttribute("data-error", passwordErrorMsg);
    if(vcErrorMsg !== "")
      localForm.vc.previousElementSibling.setAttribute("data-error", vcErrorMsg);
  };
  namespace.formModel.formSubmitHandler = function(event){
    event.preventDefault();
    if (namespace.formModel.formCheck()) {
      var requestParam = Utils.formSerialize(namespace.formModel.form);
      console.log(requestParam);
      Utils.ajaxModel.queryHandler("uacc?operate=login&"+requestParam, "POST", {}, {sucCallback: namespace.formModel.responseHandler});
    }

  };
  namespace.formModel.init = function(){
    Utils.EventUtil.addHandler(namespace.formModel.form, "submit", namespace.formModel.formSubmitHandler);
  };
  namespace.verifyCodeModel = namespace.verifyCodeModel || {};
  namespace.verifyCodeModel.clickHandler = function(event){
    var target = event.target;
    setTimeout(function(){
      target.setAttribute("src", "/codeiu/VerificationCode?param="+Math.random());
    },10);
  };
  namespace.verifyCodeModel.init = function(){
    var vfImage = document.querySelector("#vf-code");
    Utils.EventUtil.addHandler(vfImage, "click", namespace.verifyCodeModel.clickHandler);
  };
}(LoginNameSpace));
function init(){
  LoginNameSpace.formModel.init();
  LoginNameSpace.verifyCodeModel.init();
}
init();