var express    = require('express');
var app = express();
var mysql      = require('mysql');
var fs = require('fs');
var path = require('path');
var dbconfig   = require('../../config/database.js');
var dbconfig_comment   = require('../../config/database_comment.js');
var connection = mysql.createConnection(dbconfig);
var connection_comment = mysql.createConnection(dbconfig_comment);
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended : false }));

exports.created_folder_process = function(request, response) {
    var foldername = request.body.foldername;
  
    var comment_table =  foldername + "_comment";
  
    connection.query(`
      CREATE TABLE \`${foldername}\` (
        num INT PRIMARY KEY AUTO_INCREMENT, 
        title VARCHAR(500), 
        author VARCHAR(100), 
        board TEXT, 
        time TIMESTAMP NOT NULL DEFAULT NOW(), 
        filepath TEXT,
        password VARCHAR(50))`, function(error, result) {
  
        connection_comment.query(`CREATE TABLE \`${comment_table}\` (
          num INT PRIMARY KEY AUTO_INCREMENT,
          board_num INT(200) NOT NULL,
          board_comment_num INT(255),
          commenter VARCHAR(100),
          comment_board TEXT,
          comment_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          comment_password varchar(50) DEFAULT NULL)`, function(error2, result) {

            response.send(`<script>alert("게시판이 생성 되었습니다.");location.href="/";</script>`);
        });
      });
}

exports.deleted_folder_process = function(request, response) {
    var foldername = request.body.foldername;
  
    var foldernames = [];
    var comment_table =  foldername + "_comment";
  
    connection.query(`SHOW tables`, function(error, tables) {
      for(var i in tables) {
        foldernames.push(tables[i].Tables_in_dp_board);
      }
      if(foldernames.includes(foldername)) {
        connection.query(`SELECT EXISTS(SELECT * FROM \`${foldername}\`) as isChk`, function(error2, result1){
          if(result1[0].isChk === 0) {
            connection.query(`DROP TABLE \`${foldername}\``, function(error3, result2) {
              connection_comment.query(`DROP TABLE \`${comment_table}\``, function(error4, result2) {
                response.send('<script>alert("게시판이 삭제되었습니다.");location.href="/";</script>'); 
              });
            });
          } else {
            response.send('<script>alert("게시판에 글이 존재합니다!");location.href="/DeleteFolder";</script>');
          }
        });
      } else {
        response.send('<script>alert("게시판 이름을 확인해 주세요");location.href="/DeleteFolder";</script>');
      }
    });
}
  
exports.upload_process = function(request, response) {
    var filteredpage = request.params.page
    
    var title = request.body.title;
    var author = request.body.author;
    var board = request.body.board;
    var description = request.body.description;
    var password = request.body.password;
    console.log(request.file)
    if(request.file) {
      var filenames = request.file.filename;
    } else {
      var filenames = '';
    }
    
    var descriptions = description.toString().replace(/\n/gi,"<br><br>"); 
    connection.query(`INSERT INTO \`${board}\` (title, author, board, filepath, password) VALUES (?, ?, ?, ?, ?)`, [title, author, descriptions, filenames, password], function(err, tables) {
        response.send(`<script>alert("글이 업로드 되었습니다.");location.href="/${filteredpage}/";</script>`);
    });  
}
  
exports.page_pageId_comment_upload = function(request, response) {
    // posts.comment_process(request, response);
    var filteredpage = request.params.page;
    var filteredId = request.params.pageId;
  
    var commenter = request.body.commenter;
    var passwords = request.body.password;
    var comment = request.body.comment;
  
  
    var comments = comment.toString().replace(/\n/gi,"<br><br>");
    var board_num =  filteredId;
    var comment_table = filteredpage + "_comment";
  
  
    connection_comment.query(`SELECT EXISTS(SELECT * FROM \`${comment_table}\` WHERE board_num = ${board_num}) as isChk`, function(err, result) {
        if(result[0].isChk === 0) {
          var board_comment_num = 1;
          connection_comment.query(`INSERT INTO \`${comment_table}\` (board_num, board_comment_num, commenter, comment_board, comment_password) VALUES (?, ?, ?, ?, ?)`, [board_num, board_comment_num, commenter, comments, passwords], function(err, rows) {
            response.send(`<script>alert("댓글이 입력되었습니다.");location.href="/${filteredpage}/${filteredId}/";</script>`);
          });
        } else {
          connection_comment.query(`SELECT board_num, board_comment_num FROM \`${comment_table}\` WHERE board_num = ${filteredId} ORDER BY board_comment_num DESC`, function(err, result2) {
            var board_comment_num = result2[0].board_comment_num + 1;
            connection_comment.query(`INSERT INTO \`${comment_table}\` (board_num, board_comment_num, commenter, comment_board, comment_password) VALUES (?, ?, ?, ?, ?)`, [board_num, board_comment_num, commenter, comments, passwords], function(err, rows) {
                response.send(`<script>alert("댓글이 입력되었습니다.");location.href="/${filteredpage}/${filteredId}/";</script>`);
            });
          });
        }  
    });
}
  
exports.page_pageId_num_delete_comment = function(request, response) {
    // posts.comment_delete_process(request, response);
    var filteredpage = request.params.page;
    var filteredId = request.params.pageId;
    var comment_num = request.params.num;
    var passwords = request.body.password;
  
  
    var comment_table = filteredpage + "_comment";
    
    connection_comment.query(`SELECT board_num, board_comment_num, comment_password FROM \`${comment_table}\` WHERE board_num = ${filteredId} AND board_comment_num = '${comment_num}'`, function(err, pword) {
      var password = pword[0].comment_password;
  
      if (passwords === password) {
          connection_comment.query(`DELETE FROM \`${comment_table}\` WHERE board_num = ${filteredId} AND board_comment_num = '${comment_num}'`, function(err2, rows) {
            response.send(`<script>alert("글이 삭제되었습니다.");location.href="/${filteredpage}/${filteredId}/";</script>`);
          });
      } else {
        response.send(`<script>alert("비밀번호가 틀렸습니다.");location.href="/${filteredpage}/${filteredId}/";</script>`);
      }
    });
}
  
exports.page_pageId_delete_process = function(request, response) {
    // posts.delete_process(request, response);
    var filteredpage = request.params.page;
    var filteredId = request.params.pageId;
    var passwords = request.body.password;
  
  
    var comment_table = filteredpage + "_comment";
    
    connection.query(`SELECT * FROM \`${filteredpage}\` WHERE num = '${filteredId}'`, function(err, rows) {
      var file = rows[0].filepath;
      var path = __dirname + "/../../uploads/" + file;
      var password = rows[0].password;
  
      if (passwords === password) {
        if(file === '') {
          connection.query(`DELETE FROM \`${filteredpage}\` WHERE num='${filteredId}'`, function(err2, rows) {
            connection_comment.query(`DELETE FROM \`${comment_table}\` WHERE board_num='${filteredId}'`, function(err3, rows) {
               response.send(`<script>alert("글이 삭제되었습니다.");location.href="/${filteredpage}/";</script>`);
            });
          });
        } else {
          fs.unlink(path, function (err) {
            if (err) throw err;
            console.log('successfully deleted');
          });
          connection.query(`DELETE FROM \`${filteredpage}\` WHERE num='${filteredId}'`, function(err2, rows) {
            connection_comment.query(`DELETE FROM \`${comment_table}\` WHERE board_num='${filteredId}'`, function(err3, rows) {
              response.send(`<script>alert("글이 삭제되었습니다.");location.href="/${filteredpage}/";</script>`);
            });
          });
        }
      } else {
        response.send(`<script>alert("비밀번호가 틀렸습니다.");location.href="/${filteredpage}/";</script>`);
      }
    });   
}
  
exports.page_pageId_update_process = function(request, response) {
    // posts.update_process(request, response);
  
    var filteredpage = request.params.page;
    var filteredId = request.params.pageId;
  
    var title = request.body.title;
    var author = request.body.author;
    var description = request.body.description;
    var password = request.body.password;
  
    // 비밀번호 확인해야함
  
    connection.query(`SELECT * FROM \`${filteredpage}\` WHERE num = ${filteredId} `, function(err, result) {
        if(password === result[0].password) {
          if(request.file) { // 파일 재 업로드 혹은 파일삭제 필수
            var filenames = request.file.filename;
          } else {
            var filenames = '';
          }
    
    
          var descriptions = description.toString().replace(/\n/gi,"<br><br>"); 
    
          connection.query(`UPDATE \`${filteredpage}\` SET title=?, author=?, board=?, time=NOW(), filepath=? WHERE num='${filteredId}'`, [title, author, descriptions, filenames], function(error, result) {
            response.send(`<script>alert("글이 수정되었습니다.");location.href="/${filteredpage}/${filteredId}";</script>`);
          });
        } else {
          response.send(`<script>alert("비밀번호가 틀렸습니다.");location.href="/${filteredpage}/${filteredId}/uploadform";</script>`);
        }
    });
}