/**
 * Created by lance on 2016/9/23.
 */


var TaskDetailsNamespace = TaskDetailsNamespace || {};
(function(namespace, undefined){
  namespace.taskId = 0;
  namespace.isExceed = false;
  namespace.startPageLoading = function(){
    document.body.id = "totalPageLoading";
    document.body.style.overflowY = "hidden";
  };
  namespace.endPageLoading = function(){
    document.body.id = "";
    document.body.style.overflowY = "auto";
  };
  namespace.startElementLoading = function(ele){
    Utils.classNameHandler.addClass(ele, "block-loading-animate");
  };
  namespace.endElementLoading = function(ele){
    Utils.classNameHandler.removeClass(ele, "block-loading-animate");
  };
  namespace.taskMainInfoDisplayModel = namespace.taskMainInfoDisplayModel || {};
  namespace.taskMainInfoDisplayModel.init = function(){
    if(!namespace.taskMainInfoDisplayModel.getTaskIdFromUrl()){
      window.location.href = "/codeiu/PageJump?page=404page";
    }
    Utils.ajaxModel.queryHandler("tcc", "GET", {operate: "getTaskBasicInfo", id: namespace.taskId}, {sucCallback: namespace.taskMainInfoDisplayModel.requestResultHandler});
  };
  namespace.taskMainInfoDisplayModel.getTaskIdFromUrl = function(){
    var searchParams = window.location.search.split("&")[1];
    if (searchParams == null)
      return false;
    namespace.taskId = searchParams.slice(searchParams.lastIndexOf("=")+1, searchParams.length);
    return true;
  };
  namespace.taskMainInfoDisplayModel.requestResultHandler = function(responseText){
    var data = JSON.parse(responseText);
    if (data.errorKey == "0"){
      document.querySelector(".conatiner").innerHTML = "";
      return;
    }
    if(data.name){
      namespace.taskMainInfoDisplayModel.isExceedCheck(data);   //check today is pass than cutOffTime
    }
    if(namespace.taskMainInfoDisplayModel.dataProcessor(data)) {
      namespace.taskMainInfoDisplayModel.taskBasicDataDisplay(data);

      //end page loading
      namespace.endPageLoading();

      //start init top10model and submitedDisplayModel
      namespace.top10TaskSubmitDisplayModel.init();
      namespace.taskSubmitedDisplayModel.init();
    }
  };

  //process the data from server and check the correct of data{correct: return true, error: return false}
  namespace.taskMainInfoDisplayModel.dataProcessor = function(data){
    //check correct
    if(!data.name){
      return false;
    }

    //cutOffTime releaseTime taskLevel
    data.cutOffTime = data.cutOffTime.slice(5)+" 23:59";
    data.releaseTime = data.releaseTime.slice(5);
    data.taskLevel = data.taskLevel=="1"?"简单":data.taskLevel=="2"?"中等":"困难";
    return true;
  };
  namespace.taskMainInfoDisplayModel.taskBasicDataDisplay = function(data){
    Utils.Json2Dom.jsonToElements(document.body, data, "|||", namespace.taskMainInfoDisplayModel.j2dFilter);
    if(namespace.isExceed){
      var em = document.createElement("em");
      em.innerText = "【已经结束】";
      document.querySelector("h2.header-l2").appendChild(em)
    }
    namespace.taskMainInfoDisplayModel.taskOperateBtnDisplay(data);
  };
  namespace.taskMainInfoDisplayModel.j2dFilter = function(key){
    if("id-stageId".indexOf(key) >= 0)
      return false;
    return true;
  };
  namespace.taskMainInfoDisplayModel.isExceedCheck = function(data){
    if(new Date(data.cutOffTime) < new Date()){
      namespace.isExceed = true;
    }
  };
  namespace.taskMainInfoDisplayModel.taskOperateBtnDisplay = function(data){
    var uk = PublicNamespace.userInfoNavInitModel.data.kind,
      btns = document.querySelectorAll(".taskOperate");
    if(uk == "1"){
      btns[0].parentNode.removeChild(btns[0]);
      btns[1].parentNode.removeChild(btns[1]);
    }else{
      if (data.submitId == "0"){
        if(namespace.isExceed){ //if the task is pass the cutoffTime and the team submit nothing about this task -> nothing to operate about this task
          btns[0].parentNode.removeChild(btns[0]);
          btns[1].parentNode.removeChild(btns[1]);
        }else{
          btns[0].innerText = btns[1].innerText = "提交任务";
          btns[0].href = btns[1].href = "javascript: void(0)";
          //---开启提交事件监听
          namespace.taskSubmitModel.init(btns);

        }
      }else{
        btns[0].innerText = btns[1].innerText = "查看review";
        btns[0].href = btns[1].href = "/codeiu/PageJump?page=codeReview&id="+data.submitId;
      }
    }
  };

  namespace.taskSubmitModel = namespace.taskSubmitModel || {};
  namespace.taskSubmitModel.popupObject = null;
  namespace.taskSubmitModel.descripContent = "";
  namespace.taskSubmitModel.init = function(btns){
    for(var i = 0; i < btns.length; i++)
      Utils.EventUtil.addHandler(btns[i], "click", namespace.taskSubmitModel.btnClickHandler);
  };
  namespace.taskSubmitModel.btnClickHandler = function(){ //for event lis remove
    var innerHtml = "",
      popupModel = null,
      timer = null;
    if(!namespace.taskSubmitModel.popupObject) {
      namespace.taskSubmitModel.popupObject = popupFactory();
      innerHtml = '<section class="popupReview click-close-pr">'+
        '        <!-- dialog-show -->'+
        '        <div class="reviewDialog">'+
        '            <div class="prHeader"><span>提交任务 review</span>'+
        '                <button class="close-popup click-close-pr">×</button>'+
        '            </div>'+
        '            <div class="prContent">'+
        '                <form action="/codeiu/tcc" method="post">'+
        '                    <input type="hidden" name="operate" value="taskSubmit">'+
        '                    <input type="hidden" name="task_id" value="'+namespace.taskId+'">'+
        '                    <label for="" data-error="">源码地址:</label><input type="text" placeholder="请输入源码存放地址" name="gitUrl"><br>'+
        '                    <label for="" data-error="">demo地址:</label><input type="text" placeholder="请输入demo地址" name="demoUrl"><br>'+
        '                    <label for="" data-error="">描述:</label><textarea name="desc" id="submit-desc" cols="auto" rows="6" placeholder="描述一下你的这次任务吧"></textarea>'+
        '                </form>'+
        '            </div>'+
        '            <div class="prBtns">'+
        '                <a href="javascript:void (0)" class="btn cancel click-close-pr">取消</a>'+
        '                <a href="javascript:void (0)" class="btn reset-pr">重置</a>'+
        '                <a href="javascript:void (0)" class="btn submit-pr">提交</a>'+
        '            </div>'+
        '        </div>'+
        '    </section>';
      popupModel = namespace.taskSubmitModel.popupObject = popupFactory2();
      popupModel.init(innerHtml, "click-close-pr", {".reset-pr": namespace.taskSubmitModel.inReset, ".submit-pr": namespace.taskSubmitModel.submitHandler});
      timer = setTimeout(function(){
        popupModel.popup();
        clearTimeout(timer);
      }, 100);
    }else{
      namespace.taskSubmitModel.popupObject.popup();
    }
  };
  namespace.taskSubmitModel.clearDataErrorShow = function(){
    var form = namespace.taskSubmitModel.popupObject.form;
    form["gitUrl"].previousElementSibling.setAttribute("data-error", "");
    form["demoUrl"].previousElementSibling.setAttribute("data-error", "");
    form["desc"].previousElementSibling.setAttribute("data-error", "");
  };
  namespace.taskSubmitModel.inReset = function(){
    namespace.taskSubmitModel.clearDataErrorShow();
    namespace.taskSubmitModel.popupObject.form.reset();
  };
  namespace.taskSubmitModel.formInVerify = function(form){
    var flag = true,
      form = namespace.taskSubmitModel.popupObject.form,
      name = "";
    namespace.taskSubmitModel.clearDataErrorShow();
    for(name in form){
      if(form[name] && ((form[name].tagName === "INPUT" && form[name].type == "text") || form[name].tagName === "TEXTAREA")){
        if(form[name].value.trim() === ""){
          form[name].previousElementSibling.setAttribute("data-error", "不能为空");
          flag = false;
          continue;
        }
        if(form[name].tagName === "INPUT" && form[name].type == "text"){
          if(!/^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?$/.test(form[name].value)){ //判断是否符合URL格式
            form[name].previousElementSibling.setAttribute("data-error", "格式错误");
            flag = false;
          }
        }
      }
    }
    if(flag) {
      form.desc.value = form.desc.value.replace(/\n/g, "</p><p>");
      form.desc.value = "<p>" + form.desc.value + "<\p>";
      form.submit();
    }
  };

  //提交之后还是刷新一下当前页面  (便于个显示组件之间的同步)
  namespace.taskSubmitModel.submitHandler = function(){
    //check user is online?
    Utils.ajaxModel.queryHandler("heartbeat", "GET", {}, {sucCallback: function(responseText){
      var res = JSON.parse(responseText);
      if(res.errorKey == "1"){
        namespace.taskSubmitModel.formInVerify();
      }
    }});
  };

  //update the pageStatus after submit the task (for taskOperate)
  namespace.taskSubmitModel.pageStatusTrans = function(){

  };

  namespace.top10TaskSubmitDisplayModel = namespace.top10TaskSubmitDisplayModel || {}; //init the part of the top10 taskSubmit
  namespace.top10TaskSubmitDisplayModel.table = document.querySelector("#task-group-rank");
  namespace.top10TaskSubmitDisplayModel.init = function(){
    namespace.startElementLoading(namespace.top10TaskSubmitDisplayModel.table);
    Utils.ajaxModel.queryHandler("tcc", "GET", {operate: "getTaskTop10Submit", id: namespace.taskId}, {sucCallback: namespace.top10TaskSubmitDisplayModel.responseHandler});
  };
  namespace.top10TaskSubmitDisplayModel.responseHandler = function(responseText){
    var data = JSON.parse(responseText);
    if (Object.prototype.toString.call(data).indexOf("Array") >= 0)
      namespace.top10TaskSubmitDisplayModel.dataProcessorAndDisplay(data);
  };
  namespace.top10TaskSubmitDisplayModel.dataProcessorAndDisplay = function(data){
    var arrayData = [],
      arrayDataItem = [],
      i = 0;
    for(; i < data.length && i < 10; i++){
      arrayDataItem = [];
      arrayDataItem.push(i+1+"");
      arrayDataItem.push("<a href='/codeiu/PageJump?page=teamInfo&id="+data[i].teamId+"'>"+data[i].teamName+"</a>");
      arrayDataItem.push(""+data[i].grade);
      arrayDataItem.push("<a href='/codeiu/PageJump?page=codeReview&id="+data[i].taskSubmitId+"' class='btn'>查看评价</a>");
      arrayData.push(arrayDataItem);
    }
    Utils.Json2Dom.jsonToTableRow(namespace.top10TaskSubmitDisplayModel.table, arrayData, null);
    namespace.endElementLoading(namespace.top10TaskSubmitDisplayModel.table);
  };

  namespace.taskSubmitedDisplayModel = namespace.taskSubmitedDisplayModel || {}; //init the part of all taskSubmit display
  namespace.taskSubmitedDisplayModel.table = document.querySelector("table.pushed-group");
  namespace.taskSubmitedDisplayModel.init = function(){
    namespace.startElementLoading(namespace.taskSubmitedDisplayModel.table);
    namespace.taskSubmitedDisplayModel.initDataWithPageRequest();
  };
  namespace.taskSubmitedDisplayModel.initDataWithPageRequest = function(pagenum){
    Utils.ajaxModel.queryHandler("tcc", "GET", {operate: "getAllTaskSubmit", id: namespace.taskId, pagenum: pagenum?pagenum:1}, {sucCallback: namespace.taskSubmitedDisplayModel.responseHandler});
  };
  namespace.taskSubmitedDisplayModel.responseHandler = function(responseText){
    var data = JSON.parse(responseText);
    if (Object.prototype.toString.call(data.record).indexOf("Array") >= 0 && data.record.length > 0){
      namespace.taskSubmitedDisplayModel.dataProcessorAndDisplay(data.record);
      document.querySelector("#taskSubmitHeader-num").innerText = data.totalrecord;
      namespace.taskSubmitedDisplayModel.pageDivideMode.totalPageNum = data.totalPage;
      namespace.taskSubmitedDisplayModel.pageDivideMode.curPageNum = data.pagenum;
      namespace.taskSubmitedDisplayModel.pageDivideMode.init(data.startPage, data.pagenum, data.endPage);
    }
    namespace.endElementLoading(namespace.taskSubmitedDisplayModel.table);
  };
  namespace.taskSubmitedDisplayModel.dataProcessorAndDisplay = function(data){
    var dataArray = [],
      dataArrayItem = [],
      i = 0;
    for(; i< data.length; i++){
      dataArrayItem = [];
      dataArrayItem.push("<a href='/codeiu/PageJump?page=codeReview&id="+data[i].taskSubmitId+"' class='btn'>点击按钮进行评价</a>");
      dataArrayItem.push(data[i].teamName+"(<a href='/codeiu/PageJump?page=teamInfo&id="+data[i].teamId+"'>团队详情</a>)");
      dataArrayItem.push(data[i].submitTime.slice(5));
      dataArrayItem.push(data[i].grade+"");
      dataArray.push(dataArrayItem);
    }
    namespace.taskSubmitedDisplayModel.table.innerHTML = "<tr><th></th> <th class='team-info'>提交团队</th> <th>提交时间</th> <th>得分</th></tr>";
    Utils.Json2Dom.jsonToTableRow(namespace.taskSubmitedDisplayModel.table, dataArray, null);
  };
  namespace.taskSubmitedDisplayModel.pageDivideMode = namespace.taskSubmitedDisplayModel.pageDivideMode || {};
  namespace.taskSubmitedDisplayModel.pageDivideMode.container = document.querySelector("#pageNavWrapper-container").firstElementChild;
  namespace.taskSubmitedDisplayModel.pageDivideMode.totalPageNum = 0;
  namespace.taskSubmitedDisplayModel.pageDivideMode.curPageNum = 0;
  namespace.taskSubmitedDisplayModel.pageDivideMode.init = function(startPage, curPage, endPage){
    var i = startPage,
      container = namespace.taskSubmitedDisplayModel.pageDivideMode.container,
      li = null,
      a = null;
    container.innerHTML = "<li><a href='javascript: void(0);' class='prev-page'>«</a></li><li><a href='javascript: void(0);' class='next-page'>»</a></li>";
    //no record from db
    if(endPage === 0){
      namespace.taskSubmitedDisplayModel.pageDivideMode.container.id = "pageNavWrapper-noPage";
      return;
    }

    //only one record from db
    if(endPage === startPage){
      namespace.taskSubmitedDisplayModel.pageDivideMode.container.id = "pageNavWrapper-onePage";
      li = document.createElement("li");
      li.innerHTML = "<a href='javascript: void(0);' data-pageNum = '1'>1</a>";
      container.insertBefore(li, container.lastElementChild);
      return;
    }
    //pageNum bigger than 1
    for(;i <= endPage; i++){
      li = document.createElement("li");
      if(curPage === i){
        li.className = "curPageNum";
        li.innerHTML = "<a href='javascript: void(0);' data-pageNum = '"+curPage+"'>"+curPage+"</a>";
      }else{
        li.innerHTML = "<a href='javascript: void(0);' data-pageNum = '"+i+"'>"+i+"</a>";
      }
      container.insertBefore(li, container.lastElementChild);
    }
    Utils.EventUtil.addHandler(container, "click", namespace.taskSubmitedDisplayModel.pageDivideMode.clickHandler);
  };
  namespace.taskSubmitedDisplayModel.pageDivideMode.clickHandler = function(event){
    var target = event.target,
      targetPagenum = 0,
      curPage = namespace.taskSubmitedDisplayModel.pageDivideMode.curPageNum;
    if(target.tagName !== "A"){
      return;
    }
    if(target.className === "prev-page"){
      targetPagenum = curPage - 1;
    }else if(target.className === "next-page"){
      targetPagenum = curPage + 1;
    }else{
      targetPagenum = target.getAttribute("data-pagenum");
    }

    //targetPagenum verify
    if(targetPagenum > namespace.taskSubmitedDisplayModel.pageDivideMode.totalPageNum || targetPagenum === 0 || targetPagenum === curPage){
      return;
    }
    namespace.taskSubmitedDisplayModel.initDataWithPageRequest(targetPagenum);
  };


}(TaskDetailsNamespace));
PublicNamespace.userInfoNavInitModel.init(TaskDetailsNamespace.taskMainInfoDisplayModel.init);
PublicNamespace.unloginedHandlerModel.init();