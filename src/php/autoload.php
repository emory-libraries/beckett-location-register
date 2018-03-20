<?php

// Autoload classes.
spl_autoload_register(function( $class ) {
  
  $path = "classes/$class.class.php";
  
  if( file_exists($path) ) { include $path; }
  
});

// Scan for libraries.
$libraries = array_filter(scandir('libraries/'), function($item) {
  
  return !is_dir("libraries/$item") and !in_array($item, ['.', '..']);
  
});

// Load libraries.
foreach( $libraries as $library ) { include "libraries/$library"; }

?>