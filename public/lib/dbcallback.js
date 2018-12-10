exports.table = function(tables) {
    var folderlists = '<ul>';
    var list = "";
    for (var property in tables) {
        folderlists = folderlists + `<li><a href="/${tables[property].Tables_in_dp_board}">${tables[property].Tables_in_dp_board}</a></li>`;
        list = list + `<option value="${tables[property].Tables_in_dp_board}">${tables[property].Tables_in_dp_board}</option>`;
    }
    folderlists = folderlists+'</ul>';

    return {
        folderlists: folderlists,
        list: list
    }
  }