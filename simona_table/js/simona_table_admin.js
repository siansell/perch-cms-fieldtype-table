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

var simona_table=[];
initTables();
// console.log(simona_table);
