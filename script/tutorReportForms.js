/**
 * Created by lance on 2016/10/5.
 */
var TutorReportFormNamespace = TutorReportFormNamespace || {};
(function(namespace, undefined){
  namespace.startLoading = function(){
    document.body.id = "totalPageLoading";
    document.body.style.overflowY = "hidden";
  };
  namespace.endLoading = function(){
    document.body.id = "";
    document.body.style.overflowY = "auto";
  };
  function _pieFactory(wrapper, data, legendData, titleText, subTitleText){
    //data: [{value:335, name:'直接访问'},{value:310, name:'邮件营销'}]
    //legendData: ['直接访问','邮件营销']
    var myChart = echarts.init(wrapper);
    var option = {
      title : {
        text: titleText?titleText:"",
        subtext: subTitleText?subTitleText:"",
        x:'center'
      },
      tooltip : {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      legend: {
        orient: 'horizontal',
        left: 'left',
        bottom: 'bottom',
        data: legendData
      },
      series : [
        {
          name: '相关比例',
          type: 'pie',
          radius : '55%',
          center: ['50%', '60%'],
          data: data,
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
    myChart.setOption(option);
    Utils.classNameHandler.addClass(wrapper, "ready");
  }
  namespace.mainM = namespace.mainM || {};
  namespace.mainM.initLeftInfo = function(){
    var data = PublicNamespace.userInfoNavInitModel.data,
      container = document.querySelector("div.tutorInfo");
    container.firstElementChild.style.backgroundImage = "url('"+data.logUrl+"')";
    container.lastElementChild.textContent = data.name;
  };
  namespace.mainM.panelChangeEventHandler = function(target){
    if (target.tagName !== "A")
      return;
    switch (target.getAttribute("data-target")) {
      case "stuInfo":
        namespace.PanelChangeM.stuPanelInfoLoader();
        break;
      case "teamInfo":
        namespace.PanelChangeM.teamInfoPanelLoader();
        break;
      case "tasksInfo":
        namespace.PanelChangeM.taskInfoPanelLoader();
        break;
      case "DBC":
        namespace.PanelChangeM.DBConsolePanelLoader();
        break;
    }
  };
  namespace.mainM.initEventLis = function(){
    var nav = document.querySelector(".left-nav");
    Utils.EventUtil.addHandler(nav, "click", function(event){
      namespace.mainM.panelChangeEventHandler(event.target);
    });
  };
  namespace.mainM.init = function(){
    namespace.startLoading();
    namespace.mainM.initEventLis();
    namespace.mainM.initLeftInfo();
    namespace.PanelChangeM.stuPanelInfoLoader();
  };

  namespace.PanelChangeM = namespace.PanelChangeM || {};
  namespace.PanelChangeM.stuPanel = document.querySelector(".stu-info");
  namespace.PanelChangeM.teamInfoPanel = document.querySelector(".team-info");
  namespace.PanelChangeM.taskInfoPanel = document.querySelector(".tasks-info");
  namespace.PanelChangeM.DBCPanel = document.querySelector(".console-panel");


  namespace.PanelChangeM.stuPanelInfoLoader = function(){
    var curShowPanel = document.querySelector(".cur-panel");
    if (Utils.classNameHandler.contains(curShowPanel, "stu-info"))
      return;
    Utils.classNameHandler.removeClass(curShowPanel, "cur-panel");
    Utils.classNameHandler.addClass(namespace.PanelChangeM.stuPanel, "cur-panel");
    namespace.stuInfoDisplayModel.init();
  };
  namespace.PanelChangeM.teamInfoPanelLoader = function(){
    var curShowPanel = document.querySelector(".cur-panel");
    if (Utils.classNameHandler.contains(curShowPanel, "team-info"))
      return;
    Utils.classNameHandler.removeClass(curShowPanel, "cur-panel");
    Utils.classNameHandler.addClass(namespace.PanelChangeM.teamInfoPanel, "cur-panel");
    namespace.teamInfoDisplayModel.init();
  };
  namespace.PanelChangeM.taskInfoPanelLoader = function(){
    var curShowPanel = document.querySelector(".cur-panel");
    if (Utils.classNameHandler.contains(curShowPanel, "tasks-info"))
      return;
    Utils.classNameHandler.removeClass(curShowPanel, "cur-panel");
    Utils.classNameHandler.addClass(namespace.PanelChangeM.taskInfoPanel, "cur-panel");
    namespace.taskInfoDisplayModel.init();
  };
  namespace.PanelChangeM.DBConsolePanelLoader = function(){
    var curShowPanel = document.querySelector(".cur-panel");
    if (Utils.classNameHandler.contains(curShowPanel, "console-panel"))
      return;
    Utils.classNameHandler.removeClass(curShowPanel, "cur-panel");
    Utils.classNameHandler.addClass(namespace.PanelChangeM.DBCPanel, "cur-panel");
  };

  namespace.stuInfoDisplayModel = namespace.stuInfoDisplayModel || {};
  namespace.stuInfoDisplayModel.data = null;
  namespace.stuInfoDisplayModel.tableDataProcess = function(data){ //[{},{}]
    var afterDataCol = [],
      afterData = null,
      item = null;
    for(var i in data){
      item = data[i];
      afterData = [];
      afterData.push("<a href='/codeiu/PageJump?page=userInfoShow&uk=0&id="+item["id"]+"' target='_blank'>"+item["name"]+"</a>");
      afterData.push(item["stuNo"]);
      afterData.push(item["gender"]==="1"?"女":"男");
      afterData.push(item["universityName"]);
      afterData.push(item["professionName"]);
      afterData.push(item["grade"]);
      afterData.push(item["phone"]);
      afterData.push(item["email"]);
      if(item.teamName.trim() !== "")
        afterData.push("<a href='/codeiu/PageJump?page=teamInfo&id="+item.teamId+"' target='_blank'>"+item.teamName+"</a>");
      else
        afterData.push("未加入");
      afterDataCol.push(afterData);
    }
    return afterDataCol;
  };
  namespace.stuInfoDisplayModel.tableRender = function(data){
    var baseData = {
      "title": "学员基础数据",
      "headerList": ["姓名","学号","性别","学校","专业","年级","电话","邮箱","团队"],
      "sortAbleList": [0,1],
      "mobileHiddenList": [2,6,8],
      "callBackFunc": function(){
        namespace.PanelChangeM.stuPanel.appendChild(tableObj.tableDom);
        Utils.classNameHandler.addClass(tableObj.tableDom, "ready");
      },
      "wrapper": namespace.PanelChangeM.stuPanel
    };
    var tableObj = tableFactory(baseData);
    tableObj.addTableRow(namespace.stuInfoDisplayModel.tableDataProcess(data));
  };
  namespace.stuInfoDisplayModel.pieRender = function(data){
    var pieData = [],
      pieLegendData = [],
      tempData = null;
    //render gender proportion
    pieData.push({value: data.genderScale["0"], name: "男"});
    pieData.push({value: data.genderScale["1"], name: "女"});
    pieLegendData.push("男");
    pieLegendData.push("女");
    _pieFactory(document.querySelector(".proportion-gender"), pieData, pieLegendData, "所有订阅学生男女比例指数");
    //render grade proportion
    pieData = [];
    pieLegendData = [];
    tempData = data.gradeScale;
    for(var i in tempData){
      pieData.push({value: tempData[i], name: i === "none"?"未选择":i});
      pieLegendData.push(i === "none"?"未选择":i);
    }
    _pieFactory(document.querySelector(".proportion-grade"), pieData, pieLegendData, "所有订阅学生年级比例指数");
    //render university proportion
    pieData = [];
    pieLegendData = [];
    tempData = data.universityScale;
    for(var i in tempData){
      pieData.push({value: tempData[i], name: i === "none"?"未选择":i});
      pieLegendData.push(i === "none"?"未选择":i);
    }
    _pieFactory(document.querySelector(".proportion-fromUnv"), pieData, pieLegendData, "所有订阅学生所属大学比例指数");
    //render university speciality
    pieData = [];
    pieLegendData = [];
    tempData = data.professionScale;
    for(var i in tempData){
      pieData.push({value: tempData[i], name: i === "none"?"未选择":i});
      pieLegendData.push(i === "none"?"未选择":i);
    }
    _pieFactory(document.querySelector(".proportion-speciality"), pieData, pieLegendData, "所有订阅学生所属专业比例指数");
    var option = {
      title : {
        text: '某站点用户访问来源',
        subtext: '',
        x:'center'
      },
      tooltip : {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['直接访问','邮件营销']
      },
      series : [
        {
          name: '访问来源',
          type: 'pie',
          radius : '55%',
          center: ['50%', '60%'],
          data:[
            {value:335, name:'直接访问'},
            {value:310, name:'邮件营销'}
          ],
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  };
  namespace.stuInfoDisplayModel.init = function(){
    if(namespace.stuInfoDisplayModel.data === null){
      Utils.ajaxModel.queryHandler("srdc", "GET", {operate: "stusInfoStatistic"}, {sucCallback: function(responseText){
        var data = JSON.parse(responseText);
        if(data.errorKey !== undefined){
          document.querySelector("section.stu-info").id = "stuInfo-noStu";
          namespace.endLoading();
          return;
        }
        namespace.stuInfoDisplayModel.data = data;
        namespace.stuInfoDisplayModel.tableRender(data.infos);
        namespace.stuInfoDisplayModel.pieRender(data);
        namespace.endLoading();
      }});
    }
  };


  namespace.taskInfoDisplayModel = namespace.taskInfoDisplayModel || {};
  namespace.taskInfoDisplayModel.taskSubmitAllContainer = document.querySelector("ul.taskColl");
  namespace.taskInfoDisplayModel.taskSubmitAllIsInitE = false;
  namespace.taskInfoDisplayModel.isInit = false;
  namespace.taskInfoDisplayModel.init = function(){
    if(!namespace.taskInfoDisplayModel.isInit){
      namespace.taskInfoDisplayModel.isInit = true;
      Utils.ajaxModel.queryHandler("srdc", "GET", {"operate": "tasksInfoStatistic"}, {sucCallback: namespace.taskInfoDisplayModel.dataInitRequestResponseHandler});
    }
  };
  namespace.taskInfoDisplayModel.dataInitRequestResponseHandler = function(responseText){
    var data = JSON.parse(responseText);

    if(data.errorKey === "0" && data.errorMsg === "2"){
      document.querySelector("section.tasks-info").id = "taskInfo-noneTask";
    }else if(!("errorKey" in data)){
      //总任务提交图
      namespace.taskInfoDisplayModel.taskSubmitAllInit(data.allTaskRecord);
      namespace.taskInfoDisplayModel.taskSubmitExceedInit(data.exceedRecord);
    }
    //任务提交周期图
    namespace.taskInfoDisplayModel.taskSubmitIntervalInit(data.submitTimeInterval);
  };
  //数据渲染函数,方便分页的回调
  namespace.taskInfoDisplayModel.taskSubmitAllDataRender = function(data){
    var taskinfo = null;
    namespace.taskInfoDisplayModel.taskSubmitAllContainer.innerHTML = "";
    //目标为对象,通过for in循环来遍历
    for(taskinfo in data){
      namespace.taskInfoDisplayModel.taskSubmitAllDataRenderATask(taskinfo, data[taskinfo]);
    }
    if(!namespace.taskInfoDisplayModel.taskSubmitAllIsInitE){
      Utils.EventUtil.addHandler(namespace.taskInfoDisplayModel.taskSubmitAllContainer, "click", function(event){
        var target = event.target;
        if (target.className.indexOf("btn-showAllSubmit") >= 0){
          namespace.taskInfoDisplayModel.taskSubmitAllUnFoldHandler(target);
        }
      });
      namespace.taskInfoDisplayModel.taskSubmitAllIsInitE = true;
    }
  };
  namespace.taskInfoDisplayModel.taskSubmitAllUnFoldHandler = function(target){
    var container = target.nextElementSibling;
    if(Utils.classNameHandler.contains(container, "show")){
      Utils.classNameHandler.removeClass(target.nextElementSibling, "show");
    }else{
      Utils.classNameHandler.addClass(target.nextElementSibling, "show");
    }
  };
  /**
   * 绘制一个任务的提交细节
   * **/
  namespace.taskInfoDisplayModel.taskSubmitAllDataRenderATask = function(taskInfo, aTaskData){
    console.log(taskInfo);
    console.log(aTaskData);
    var aTaskContainer = document.createElement("li"),
      info = taskInfo.split("-scodeius-"),
      li = null,
      i = null,
      aSubmit = null;
    aTaskContainer.innerHTML = '<a href="/codeiu/PageJump?page=taskDetails&id='+info[1]+'" class="over-eclipse" target="_blank">'+info[0]+'</a>'+
      '<i>发布时间: '+info[2]+'</i>'+
        //'<i>应提交: 20</i>'+
      '<a href="javascript: void(0)" class="btn-showAllSubmit" target="_blank">点击展开</a>'+
      '<ul class=""></ul>';
    if(aTaskData.length === 0){
      li = document.createElement("li");
      li.innerHTML = "当前暂无提交记录";
      aTaskContainer.lastElementChild.appendChild(li);
    }
    for(i in aTaskData){
      aSubmit = aTaskData[i];
      li = document.createElement("li");
      li.innerHTML = '<a href="/codeiu/PageJump?page=teamInfo&id='+aSubmit["teamId"]+'" target="_blank">'+aSubmit["teamName"]+'</a><i>提交于'+aSubmit["submitTime"]+'</i><em>已获得'+aSubmit["reviewNum"]+'个review</em>平均分为'+aSubmit["grade"]+' <a href="/codeiu/PageJump?page=codeReview&id='+aSubmit["id"]+'" target="_blank">前往评论</a>';
      aTaskContainer.lastElementChild.appendChild(li);
    }
    namespace.taskInfoDisplayModel.taskSubmitAllContainer.appendChild(aTaskContainer);
    Utils.classNameHandler.addClass(namespace.taskInfoDisplayModel.taskSubmitAllContainer, "ready");
  };
  namespace.taskInfoDisplayModel.pageRequester = function(pageNum){
    Utils.ajaxModel.queryHandler("srdc?operate=taskRecordByPageNum&pagenum="+pageNum, "GET", {}, {sucCallback: function(responseText){
      var data = JSON.parse(responseText);
      if(data.errorKey === "0")
        return;
      namespace.taskInfoDisplayModel.taskSubmitAllInit(data);
    }});

  };
  namespace.taskInfoDisplayModel.taskSubmitAllInit = function(dataP){
    namespace.taskInfoDisplayModel.pageDivideModel.init(dataP.startPage, dataP.endPage, dataP.pagenum, dataP.totalPage, document.querySelector("#allTask-pageNavWrapper-container"),
      namespace.taskInfoDisplayModel.pageRequester);
    namespace.taskInfoDisplayModel.taskSubmitAllDataRender(dataP.mapRecord);
  };
  //------------------------------------------------------------------------------------------------------------------------------------------
  namespace.taskInfoDisplayModel.taskSubmitIntervalDataRender = function(data){
    var container = document.querySelector("div.taskSubmit-interval"),
      myChart = echarts.init(container),
      allTitleArray = [],
      title = "",
      tempLet3TaskData = [],
      tempLet7TaskData = [],
      tempBigTaskData = [];
    for(title in data){
      if(data.hasOwnProperty(title))
        allTitleArray.push(title.slice(0, title.lastIndexOf("-")));
      tempLet3TaskData.push(data[title][0]);
      tempLet7TaskData.push(data[title][1]);
      tempBigTaskData.push(data[title][2]);
    }
    var option = {
      tooltip : {
        trigger: 'axis',
        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
          type : 'line'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      legend: {
        data: ['三天之内', '三至七天','大于七天']
      },
      grid: {
        left: '1%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis:  {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: allTitleArray
      },
      series: [
        {
          name: '三天之内',
          type: 'bar',
          stack: '总量',
          label: {
            normal: {
              show: true,
              position: 'insideRight'
            }
          },
          data: tempLet3TaskData
        },
        {
          name: '三至七天',
          type: 'bar',
          stack: '总量',
          label: {
            normal: {
              show: true,
              position: 'insideRight'
            }
          },
          data: tempLet7TaskData
        },
        {
          name: '大于七天',
          type: 'bar',
          stack: '总量',
          label: {
            normal: {
              show: true,
              position: 'insideRight'
            }
          },
          data: tempBigTaskData
        }
      ]
    };
    myChart.setOption(option);
    Utils.classNameHandler.addClass(container, "ready");
  };
  namespace.taskInfoDisplayModel.taskSubmitIntervalInit = function(data){
    namespace.taskInfoDisplayModel.taskSubmitIntervalDataRender(data);
  };

  namespace.taskInfoDisplayModel.taskSubmitExceedRenderATask = function(container, info, data){
    var containerLi = document.createElement("li"),
      i = 0,
      j = 0,
      aExceedRecord = null,
      teamMembers = [],
      teamMemberHtmlStr = "",
      li = null;
    containerLi.innerHTML = '<a href="/codeiu/PageJump?page=taskDetails&id='+info.slice(info.lastIndexOf("-")+1)+'" class="over-eclipse" target="_blank">'+info.slice(0, info.lastIndexOf("-"))+'</a>'+
      '<i>截止时间: '+data[0].cutofftime+' 距离当前'+data[0].toNow+'天</i>'+
      '<a href="javascript: void(0)" class="btn-showAllExceedTeam" target="_blank">点击展开(未提交团队)</a>'+
      '<ul class=""></ul>';
    if(data[0].teamId === -1){
      li = document.createElement("li");
      li.innerHTML = "无超期未提交团队";
      containerLi.lastElementChild.appendChild(li);
    }else{
      for(i in data){
        li = document.createElement("li");
        aExceedRecord = data[i];
        teamMembers = aExceedRecord.teamMenber.split("--*codeiu*--");
        teamMemberHtmlStr = "";
        for(j = 0; j < teamMembers.length; j++){
          teamMemberHtmlStr += '<a href="/codeiu/PageJump?page=userInfoShow&uk=0&id='+teamMembers[j].slice(teamMembers[j].lastIndexOf("-")+1)+'" target="_blank">'+teamMembers[j].slice(0, teamMembers[j].lastIndexOf("-"))+'</a>';
        }
        li.innerHTML = '团队: <a href="/codeiu/PageJump?page=teamInfo&id='+aExceedRecord["teamId"]+'" target="_blank" class="over-eclipse">'+aExceedRecord["teamName"]+'</a> 成员:<span>'+teamMemberHtmlStr+'</span>';

        containerLi.lastElementChild.appendChild(li);
      }
    }
    container.appendChild(containerLi);
  };
  namespace.taskInfoDisplayModel.taskSubmitExceedDataRender = function(data, container){
    container.innerHTML = "";
    for(var exceedTask in data){
      namespace.taskInfoDisplayModel.taskSubmitExceedRenderATask(container, exceedTask, data[exceedTask]);
    }
  };
  namespace.taskInfoDisplayModel.taskSubmitExceedUnfoldHandler = function(target){
    var liC = target.nextElementSibling;
    if(Utils.classNameHandler.contains(liC, "show")){
      Utils.classNameHandler.removeClass(liC, "show");
    }else{
      Utils.classNameHandler.addClass(liC, "show");
    }
  };
  namespace.taskInfoDisplayModel.taskSubmitExceedInit = function(data){
    var container = document.querySelector("ul.taskExcColl");
    namespace.taskInfoDisplayModel.taskSubmitExceedDataRender(data, container);
    Utils.EventUtil.addHandler(container, "click", function(event){
      var target = event.target;
      if(target && target.className.indexOf("btn-showAllExceedTeam") >= 0){
        namespace.taskInfoDisplayModel.taskSubmitExceedUnfoldHandler(target);
      }
    });
  };
  //------------------------------------------------------------------------------------------------------------------------------------------
  namespace.taskInfoDisplayModel.pageDivideModel = namespace.taskInfoDisplayModel.pageDivideModel || {};
  namespace.taskInfoDisplayModel.pageDivideModel.curRequestFunc = {};
  namespace.taskInfoDisplayModel.pageDivideModel.curDivideStatus = {
    "1483689482891": {
      curPage: 1,
      startPage: 1,
      endPage: 1,
      totalPage: 1,
      isInitE: false
    }
  };
  //callback: pageRequestCallback
  namespace.taskInfoDisplayModel.pageDivideModel.init = function(pageStart, pageEnd, curPage, totalPage, curElement, pageRequestCallback){
    if(!(curElement && typeof curElement === 'object' && "querySelector" in curElement)){
      throw new Error("curElement(param) is not a Element");
    }
    var liContainer = curElement.firstElementChild,
      curId = curElement.getAttribute("data-pageDivideId")?curElement.getAttribute("data-pageDivideId"):(new Date()).getTime();
    curElement.setAttribute("data-pageDivideId", curId);
    namespace.taskInfoDisplayModel.pageDivideModel.curRequestFunc[curId] = pageRequestCallback;
    namespace.taskInfoDisplayModel.pageDivideModel.curDivideStatus[curId] = {curPage: curPage, startPage: pageStart, endPage: pageEnd, totalPage: totalPage, isInitE:  namespace.taskInfoDisplayModel.pageDivideModel.curDivideStatus[curId]?namespace.taskInfoDisplayModel.pageDivideModel.curDivideStatus[curId].isInitE:false};
    if(pageStart === pageEnd){
      liContainer.id = "pageNavWrapper-onePage";
      return;
    }
    namespace.taskInfoDisplayModel.pageDivideModel.clearPageNums(liContainer);
    namespace.taskInfoDisplayModel.pageDivideModel.pageNumRender(liContainer, curId);

  };
  namespace.taskInfoDisplayModel.pageDivideModel.clearPageNums = function(liContainer){
    var eleItem = null,
      liCol = liContainer.children,
      i = 0;
    for(;i < liCol.length; i++){
      eleItem = liCol[i];
      if(eleItem.firstElementChild && eleItem.firstElementChild.className.search(/prev-page|next-page/g) < 0){
        liContainer.removeChild(eleItem);
        i--;
      }
    }
  };
  namespace.taskInfoDisplayModel.pageDivideModel.pageNumRender = function(liContainer, id){
    var li = null,
      a = null,
      curInfo = namespace.taskInfoDisplayModel.pageDivideModel.curDivideStatus[id],
      i = curInfo.startPage;

    //添加页码序列
    for(i; i <= curInfo.endPage; i++){
      li = document.createElement("li");
      a = document.createElement("a");
      a.href = "javascript: void(0);";
      a.setAttribute("data-pagenum", i);
      a.textContent = i;
      if(i === curInfo.curPage){
        li.className = "curPageNum";
      }
      li.appendChild(a);
      liContainer.insertBefore(li, liContainer.lastElementChild);
    }
    //事件监听
    if(!curInfo.isInitE){
      Utils.EventUtil.addHandler(liContainer, "click", function(event){
        var target = event.target,
          curInfo = namespace.taskInfoDisplayModel.pageDivideModel.curDivideStatus[id],
          pageNum = null;
        if(target.tagName !== "A")
          return;
        //"prev-page" search(/prev-page|next-page/g) >= 0
        if(target.className.indexOf("prev-page") >=0){
          pageNum = curInfo.curPage - 1;
        }else if(target.className.indexOf("next-page") >=0){
          pageNum = curInfo.curPage + 1;
        }else{
          pageNum = target.getAttribute("data-pagenum");
        }
        namespace.taskInfoDisplayModel.pageDivideModel.toPage(pageNum, id);
        event.stopPropagation();
      });
      curInfo.isInitE = true;
    }
  };
  namespace.taskInfoDisplayModel.pageDivideModel.toPage = function(pageNum, id){
    if(!pageNum || !parseInt(pageNum)){
      return;
    }
    var divideInfo = namespace.taskInfoDisplayModel.pageDivideModel.curDivideStatus[id];
    pageNum = parseInt(pageNum);
    if(pageNum <=0 || pageNum > divideInfo.totalPage){
      return;
    }
    namespace.taskInfoDisplayModel.pageDivideModel.curRequestFunc[id](pageNum);
  };


  namespace.teamInfoDisplayModel = namespace.teamInfoDisplayModel || {};
  namespace.teamInfoDisplayModel.isInit = false;
  namespace.teamInfoDisplayModel.tableDataProcess = function(data){
    var afterDataCol = [],
      afterData = null,
      teamMembers = null,
      teamMemberHtmlStr = "",
      item = null;
    for(var i in data) {
      item = data[i];
      afterData = [];
      afterData.push("<a href='/codeiu/PageJump?page=teamInfo&id="+item.id+"' target='_blank' class='over-eclipse'>"+item.name+"</a>");
      afterData.push("<p class='over-eclipse'>" + item.announcement.slice(0, item.announcement.lastIndexOf("---")) + "</p>");
      teamMembers = item.allStusInfo.split("--*codeiu*--");
      teamMemberHtmlStr = "";
      for(j = 0; j < teamMembers.length; j++){
        teamMemberHtmlStr += '<a href="/codeiu/PageJump?page=userInfoShow&uk=0&id='+teamMembers[j].slice(teamMembers[j].lastIndexOf("-")+1)+'" target="_blank">'+teamMembers[j].slice(0, teamMembers[j].lastIndexOf("-"))+'</a>';
      }
      afterData.push(teamMemberHtmlStr);
      afterData.push("<a href='javascript: void(0)'>查看</a>");
      afterData.push("<a href='javascript: void(0)'>查看</a>");
      afterData.push("<a href='javascript: void(0)'>查看</a>");
      afterDataCol.push(afterData);
    }
    return afterDataCol;
  };
  namespace.teamInfoDisplayModel.tableRender = function(data){
    var baseData = {
      "title": "学员组队基础数据",
      "headerList": ["团队名","团队公告","成员","活跃度","已提交任务","未提交任务"],
      "sortAbleList": [],
      "mobileHiddenList": [1],
      "callBackFunc": function(){
        namespace.PanelChangeM.teamInfoPanel.appendChild(tableObj.tableDom);
        Utils.classNameHandler.addClass(tableObj.tableDom, "ready");
      },
      "wrapper": namespace.PanelChangeM.stuPanel
    };
    var tableObj = tableFactory(baseData);
    tableObj.addTableRow(namespace.teamInfoDisplayModel.tableDataProcess(data));
  };
  namespace.teamInfoDisplayModel.responseHandler = function(responseText){
    var data = JSON.parse(responseText);
    namespace.teamInfoDisplayModel.tableRender(data);
  };
  namespace.teamInfoDisplayModel.init = function(){
    if(!namespace.teamInfoDisplayModel.isInit){
      namespace.teamInfoDisplayModel.isInit = true;
      Utils.ajaxModel.queryHandler("srdc?operate=teamsInfoStatistic", "GET", {}, {sucCallback: namespace.teamInfoDisplayModel.responseHandler});
    }
  };

}(TutorReportFormNamespace));
function tableFactory(data){
  return new Lance_Table(data);
}
function init(){
  PublicNamespace.userInfoNavInitModel.init(TutorReportFormNamespace.mainM.init);
}
init();