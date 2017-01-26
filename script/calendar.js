/**
 * Created by lance on 2016/9/30.
 */
//注意： 在此种情况下：  全局中只能有一个日期选择框  important
var lance_Global_Calender_self = null;

//param1: 日期数据填充容器对象
//param2: 日期改变后的回调函数
function CalendarModule(dateContainer, dataFilter, errorCallBack, callBackFunc) {
  if (!dateContainer || dateContainer.value === undefined) {
    throw new Error("bad container");
  }
  this.dom = null;
  //真正的今天
  this.year = 2016;
  this.month = 6;
  this.day = 6;

  //选择的某一天
  this.selectedYear = 2016;
  this.selectedMonth = 6;
  this.selectedDay = 6;
  this.init();
  this.selectedBlock = null;

  //数据接收容器
  this.dateContainer = dateContainer;
  //用户选择日子之后的回调函数
  this.callBackFunc = callBackFunc;
  //数据过滤回调
  this.dataFilter = dataFilter;
  this.errorCallBack = errorCallBack;
}

CalendarModule.prototype = {
  constructor: CalendarModule,

  monthDays: {
    "1": 31,
    "2": null,
    "3": 31,
    "4": 30,
    "5": 31,
    "6": 30,
    "7": 31,
    "8": 31,
    "9": 30,
    "10": 31,
    "11": 30,
    "12": 31
  },
  getMonthDays: function (month) {
    if (this.monthDays[month]) {
      return this.monthDays[month];
    }
    //处理二月份的天数
    var year = this.selectedYear;
    if ((year % 4 === 0 && year % 100 !== 0 )|| year % 400 === 0) {
      return 29;
    }else{
      return 28;
    }
  },
  //获取上一格月的日期数
  getPrevMonthDays: function (month) {
    //如果是一月   上一个月就是上一年的12月
    if (month === 1) {
      return this.getMonthDays(12);
    }else{
      return this.getMonthDays(month-1);
    }
  },
  //获取指定月的第一天是星期几  此处返回几，第一行前面又有几天是上一个月的
  getMonthFirstDayWeek: function (month) {
    var firstDay = new Date(this.selectedYear+"-"+month+"-01");
    return firstDay.getDay();
  },
  calenderChangeDispacher: function (nextOrPrev) {
    /*
     var lastMonth = this.month == 1 ? 12 : this.month-1;
     */
    //分上一年  下一年   当年
    //当前是一月，  上一个月就是上一年的12月
    //当前是12月，   下一个月就是下一年的1月
    var targetMonth;
    switch(nextOrPrev){
      case "next":
        if (this.selectedMonth === 12) {
          targetMonth = 1;
          this.selectedMonth = targetMonth;
          this.selectedYear = this.selectedYear + 1;
        }else{
          targetMonth = this.selectedMonth+1;
          this.selectedMonth = targetMonth;
        }
        break;
      case "pre":
        if (this.selectedMonth === 1) {
          targetMonth = 12;
          this.selectedMonth = targetMonth;
          this.selectedYear = this.selectedYear - 1;
        }else{
          targetMonth = this.selectedMonth - 1;
          this.selectedMonth = targetMonth;
        }
    }
    this.changeCalender(targetMonth);
  },
  //用户调节月份，此处改变DOM
  changeCalender: function (targetMonth) {
    var lastMonthLastDay = this.getPrevMonthDays(targetMonth);
    var lastRemainDays = this.getMonthFirstDayWeek(targetMonth);
    var curmonthDays = this.getMonthDays(targetMonth);
    //如果在一个不是本天所在月的月份里，默认没有当前天与选中天
    var curday = 0;
    var content = this.createCalenderContent(lastMonthLastDay,lastRemainDays, curmonthDays,curday);
    var top = this.createCalenderTop();
    this.dom.removeChild(this.dom.children[2]);
    this.dom.removeChild(this.dom.children[0]);
    this.dom.insertBefore(top,this.dom.children[0]);
    this.dom.insertBefore(content,null);
  },
  initDom: function () {
    var today = new Date();
    var curmonth = today.getMonth()+1;
    var curyear = today.getFullYear();
    //获取几号
    var curday = today.getDate();
    var curMonthDays = this.getMonthDays(curmonth);
    this.selectedYear = this.year = curyear;
    this.selectedMonth = this.month = curmonth;
    this.selectedDay = this.day = curday;
    //上一个月有多少天在本月第一行前面
    var lastMonthRemainDays = this.getMonthFirstDayWeek(curmonth);
    //上个月最后一天是几号
    var lastMonthLastDay = this.getPrevMonthDays(curmonth);

    //数据准备完毕，开始画DOM
    var calender = document.createElement("section");
    calender.className = "calender";
    calender.appendChild(this.createCalenderTop());
    calender.appendChild(this.createCalenderWeek());
    calender.appendChild(this.createCalenderContent(lastMonthLastDay,lastMonthRemainDays,curMonthDays,curday));
    this.dom = calender;
  },

  //创建具体日期内容的显示区域
  createCalenderContent: function (lastMonthLastDay,lastRemainDays, curmonthDays,curday) {
    if (this.dom) {
      this.dom.children[2].removeEventListener("click", this.contentClickHandler);
    }
    //上个月剩余天的第一天是几号
    var lastRemainDaysBegeainDay = lastMonthLastDay - lastRemainDays + 1;
    //日期周步长，方便周切换
    var content = document.createElement("section");
    content.className = "content";

    var curdayNum = lastRemainDays + curday;

    var week = document.createElement("section");
    week.className = "weekend";

    var tempDays = 0;
    var curmonthLength = curmonthDays;

    //绘制上个月的
    while(lastRemainDays > 0){
      var span = document.createElement("span");
      span.className = "not-curmonth";
      span.innerText = lastRemainDaysBegeainDay + "";
      week.appendChild(span);
      lastRemainDaysBegeainDay++;
      tempDays++;
      lastRemainDays--;
    }

    //绘制本月的
    while(curmonthDays > 0){
      var span = document.createElement("span");
      span.innerText = curmonthLength - curmonthDays + 1 + "";
      week.appendChild(span);
      tempDays++;
      curmonthDays--;
      if (tempDays % 7 === 0) {
        content.appendChild(week);
        week = document.createElement("section");
        week.className = "weekend";
      }
      if (tempDays === curdayNum) {
        span.className = "curday";
        this.selectedBlock = span;
      }
    }

    //绘制下个月的
    var nexCurLen = 0;
    if ((nexCurLen = tempDays % 7 )!== 0) { //如果当前月还有剩余空格
      nexCurLen = 7 - nexCurLen;
      var tempLen = nexCurLen;
      while(nexCurLen > 0){
        var span = document.createElement("span");
        span.className = "not-curmonth";
        span.innerText = tempLen - nexCurLen + 1 + "";
        week.appendChild(span);
        nexCurLen--;
        tempDays++;
      }
      content.appendChild(week);
    }

    //如果行数不够
    if (tempDays / 7 < 6) {
      var remainRow = tempDays / 7;
      for (var i = 0; i < remainRow; i++) {
        var start = 1;
        week = document.createElement("section");tempDays / 7;
        week.className = "weekend";
        for (var i = 0; i < 7; i++) {
          var span = document.createElement("span");
          span.className = "not-curmonth";
          span.innerText = start + "";
          start++;
          tempDays++;
          week.appendChild(span);
        }
        content.appendChild(week);
      }
    }
    content.addEventListener("click", this.contentClickHandler);
    return content;
  },

  //创建星期一到星期日的显示区域
  createCalenderWeek: function () {
    var week = ["日","一","二","三","四","五","六"];
    var weekSec = document.createElement("section");
    weekSec.className = "week";
    for (var i = 0; i < week.length; i++) {
      var span = document.createElement("span");
      span.innerText = week[i];
      weekSec.appendChild(span);
    }
    return weekSec;
  },

  //创建顶端的月份显示与调节区域
  createCalenderTop: function () {
    //如果已经有了DOM结构， 就证明有时间监听需要去除
    if (this.dom) {
      this.dom.children[0].removeEventListener("click", this.topClickHandler);
    }
    var top = document.createElement("section");
    var prev = document.createElement("span");
    var curMonth = document.createElement("span");
    var next = document.createElement("span");
    top.className = "top";
    prev.className = "pre";
    curMonth.className = "cur-mon";
    next.className = "next";
    curMonth.innerText = this.selectedYear + "年" + this.selectedMonth + "月";
    top.appendChild(prev);
    top.appendChild(curMonth);
    top.appendChild(next);
    var self = this;
    top.addEventListener("click",this.topClickHandler);
    return top;
  },

  //顶端日期调节处理函数
  topClickHandler: function (event) {
    var self = lance_Global_self;
    var target = event.target;
    if (target.className === "next" || target.className === "pre") {
      self.calenderChangeDispacher(target.className);
    }
  },

  //日期具体内容
  contentClickHandler: function (event) {
    var self = lance_Global_self;
    var target = event.target;
    if (target.className === "not-curmonth" || target.tagName === "section") {
      return;
    }
    if (self.selectedBlock) {
      self.selectedBlock.className = "";
    }
    target.className = "selectedDay";
    self.selectedBlock = target;
    self.selectedDay = target.innerText;
    self.dom.style.display = "none";
    self.callBackFunc();
    self.dataFill();
  },
  insertBefore: function (parentNode, beforeNode) {
    var beforeNode = beforeNode || null;
    parentNode.insertBefore(this.dom, beforeNode);
  },
  getSelectDay: function () {
    //返回一个对象，包含year month day
    return {
      year: this.selectedYear,
      month: this.selectedMonth,
      day: this.selectedDay
    }
  },
  dataFill: function (ele) {
    //往指定容器里面填充数据  格式yyyy-mm-dd
    var date = this.getSelectDay();
    date.day = parseInt(date.day);
    console.log(this.dataFilter(date));
    if(this.dataFilter(date)){
      this.dateContainer.value = date.year + "-" + date.month + "-" + date.day;
    }else{
      console.log(this.errorCallBack);

      this.errorCallBack();
    }

  },
  init: function () {
    this.initDom();
    lance_Global_self = this;
  }
};