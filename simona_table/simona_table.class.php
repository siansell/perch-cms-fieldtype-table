<?php
class PerchFieldType_simona_table extends PerchAPI_FieldType
{

  public $processed_output_is_markup = true;

  private $_location = '/addons/fieldtypes/simona_table';
  private $_handsontable_location = "/handsontable-0.19.0/dist/";

  public function add_page_resources()
  {
    $Perch = Perch::fetch();
    $Perch->add_css(PERCH_LOGINPATH. $this->_location. '/css/simona_table_admin.css');
    $Perch->add_css(PERCH_LOGINPATH. $this->_location. $this->_handsontable_location. 'handsontable.full.min.css');
    $Perch->add_javascript(PERCH_LOGINPATH. $this->_location. $this->_handsontable_location. 'handsontable.full.min.js');
    $Perch->add_javascript(PERCH_LOGINPATH. $this->_location. '/js/simona_table_admin.js');
  }

  public function render_inputs($details=array()) {

    // PerchUtil::debug($this);

    $id = $this->required_id;

    $default_data = array();

    if ($this->Tag->columns()) {
      $columns = explode(',', $this->Tag->columns());
      $column_headers = array();
      $column_types = array();
      $column_options = array();
      for ($i=0; $i<count($columns); $i++) {
        $tmp = explode('|', $columns[$i]);
        array_push($column_headers, $tmp[0]);
        if (count($tmp) > 1) {
          array_push($column_types, $tmp[1]);
        } else {
          array_push($column_types, 'text');
        }
        if (count($tmp) > 2) {
          array_push($column_options, $tmp[2]);
        } else {
          array_push($column_options, '');
        }
      }
      for ($i=0; $i<2; $i++) {
        $a = array_fill(0, count($column_headers), NULL);
        array_push($default_data, $a);
      }
    } else {
      $column_headers = '[]';
      $column_types = '[]';
      $column_options = '[]';
      for ($i=0; $i<2; $i++) {
        $a = array_fill(0, 4, NULL);
        array_push($default_data, $a);
      }
    }


    $data = isset($details[$id]['data']) ? $this->Form->get($details[$id], 'data') : json_encode($default_data);
    $headers = isset($details[$id]['headers']) ? $this->Form->get($details[$id], 'headers') : json_encode($column_headers);
    $types = isset($details[$id]['types']) ? $this->Form->get($details[$id], 'types') : json_encode($column_types);
    $options = isset($details[$id]['options']) ? $this->Form->get($details[$id], 'options') : json_encode($column_options);

    $s = '';
    $s.= '<div class="simona_table_row">';
    $s.= '<p><a href="#" id="simona_hot_'. $id. '_edit_headers" onclick="javascript:editColHeaders(\'simona_hot_'. $id. '\', this); return false;">Edit column headers</a></p>';
    $s.= '<p><a href="#" id="simona_hot_'. $id. '_save_headers" style="display:none;" onclick="javascript:saveColHeaders(\'simona_hot_'. $id. '\', this); return false;">Save column headers</a></p>';
    $s.= '  <div class="simona_hot">';
    $s.= '    <div id="simona_hot_'. $id. '"></div>';
    $s.= '  </div>';
    $s.= '</div>';
    $s.= $this->Form->hidden($id. '_data',  $data);
    $s.= $this->Form->hidden($id. '_headers',  $headers);
    $s.= $this->Form->hidden($id. '_types',  $types);
    $s.= $this->Form->hidden($id. '_options',  $options);
    return $s;

  }

  public function get_raw($post=false, $Item=false) {

    $id = $this->Tag->id();
    // PerchUtil::debug($this->Tag);


    if (isset($post[$id. '_data']) && trim($post[$id. '_data']) !== '') {
      $out['data'] = $post[$id. '_data'];
    } else {
      $out['data'] = '[]';
    }

    if (isset($post[$id. '_headers']) && trim($post[$id. '_headers']) !== '') {
      $out['headers'] = $post[$id. '_headers'];
    } else {
      $out['headers'] = '[]';
    }

    if (isset($post[$id. '_types']) && trim($post[$id. '_types']) !== '') {
      $out['types'] = $post[$id. '_types'];
    } else {
      $out['types'] = '[]';
    }

    if (isset($post[$id. '_options']) && trim($post[$id. '_options']) !== '') {
      $out['options'] = $post[$id. '_options'];
    } else {
      $out['options'] = '[]';
    }

    return $out;

  }

  public function get_processed($raw=false) {

    // PerchUtil::debug($this->Tag);
    // PerchUtil::debug($this->Tag->hide_headers());

    $data = json_decode($raw['data']);
    $headers = json_decode($raw['headers']);
    $types = json_decode($raw['types']);
    $options = json_decode($raw['options']);
    $hideheaders = ($this->Tag->hide_headers() === 'true') ? true : false;

    $out = '<table';
    if ($this->Tag->class()) $out.= ' class="'. $this->Tag->class(). '"';
    $out.= '>';

    if ($headers && !$hideheaders) {
      $out.= '<thead>';
      foreach ($headers as $i => $th) {
        $out.= '<th>'. $th. '</th>';
      }
      $out.= '</thead>';
    }

    $out.= '<tbody>';
    foreach ($data as $i => $row) {
      $out.= '<tr>';
      foreach ($row as $j => $col) {
        $out.= '<td>'. $col. '</td>';
      }
      $out.= '</tr>';
    }
    $out.= '</tbody>';
    $out.= '</table>';

    return $out;

  }

  public function get_search_text($raw=false) {
    return false;
  }

  public function render_admin_listing($raw=false) {
    return false;
  }

}
?>
