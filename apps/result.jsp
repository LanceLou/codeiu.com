<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>成功</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">
    <link rel="stylesheet" href="/codeiu/style/font-awesome.min.css">
    <link rel="stylesheet" href="/codeiu/style/bootstrap.min.css">
    <link rel="stylesheet" href="/codeiu/style/public.css">
    <link rel="stylesheet" href="/codeiu/style/result.css">
</head>
<body>
<header>
    <h1 class="logo">大学生在校编码平台</h1>
</header>
<!--id: suc or error [request.status]-->
<section class="main-container container" id="${requestScope.status }">
    <section class="sucBlock">
        <h5 class="suc">SUCCESS</h5>
        <h5 class="error">ERROR</h5>
        <!--request.wordDisplay-->
        <p>${requestScope.wordDisplay }</p>
        <i class="fa fa-check-circle suc" aria-hidden="true"></i>
        <i class="fa fa-times-circle error" aria-hidden="true"></i>
        <div class="btnCols">
            <!--request.backUrl  request.backWord-->
            <a href="${requestScope.backUrl }" class="btn">${requestScope.backWord }</a>
            <!--request.forwardUrl  request.forwardWord-->
            <a href="${requestScope.forwardUrl }" class="btn">${requestScope.forwardWord }</a>
        </div>
    </section>
</section>
</body>
</html>