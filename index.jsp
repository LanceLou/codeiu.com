<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>主页</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">
    <link rel="shortcut icon" href="/favicon.ico"/>
    <link rel="stylesheet" href="${pageContext.request.contextPath }/style/bootstrap.min.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath }/style/public.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath }/style/index.css">
</head>
<body>
    <input type="hidden" value="<c:choose><c:when test="${not empty sessionScope.user}">1</c:when><c:when test="${empty sessionScope.user}"
    	>0</c:when></c:choose>-<c:if test="${not empty sessionScope.user}">${sessionScope.user.id }</c:if
    	>-<c:choose><c:when test="${not empty sessionScope.user}">${sessionScope.userKind }</c:when><c:when test="${empty sessionScope.user}"
    	>no</c:when></c:choose>" id="ses-bed-state"/>
    <header>
        <h1 class="logo">大学生在校编码平台<span><a href="/codeiu/uacc?operate=logout">注销</a></span></h1>
    </header>
    <!--opt: 1. 已登录(从cookie自动登录),呈现欢迎模块   2. 未登录,呈现前三个模块-->
    <section class="banner container">
        <section class="intro-m curShow">
            <h1 class="col-sm-12">CodeIU: 在校大学生编码学习平台</h1>
            <p class="col-sm-12 col-md-12">codeiu.com是一个专为在校大学生打造的,免费的编程学习平台,采用导师带队制,任务制.平台导师发放任务,平台学员以组队的方式来完成任务,
            实现学员团队合作能力,编码实践能力,时间管理能力的提升.平台拥有完善的数据管理以及数据表示能力,便于各院校,团体对学员学习情况的掌握以及
            调整.</p>
            <div class="col-sm-0 col-md-3"></div>
            <div class="col-sm-12 col-md-3"><a class="button" id="loginBtn" href="javascript: void(0)">登录CodeIU</a></div>
            <div class="col-sm-12 col-md-3"><a class="button" id="regBtn" href="javascript: void(0)">注册CodeIU</a></div>
            <div class="col-sm-0 col-md-3"></div>
        </section>
        <section class="login-m container">
            <div class="col-sm-0 col-md-3"></div>
            <div class="col-sm-12 col-md-6 wrapper">
                <nav class="col-sm-12 col-md-12"><h1>登录codeiu.com</h1></nav>
                <div class="in-wrapper">
                    <form action="" method="post">
                        <label for="lg-email" data-confirm="">邮箱 :</label><input type="text" name="email" id="lg-email" placeholder="使用焦点离开式输入验证"><br>
                        <label for="lg-password" data-confirm="">密码 :</label><input type="password" name="password" id="lg-password"><br>
                        <label for="verification-code" data-confirm="">验证码 :</label><input type="text" name="vc" id="verification-code" placeholder="点击图片更新验证码">
                        <img src="${pageContext.request.contextPath }/VerificationCode" id="verificationCodeImg" alt="vc" title="点击图片更新验证码" data-default="${pageContext.request.contextPath }/images/block.png">
                        <br>
                        <label>保存登录状态:</label><input type="checkbox" name="keepIn"/><a href="/codeiu/PageJump?page=passwordChange" id="findBackPwd">忘记密码</a>
                        <input type="submit" value="提交" class="center-block" id="login">
                    </form>
                </div>
            </div>
            <div class="col-sm-0 col-md-3"></div>
        </section>
        <section class="register-m container">
            <div class="col-sm-0 col-md-3"></div>
            <div class="col-sm-12 col-md-6 wrapper">
                <div class="nav" id="reg-method">
                    <span class="cur reg-method-stu">学员注册</span>
                    <span class="reg-method-teacher">导师注册</span>
                </div>
                <div class="in-wrapper">
                    <!--server1: stu register server server2: teacher register server-->
                    <form action="" method="post" data-server="server1|server2">
                        <label for="stuNo" data-confirm="">学号 :</label><input type="text" name="stuNo" id="stuNo" placeholder="请填写学号/邀请码"><br>
                        <label for="email" data-confirm="">邮箱 :</label><input type="text" name="email" id="email" placeholder=""><br>
                        <label for="stuName" data-confirm="">姓名 :</label><input type="text" name="name" id="stuName" placeholder="院校项目学员请实名填写"><br>
                        <label for="password" data-confirm="">密码 :</label><input type="password" name="password" id="password"><br>
                        <label for="passwordC" data-confirm="">密码确认 :</label><input type="password" name="passwordC" id="passwordC"><br>
                        <input type="submit" value="提交" class="center-block" id="register">
                    </form>
                </div>
            </div>
            <div class="col-sm-0 col-md-3"></div>
        </section>
        <!--登录用户欢迎界面-->
        <section class="welcome-m container">
            <h1 class="col-sm-12 col-md-12" id="userName">Welcome: </h1>
            <div class="col-md-12 user-img-wrapper">
                <div class="img" id="userLog"></div>
            </div>
            <div class="col-sm-0 col-md-1"></div>
            <div class="col-sm-12 col-md-3"><a href="/codeiu/PageJump?" class="button pjA">完善信息</a></div>
            <div class="col-sm-12 col-md-4"><a href="/codeiu/PageJump?" class="button pjA">查看任务</a></div>
            <div class="col-sm-12 col-md-3"><a href="/codeiu/PageJump?" class="button pjA">导师选择</a></div>
            <div class="col-sm-0 col-md-1"></div>
        </section>
        <section class="emailVerifyNotice-m container">
            <h1 class="col-sm-12 col-md-12">感谢注册codeiu, 验证邮件已发往你的邮箱, 请<a href="#">前往</a>验证</h1>
        </section>
    </section>
    <!--导师制介绍模块-->
    <section class="intro tutors-intro col-md-12 col-sm-12">
        <img src="${pageContext.request.contextPath }/images/teacher-intro.png" class="scrollLoad-leftToRight col-sm-12" alt="teacher-ico" title="导师制">
        <p class="intro scrollLoad-rightToLeft col-sm-12"><span>导师制:</span>CodeIU采用导师带队制,导师在平台发放任务,学员领取任务并完成任务,导师对学员提交的任务进行打分与
        点评,通过导师与学员之间的互动来增强学员的学习积极性和效率!</p>
    </section>

    <!--团队制介绍模块-->
    <section class="intro teams-intro col-md-12 col-sm-12">
        <p class="intro scrollLoad-leftToRight col-sm-12"><span>团队制:</span>学员组队参加CodeIU,CodeIU将提供团队间的协作,沟通环境。任务以团队的形式进行,且以团队为
            单位进行提交,从而提高各学员的团队协作能力和沟通能力!</p>
        <img src="${pageContext.request.contextPath }/images/teamwork-intro.png" class="scrollLoad-rightToLeft col-sm-12" alt="teamwork-ico" title="团队制">
    </section>

    <!--任务制介绍模块-->
    <section class="intro tasks-intro col-md-12 col-sm-12">
        <p class="scrollLoad-bottomToTop"><span>任务制:</span>导师发放任务,学员以团队的形式领取任务,与传统的MOOC的形式不同,CodeIU不提供学习资源,但提供学习资源的引用,我们只是资源的搬运工,在团队
        领取任务之后,在任务中将会有与任务相关的资源的引用,学员学习完知识点后,即可完成任务,与传统的MOOC平台照抄代码相比,CodeIU对学员动手能力和
        独立思考能力将有很大提升!</p>
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

    <!-- 相关版权申明 -->
    <footer>
        <span class="block">Copyright © 2016 CodeIU</span>
        <span class="block">备案中......</span>
    </footer>
    <script src="${pageContext.request.contextPath }/script/utils.js"></script>
    <script src="${pageContext.request.contextPath }/script/index.js"></script>
</body>
</html>