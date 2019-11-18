var express = require('express');
var ejs = require('ejs');

var app = express();
// 设置使用ejs引擎处理html文件
app.engine('html',ejs.__express);
// 设置视图引擎
app.set('view engine', 'html');
// 设置模板文件位置
app.set('views', "./html");

// 处理初始界面，使用services 数据源渲染index.html并显示
app.get("/", function (req, res) {
    res.render("index");
    console.log("初始界面");
  });

  app.get("/kkkkk", function (req, res) {
    console.log("jjjjjjj");
  });

  app.listen(3000, function () {
    console.log('app is listening at port 3000');
  });