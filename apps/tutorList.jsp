<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%> 
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>导师列表</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">
    <link rel="stylesheet" href="/codeiu/style/font-awesome.min.css">
    <link rel="stylesheet" href="/codeiu/style/bootstrap.min.css">
    <link rel="stylesheet" href="/codeiu/style/public.css">
    <link rel="stylesheet" href="/codeiu/style/tutorList.css">
    <link rel="stylesheet" href="/codeiu/style/MobileRotateCheckModel.css">
    <script src="/codeiu/script/MobileRotateCheckModel.js"></script>
</head>
<body data-status="${status }">
<script>
    mobile_rotateCheckModel.init();
    mobile_rotateCheckModel.setScreenHorizonHandler(function(){
        document.body.className = "";
    });
    mobile_rotateCheckModel.setUnScreenHorizonHandler(function(){
        document.body.className = "mobile";
    });
</script>
<!--id topM-sysMsg or topM-warning-->
<section class="top-message">
    <section class="systemMessage">
        <h3>您有未读的消息</h3>
        <ul class="msg-item-container"></ul>
        <div class="msgContent" data-mid=""></div>
    </section>
    <section class="warning">
        <p class="warning-p"></p>
    </section>
    <section class="tm-notice" id="noticeC">
        <p>更新成功</p>
    </section>
</section>
<section class="pageLoading">
    <i class="fa fa-refresh loader" aria-hidden="true"></i>
</section>
<header>
    <h1 class="logo">大学生在校编码平台</h1>
    <div class="nav-bar">
        <i class="bar"></i>
        <i class="bar"></i>
        <i class="bar"></i>
    </div>
    <span class="nav">
        <a href="#" class="userLink click-toggle"><i class="name"></i>@<span class="team-name"></span><i class="down-ico"></i></a>
        <ul class="show-hidden"></ul>
    </span>
</header>
<section class="mobile-nav">
    <ul>
        <li><i class="name"></i>@<span class="team-name"></span></li>
    </ul>
</section>
<section class="rotatePrompt container">
    <img src="/codeiu/images/screen-rotation.png" alt="screen-rotate" class="img-circle center-block">
    <h3>For a better experience, please use the horizontal screen</h3>
</section>
<!-- major field 先把具体格式以及基本操作实现, 具体数据填充交由后台jsp进行填充-->
<section class="mainWrapper container">
    <!--还未选择导师-->
    <!--还未选择方向-->
    <div class="user-state">
    	<c:choose><c:when test="${status=='1' }">还未选择导师</c:when><c:when test="${status=='3' }">您已选择导师 <em>${tutorName.name }</em><a href="javascript: void(0)">点击</a>更改导师</c:when><c:when test="${status=='4' }">还未选择专业方向</c:when><c:when test="${status=='5' }">已选择导师且加入团队(不可再选择)</c:when></c:choose>
    </div>
    
    <c:choose>
    	<c:when test="${status=='4' }"><section class="field-title">您还未选择学习方向, 先去<a href="/codeiu/PageJump?page=userInfo">选择方向</a></section></c:when>
    	<c:otherwise>
    		<c:if test="${fn:length(tutors)==0 }"><section class="field-title">您所选方向暂无导师,敬请期待!!!</section></c:if>
    		<c:if test="${fn:length(tutors)!=0 }"><section class="field-title">${direction.name }方向</section></c:if>
    	</c:otherwise>
    </c:choose>
    <!--<section class="field-title">您还未选择学习方向, 先去<a href="/codeiu/PageJump?page=userInfo">选择方向</a></section>-->
    <!--<section class="field-title">您所选方向暂无导师,敬请期待!!!</section>-->
    <!-- id: tutor-selected(已选择导师,禁止选择)-->
    <section class="field-tutors" id='<c:if test="${status!='1' }">tutor-selected</c:if>'>
    	<c:if test="${status!='4' }">
    		<c:forEach items="${tutors}" var="item" varStatus="i">
    			<div class="tutor <c:if test="${i.count==1 }">unwind</c:if>">
		            <div class="brief-block">
		                <span>${item.name }</span>
		                <span><a href="javascript: void(0)" class="fe-unwind">点击展开</a></span>
		                <span><a href="javascript: void(0)" class="selectBtn" data-tutorId="${item.id }">选择他</a></span>
		            </div>
		            <div class="detail-block">
		                <div class="left-show">
		                    <div class="avatar" style="background-image: url('http://tp4.sinaimg.cn/2908583755/180/5746801334/1')"></div>
		                    <h3 class="tutor-name">${item.name }</h3>
		                    <h5 class="tutor-simpleIntro">${item.aWordIntro }</h5>
		                </div>
		                <div class="right-show">
		                    <p><span>姓名:</span><span>${item.name }</span></p>
		                    <p><span>性别:</span><span><c:choose><c:when test="${item.gender==0 }">男</c:when><c:otherwise>女</c:otherwise></c:choose></span></p>
		                    <p><span>方向:</span><span>${direction.name }</span></p>
		                    <p><span>个人网站:</span><span><a href="#">${item.personPageUrl }</a></span></p>
		                    <p><span>个人简介:</span><span>${item.intro }</span></p>
		                    <p><span>学员要求:</span><span>${item.studentRequirement }</span></p>
		                    <p><span>背景:</span><span>${item.experience }</span></p>
		                </div>
		            </div>
        		</div>
    		</c:forEach>
    	</c:if>
    </section>
</section>
<!-- 建站相关信息介绍: 网站相关  联系合作  关注我们 -->
<section class="infoShow">
    <div class="col-md-1"></div>
    <section class="aboutSite col-md-2">
        <span class="title">网站相关</span>
        <span><a href="#">关于我们</a></span>
        <span><a href="#">帮助中心</a></span>
    </section>
    <section class="contactCo col-md-2">
        <span class="title">联系合作</span>
        <span><a href="#">联系我们</a></span>
        <span><a href="#">加入我们</a></span>
    </section>
    <section class="aboutUs col-md-2">
        <span class="title">关注我们</span>
        <span><a href="#">github</a></span>
        <span><a href="#">微博</a></span>
        <span><a href="#">Twitter</a></span>
    </section>
    <section class="friendlyLink col-md-2">
        <span class="title">友情链接</span>
        <span><a href="#">w3cplus</a></span>
        <span><a href="#">w3c</a></span>
        <span><a href="#">MDN</a></span>
    </section>
    <section class="declare col-md-3">
        <span>网站声明</span>
        <p>本站点所有资源均由用户产生与使用,站点仅是一个资源的存放与分享平台,不对相关的资源的版权负责。</p>
    </section>
    <div class="col-md-1 col-sm-0"></div>
</section>

<!--回到顶部功能部分-->
<span class="backToTop">
    <i class="fa fa-chevron-up"></i>
</span>


<!-- 相关版权申明 -->
<footer>
    <span class="block">Copyright © 2016 CodeIU</span>
    <span class="block">备案中......</span>
</footer>
<script src="/codeiu/script/utils.js"></script>
<script src="/codeiu/script/public.js"></script>
<script src="/codeiu/script/tutorList.js"></script>
</body>
</html>