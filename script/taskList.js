/**
 * Created by lance on 2016/12/6.
 */

var TaskListNamespace = TaskListNamespace || {};
(function(namespace, undefined){
  namespace.startLoading = function(){
    document.body.id = "totalPageLoading";
    document.body.style.overflowY = "hidden";
  };
  namespace.endLoading = function(){
    document.body.id = "";
    document.body.style.overflowY = "auto";
  };
  namespace.dataDisplayInitModel = namespace.dataDisplayInitModel || {};
  namespace.dataDisplayInitModel.init = function(){
    namespace.startLoading();
    var userData = PublicNamespace.userInfoNavInitModel.data;
    if(userData.kind == "1"){
      Utils.ajaxModel.queryHandler("tcc", "GET", {operate: "getTutorAllTask"}, {sucCallback: namespace.dataDisplayInitModel.requestResultHandler});
    }else{
      Utils.ajaxModel.queryHandler("tcc", "GET", {operate: "getUserAllTask"}, {sucCallback: namespace.dataDisplayInitModel.requestResultHandler});
    }
  };
  namespace.dataDisplayInitModel.noTaskReleasedHandler = function(){ //no taskReleased handler
    document.querySelector(".mainWrapper").id = "noTask";
    namespace.endLoading();
  };
  namespace.dataDisplayInitModel.requestResultHandler = function(responseText){
    var data = JSON.parse(responseText);
    if(data.errorMsg == "1"){
      namespace.dataDisplayInitModel.noTaskReleasedHandler();
      return;
    }
    if(data.length === 0){
      namespace.dataDisplayInitModel.noTaskReleasedHandler();
    }
    var formatData = namespace.dataDisplayInitModel.dataProcessor(data);
    namespace.dataDisplayInitModel.display(formatData);
  };
  //from format [{},{}] to {stage1: [], stage2: []}
  namespace.dataDisplayInitModel.dataProcessor = function(data){
    namespace.dataDisplayInitModel.sortByCutoffTime(data);
    var formatDate = {},
      item = null,
      time = 0;
    for(var i in data){
      item = data[i];
      time = new Date(item.stageReleaseDate).getTime()+"";
      if(!formatDate.hasOwnProperty(time)){
        formatDate[time] = [];
      }
      formatDate[time].push(item);
    }
    return formatDate;
  };
  namespace.dataDisplayInitModel.sortByCutoffTime = function(data){
    if(!data.length)
      return;
    data.sort(function(item1, item2){
      var time1 = new Date(item1.cutoffDate).getTime();
      var time2 = new Date(item2.cutoffDate).getTime();
      return time1 - time2;
    });
  };
  namespace.dataDisplayInitModel.display = function(data){
    var headerL3 = null,
      stageWrapper = null,
      taskWrapper = null,
      taskData = null,
      task = null,
      container = document.querySelector(".mainWrapper");
    for(var i in data){  //loop stage
      headerL3 = document.createElement("div");
      headerL3.className = "header-l3  col-md-12 col-sm-12";
      headerL3.innerHTML = "<a href=\"/codeiu/PageJump?page=stageDetails&id="+data[i][0].stageId+"\">"+data[i][0].stageName+"概要说明（请仔细阅读）</a>";
      stageWrapper = document.createElement("section");
      stageWrapper.className = "stage-wrapper col-md-12 col-sm-12";
      for(var j = 0; j < data[i].length; j++){
        taskData = data[i][j];
        task = document.createElement("div");
        task.className = "task";
        task.innerHTML = "<h3 class=\"task-title\"><a href=\"/codeiu/PageJump?page=taskDetails&id="+taskData.id+"\">"+taskData.name+"</a></h3>"+
          "            <div class=\"task-attr\">"+
          "                <div class=\"task-attr-left\">"+
          "                    难度: <i>"+(taskData.diff=="1"?"简单":taskData.diff=="2"?"中等":"困难")+"</i> <br/>"+
          "                    发布时间: <i>"+taskData.releaseDate.slice(5,10)+"</i>"+
          "                </div>"+
          "                <div class=\"task-attr-right\">"+
          "                    <i>"+taskData.submitNum+"</i> 提交任务 <br/>"+
          "                    截止日期: <i>"+taskData.cutoffDate.slice(5,10)+" 23:59</i>"+
          "                </div>"+
          "            </div>";
        stageWrapper.appendChild(task);
      }
      container.appendChild(headerL3);
      container.appendChild(stageWrapper);
    }
    namespace.endLoading();
  };

}(TaskListNamespace));
PublicNamespace.userInfoNavInitModel.init(TaskListNamespace.dataDisplayInitModel.init);