/**
 * Created by lance on 2016/9/28.
 */
var TeamInfoModel = TeamInfoModel || {};
(function(namespace, undefined){
  namespace.commentPage = null;
  namespace.taskSubmitPage = null;
  namespace.teamId = null;
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
  namespace.startLoading = function(){
    document.body.id = "totalPageLoading";
    document.body.style.overflowY = "hidden";
  };
  namespace.endLoading = function(){
    document.body.id = "";
    document.body.style.overflowY = "auto";
  };
  namespace.startElementLoading = function(ele){
    Utils.classNameHandler.addClass(ele, "block-loading-animate");
  };
  namespace.endElementLoading = function(ele){
    Utils.classNameHandler.removeClass(ele, "block-loading-animate");
  };

  namespace.teamBasicInfoModel = namespace.teamBasicInfoModel || {};
  namespace.teamBasicInfoModel.init = function(){
    var searchStr = window.location.search;
    namespace.teamId = searchStr.slice(searchStr.lastIndexOf("=")+1);
    Utils.ajaxModel.queryHandler("tdic", "GET", {operate: "teamDetailInfo", id: namespace.teamId}, {sucCallback: namespace.teamBasicInfoModel.requestResponseHandler});
  };
  namespace.teamBasicInfoModel.requestResponseHandler = function(responseText){
    var data = JSON.parse(responseText);
    if(data != null && data.name !== undefined){
      namespace.commentPage = data.commentPage;
      namespace.taskSubmitPage = data.taskSubmitPage;
      namespace.teamBasicInfoModel.infoRender({announcement: data.announcement, name: data.name, teamMembers: data.teamMembers, taskSubmitPage: data.taskSubmitPage, commentPage: data.commentPage});
      namespace.teamBasicInfoModel.teamAnnouncementUpdateModel.init(data.announcement);
      namespace.pushedTaskAndViewsShowModel.init();
      namespace.publishedTaskAndReviewTransModel.init();
      namespace.endLoading();
    }
  };
  namespace.teamBasicInfoModel.infoRender = function(data){
    //data.announcement.slice(data.announcement.lastIndexOf("---")+3, data.announcement.lastIndexOf("-"))
    var teamInfoWrapper = document.querySelector(".teamInfo"),
      teamMemberContainer = teamInfoWrapper.querySelector(".team-member"),
      updateTeamAnnounceMember = null,
      updateTeamAnnounceMemberId = data.announcement.slice(data.announcement.lastIndexOf("-")+1),
      updateTeamAnnounceTime = data.announcement.slice(data.announcement.lastIndexOf("---")+3, data.announcement.lastIndexOf("-")),
      i = 0,
      aMember = null,
      a = null;
    for(i in data.teamMembers){
      aMember = data.teamMembers[i];
      if(aMember.id == updateTeamAnnounceMemberId){
        updateTeamAnnounceMember = aMember;
      }
      a = document.createElement("a");
      a.href = "/codeiu/PageJump?page=userInfoShow&uk=0&id="+aMember.id;
      a.className = "member-avatar";
      a.style.backgroundImage = "url('"+aMember.logUrl+"')";
      a.innerHTML = '<i class="name">'+aMember.name+'</i>';
      teamMemberContainer.appendChild(a);
    }
    Utils.Json2Dom.jsonToElements(teamInfoWrapper, {name: data.name, memberNum: data.teamMembers.length,
      announcement: data.announcement.slice(0, data.announcement.lastIndexOf('---')),
      updateTeamMember: updateTeamAnnounceMember?updateTeamAnnounceMember.name:"",
      updateTime: updateTeamAnnounceTime,
      submitNum: data.taskSubmitPage.totalrecord,
      reviewNum: data.commentPage.totalrecord
      }, null, function(key, data, container){
      if(key === "updateTeamMember"){
        container.querySelector(".j2d-updateTeamMember").href = "/codeiu/PageJump?page=userInfoShow&uk=0&id="+updateTeamAnnounceMemberId;
      }
      return true;
    });

  };

  namespace.teamBasicInfoModel.teamAnnouncementUpdateModel = namespace.teamBasicInfoModel.teamAnnouncementUpdateModel || {};
  namespace.teamBasicInfoModel.teamAnnouncementUpdateModel.popupObject = null;
  namespace.teamBasicInfoModel.teamAnnouncementUpdateModel.oldAnnouncement = "";
  namespace.teamBasicInfoModel.teamAnnouncementUpdateModel.init = function(announcement){
    var updateBtn = document.querySelector("#updateTeamAnnouncement");
    if(PublicNamespace.userInfoNavInitModel.data.tId == namespace.teamId){ //只有本组才能更新
      Utils.EventUtil.addHandler(updateBtn, "click", function(event){
        if(namespace.teamBasicInfoModel.teamAnnouncementUpdateModel.popupObject === null){
          namespace.teamBasicInfoModel.teamAnnouncementUpdateModel.initPopup(announcement);
        }
        namespace.teamBasicInfoModel.teamAnnouncementUpdateModel.popupObject.form.announcement.value = namespace.teamBasicInfoModel.teamAnnouncementUpdateModel.oldAnnouncement;
        namespace.teamBasicInfoModel.teamAnnouncementUpdateModel.popupObject.popup();
      });
    }else {
      updateBtn.parentNode.removeChild(updateBtn);
    }
  };
  namespace.teamBasicInfoModel.teamAnnouncementUpdateModel.update = function(announcement, teamId){
    var cur = new Date();
    if(announcement === namespace.teamBasicInfoModel.teamAnnouncementUpdateModel.oldAnnouncement){
      namespace.teamBasicInfoModel.teamAnnouncementUpdateModel.popupObject.closePopup();
      return;
    }
    //联盟创新团伙。bingo！---12-21 12:16-1

    announcement = announcement + "---" + (cur.getMonth()+1) + "-" + (cur.getDate()) + " " + cur.getHours() + ":" + cur.getMinutes() + "-" + PublicNamespace.userInfoNavInitModel.data.id;
    Utils.ajaxModel.queryHandler("tdic", "POST", {operate: "updateAnnouncement", announcement: announcement, id: teamId}, {sucCallback: namespace.teamBasicInfoModel.teamAnnouncementUpdateModel.responseHandler});
  };
  namespace.teamBasicInfoModel.teamAnnouncementUpdateModel.responseHandler = function(responseText){
    var data = JSON.parse(responseText),
      teamInfoWrapper = document.querySelector(".teamInfo");
    if(data.errorKey === "1"){
      namespace.teamBasicInfoModel.teamAnnouncementUpdateModel.popupObject.closePopup();
      namespace.notice("更新成功!");
      namespace.teamBasicInfoModel.teamAnnouncementUpdateModel.oldAnnouncement = data.errorMsg;
      teamInfoWrapper.querySelector(".j2d-announcement").innerText = data.errorMsg;
    }else{
      namespace.notice("更新失败!");
    }
  };
  namespace.teamBasicInfoModel.teamAnnouncementUpdateModel.initPopup = function(announcement){
    namespace.teamBasicInfoModel.teamAnnouncementUpdateModel.oldAnnouncement = announcement.slice(0, announcement.lastIndexOf("---"));
    var html = "<section class=\"popupReview click-close-pr\">"+
      "    <div class=\"reviewDialog\">"+
      "        <div class=\"prHeader\">"+
      "            更新公告"+
      "            <button class=\"close-popup click-close-pr\">×</button>"+
      "        </div>"+
      "        <div class=\"prContent\">"+
      "            <form action=\"#\">"+
      "                <label for=\"announcement\">公告：</label>"+
      "                <textarea name=\"announcement\" id=\"announcement\" cols=\"30\" rows=\"10\" placeholder=\"请输入\"></textarea>"+
      "            </form>"+
      "        </div>"+
      "        <div class=\"prBtns\">"+
      "            <a href=\"javascript:void (0)\" class=\"btn cancel click-close-pr\">取消</a>"+
      "            <a href=\"javascript:void (0)\" class=\"btn submit-pr\">提交</a>"+
      "        </div>"+
      "    </div>"+
      "</section>";
    var popupReviewModel = popupFactory2();
    namespace.teamBasicInfoModel.teamAnnouncementUpdateModel.popupObject = popupReviewModel;
    popupReviewModel.init(html, "click-close-pr", {".submit-pr": function(event){
      namespace.teamBasicInfoModel.teamAnnouncementUpdateModel.update(popupReviewModel.form.announcement.value, namespace.teamId);
    }});
  };

  namespace.pushedTaskAndViewsShowModel = namespace.pushedTaskAndViewsShowModel || {};
  namespace.pushedTaskAndViewsShowModel.taskSubmitListWrapper = document.querySelector("#taskListWrapper");
  namespace.pushedTaskAndViewsShowModel.reviewListWrapper = document.querySelector("#reviewListWrapper");
  namespace.pushedTaskAndViewsShowModel.init = function(){
    namespace.pushedTaskAndViewsShowModel.pushedTaskDataRender(namespace.taskSubmitPage);
    namespace.pushedTaskAndViewsShowModel.viewsDataRender(namespace.commentPage);
  };
  namespace.pushedTaskAndViewsShowModel.pushedTaskDataRender = function(data){
    if(data == null || data.record == null || data.record.length === 0)
      return;
    var container = namespace.pushedTaskAndViewsShowModel.taskSubmitListWrapper,
      aTaskSubmitEle = null,
      taskSubmitItem = null;
    container.innerHTML = "";
    for(var i in data.record){
      taskSubmitItem = data.record[i];
      aTaskSubmitEle = document.createElement("div");
      aTaskSubmitEle.className = "task";
      aTaskSubmitEle.innerHTML = '<h3 class="task-title"><a href="/codeiu/PageJump?page=taskDetails&id='+taskSubmitItem.task_id+'">'+taskSubmitItem.taskName+'</a></h3> ' +
        '<div class="task-attr"> <p>提交时间：'+taskSubmitItem.submitTime.slice(taskSubmitItem.submitTime.indexOf("-")+1)+'</p> ' +
        '<p>代码地址: <a href="'+taskSubmitItem.gitUrl+'">'+taskSubmitItem.gitUrl+'</a></p> ' +
        '<p><span>已经有'+taskSubmitItem.reviewedNum+'人 review</span><span>平均得分：'+taskSubmitItem.grade+'</span></p> ' +
        '<a href="/codeiu/PageJump?page=codeReview&id='+taskSubmitItem.taskSubmitId+'" class="btn">查看详情</a> </div>';
      container.appendChild(aTaskSubmitEle);
    }
    namespace.pageDivideModel.init(data.pagenum, data.startPage, data.endPage);
    namespace.pageDivideModel.curPageInfo.teamSubmitedTask.endPage = data.endPage;  //初始化 已提交任务部分的分页基础数据
  };
  namespace.pushedTaskAndViewsShowModel.viewsDataRender = function(data){
    if(data == null || data.record == null || data.record.length === 0)
      return;
    var container = namespace.pushedTaskAndViewsShowModel.reviewListWrapper,
      aTaskReviewEle = null,
      taskReviewItem = null;
    container.innerHTML = "";
    for(var i in data.record){
      taskReviewItem = data.record[i];
      aTaskReviewEle = document.createElement("div");
      aTaskReviewEle.className = "task";
      aTaskReviewEle.innerHTML = '<h3 class="task-title"><a href="/codeiu/PageJump?page=taskDetails&id='+taskReviewItem.taskId+'">'+taskReviewItem.taskName+'</a></h3>' +
        '<div class="task-attr"><p>提交团队：<a href="/codeiu/PageJump?page=teamInfo&id='+taskReviewItem.teamId+'">'+taskReviewItem.teamName+'</a></p>' +
        '<p>代码地址:&nbsp;&nbsp;<a href="'+taskReviewItem.gitUrl+'">'+taskReviewItem.gitUrl+'</a></p>' +
        '<p><a href="/codeiu/PageJump?page=userInfoShow&uk=0&id='+taskReviewItem.reviewerId+'">'+taskReviewItem.reviewerName+'</a>review 时间：'+taskReviewItem.time.slice(taskReviewItem.time.indexOf("-")+1)+'</p>' +
        '<p>打分: '+taskReviewItem.grade+'</p> <a href="/codeiu/PageJump?page=codeReview&id='+taskReviewItem.taskSubmitId+'" class="btn">查看详情</a> </div>';
      container.appendChild(aTaskReviewEle);
      namespace.pageDivideModel.curPageInfo.teamReviewedRecord.endPage = data.endPage; //初始化分页基础数据的评论部分
    }
  };
  namespace.pageDivideModel = namespace.pageDivideModel || {};
  namespace.pageDivideModel.curPageTarget = "teamSubmitedTask";
  namespace.pageDivideModel.curPageInfo = {
    "teamSubmitedTask": {
      curPageNum: 1,
      endPage: 0
    },
    "teamReviewedRecord": {
      curPageNum: 1,
      endPage: 0
    }
  };

  namespace.pageDivideModel.pageDivideBar = document.querySelector(".pageNavWrapper").firstElementChild;
  namespace.pageDivideModel.isInit = false;
  namespace.pageDivideModel.init = function(curPage, startPage, endPage){
    var container = namespace.pageDivideModel.pageDivideBar,
      lastChild = container.lastElementChild,
      li = null,
      i = 0;
    namespace.pageDivideModel.clearPageNum();
    if(endPage === 0){
      container.id = "page-noneRecord";
      return;
    }
    if(startPage === endPage){
      container.id = "page-single";
      li = document.createElement("li");
      li.className = "curPageNum";
      li.innerHTML = '<a href="javascript: void(0);">1</a>';
      container.insertBefore(li, lastChild);
      return;
    }
    for(i = startPage; i <= endPage; i++){
      li = document.createElement("li");
      li.setAttribute("data-pageNum", i);
      li.innerHTML = '<a href="javascript: void(0);">'+i+'</a>';
      if(i === curPage)
        li.className = "curPageNum";
      container.insertBefore(li, lastChild);
    }
    if(!namespace.pageDivideModel.isInit){
      Utils.EventUtil.addHandler(container, "click", namespace.pageDivideModel.clickHandler);
    }
  };
  namespace.pageDivideModel.clearPageNum = function(){
    var container = namespace.pageDivideModel.pageDivideBar,
      children = container.children,
      i = 0;
    for(i = 0; i < children.length; i++ ){
      if(children[i].firstElementChild.className.indexOf("-page") < 0){
        container.removeChild(children[i]);
        i --;
      }
    }
  };
  namespace.pageDivideModel.clickHandler = function(event){
    var target = event.target,
      curPageNum = namespace.pageDivideModel.curPageInfo[namespace.pageDivideModel.curPageTarget].curPageNum,
      curTotalPage = namespace.pageDivideModel.curPageInfo[namespace.pageDivideModel.curPageTarget].endPage,
      targetPageNum = 0;
    if(target.tagName !== "A")
      return;
    if(target.className === "prev-page"){
      targetPageNum = curPageNum - 1;
    }else if(target.className === "next-page"){
      targetPageNum = curPageNum + 1;
    }else{
      targetPageNum = parseInt(target.parentNode.getAttribute("data-pageNum"));
    }
    if(targetPageNum > 0 && targetPageNum <= curTotalPage && targetPageNum != curPageNum){
      namespace.pageDivideModel.curPageInfo[namespace.pageDivideModel.curPageTarget].curPageNum = targetPageNum;
      namespace.pageDivideModel.toPage(targetPageNum);
    }
  };
  namespace.pageDivideModel.toPage = function(toPageNum){
    Utils.ajaxModel.queryHandler("tdic", "GET", {operate: namespace.pageDivideModel.curPageTarget, pageNum: toPageNum, id: namespace.teamId}, {sucCallback: namespace.pageDivideModel.responsePageRequestHandler});
  };
  namespace.pageDivideModel.responsePageRequestHandler = function(responseText){
    var data = JSON.parse(responseText);
    if(data.totalrecord == undefined || data.tottotalrecord === 0)
      return;
    namespace.pageDivideModel.init(data.pagenum, data.startPage, data.endPage);
    if(data.record[0].task_id === undefined){
      namespace.commentPage = data;
      namespace.pushedTaskAndViewsShowModel.viewsDataRender(data);
    }else{
      namespace.taskSubmitPage = data;
      namespace.pushedTaskAndViewsShowModel.pushedTaskDataRender(data);
    }
  };
  namespace.publishedTaskAndReviewTransModel = namespace.publishedTaskAndReviewModelTrans || {};
  namespace.publishedTaskAndReviewTransModel.showModels = {
    taskListContainer: document.querySelector("#taskListWrapper"),
    reviewListContainer: document.querySelector("#reviewListWrapper")
  };
  namespace.publishedTaskAndReviewTransModel.trans = function(target){
    if(Utils.classNameHandler.contains(target,"cur-block"))
      return;
    console.log("get");
    var otherSpan = target.previousElementSibling?target.previousElementSibling:target.nextElementSibling,
      targetShowModel = namespace.publishedTaskAndReviewTransModel.showModels[target.getAttribute("data-target")],
      targetHiddenModel = targetShowModel.previousElementSibling?targetShowModel.previousElementSibling:targetShowModel.nextElementSibling;
    Utils.classNameHandler.removeClass(otherSpan, "cur-block");
    Utils.classNameHandler.addClass(target, "cur-block");
    Utils.classNameHandler.removeClass(targetHiddenModel,"cur-list-wrapper");
    Utils.classNameHandler.addClass(targetShowModel,"cur-list-wrapper");
    if(target.getAttribute("data-target").indexOf("task") >= 0){
      namespace.pageDivideModel.curPageTarget = "teamSubmitedTask";
      namespace.pageDivideModel.init(namespace.taskSubmitPage.pagenum, namespace.taskSubmitPage.startPage, namespace.taskSubmitPage.endPage);
    }else{
      namespace.pageDivideModel.curPageTarget = "teamReviewedRecord";
      namespace.pageDivideModel.init(namespace.commentPage.pagenum, namespace.commentPage.startPage, namespace.commentPage.endPage);
    }
  };
  namespace.publishedTaskAndReviewTransModel.init = function(){
    var infoNav = document.querySelector(".activity-info-nav");
    Utils.EventUtil.addHandler(infoNav, "click", function(event){
      var target = event.target;
      if (target.tagName === "SPAN")
        namespace.publishedTaskAndReviewTransModel.trans(target);
      if (target.tagName === "EM")
        namespace.publishedTaskAndReviewTransModel.trans(target.parentNode);
    });
  }
}(TeamInfoModel));
PublicNamespace.userInfoNavInitModel.init(TeamInfoModel.teamBasicInfoModel.init);
PublicNamespace.unloginedHandlerModel.init();