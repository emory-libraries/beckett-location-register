<?php

if( !function_exists('curl_reset') ) {
  
  function curl_reset(&$ch) { $ch = curl_init(); }
  
}

?>