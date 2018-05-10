// Constants
const allTablesOnPage = []
const tablePrefix = 'simona_hot_'

const setCulture = (id) => {
  const culture = $(`#${id}_culture`).val()
  numbro.culture(culture)
}

const initTables = () => {
  // Don't use an arrow function as the callback, we need `this`
  $(`div[id^=${tablePrefix}]`).each(function () {
    // Unique table id
    const uid = this.id.replace(tablePrefix, '')

    // Does the table already exist in the DOM?
    // TODO: this might not be necessary?
    const result = $.grep(allTablesOnPage, e => e.id === uid)
    // Table already exists. Do nothing.
    if (result.length) return

    // Hidden DOM elements holding the table data in a value attribute
    const dataEl = $(`#${uid}_data`)
    const headersEl = $(`#${uid}_headers`)
    const typesEl = $(`#${uid}_types`)
    const optionsEl = $(`#${uid}_options`)
    setCulture(uid)

    // data is an array with one item for each row in the table
    // Each item is an array with one item for each column
    const data = JSON.parse(dataEl.val())

    // headers is an array with one item for each column
    const headers = JSON.parse(headersEl.val())

    // types is an array with one item for each column
    const types = JSON.parse(typesEl.val())

    // options is an array with one item for each column
    const options = JSON.parse(optionsEl.val())

    // Populate an array of column objects. Some keys only apply to certain types.
    // { type, dateFormat, correctFormat, checkedTemplate, uncheckedTemplate, source }
    const columns = types
      .map((type, i) => {
        const col = {
          type,
        }

        const colOptions = options[i]
        const optionsParts = colOptions.split(';')

        // Add properties to the columns depending on column type
        switch (type) {
          case 'numeric':
          // Valid patterns: http://numbrojs.com/format.html#numbers
            if (colOptions) {
              col.numericFormat = {
                pattern: colOptions,
              }
            }
            break

          case 'date':
          // Valid date formats: http://momentjs.com/docs/#/parsing/string-format/
            if (options[i]) {
              col.dateFormat = colOptions
              col.correctFormat = true
            }
            break

          case 'checkbox':
            col.checkedTemplate = optionsParts[0]
            col.uncheckedTemplate = optionsParts[1]
            break

          case 'dropdown':
          // Semi-colon delimited list of options
            col.source = optionsParts
            break
        }

        return col
      })

    // Write formatted Handsontable data to the hidden DOM element
    this.setData = (hot) => {
      setCulture(uid)

      const hotData = hot
        .getData()

      const formattedData = hotData.map((row, i) => {
        return row.map((col, j) => {
          switch (types[j]) {
            case 'numeric':
              return hotData[i][j] ? numbro(hotData[i][j]).format(options[j]) : null
            default:
              return col
          }
        })
      })

      $(dataEl).val(JSON.stringify(formattedData))
    }

    // Set the Handsontable headers
    this.setHeaders = (hot) => {
      $(headersEl).val(
        JSON.stringify(
          hot
            .getColHeader()
            .map(header => header || '')
        )
      )
    }

    // Init the table: https://docs.handsontable.com/pro/2.0.0/tutorial-quick-start.html
    var parent = this
    var container = document.getElementById(this.id)
    var hot = new Handsontable(container, {
      afterChange: function () {
        parent.setData(this)
      },
      afterCreateCol: function () {
        parent.setData(this)
      },
      afterCreateRow: function () {
        parent.setData(this)
      },
      afterGetColHeader: function () {
        parent.setData(this)
        parent.setHeaders(this)
      },
      afterRemoveCol: function () {
        parent.setData(this)
      },
      afterRemoveRow: function () {
        parent.setData(this)
      },
      data: data,
      colHeaders: headers,
      columns: columns,
      contextMenu: {
        items: {
          row_above: {},
          row_below: {},
          remove_row: {},
        },
        // TODO: conditionally add/remove columns. change default data in php file
      },
      manualColumnResize: true,
      manualRowResize: true,
      rowHeaders: false,
    })
    this.setHeaders(hot)
    hot.id = uid
    allTablesOnPage.push(hot)
  })
}

// Find a table by id
const getHotFromID = (id) => {
  const hot = $.grep(allTablesOnPage, e => e.id === id.replace(tablePrefix, ''))
  if (!hot.length) return false
  return hot[0]
}

// `Save changes` / `Cancel` Perch edit buttons. Pass true to disable,false to enable
const disablePerchEditButtons = (value) => {
  $('input[type="submit"]#btnsubmit').prop('disabled', value)
  $('input[type="submit"]#add_another').prop('disabled', value)
}

const editColHeaders = (id, e) => { // eslint-disable-line
  const hot = getHotFromID(id)
  if (!hot.hasColHeaders() || hot === false) return

  // Save/edit links
  $(e).hide()
  $(`#${e.id.replace('edit', 'save')}`).show()

  disablePerchEditButtons(true)

  hot.updateSettings({
    // Replace column headers with editable inputs
    colHeaders: hot
      .getColHeader()
      .map((h, i) =>
        `<input type="text" onchange="javascript:saveHeader('${id}',${i},$(this).val());" value="${h}" />`),
    afterOnCellMouseDown: function (sender, e) { // no arrow function here, we need `this`
      // Disable default header click behaviour, which is to select the entire cell
      if (e.row === -1) this.getInstance().deselectCell()
    },
  })
}

const saveColHeaders = (id, e) => { // eslint-disable-line
  const hot = getHotFromID(id)
  if (!hot.hasColHeaders() || hot === false) return

  // Save/edit links
  $(e).hide()
  $(`#${e.id.replace('save', 'edit')}`).show()

  hot.updateSettings({
    colHeaders: hot
      .getColHeader()
      .map(header => $(header).attr('value')),
  })

  disablePerchEditButtons(false)
}

const saveHeader = (id, col, value) => { // eslint-disable-line
  const hot = getHotFromID(id)
  if (!hot.hasColHeaders() || hot === false) return

  hot.updateSettings({
    colHeaders: hot
      .getColHeader()
      .map((h, i) => i === col ? h.replace(/value=".*"/, `value="${value}"`) : h),
  })
}

// Let's go!
// Perch_Init_Editors is called when a new block or repeater item is added in Perch
$(window).on('Perch_Init_Editors', initTables)
initTables()
