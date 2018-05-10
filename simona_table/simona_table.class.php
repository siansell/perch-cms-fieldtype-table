<?php
// Ref: https://docs.grabaperch.com/api/field-types/
class PerchFieldType_simona_table extends PerchAPI_FieldType
{
    public $processed_output_is_markup = true;

    private $_location = '/addons/fieldtypes/simona_table';

    // Default data, used if no columns attribute supplied
    private $_default_column_headers = ['A', 'B', 'C', 'D'];
    private $_default_column_types = ['text', 'text', 'text', 'text'];
    private $_default_column_options = ['', '', '', ''];

    // https://docs.grabaperch.com/api/reference/fieldtype/add-page-resources/
    // Adds Handsontable JS and CSS to the Perch admin
    public function add_page_resources()
    {
        $Perch = Perch::fetch();

        // Handsontable + dependencies
        $Perch->add_css(PERCH_LOGINPATH . $this->_location . '/css/handsontable.full.min.css');
        $Perch->add_javascript(PERCH_LOGINPATH . $this->_location . '/js/handsontable.full.min.js');
        $Perch->add_javascript(PERCH_LOGINPATH . $this->_location . '/js/languages.min.js');

        // simona_table
        $Perch->add_javascript(PERCH_LOGINPATH . $this->_location . '/js/simona_table_admin.min.js');
        $Perch->add_css(PERCH_LOGINPATH . $this->_location . '/css/simona_table_admin.min.css');
    }

    // https://docs.grabaperch.com/api/reference/fieldtype/render-inputs/
    // Renders the HTML to the Perch admin
    // Handsontable is then initialised via JS /js/simona_table_admin.js
    public function render_inputs($details = [])
    {
        if ($this->Tag->columns()) {
            // Table with predefined columns
            $columns = explode(',', $this->Tag->columns());
            $column_parts = array_map(function ($column) {
                return explode('|', $column);
            }, $columns);

            $column_headers = array_map(function ($part) {
                return $part[0];
            }, $column_parts);

            $column_types = array_map(function ($part) {
                if (PerchUtil::count($part) > 1) {
                    return $part[1];
                } else {
                    return 'text';
                }
            }, $column_parts);

            $column_options = array_map(function ($part) {
                if (PerchUtil::count($part) > 2) {
                    return $part[2];
                } else {
                    return '';
                }
            }, $column_parts);
        } else {
            // No predefined columns
            $column_headers = $this->_default_column_headers;
            $column_types = $this->_default_column_types;
            $column_options = $this->_default_column_options;
        }

        // Populate default data. 2 rows
        $default_data = [];
        for ($i = 0; $i < 2; $i++) {
            $a = array_fill(0, PerchUtil::count($column_headers), null);
            array_push($default_data, $a);
        }

        // If we already have data from $details, use it. Otherwise use the default data.
        $id = $this->required_id;
        /* Structure of $details[$id] is:
        [
        [data] => [["Simon","43","$22.11","12 Feb 18","yes","yellow"],[null,null,"$3.00",null,null,null],["Toby",null,"$NaN",null,"yes",null]],
        [headers] => ["Name","Age","Price","Date of Birth","Active","Favourite colour"],
        [types] => ["text","numeric","numeric","date","checkbox","dropdown"],
        [options] => ["","","$0.00","DD MMM YY","yes;no","blue;red;yellow;pink"],
        ] */
        $data = isset($details[$id]['data']) ? $this->Form->get($details[$id], 'data') : json_encode($default_data);
        $headers = isset($details[$id]['headers']) ? $this->Form->get($details[$id], 'headers') : json_encode($column_headers);
        $types = isset($details[$id]['types']) ? $this->Form->get($details[$id], 'types') : json_encode($column_types);
        $options = isset($details[$id]['options']) ? $this->Form->get($details[$id], 'options') : json_encode($column_options);
        if ($this->Tag->culture()) {
            $culture = $this->Tag->culture();
        } else {
            $culture = 'en-GB'; // http://numbrojs.com/languages.html#supported-languages
        }

        // Render the table.
        $s = '';
        $s .= '<div class="simona_table_row">';
        $s .= '    <div><a href="#" id="simona_hot_' . $id . '_edit_headers" onclick="javascript:editColHeaders(\'simona_hot_' . $id . '\', this); return false;">Edit column headers</a></div>';
        $s .= '    <div><a href="#" id="simona_hot_' . $id . '_save_headers" style="display:none;" onclick="javascript:saveColHeaders(\'simona_hot_' . $id . '\', this); return false;">Save column headers</a></div>';
        $s .= '    <div class="simona_hot">';
        $s .= '        <div id="simona_hot_' . $id . '"></div>';
        $s .= '    </div>';
        $s .= '</div>';
        $s .= $this->Form->hidden($id . '_data', $data);
        $s .= $this->Form->hidden($id . '_headers', $headers);
        $s .= $this->Form->hidden($id . '_types', $types);
        $s .= $this->Form->hidden($id . '_options', $options);
        $s .= $this->Form->hidden($id . '_culture', $culture);
        return $s;
    }

    // https://docs.grabaperch.com/api/reference/fieldtype/get-raw/
    // Prepares data to be stored in the Perch db.
    public function get_raw($post = false, $Item = false)
    {
        $id = $this->Tag->id();

        if (isset($post[$id . '_data']) && trim($post[$id . '_data']) !== '') {
            $out['data'] = $post[$id . '_data'];
        } else {
            $out['data'] = '[]';
        }

        if (isset($post[$id . '_headers']) && trim($post[$id . '_headers']) !== '') {
            $out['headers'] = $post[$id . '_headers'];
        } else {
            $out['headers'] = '[]';
        }

        if (isset($post[$id . '_types']) && trim($post[$id . '_types']) !== '') {
            $out['types'] = $post[$id . '_types'];
        } else {
            $out['types'] = '[]';
        }

        if (isset($post[$id . '_options']) && trim($post[$id . '_options']) !== '') {
            $out['options'] = $post[$id . '_options'];
        } else {
            $out['options'] = '[]';
        }

        return $out;
    }

    // https://docs.grabaperch.com/api/reference/fieldtype/get-processed/
    // Returns HTML that is rendered to the front-end.
    public function get_processed($raw = false)
    {
        $data = json_decode($raw['data']);
        $headers = json_decode($raw['headers']);
        $types = json_decode($raw['types']);
        $options = json_decode($raw['options']);
        $hideheaders = ($this->Tag->hide_headers() === 'true') ? true : false;

        // Opening tag
        $out = '<table';
        if ($this->Tag->class()) {
            $out .= ' class="' . $this->Tag->class() . '"';
        }
        $out .= '>';

        // Headers
        if ($headers && !$hideheaders) {
            $out .= '<thead>';
            foreach ($headers as $i => $th) {
                $out .= '<th>' . $th . '</th>';
            }
            $out .= '</thead>';
        }

        // Body
        $out .= '<tbody>';
        foreach ($data as $i => $row) {
            $out .= '<tr>';
            foreach ($row as $j => $col) {
                $out .= '<td>' . $col . '</td>';
            }
            $out .= '</tr>';
        }
        $out .= '</tbody>';

        // Closing tag
        $out .= '</table>';

        return $out;
    }

    // https://docs.grabaperch.com/api/reference/fieldtype/get-search-text/
    // Returns table contents as a string that can be used by Perch for searching purposes.
    public function get_search_text($raw = false)
    {
        return $raw['headers'] . '|' . $raw['data'];
    }

    // https://docs.grabaperch.com/api/reference/fieldtype/render-admin-listing/
    // Returns a summary of the table as a string, displayed in Perch admin listdetail mode.
    public function render_admin_listing($raw = false)
    {
        $row_count = PerchUtil::count(json_decode($raw['data']));
        $headers = implode(', ', json_decode($raw['headers']));
        return 'Table (' . $row_count . ' row' . ($row_count === 1 ? '' : 's') . '): ' . $headers;
    }
}
