<?php

function scandir_recursive( $root ) {
  
  if( is_file($root) ) return;
  
  $root = rtrim($root, '/').'/';
  
  $dirs = array_filter(scandir($root), function($dir) {
    
    return !in_array($dir, ['.', '..']);
    
  });
  
  $result = [];
  
  foreach( $dirs as &$dir ) {
    
    $path = $root.$dir;
    
    if( is_dir($path) ) $result = array_merge($result, scandir_recursive( $path ));
      
    else $result[] = $path;
    
  }
  
  return $result;
  
}

?>