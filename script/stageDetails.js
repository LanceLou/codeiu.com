/**
 * Created by lance on 2016/12/22.
 */
function dataFill(data){
  var container = document.querySelector(".main-wrapper");
  data.startTime = data.startTime.slice(0, 10);
  Utils.Json2Dom.jsonToElements(container, data);
}
function dataRequestResponseHandler(responseText){
  var data = JSON.parse(responseText);
  if (data.name !== undefined){
    dataFill(data);
  }
}
function init(){
  PublicNamespace.userInfoNavInitModel.init();
  var search = window.location.search;
  console.log(search.slice(search.lastIndexOf("id=")+3));
  Utils.ajaxModel.queryHandler("tcc", "GET", {operate: "stageInfo", id: search.slice(search.lastIndexOf("id=")+3)}, {sucCallback: dataRequestResponseHandler});
}
init();