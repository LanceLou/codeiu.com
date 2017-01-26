/**
 * Created by lance on 2016/11/13.
 */
var TaskStageNamespace = TaskStageNamespace || {};
(function (namespace, undefined){
  namespace.pageInit = namespace.pageInit || {};
  namespace.pageInit.data = null;
  namespace.pageInit.init = function(){
    Utils.ajaxModel.queryHandler("tcc?operate=allStage", "GET", {}, {"sucCallback": namespace.pageInit.responseHandler});
  };
  namespace.pageInit.responseHandler = function(responseText){
    var data = JSON.parse(responseText),
      i = 0;
    if(data[0].errorMsg == 1)
      document.forms[0].name.parentNode.previousElementSibling.lastElementChild.innerText = "必须先创建阶段，之后才能创建任务哦";
    namespace.pageInit.data = data;
  };
  namespace.formHandler = namespace.formHandler || {};
  namespace.formHandler.editor = new Simditor({
    textarea: $('#task-describe-editor')
  });
  namespace.formHandler.verify = function(){
    var forms = document.forms[0],
      data = namespace.pageInit.data,
      i = 0,
      value,
      result = true;
      errorMsg = "";
    [].forEach.call(forms, function(ele){
      switch (ele.name) {
        case "name":
          if (ele.value.trim() === "") {
            errorMsg = "阶段名字不能为空!";
            result = false;
          }
          if (data && !data[0].errorKey){
            for(i = 0; i < data.length; i++){
              if(data[i].name === ele.value){
                errorMsg = "阶段名字已存在";
                result = false;
                break;
              }
            }
          }
          ele.parentNode.previousElementSibling.lastElementChild.innerText = errorMsg;
          errorMsg = "";
          break;
        case "desciption":
          if (ele.value.trim() === ""){
            errorMsg = "描述不能为空!";
            result = false;
          }
          ele.parentNode.parentNode.parentNode.previousElementSibling.lastElementChild.innerText = errorMsg;
          errorMsg = "";
      }
    });
    return result;
  };
  namespace.formHandler.formUploadHandler = function(event){
    event.preventDefault();
    if (namespace.formHandler.verify()){
      document.forms[0].submit();
    }
  };
}(TaskStageNamespace));
function init(){
  PublicNamespace.userInfoNavInitModel.init();
  TaskStageNamespace.pageInit.init();
  Utils.EventUtil.addHandler(document.forms[0], "submit", TaskStageNamespace.formHandler.formUploadHandler);
}
init();