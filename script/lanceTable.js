/**
 * Created by lance on 2016/10/8.
 */
/*
* 移动端情况下关闭表格排序功能
*
* */
var Lance_Table = (function(){
  function tableHeaderSuspendHandler(event){

  }
  function _isArrayOrObject(target){
    var clazz = Object.prototype.toString.call(target);
    if(clazz.indexOf("Array") < 0 && clazz.indexOf("Object]") < 0){
      return false;
    }
    return true;
  }
  function tableSort(tableDom, tableDatas, baseIndex, compareFunction) {
    var trs = tableDom.children,
      children = tableDom.children[2].children,
      tempMax = "0",
      tempMaxIndex = 0,
      replacedNode = null,
      tempArr = [],
      tempNextEle = null;
    for(var i = 0, len = tableDatas.length; i < len; i++){
      trs = children;
      tempMax = tableDatas[0][baseIndex];
      tempMaxIndex = 0;
      for(var j = 0, jLen = len - i; j < jLen; j++){
        if(compareFunction(tempMax, tableDatas[j][baseIndex])){
          tempMax = tableDatas[j][baseIndex];
          tempMaxIndex = j;
        }
      }
      //自己和自己交换
      if(tempMaxIndex === len-i-1)
        continue;
      tempNextEle = trs[tempMaxIndex].nextElementSibling;
      //前后交换
      tempNextEle === trs[len-i-1] ? tempNextEle = trs[tempMaxIndex] : undefined;
      replacedNode = trs[0].parentNode.replaceChild(trs[tempMaxIndex], trs[len-i-1]);
      trs[0].parentNode.insertBefore(replacedNode, tempNextEle);
      tempArr = tableDatas[len - i - 1];
      tableDatas[len-i-1] = tableDatas[tempMaxIndex];
      tableDatas[tempMaxIndex] =  tempArr;
      tempMax = "0";
    }
  }
  /*
  * params1 itemList [item[String]][Array]
  * return tr[DOM]
  * */
  function createOneRow(itemList, mobileHiddenList){
    var row = document.createElement("tr");
    for(var i in itemList){
      if(!itemList.hasOwnProperty(i)){
        continue;
      }
      var td = document.createElement("td");
      td.innerHTML = itemList[i];
      if(mobileHiddenList && mobileHiddenList[mobileHiddenList[0]]+"" === i){
        Utils.classNameHandler.addClass(td, "mobileHidden");
        mobileHiddenList[0]++;
      }
      row.appendChild(td);
    }
    mobileHiddenList[0] = 1;
    return row;
  }
  /*
  * return table DOM
  * */
  function createTheTable(title, headerList, sortAbleList, mobileHiddenList){
    var table = document.createElement("table"),
      caption = document.createElement("caption"),
      tHead = document.createElement("thead"),
      headerRow = document.createElement("tr");


    Utils.classNameHandler.addClass(table,"lanceTable");
    caption.innerText = title;

    for(var i = 0, len = headerList.length; i < len; i++){
      console.log(i);
      var th = document.createElement("th");
      th.innerText = headerList[i];
      if (sortAbleList && sortAbleList[sortAbleList[0]] === i){
        Utils.classNameHandler.addClass(th, "orderAble");
        sortAbleList[0]++;
      }
      if(sortAbleList && mobileHiddenList[mobileHiddenList[0]] === i){
        Utils.classNameHandler.addClass(th, "mobileHidden");
        mobileHiddenList[0]++;
      }
      headerRow.appendChild(th);
    }
    sortAbleList?sortAbleList[0] = 1:null;
    mobileHiddenList?mobileHiddenList[0] = 1:null;
    console.log(sortAbleList);
    console.log(mobileHiddenList);
    tHead.appendChild(headerRow);
    table.appendChild(caption);
    table.appendChild(tHead);
    return table;
  }
  /*
   * @params1 wrapper[DOM] the parent node of this table
   * @params2 title[String]
   * @params3 headerList [{thContent[String], sortAble[boolean]}[Object]][Array]
   * @params4 mobileHiddenList [index[Number]][Array] tall the model which cols of the table will hidden when in mobile device. selectable
   * */
  function TableClass(option){
    if (!option.title || Object.prototype.toString.call(option.headerList).indexOf("Array") < 0 )
      throw error("Invalid Params");

    //selectAble params value transmit
    this.headerList = option.headerList;
    this.sortAbleList = option.sortAbleList?option.sortAbleList:null;
    this.mobileHiddenList = option.mobileHiddenList?option.mobileHiddenList:null;
    this.callBackFunc = option.callBackFunc?option.callBackFunc:null;
    this.wrapper = option.wrapper?option.wrapper:null;
    this.sortAbleList?this.sortAbleList.unshift(1):null;
    this.mobileHiddenList?this.mobileHiddenList.unshift(1):null;

    this.tableDom = createTheTable(option.title, this.headerList, this.sortAbleList, this.mobileHiddenList);
    this.tableDatas = []; //table data(all) except th 2D array FOR TABLE SORT
  }
  TableClass.prototype = {
    constructor: TableClass,
    /*
     * @params1 itemList [tdContent[String]][Array] or [[tdContent[String]][Array]][Array] forbid mix
     * */
    addTableRow: function(itemList){
      if(!_isArrayOrObject(itemList)){
        throw new Error("itemList: no correct format");
      }
      var fragment = document.createDocumentFragment(),
        tBody = null;
      if(!_isArrayOrObject(itemList[0])){ //only a row
        this.tableDatas.push(itemList);
        fragment.appendChild(createOneRow(itemList, this.mobileHiddenList));
      }else{   //rows
        this.tableDatas = this.tableDatas.concat(itemList);
        for(var i= 0, len = itemList.length; i < len; i++){
          fragment.appendChild(createOneRow(itemList[i], this.mobileHiddenList));
        }
      }
      console.log(this.tableDatas);
      if ((tBody = this.tableDom.querySelector("tbody"))){
        tBody.appendChild(fragment);
      }else{
        tBody = document.createElement("tbody");
        tBody.appendChild(fragment);
        this.tableDom.appendChild(tBody);
      }
      if (this.callBackFunc)
        this.callBackFunc();
      this.initEventLis();
    },
    /*
     * params: caption[DOM] needed
     * */
    setCaption: function(caption){
      this.tableDom.replaceChild(caption, this.tableDom.firstElementChild);
    },
    initEventLis: function(){
      if(0/*是移动端情况下*/) //--------------------------------------
        return;
      var self = this;
      Utils.EventUtil.addHandler(this.tableDom, "click", function(event){
        var target = event.target;
        if (!Utils.classNameHandler.contains(target, "orderAble"))
          return;
        var baseIndex = [].indexOf.call(target.parentNode.children, target);
        if (!target.getAttribute("data-isDecOrder") || target.getAttribute("data-isDecOrder")==="1"){
          tableSort(self.tableDom, self.tableDatas, baseIndex, function(op1, op2){
            return op1 < op2;
          });
          target.setAttribute("data-isDecOrder", "0");
        } else{
          tableSort(self.tableDom, self.tableDatas, baseIndex,  function(op1, op2){
            return op1 > op2;
          });
          target.setAttribute("data-isDecOrder", "1");
        }
      });
      console.log(this.wrapper.getBoundingClientRect());
      if (this.wrapper){
        Utils.EventUtil.addHandler(this.wrapper, "wheel", function(event){

        });
      }
    }
  };
  return TableClass;
}());