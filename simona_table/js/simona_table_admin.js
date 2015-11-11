$(window).on('Perch_Init_Editors', initTables);

function initTables() {

  $('div[id^="simona_hot_"]').each(function(index) {

    var unique_id = this.id.replace('simona_hot_', '');

    var result = $.grep(simona_table, function(e){
      return e.id == unique_id;
    });

    if (result.length == 0) {

      var data = JSON.parse($('#' + unique_id + '_data').val());
      var headers = JSON.parse($('#' + unique_id + '_headers').val());
      if (headers == '[]') headers = true;

      var types = JSON.parse($('#' + unique_id + '_types').val());
      var columns = [];
      if (types != '[]') {
        for (i=0;i<types.length;i++) {
          var c = {};
          c.type = types[i];
          columns.push(c);
        }
      } else {
        columns = false;
      }

      if (columns.length > 0) {
        var options = JSON.parse($('#' + unique_id + '_options').val());
        for (i=0;i<columns.length;i++) {
          switch(columns[i].type) {
            case 'numeric':
              //valid number formats:http://numeraljs.com/
              if (options[i]) {
                columns[i].format = options[i];
              }
              break;
            case 'date':
              //valid date formats: http://momentjs.com/docs/#/parsing/string-format/
              if (options[i]) {
                columns[i].dateFormat = options[i];
                columns[i].correctFormat = true;
              }
              break;
            case 'checkbox':
              var opts = options[i].split(';');
              columns[i].checkedTemplate = opts[0];
              columns[i].uncheckedTemplate = opts[1];
              break;
            case 'dropdown':
              var opts = options[i].split(';');
              columns[i].source = opts;
              break;
          }
        }
        // console.log(columns);
      }

      var container = document.getElementById(this.id);

      this.setData = function(hot) {
        // console.log(hot.getData());
        $data = hot.getData();
        if (data && data.length > 0) {
          for (i=0;i<data.length;i++) {
            for (j=0;j<data[i].length;j++) {
              switch (types[j]) {
                case 'numeric':
                  data[i][j] = numeral(data[i][j]).format(options[j]);
                  break;
              }
            }
          }
          out = JSON.stringify(data);
          $('#' + unique_id + '_data').val(out);
        }
      };

      this.setHeaders = function(hot) {
          out = hot.getColHeader();
          for (i=0;i<out.length;i++) {
            if (!out[i]) out[i] = '';
          }
          out = JSON.stringify(out);
          $('#' + unique_id + '_headers').val(out);
      };

      var parent = this;
      var hot = new Handsontable(container, {
        data: data,
        minSpareRows: 0,
        rowHeaders: false,
        colHeaders: headers,
        columns: columns,
        contextMenu: {
          items: {
            'row_above': {},
            'row_below': {},
            'remove_row': {},
            "hsep1": "---------",
            'col_left': {},
            'col_right': {},
            'remove_col': {},
          }
        },
        manualColumnResize: true,
        manualRowResize: true,
        afterChange: function(changes, source) {
          parent.setData(this);
        },
        afterGetColHeader: function (col, TH) {
          // console.log('afterGetColHeader');
          parent.setData(this);
          parent.setHeaders(this);
        },
        afterCreateRow: function(index, amount) {
          parent.setData(this);
        },
        afterRemoveRow: function(index, amount) {
          parent.setData(this);
        },
        afterCreateCol: function(index, amount) {
          parent.setData(this);
        },
        afterRemoveCol: function(index, amount) {
          parent.setData(this);
        }
      });
      this.setHeaders(hot);
      hot.id = unique_id;
      simona_table.push(hot);

    }

  });

}

function getHotFromID(id) {
  //find the table
  var hot = $.grep(simona_table, function(e){
    return e.id == id.replace('simona_hot_', '');
  });
  if (hot.length == 0) {return false;}

  return hot[0];
}

function editColHeaders(id, e) {

  hot = getHotFromID(id);
  if (!hot.hasColHeaders() || hot == false) { return; }
  $(e).hide();
  var save_id = e.id.replace('edit', 'save');
  // console.log(save_id);
  $('#' + save_id).show();

  $('input[type="submit"]#btnsubmit').prop('disabled', true);
  $('input[type="submit"]#add_another').prop('disabled', true);

  // console.log(hot);
  current_headers = hot.getColHeader();

  hot.updateSettings({
    colHeaders: function (index) {
      var textbox = '<input type="text" onchange="javascript:saveHeader(\'' + id + '\', ' + index + ', $(this).val());" value="' + current_headers[index] + '" />';
      return textbox;
    },
    afterOnCellMouseDown : function(sender, e){
      if (e.row === -1) {
        this.getInstance().deselectCell();
      }
    },
  });

}

function saveColHeaders(id, e) {

  hot = getHotFromID(id);
  if (!hot.hasColHeaders() || hot == false) { return; }
  $(e).hide();
  var edit_id = e.id.replace('save', 'edit');
  // console.log(edit_id);
  $('#' + edit_id).show();

  new_headers = [];
  x = hot.getColHeader();
  for (i=0;i<x.length;i++) {
    // console.log($(x[i]).attr('value'));
    new_headers.push($(x[i]).attr('value'));
  }

  hot.updateSettings({
    colHeaders: new_headers
  });

  $('input[type="submit"]#btnsubmit').prop('disabled', false);
  $('input[type="submit"]#add_another').prop('disabled', false);

}

function saveHeader(id, col, value) {

  // console.log(id);

  hot = getHotFromID(id);
  if (!hot.hasColHeaders() || hot == false) { return; }

  new_headers = hot.getColHeader();
  new_headers[col] = '<input type="text" onchange="javascript:saveHeader(\'' + id + '\', ' + col + ', $(this).val());" value="' + value + '" />';

  // console.log(new_headers);

  hot.updateSettings({
    colHeaders: new_headers
  });

}

var simona_table=[];
initTables();
// console.log(simona_table);
