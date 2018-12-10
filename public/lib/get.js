var mysql      = require('mysql');
var fs = require('fs');
var path = require('path');
var templates = require('./template.js');
var dbconfig   = require('../../config/database.js');
var dbconfig_comment   = require('../../config/database_comment.js');
var connection = mysql.createConnection(dbconfig);
var connection_comment = mysql.createConnection(dbconfig_comment);

var dbcallback = require('./dbcallback');

exports.main = function(request, response) {
  connection.query(`SHOW tables`, function(err, tables) {
    var folderlists = dbcallback.table(tables).folderlists;
    var description = templates.mainpage();
    var template = templates.BaseTemplate(folderlists, description);
    response.send(template);
  });
}

exports.page = function(request, response) {
  var filteredpage = path.parse(request.params.page).base;
  if(filteredpage === 'writeform') {
    connection.query(`SHOW tables`, function(err, tables) {
      var folderlists = dbcallback.table(tables).folderlists;
      var list = dbcallback.table(tables).list;
  
      var description = templates.Multiupload(list);
      var template = templates.BaseTemplate(folderlists, description);
      response.send(template);
    });
  } else if(filteredpage === 'CreateFolder') { 
    connection.query(`SHOW tables`, function(err, tables) {
      var folderlists = dbcallback.table(tables).folderlists;

      var description = templates.createdfolder();
      var template = templates.BaseTemplate(folderlists, description);
      response.send(template);
    });
  } else if(filteredpage === 'DeleteFolder') {  
    connection.query(`SHOW tables`, function(err, tables) {
      var folderlists = dbcallback.table(tables).folderlists;

      var description = templates.deletedfolder();
      var template = templates.BaseTemplate(folderlists, description);
      response.send(template);
    });
  } else {
    connection.query(`SHOW tables`, function(err, tables) {
      var folderlists = dbcallback.table(tables).folderlists;
      connection.query(`SELECT * FROM \`${filteredpage}\` ORDER BY num DESC`, function(err2, rows) {
        var list = templates.TitleTemplate(filteredpage, rows);    
        var template = templates.BaseTemplate(folderlists, list);
        response.send(template);
      });
    }); 
  }
}

exports.page_pageid = function(request, response) {
  var filteredpage = path.parse(request.params.page).base;
  var filteredId = path.parse(request.params.pageId).base;

  if(filteredpage === "uploads") {
    var filename = path.parse(request.params.pageId).base;
    filepath = __dirname + "/../../uploads/" + filename;
    response.download(filepath, filename);
  } else {
    connection.query(`SHOW tables`, function(err, tables) {
      var folderlists = dbcallback.table(tables).folderlists;
      connection.query(`SELECT * FROM \`${filteredpage}\` WHERE num = '${filteredId}'`, function(err2, rows) {
        var comment_table = filteredpage + "_comment";
        connection_comment.query(`SELECT * FROM \`${comment_table}\` WHERE board_num = ${filteredId} ORDER BY board_comment_num DESC `, function(err3, comments){
  
          var title = rows[0].title
          var author = rows[0].author
          var board = rows[0].board
          var filepath = rows[0].filepath
          
          var comment_View = templates.Comment_View(comments, filteredpage, filteredId);
          var comment_Form = templates.Comment_Form(filteredpage, filteredId);
          var description = templates.BoardTemplate(title, author, board, filepath, comment_View, comment_Form);

          var template = templates.BaseTemplate(folderlists, description);
          response.send(template);
        });
      });  
    }); 
  }
}

exports.page_pageid_current = function(request, response){
  var filteredcurrent =path.parse(request.params.current).base;
  var filteredpage = path.parse(request.params.page).base;
  var filteredId = path.parse(request.params.pageId).base;

  if(filteredcurrent === 'current_delete_process') {
    connection.query(`SHOW tables`, function(err, tables) {
      var folderlists = dbcallback.table(tables).folderlists;

      var description = templates.Currect_Delete_Password(filteredpage, filteredId);
      var template = templates.BaseTemplate(folderlists, description);
      response.send(template);
    });
  } else if(filteredcurrent === 'uploadform') {
    connection.query(`SHOW tables`, function(err, tables) {

      var folderlists = dbcallback.table(tables).folderlists;
  
      connection.query(`SELECT * FROM \`${filteredpage}\` WHERE num = '${filteredId}'`, function(err2, board) {

        var title = board[0].title;
        var author = board[0].author
        var folder = filteredpage;
        var description = board[0].board
        var filename = board[0].filepath
        var path = __dirname + '/../../uploads/' + filename;
        
        fs.unlink(path, function (err) {
          if (err) throw err;
          console.log('successfully deleted');
        });

        var description = templates.UpdateForm(filteredpage, filteredId, title, author, folder, description);
        var template = templates.BaseTemplate(folderlists, description);
        response.send(template);
      });
    });
  } 
}

exports.page_pageId_num_delete_comments = function(request, response){

    var filteredpage = path.parse(request.params.page).base;
    var filteredId = path.parse(request.params.pageId).base;
    var comment_num = path.parse(request.params.num).base;
  
    connection.query(`SHOW tables`, function(err, tables) {
      var folderlists = dbcallback.table(tables).folderlists;
      var description = templates.Currect_CommentDelete_Password(filteredpage, filteredId, comment_num);
      var template = templates.BaseTemplate(folderlists, description);
      response.send(template);
    });
  }
