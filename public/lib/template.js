module.exports = {
  BaseTemplate : function(list, description) {
    return `
      <!doctype html>
      <html>
      <head>
      <title>Board</title>
      <meta charset="utf-8">
      <link rel="stylesheet" type="text/css" href="/static/stylesheets/style.css"/>
      </head>
      <body>
      <header>
        <div class="mainpage">
          <div class="main"><h1><a href="/">생각 조각 모음</a></h1></div>
          <div class="createfolder"><a href="/CreateFolder">게시판 생성</a></div>
          <div class="deletefolder"><a href="/DeleteFolder">게시판 삭제</a></div>
        </div>
      </header>
      <nav>
      </nav>
      <section>
          <div class="list">
          <h2><a href="/writeform">업로드</a></h2>
          ${list}
          </div>
          <div class="order">
            ${description}
          </div>
      </section>
      <footer>KwonJuYoung 2018</footer>
      </body>
      </html>
    `;
  },

  TitleTemplate : function(filteredpage, rows) {
  var list = '<div class="BoardList">';
    list = list + '<div class="Lists"><div>글번호</div><div>제목</div><div>글쓴이</div><div>수정</div><div>삭제</div></div>';
    for(var i in rows) {
      var num = rows[i].num;
      var title = rows[i].title;
      var author = rows[i].author;

      list = list + `
          <div class="List">
          <div>${num}</div>
          <div><a href="/${filteredpage}/${num}">${title}</a></div>
          <div>${author}</div>
          <div>
            <form action="/${filteredpage}/${num}/uploadform" method="GET">
                <input type="submit" value="수정">
            </form>
          </div>
          <div>
            <form action="/${filteredpage}/${num}/current_delete_process" method="GET">
                <input type="submit" value="삭제">
            </form>
          </div>
          </div>
          `;
      }
    return list;
  },

  BoardTemplate : function(title, author, board, filepath, comment_View, comment_Form) {
    var description = `
            <div class="text">
              <div class="title_author">
                <h2 class="title">${title}</h2>
                <h4 class="author">${author}</h4>
              </div>
              <div class="descriptions">
                ${board}
              </div>
              <div clsaa="file">
              <p>첨부파일 : <a href="/uploads/${filepath}">${filepath}</a></p>
              </div>
            </div>
            ${comment_View}
            </div>
            <div class="input_comment">${comment_Form}</div>
            `;
            
    return description;
  },

  Comment_Form : function(page, pageId) {
    return `
    <form action="/${page}/${pageId}/comment_upload" method="post">
      <div class="commentforms">
        <div class="commentform">
          <div>글쓴이</div><div>비밀번호</div><div>내용</div>
          <div><textarea id="commenter" name="commenter"></textarea></div>
          <div><input id="password" type="password" name="password"></div>
          <div><textarea id="comment" name="comment"></textarea> </div>
        </div>
        <div>
          <input type="submit" value="작성">
        </div>
      </div>

      </div>
    </form>`;
  },

  

  Comment_View : function(rows, filteredpage, num) {
    var comment_list = '<div class="CommentLists">';
    comment_list = comment_list + '<div class="CommentList"><div>번호</div><div>글쓴이</div><div>내용</div><div>작성시간</div><div>삭제</div></div>';
    for(var i in rows) {
      var comment_num = rows[i].board_comment_num;
      var commenter = rows[i].commenter;
      var comment = rows[i].comment_board;
      var comment_time = rows[i].comment_time;
      var sliced_day = comment_time.toLocaleDateString().replace(/T/, ' ').replace(/\..+/, '')
      var sliced_time = comment_time.toLocaleTimeString().replace(/T/, ' ').replace(/\..+/, '')
      
      var sliced_daytime = sliced_day + " " + sliced_time;
      
      // 출처 : https://stackoverflow.com/questions/10645994/how-to-format-a-utc-date-as-a-yyyy-mm-dd-hhmmss-string-using-nodejs

      comment_list = comment_list + `
        <div class="CommentList">
          <div>${comment_num}</div>
          <div>${commenter}</div>
          <div>${comment}</div>
          <div>${sliced_daytime}</div>
          <div>
            <form action="/${filteredpage}/${num}/${comment_num}/delete_comments" method="GET">
              <input type="submit" value="삭제">
            </form>
          </div>
        </div>
        
          `;
      }
    return comment_list;
  },

  Currect_CommentDelete_Password : function(page, pageId, comment_num) {
    return `
      <form action="/${page}/${pageId}/${comment_num}/delete_comment" method="post">
        <p>비밀번호를 입력해 주세요</p>
        <input type="password" name="password">
        <input type="submit" value="확인">
      </form>`;
  },

 Multiupload : function(folder) {
    return `
      <form action="/upload_process" method="post" enctype="multipart/form-data">
        <p>제목</p><textarea id="title" name="title"></textarea>
        <p>작성자</p><textarea id="author" name="author"></textarea>
        <p>비밀번호</p><input id="password" type="password" name="password">
        <p>게시판 선택</p>
        <select id="board" name="board">
          ${folder}
        </select>
        <p>내용</p><textarea id="description" name="description"></textarea>
        <p>파일 업로드</p>
        <p><input id="file" type="file" name="upload_Files" multiple="multiple"></p>        
        <br><input type="submit" value="작성">
      </form>`;
  },

  UpdateForm : function(page, pageId, title, author, folder, description) {
    return `
      <form action="/${page}/${pageId}/update_process" method="post" enctype="multipart/form-data">
        <p>제목</p><textarea id="title" name="title">${title}</textarea>
        <p>작성자</p><textarea id="author" name="author">${author}</textarea>
        <p>비밀번호</p><input id="password" type="password" name="password"></textarea>
        <p>게시판 : ${folder}</p>
        <p>내용</p><textarea id="description" name="description">${description}</textarea>
        <p>파일 업로드</p>
        <p><input id="file" type="file" name="upload_Files" multiple="multiple"></p>        
        <br><input type="submit" value="작성">
      </form>`;
  },

  Currect_Delete_Password : function(page, pageId) {
    return `
      <form action="/${page}/${pageId}/delete_process" method="post">
        <p>비밀번호를 입력해 주세요</p>
        <input type="password" name="password">
        <input type="submit" value="확인">
      </form>`;
  },

  Currect_Update_Password : function(page, pageId) {
    return `
      <form action="/${page}/${pageId}/PasswordCheck" method="post">
        <p>비밀번호를 입력해 주세요</p>
        <input type="password" name="password">
        <input type="submit" value="확인">
      </form>`;
  },
  
  createdfolder : function() {
    return `
      <form action="/created_folder_process" method="post">
        <p>생성할 게시판명을 입력해 주세요</p>
        <input type="text" name="foldername">
        <input type="submit" value="생성">
      </form>`;
  },

  deletedfolder : function() {
    return `
      <form action="/deleted_folder_process" method="post">
        <p>삭제할 게시판명을 입력해 주세요</p>
        <p>게시판가 비어있을 경우 삭제가 진행됩니다.</p>
        <input type="text" name="foldername">
        <input type="submit" value="삭제">
      </form>`;
  },

  mainpage : function(filelist) {
    return `
    <div class="image"></div>
    <div class="maintext"><p>자신의 생각을 마음껏 전달하세요!</p></div>
    `;
  }  
}


