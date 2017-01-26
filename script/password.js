/**
 * Created by lance on 2016/12/5.
 */
var PasswordNameSpace = PasswordNameSpace || {};
(function (namespace, undefined){
  namespace.inVerify = function(form){
    var formEle = null,
      labelEle = null,
      flag = true;
    for(var i in form){
      if(!form[i] || form[i].tagName !== "INPUT" || !form[i].name) //null or tagName not input or element's name attribute is ""
        continue;
      formEle = form[i];
      labelEle = formEle.previousElementSibling;
      labelEle?labelEle.setAttribute("data-error", ""):null;
      if(formEle.value.trim() === ""){
        labelEle?labelEle.setAttribute("data-error", labelEle.getAttribute("data-name")+"不能为空"):null;
        flag = false;
        continue;
      }
      if(!Utils.FormVerificationModel.verify(formEle, formEle.value)){
        labelEle?labelEle.setAttribute("data-error", labelEle.getAttribute("data-name")+"格式不对"):null;
        flag = false;
        continue;
      }
      if(formEle.name === "password" && formEle.value.length < 9){
        labelEle?labelEle.setAttribute("data-error", "密码过短"):null;
        flag = false;
        continue;
      }
      if(formEle.name === "passwordR" && formEle.value !== form.password.value){
        labelEle?labelEle.setAttribute("data-error", "两次密码不一致"):null;
        flag = false;
      }
    }
    return flag;
  };
  namespace.mainContainer = document.querySelector(".main-container");
  namespace.navConatiner = document.querySelector(".top-nav");
  namespace.nextStep = function(){
    var curStep = namespace.navConatiner.querySelector(".cur-item");
    if(!curStep.nextElementSibling)
      return;
    Utils.classNameHandler.removeClass(curStep, "cur-item");
    Utils.classNameHandler.addClass(curStep.nextElementSibling, "cur-item");
  };
  namespace.prevStep = function(){
    var curStep = namespace.navConatiner.querySelector(".cur-item");
    if(!curStep.previousElementSibling)
      return;
    Utils.classNameHandler.removeClass(curStep, "cur-item");
    Utils.classNameHandler.addClass(curStep.previousElementSibling, "cur-item");
  };
  namespace.verifyStepModel = namespace.verifyStepModel || {};
  namespace.verifyStepModel.isSended = false;
  namespace.verifyStepModel.form = document.querySelector("#verifyModel").firstElementChild;
  namespace.verifyStepModel.btn = namespace.verifyStepModel.form.querySelector("a");
  namespace.verifyStepModel.init = function(){
    Utils.EventUtil.addHandler(namespace.verifyStepModel.btn, "click", namespace.verifyStepModel.clickRequestHandler);
    Utils.EventUtil.addHandler(namespace.verifyStepModel.form, "submit", namespace.verifyStepModel.submitActionHandler);
  };
  //handler after the response of ajax(request send the email code)
  namespace.verifyStepModel.requestResultHandler = function(responseText){
    var data = JSON.parse(responseText);
    if(data.errorKey == "1"){   //success
      namespace.verifyStepModel.btn.innerHTML = "添加成功";
      namespace.verifyStepModel.isSended = true;
      return;
    }
    if(data.errorMsg == "3"){  //邮件对应用户不存在
      namespace.verifyStepModel.form.email.previousElementSibling.setAttribute("data-error", "邮箱未注册!!!");
    }
    Utils.EventUtil.addHandler(namespace.verifyStepModel.form, "submit", namespace.verifyStepModel.submitActionHandler);
  };
  //handler of the click of code mail send
  namespace.verifyStepModel.clickRequestHandler = function(event){
    var mailFormEle = namespace.verifyStepModel.form.email;
    if(mailFormEle.value.trim() === "" || !Utils.FormVerificationModel.verify(mailFormEle, mailFormEle.value)){
      mailFormEle.previousElementSibling.setAttribute("data-error", "邮箱格式不对");
      return;
    }
    Utils.ajaxModel.queryHandler("PFH?operate=pf&"+Utils.formSerialize(namespace.verifyStepModel.form), "GET", {}, {sucCallback: namespace.verifyStepModel.requestResultHandler});
    Utils.EventUtil.removeHandler(namespace.verifyStepModel.btn, "click", namespace.verifyStepModel.clickRequestHandler); //防重复点击
  };
  //handler of the next step action
  namespace.verifyStepModel.submitActionHandler = function(event){
    event.preventDefault();
    if(!namespace.verifyStepModel.isSended){
      namespace.verifyStepModel.form.email.previousElementSibling.setAttribute("data-error", "邮件还未发送");
      return;
    }
    if(namespace.inVerify(event.target)) {
      namespace.resetStepModel.form.email.value = namespace.verifyStepModel.form.email.value;
      namespace.resetStepModel.form.code.value = namespace.verifyStepModel.form.vc.value;
      namespace.mainContainer.id = "resetModelStep";
      namespace.nextStep();
    }
  };


  //http://127.0.0.1:8080/codeiu/PFH?operate=pc&email=lc1456666@outlook.com&code=8667&password=666666666
  namespace.resetStepModel = namespace.resetStepModel || {};
  namespace.resetStepModel.form = document.querySelector("#resetModel").firstElementChild;
  namespace.resetStepModel.init = function(){
    Utils.EventUtil.addHandler(namespace.resetStepModel.form, "submit", namespace.resetStepModel.submitActionHandler);
    Utils.EventUtil.addHandler(namespace.resetStepModel.form.querySelector("#prevStep"), "click", function(event){  //prev step btn
      namespace.resetStepModel.form.password.previousElementSibling.setAttribute("data-error", ""); //clear the error report
      namespace.mainContainer.id = "verifyModelStep";
      namespace.prevStep();
    });
  };
  //form submit action handler
  namespace.resetStepModel.submitActionHandler = function(event){
    event.preventDefault();
    if(namespace.inVerify(event.target)){
      Utils.ajaxModel.queryHandler("PFH?operate=pc&"+Utils.formSerialize(event.target), "GET", {}, {sucCallback: namespace.resetStepModel.requestResultHandler});
    }
  };
  //handler after the response of ajax
  namespace.resetStepModel.requestResultHandler = function(responseText){
    var data = JSON.parse(responseText),
      form = namespace.resetStepModel.form;
    if(data.errorKey == "1"){
      namespace.mainContainer.id = "successModelStep";
      namespace.nextStep();
      return;
    }
    if(data.errorMsg == "4"){  //no password change request
      form.password.previousElementSibling.setAttribute("data-error", "未进行密码修改申请");
      form.id = "prev";
    }
    if(data.errorMsg == "5"){  //code wrong
      form.password.previousElementSibling.setAttribute("data-error", "验证码错误");
      form.id = "prev";
    }
  };


  namespace.successModel = namespace.successModel || {};
  namespace.successModel.init = function(){
    Utils.EventUtil.addHandler(document.querySelector("#changeSuc"), "click", function(event){
      window.location.href = "/codeiu/PageJump?page=login";
    });
  };


  namespace.init = function(){
    namespace.verifyStepModel.init();
    namespace.resetStepModel.init();
    namespace.successModel.init();
  }
}(PasswordNameSpace));

PasswordNameSpace.init();
