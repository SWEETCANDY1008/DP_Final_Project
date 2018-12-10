var express    = require('express');
var app = express();
var multer = require('multer');
var bodyParser = require("body-parser");
var moment = require('moment');
var date = moment().format('YYYYMMDD_HHmmss');

var get = require('./public/lib/get');
var post = require('./public/lib/post');



var _storage = multer.diskStorage({                   // multer를 이용한 파일 업로드에서 지정한 파일 이름으로 업로드
  destination: function (request, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (request, file, cb) {
    cb(null, date + "_" + file.originalname);
  }
});

var upload = multer({ storage: _storage });

app.set('port', process.env.PORT || 2000);
app.use('/static', express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended : false }));


// 메인 페이지
app.get('/favicon.ico', function(request, response) {
  response.status(204)
})

app.get('/', get.main);  // 메인 페이지

// 게시판 페이지 및 글 작성, 게시판 생성 삭제, 파일 다운로드

app.get('/:page',  get.page);                                                                                   // 게시판 내 글 목록
app.get('/:page/:pageId', get.page_pageid);                                                               // 게시판 내 글 페이지
app.get('/:page/:pageId/:current', get.page_pageid_current)                                           // 게시판 업데이트, 글 삭제 확인 화면
app.get('/:page/:pageId/:num/delete_comments', get.page_pageId_num_delete_comments)  // 게시판 댓글 삭제 확인 화면

// post, 각종 프로세스, 폴더생성, 폴더삭제, 글 업로드, 댓글 업로드, 댓글 삭제, 글 삭제, 글 업데이트, 암호 체크

app.post('/created_folder_process', post.created_folder_process);
app.post('/deleted_folder_process', post.deleted_folder_process);
app.post('/upload_process', upload.single('upload_Files'), post.upload_process);
app.post('/:page/:pageId/comment_upload', post.page_pageId_comment_upload);
app.post('/:page/:pageId/:num/delete_comment', post.page_pageId_num_delete_comment);
app.post('/:page/:pageId/delete_process', post.page_pageId_delete_process);
app.post('/:page/:pageId/update_process', upload.single('upload_Files'), post.page_pageId_update_process);

app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
})

