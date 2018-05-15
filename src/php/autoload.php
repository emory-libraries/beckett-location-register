<?php

// Autoload classes.
spl_autoload_register(function( $class ) {
                                          
  $classes = scandir_recursive('classes/');
  
  $path = array_values(array_filter($classes, function($path) use ($class) {
    
    return strpos($path, str_replace('\\', '/', $class).'.php') !== false;
    
  }));

  if( !empty($path) and isset($path[0]) ) { include $path[0]; }
  
});

// Scan for libraries.
$libraries = array_filter(scandir('libraries/'), function($item) {
  
  return (!is_dir("libraries/$item") and !in_array($item, ['.', '..']));
  
});

// Load libraries.
foreach( $libraries as $library ) { include "libraries/$library"; }

?>