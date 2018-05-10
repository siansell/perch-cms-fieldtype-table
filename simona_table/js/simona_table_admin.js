// Constants
var allTablesOnPage = []
var tablePrefix = 'simona_hot_'

// Perch_Init_Editors is called when a new block or repeater item is added in Perch
$(window).on('Perch_Init_Editors', initTables)

// Let's go
initTables()

function setCulture(id) {
  var culture = $('#' + id + '_culture').val()
  numbro.culture(culture)
}

function initTables() {
  $('div[id^=' + tablePrefix + ']').each(function() {
    var unique_id = this.id.replace(tablePrefix, '')

    // Does the table already exist in the DOM?
    // TODO: this might not be necessary?
    var result = $.grep(allTablesOnPage, function(e) {
      return e.id === unique_id
    })
    // Table already exists. Do nothing.
    if (result.length) return

    // Hidden DOM elements holding the table data in a value attribute
    var dataEl = $('#' + unique_id + '_data')
    var headersEl = $('#' + unique_id + '_headers')
    var typesEl = $('#' + unique_id + '_types')
    var optionsEl = $('#' + unique_id + '_options')
    setCulture(unique_id)

    // Init the table

    // data is an array with one item for each row in the table
    // Each item is an array with one item for each column
    var data = JSON.parse(dataEl.val())

    // headers is an array with one item for each column
    var headers = JSON.parse(headersEl.val())

    // types is an array with one item for each column
    var types = JSON.parse(typesEl.val())

    // Init an array of column objects and set the type. Some keys only apply to certain types.
    // { type, dateFormat, correctFormat, checkedTemplate, uncheckedTemplate, source }
    var columns = []
    for (var i = 0; i < types.length; i++) {
      var c = {}
      c.type = types[i]
      columns.push(c)
    }
    // options is an array with one item for each column
    var options = JSON.parse(optionsEl.val())

    // Add properties to the columns depending on column type
    for (i = 0; i < columns.length; i++) {
      var optionsParts = options[i].split(';')

      switch (columns[i].type) {
        case 'numeric':
          // Valid patterns: http://numbrojs.com/format.html#numbers
          if (options[i]) {
            columns[i].numericFormat = {
              pattern: options[i],
            }
          }
          break

        case 'date':
          // Valid date formats: http://momentjs.com/docs/#/parsing/string-format/
          if (options[i]) {
            columns[i].dateFormat = options[i]
            columns[i].correctFormat = true
          }
          break

        case 'checkbox':
          columns[i].checkedTemplate = optionsParts[0]
          columns[i].uncheckedTemplate = optionsParts[1]
          break

        case 'dropdown':
          // Semi-colon delimited list of options
          columns[i].source = optionsParts
          break
      }
    }

    // Write Handsontable data to the hidden DOM element
    this.setData = function(hot) {
      setCulture(unique_id)
      var hotData = hot.getData()
      for (var i = 0; i < hotData.length; i++) {
        for (var j = 0; j < hotData[i].length; j++) {
          switch (types[j]) {
            case 'numeric':
              if (hotData[i][j]) {
                hotData[i][j] = numbro(hotData[i][j]).format(options[j])
              }
              break
          }
        }
      }
      var out = JSON.stringify(hotData)
      $(dataEl).val(out)
    }

    // Set the Handsontable headers
    this.setHeaders = function(hot) {
      var out = hot.getColHeader()
      for (i = 0; i < out.length; i++) {
        if (!out[i]) out[i] = ''
      }
      out = JSON.stringify(out)
      $(headersEl).val(out)
    }

    // Init the table: https://docs.handsontable.com/pro/2.0.0/tutorial-quick-start.html
    var parent = this
    var container = document.getElementById(this.id)
    var hot = new Handsontable(container, {
      data: data,
      colHeaders: headers,
      columns: columns,
      contextMenu: {
        items: {
          row_above: {},
          row_below: {},
          remove_row: {},
        },
      },
      manualColumnResize: true,
      manualRowResize: true,
      rowHeaders: false,
      afterChange: function() {
        parent.setData(this)
      },
      afterGetColHeader: function() {
        parent.setData(this)
        parent.setHeaders(this)
      },
      afterCreateRow: function() {
        parent.setData(this)
      },
      afterRemoveRow: function() {
        parent.setData(this)
      },
      afterCreateCol: function() {
        parent.setData(this)
      },
      afterRemoveCol: function() {
        parent.setData(this)
      },
    })
    this.setHeaders(hot)
    hot.id = unique_id
    allTablesOnPage.push(hot)
  })
}

// Find a table
function getHotFromID(id) {
  var hot = $.grep(allTablesOnPage, function(e) {
    return e.id === id.replace(tablePrefix, '')
  })
  if (hot.length === 0) return false
  return hot[0]
}

function editColHeaders(id, e) { // eslint-disable-line
  var hot = getHotFromID(id)
  if (!hot.hasColHeaders() || hot === false) return

  $(e).hide()
  var save_id = e.id.replace('edit', 'save')
  $('#' + save_id).show()

  $('input[type="submit"]#btnsubmit').prop('disabled', true)
  $('input[type="submit"]#add_another').prop('disabled', true)

  var current_headers = hot.getColHeader()

  hot.updateSettings({
    colHeaders: function(index) {
      var textbox =
        '<input type="text" onchange="javascript:saveHeader(\'' +
        id +
        "', " + // eslint-disable-line
        index +
        ', $(this).val());" value="' +
        current_headers[index] +
        '" />'
      return textbox
    },
    afterOnCellMouseDown: function(sender, e) {
      if (e.row === -1) {
        this.getInstance().deselectCell()
      }
    },
  })
}

function saveColHeaders(id, e) { // eslint-disable-line
  var hot = getHotFromID(id)
  if (!hot.hasColHeaders() || hot === false) {
    return
  }
  $(e).hide()
  var edit_id = e.id.replace('save', 'edit')
  $('#' + edit_id).show()

  var new_headers = []
  var x = hot.getColHeader()
  for (var i = 0; i < x.length; i++) {
    new_headers.push($(x[i]).attr('value'))
  }

  hot.updateSettings({
    colHeaders: new_headers,
  })

  $('input[type="submit"]#btnsubmit').prop('disabled', false)
  $('input[type="submit"]#add_another').prop('disabled', false)
}

function saveHeader(id, col, value) { // eslint-disable-line
  var hot = getHotFromID(id)
  if (!hot.hasColHeaders() || hot === false) {
    return
  }

  var new_headers = hot.getColHeader()
  new_headers[col] =
    '<input type="text" onchange="javascript:saveHeader(\'' +
    id +
    "', " + // eslint-disable-line
    col +
    ', $(this).val());" value="' +
    value +
    '" />'

  hot.updateSettings({
    colHeaders: new_headers,
  })
}
