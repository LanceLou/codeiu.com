/**
 * Created by lance on 16/9/20.
 */

//全部采用模块化替代, 下面各函数代码取消
var CodeReviewPageNamespace = CodeReviewPageNamespace || {};
(function(namespace, undefined){
  namespace.endPageLoading = function(){
    document.body.id = "";
    document.body.style.overflowY = "auto";
  };
  //cur basic message for page load ->
  namespace.curUserId = 0;
  namespace.userKind = 0;
  namespace.curTeamId = 0;
  namespace.curSubmitId = 0;
  namespace.curSubmitUser = 0;
  namespace.noticeC = document.querySelector("#noticeC");
  namespace.notice = function(msg){
    var timer = null;
    namespace.noticeC.innerHTML = "<p>"+ msg +"</p>";
    namespace.noticeC.parentNode.id = "topM-notice";
    timer = setTimeout(function(){
      namespace.noticeEnd();
      clearTimeout(timer);
    }, 3000);
  };
  namespace.noticeEnd = function(){
    namespace.noticeC.innerHTML = "";
    namespace.noticeC.parentNode.id = "";
  };
  namespace.init = function(){
    var tomer = null;
    namespace.pageBasicInfoModel.init();
    namespace.taskSubmitBasicInfoModel.init();
    namespace.commentModel.init();
    timer = setTimeout(function(){
      namespace.endPageLoading();
      clearTimeout(timer);
    }, 500);
  };
  namespace.pageBasicInfoModel = namespace.pageBasicInfoModel || {};
  namespace.pageBasicInfoModel.init = function(){
    var basicData = PublicNamespace.userInfoNavInitModel.data;
    var searchStr = window.location.search;
    namespace.userKind = basicData.kind;
    namespace.curTeamId = basicData.tId > 2 ? basicData.tId : 0;
    namespace.curUserId = basicData.id;
    namespace.curSubmitId = searchStr.slice(searchStr.lastIndexOf("id=")+3);
  };
  namespace.taskSubmitBasicInfoModel = namespace.taskSubmitBasicInfoModel || {};
  namespace.taskSubmitBasicInfoModel.init = function(){
    Utils.ajaxModel.queryHandler("tcc", "GET", {operate: "getTaskSubmitBasicInfo", id: namespace.curSubmitId}, {sucCallback: namespace.taskSubmitBasicInfoModel.requestHandler});
  };
  namespace.taskSubmitBasicInfoModel.requestHandler = function(responseText){
    var data = JSON.parse(responseText);
    namespace.taskSubmitBasicInfoModel.taskSubmitBasicInfoPrinter(data);
    namespace.reviewReleaseModel.init(data);
  };
  namespace.taskSubmitBasicInfoModel.dataPrinterFilterWithHrefFill = function(curKey, data, container){
    var haveToHandle = "toTaskDetail|teamName|stuName|gitUrl|demoUrl",
      ele = container.querySelector(".j2d-"+curKey);
    if (!ele || haveToHandle.indexOf(curKey) < 0)
      return true;
    if(curKey === "toTaskDetail"){
      ele.href = "http://127.0.0.1:8080/codeiu/PageJump?page=taskDetails&id="+data["task_id"];
    }
    if(curKey === "teamName"){
      ele.href = "http://127.0.0.1:8080/codeiu/PageJump?page=teamInfo&id="+data["tId"];
    }
    if(curKey === "stuName"){
      ele.href = "http://127.0.0.1:8080/codeiu/PageJump?page=userInfoShow&id="+data["stu_id"];
    }
    if(curKey === "gitUrl" || curKey === "demoUrl"){
      ele.href = data[curKey];
    }
    return true;
  };
  namespace.taskSubmitBasicInfoModel.taskSubmitBasicInfoPrinter = function(data){
    namespace.curSubmitUser = data["stu_id"];
    data["submitTime-day"] = data.submitTime.slice(5,10);
    data["submitTime-hm"] = data.submitTime.slice(11);
    data["toTaskDetail"] = "查看详情";
    Utils.Json2Dom.jsonToElements(document.querySelector(".container"), data, null, namespace.taskSubmitBasicInfoModel.dataPrinterFilterWithHrefFill);
  };

  namespace.reviewReleaseModel = namespace.reviewReleaseModel || {};
  namespace.reviewReleaseModel.releaseBtn = document.querySelector("#releaseReview");
  namespace.reviewReleaseModel.popupObject = null;
  namespace.reviewReleaseModel.init = function(data){
    var curStatus = data.curUserStatus;
    if(curStatus === "1"){
      Utils.EventUtil.addHandler(namespace.reviewReleaseModel.releaseBtn, "click", namespace.reviewReleaseModel.clickHandler);
    }else{
      namespace.reviewReleaseModel.releaseBtn.parentNode.removeChild(namespace.reviewReleaseModel.releaseBtn);
    }
  };
  namespace.reviewReleaseModel.submitInfoVerify = function(form){
    var grade = parseInt(form["grade"].value);
    var content = form["content"].value;
    if (grade !== grade || grade < 0 || grade > 10){
      alert("分数值异常");
      form["grade"].value = "5";
      return false;
    }
    if(content.trim() === ""){
      form["content"].previousElementSibling.setAttribute("评论不能为空");
      return false;
    }
    content.replace(/\n/g, "</p><p>");
    content = "<p>" + content;
    content = content + "</p>";
    form["content"].value = content;
    return true;
  };
  namespace.reviewReleaseModel.submitTheReviewInfo = function(form){
    if(namespace.reviewReleaseModel.submitInfoVerify(form)){
      form.submit();
    }
  };
  namespace.reviewReleaseModel.gradeCtlClickHandler = function(event){
    var target = event.target,
      input,
      value;
    if (input = target.nextElementSibling){ //如果是第一个减
      value = input.value;
      if(value > 0)
        value = parseInt(input.value) - 1;
    }else{
      input = target.previousElementSibling;
      value = input.value;
      if(value < 10)
        value = parseInt(input.value) + 1;
    }
    if(isNaN(value)){
      alert("分数必须为整数");
      input.value = "5";
    }else {
      input.value = value + "";
    }
  };
  namespace.reviewReleaseModel.clickHandler = function(){
    var timer = null;
    if(!namespace.reviewReleaseModel.popupObject){
      namespace.reviewReleaseModel.initPopup();
    }
    timer = setTimeout(function(){
      namespace.reviewReleaseModel.popupObject.popup();
      clearTimeout(timer);
    }, 1);
  };
  namespace.reviewReleaseModel.initPopup = function(){
    var html = ["<section class=\"popupReview click-close-pr\">",
        "    <div class=\"reviewDialog\">",
        "        <div class=\"prHeader\">",
        "            <span>发表 review</span>",
        "            <button class=\"close-popup click-close-pr\">×</button>",
        "        </div>",
        "        <div class=\"prContent\">",
        "            <form action=\"/codeiu/tcc\" method='post'>",
        "                <input type='hidden' name='submitId' value='"+namespace.curSubmitId+"'/>",
        "                <input type='hidden' name='operate' value='taskComment'/>",
        "                <label for=\"reviewContent\" data-error=''>评论：</label>",
        "                <textarea name=\"content\" id=\"reviewContent\" cols=\"30\" rows=\"10\" placeholder=\"review 评论\"></textarea>",
        "                <label for=\"reviewGrade\">打分：</label>",
        "                <span class=\"gradeCtl\">-</span><input type=\"text\" id=\"reviewGrade\" placeholder=\"\" value=\"5\" name='grade'><span class=\"gradeCtl\">+</span>",
        "            </form>",
        "            <ul class=\"gradeStatement\">",
        "                打分说明",
        "                <li><em>0:</em>并没有做</li>",
        "                <li><em>1:</em>和没有做差不多，但看得出有努力</li>",
        "                <li><em>2:</em>完成了少部分题目需求，但还有大部分未完成</li>",
        "                <li><em>3:</em>完成了大部分题目需求，但还有一些未完成</li>",
        "                <li><em>4:</em>完成了题目的需求，但是实现细节和技术方法非常差</li>",
        "                <li><em>5:</em>完成了题目的需求，但实现细节和技术方法不好，不符合预期，有较多需要改进</li>",
        "                <li><em>6:</em>完成了题目的需求，实现细节和技术方法基本符合预期，但还有很多改进空间</li>",
        "                <li><em>7:</em>完成了题目的需求，实现细节和技术方法很好，部分值得赞扬和大家学习，还有一些需要改善</li>",
        "                <li><em>8:</em>完成了题目的需求，实现细节和技术方法很好，大部分值得大家学习，小部分地方还值得改善</li>",
        "                <li><em>9:</em>非常完美，需要鸡蛋里挑骨头</li>",
        "                <li><em>10:</em>任何方面都完美无瑕，堪称经典</li>",
        "            </ul>",
        "        </div>",
        "        <div class=\"prBtns\">",
        "            <a href=\"javascript:void (0)\" class=\"btn cancel click-close-pr\">取消</a>",
        "            <a href=\"javascript:void (0)\" class=\"btn submit-pr\">提交</a>",
        "        </div>",
        "    </div>",
        "</section>"].join("");
    var popupReviewModel = popupFactory2();
    namespace.reviewReleaseModel.popupObject = popupReviewModel;
    popupReviewModel.init(html, "click-close-pr", {".gradeCtl": namespace.reviewReleaseModel.gradeCtlClickHandler, ".submit-pr": function(event){
      event.preventDefault();
      namespace.reviewReleaseModel.submitTheReviewInfo(popupReviewModel.form);
    }});
  };

  namespace.commentModel = namespace.commentModel || {};
  namespace.commentModel.container = document.querySelector(".main-content");
  namespace.commentModel.popupObject = null;
  namespace.commentModel.init = function(){
    Utils.ajaxModel.queryHandler("tcc", "GET", {operate: "getAllTaskSubmitComment", id: namespace.curSubmitId}, {sucCallback: namespace.commentModel.responseHandler});
  };
  namespace.commentModel.responseHandler = function(responseText){
    var data = JSON.parse(responseText);
    if(!data.length || data.length === 0) {
      namespace.commentModel.container.id = "main-content-noReview";
      return;
    }
    namespace.commentModel.dataFill(data);
  };
  namespace.commentModel.dataFill = function(data){
    //先绘制item 在绘制reply即可 即肯定是先有item再有reply的
    [].forEach.call(data, function(item){
      if(item.refer.trim() === ""){
        namespace.commentModel.addCommentItemFill(item);
      }else {
        namespace.commentModel.addCommentReplyFill(item);
      }
    });
    //监听发表review的评论和删除
    Utils.EventUtil.addHandler(namespace.commentModel.container, "click", function(event){
      var target = event.target,
        className = target.className;
      if(className.indexOf("-btn") > 0){
        if(className.indexOf("comment-btn") >= 0){
          namespace.commentModel.addCommentReply(target.parentNode.getAttribute("data-commentid"));
        }else if(className.indexOf("replyDelete-btn") >= 0){
          namespace.commentModel.deleteCommentReply(target.parentNode.getAttribute("data-replayId"));
        }
      }
    });
  };
  namespace.commentModel.addCommentItemFill = function(data){
    var commentItemContainer = document.createElement("div"),
      headerSpan = document.createElement("span"),
      contentContainer = document.createElement("div"),
      headerSpanInnerHtml = "",
      reviewerName = "";
    commentItemContainer.className = "comment col-md-12 col-sm-12";
    headerSpan.className = "comment-header";
    headerSpan.setAttribute("data-commentId", data.id);
    contentContainer.className = "comment-content";
    if(namespace.curUserId == data.reviewerId){
      reviewerName = "我";
    }else {
      reviewerName = data.reviewerName;
    }
    if(data.uk === "0"){
      headerSpanInnerHtml = '<a href="http://127.0.0.1:8080/codeiu/PageJump?page=teamInfo&id='+data.teamId+'">'+data.teamName+'</a>&nbsp;review '+data.time+'（<a href="http://127.0.0.1:8080/codeiu/PageJump?page=userInfoShow&uk=0&id='+data.reviewerId+'">'+reviewerName+'</a> '+data.time.slice(5)+' 更新）' +
        '<i class="fa fa-comment"></i><a href="javascript:void (0)" class="comment-btn">评论</a> <i class="grade">'+data.grade+'分</i>';
    }else{
      headerSpanInnerHtml = '<a href="javascript: void(0)">导师</a>&nbsp;review '+data.time+'（<a href="http://127.0.0.1:8080/codeiu/PageJump?page=userInfoShow&uk=1&id='+data.reviewerId+'">'+reviewerName+'</a> '+data.time.slice(5)+' 更新）' +
        '<i class="fa fa-comment"></i><a href="javascript:void (0)" class="comment-btn">评论</a> <i class="grade">'+data.grade+'分</i>';
    }
    headerSpan.innerHTML = headerSpanInnerHtml;
    contentContainer.innerHTML = data.content;
    contentContainer.id = "comment-item-" + data.id;
    commentItemContainer.appendChild(headerSpan);
    commentItemContainer.appendChild(contentContainer);
    namespace.commentModel.container.appendChild(commentItemContainer);
  };
  namespace.commentModel.addCommentReplyFill = function(data){
    var commentReplyItem = document.createElement("li"),
      commentReplyItemInfo = document.createElement("p"),
      commentReplyItemContent = document.createElement("p"),
      commentItemContent = null,
      refCols = null,
      commentReplyItemInfoInnerHtml = "";
    commentReplyItem.className = "comment-reply";
    commentReplyItem.id = "commentReply-" + data.id;
    commentReplyItemInfo.className = "rep-info";
    commentReplyItemContent.className = "rep-content";
    //区分当前登录用户的评论(我) 和 当前任务提交者(作者) 以及 其他人的评论
    if(data.reviewerId == namespace.curUserId){ //当前登录用户(我)
      commentReplyItemInfoInnerHtml = '我的 回复 '+data.time.slice(5)+' &nbsp; <a href="javascript: void(0)" class="replyDelete-btn">删除</a>';
      commentReplyItemInfo.setAttribute("data-replayId", data.id);
    }else if(data.reviewerId == namespace.curSubmitUser){  //任务提交用户(作者)
      commentReplyItemInfoInnerHtml = '作者<a href="http://127.0.0.1:8080/codeiu/PageJump?page=userInfoShow&uk=0&id='+data.reviewerId+'">'+data.reviewerName+'</a> 回复 '+data.time.slice(5);
    }else{
      commentReplyItemInfoInnerHtml = '<a href="<a href="http://127.0.0.1:8080/codeiu/PageJump?page=teamInfo&id='+data.teamId+'">'+data.teamName+'</a> <a href="http://127.0.0.1:8080/codeiu/PageJump?page=userInfoShow&uk=0&id='+data.reviewerId+'">'+data.reviewerName+'</a> 回复 '+data.time.slice(5);
    }
    commentReplyItemInfo.innerHTML = commentReplyItemInfoInnerHtml;
    commentReplyItemContent.innerHTML = data.content;
    commentReplyItem.appendChild(commentReplyItemInfo);
    commentReplyItem.appendChild(commentReplyItemContent);

    commentItemContent = namespace.commentModel.container.querySelector("#comment-item-"+data.refer);
    if(commentItemContent === null)
      return;
    if((refCols = commentItemContent.querySelector(".comment-reply-cols")) === null){
      refCols = document.createElement("ul");
      refCols.className = "comment-reply-cols";
      commentItemContent.appendChild(refCols);
    }
    refCols.appendChild(commentReplyItem);
  };
  namespace.commentModel.deleteCommentReply = function(replyId){
    Utils.ajaxModel.queryHandler("heartbeat", "GET", {}, {sucCallback: function(responseText){}});
    Utils.ajaxModel.queryHandler("tcc", "GET", {operate: "deleteCommentReply", replyId: replyId}, {sucCallback: namespace.commentModel.deleteCommentReplyResponseHandler});
  };
  namespace.commentModel.deleteCommentReplyResponseHandler = function(responseText){
    //commentReply-41
    var data = JSON.parse(responseText),
      li = null;
    if(data.errorKey === "1"){
      li = document.querySelector("#commentReply-"+data.errorMsg)
      li.parentNode.removeChild(li);
      namespace.notice("删除成功");
    }
  };
  namespace.commentModel.addCommentReply = function(commentId){
    Utils.ajaxModel.queryHandler("heartbeat", "GET", {}, {sucCallback: function(responseText){
      var data = JSON.parse(responseText);
      if(data.errorKey === "1") {
        if (namespace.commentModel.popupObject === null) {
          namespace.commentModel.initPopup();
        }
        namespace.commentModel.popupObject.form.reviewContent.value = "";
        namespace.commentModel.popupObject.form.referId.value = commentId;
        namespace.commentModel.popupObject.popup();
      }
    }});
  };
  namespace.commentModel.addCommentReplySubmitHandler = function(form){
    var content = form.reviewContent.value,
      referId = form.referId.value;
    form.reviewContent.previousElementSibling.setAttribute("data-error", "");
    if(content.trim().length === 0){
      form.reviewContent.previousElementSibling.setAttribute("data-error", "评论内容不能为空");
      return;
    }
    content = content.replace(/\n/g, "</p><p>");
    content = "<p>" + content + "</p>";
    Utils.ajaxModel.queryHandler("tcc", "POST", {operate: "taskComment", grade: "0", content: content, submitId: namespace.curSubmitId, referId: referId}, {sucCallback: namespace.commentModel.addCommentReplyResponseHandler});
    console.log(form);
  };
  namespace.commentModel.addCommentReplyResponseHandler = function(responseText){
    var data = JSON.parse(responseText);
    //将相应回复进行绘制
    namespace.commentModel.addCommentReplyFill(data);
    namespace.notice("回复成功");
    namespace.commentModel.popupObject.closePopup();
    namespace.commentModel.popupObject.form.content = "";
  };
  namespace.commentModel.initPopup = function(referId){
    var html = "<section class=\"popupReview click-close-pr\">"+
      "    <div class=\"reviewDialog\">"+
      "        <div class=\"prHeader\">"+
      "            回复 review"+
      "            <button class=\"close-popup click-close-pr\">×</button>"+
      "        </div>"+
      "        <div class=\"prContent\">"+
      "            <form action=\"#\">"+
      "                <input name='referId' value='' type='hidden'/>"+
      "                <label for=\"reviewContent\">评论：</label>"+
      "                <textarea name=\"reviewContent\" id=\"reviewContent\" cols=\"30\" rows=\"10\" placeholder=\"输入要回复的评论内容\"></textarea>"+
      "            </form>"+
      "        </div>"+
      "        <div class=\"prBtns\">"+
      "            <a href=\"javascript:void (0)\" class=\"btn cancel click-close-pr\">取消</a>"+
      "            <a href=\"javascript:void (0)\" class=\"btn submit-pr\">提交</a>"+
      "        </div>"+
      "    </div>"+
      "</section>";
    var popupReviewModel = popupFactory2();
    namespace.commentModel.popupObject = popupReviewModel;
    popupReviewModel.init(html, "click-close-pr", {".gradeCtl": namespace.reviewReleaseModel.gradeCtlClickHandler, ".submit-pr": function(event){
      namespace.commentModel.addCommentReplySubmitHandler(popupReviewModel.form);
    }});
  }

}(CodeReviewPageNamespace));
PublicNamespace.userInfoNavInitModel.init(CodeReviewPageNamespace.init);
PublicNamespace.unloginedHandlerModel.init();