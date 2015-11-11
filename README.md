# perch-cms-fieldtype-table

Table fieldtype for [Perch CMS](http://grabaperch.com). Works in standard templates and within blocks. Creates a configurable editable datatable within the Perch admin and outputs an HTML `<table>` element.

**Be warned! This README document is a work in progress and the repository is subject to change until marked as v1.0.**

## Installation

Download and place the `simona_table` folder within `perch/addons/fieldtypes`.

## Usage

Once installed, the fieldtype can be used in a template by setting the `type` attribute to `simona_table`:

`<perch:content id="mytable" type="simona_table" label="Editable Table" />`

Example templates are supplied in the `templates` folder.

Table data is editable within Perch. To add and remove rows or columns, right-click and use the context menu. Note: columns can only be added or removed if the `columns` attribute is not specified (see below).

Column headers are editable within Perch. The Perch region `Save Changes` and `Save & Add another` buttons are disabled while column headers are in edit mode.

### Attributes

#### columns

Optional. The `columns` attribute takes a comma-separated list that defines the structure of the table. An optional type and format/options for each column can also be specified, separated by `|`. If used, column names are output in the `<thead>` section of the `<table>` element. If the `columns` attribute is not used, an empty 2*4 table is created and the user can add or remove columns as desired via right-click.

Example:
`<perch:content id="mytable" type="simona_table" label="Predefined Table" columns="Name,Age|numeric,Value|numeric|$0.00,Date of Birth|date|DD MMM YYYY,Active|checkbox|yes;no,Favourite colour|dropdown|blue;red;yellow;pink" />`

Suported column types: `text` (the default), `numeric`, `date`, `checkbox`, `dropdown`.

##### numeric
Formats for the numeric column type follow the [numeral.js](http://numeraljs.com/) syntax. Default is `0`.

##### date
Formats for the date column type follow the [moment.js](http://momentjs.com/docs/#/parsing/string-format/) syntax. Default is `DD-MM-YYYY`.

##### checkbox
Checkbox values can be specified as `checked_value;unchecked_value`. Default is `true;false`.

##### dropdown
Dropdown options should be specified by a semi-colon delimited list, as in the example above.

#### class

Optional. If specified, the `class` attribute is applied to the output `<table>` element.
`<perch:content id="mytable" type="simona_table" label="Editable Table" class="table table-striped" />`

#### hide-headers

Optional: Set to true to hide the `<thead>` section in the output.
`<perch:content id="mytable" type="simona_table" label="Editable Table" hide-headers="true" />`

## Future Development

- Implement individual formatting of table cells within Perch.
- Optional data validation: for example, don't allow saving if a `numeric` cell contains text.
- Merge cells functionality.
- Load data from file.

## Credits

* handsontable: http://handsontable.com/

## License

perch-cms-fieldtype-table is released under the [MIT License](https://github.com/siansell/perch-cms-fieldtype-table/blob/master/LICENSE).
