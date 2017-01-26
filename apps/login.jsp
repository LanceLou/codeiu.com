<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
    <%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>登录</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">
    <link rel="stylesheet" href="/codeiu/style/bootstrap.min.css">
    <link rel="stylesheet" href="/codeiu/style/login.css">
</head>
<body>
<input type="hidden" name="srcLink" value="<c:if test="${not empty param.sourcePage}">${param.sourcePage }</c:if
><c:if test="${not empty requestScope.targetPage}">${requestScope.targetPage }</c:if>" id="loginedTargetPage">
<section class="container mainC">
    <section class="left-show"></section>
    <section class="right-form">
        <h2>登录<c:if test="${not empty requestScope.logInfo}">(${requestScope.logInfo })</c:if></h2>
        <form action="">
            <label for="email" data-error="" data-error-name="邮箱">邮箱</label>
            <input type="text" name="email" id="email" class="in">
            <label for="password" data-error="" data-error-name="密码">密码<a href="/codeiu/PageJump?page=passwordChange">忘记密码?</a></label>
            <input type="password" name="password" id="password" class="in">
            <label for="vc" data-error="" data-error-name="验证码">验证码</label>
            <input type="text" name="vc" id="vc" class="in">
            <img src="/codeiu/VerificationCode" id="vf-code"><br>
            <input type="checkbox" name="keepIn" id="keepIn"><label for="keepIn">保持登录</label>
            <input type="submit" value="登录">
        </form>
        <h4>CodeIU</h4>
    </section>
</section>
<script type="text/javascript" src="/codeiu/script/utils.js"></script>
<script type="text/javascript" src="/codeiu/script/login.js"></script>
</body>
</html>