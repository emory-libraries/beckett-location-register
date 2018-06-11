<?php

function is_associative_array( array $array ) {

  if( array() == $array ) return false;
  
  $numeric = [];
  
  foreach( $array as $key => $value ) { $numeric[] = is_numeric($key); }

  return array_every($numeric, function($value) { return $value == false; });
  
}

function array_every( array $array, callable $condition ) {
  
  $result = true;
  
  foreach( $array as $key => $value ) { if( !$condition($value) ) $result = false; }
  
  return $result;
  
}

function array_flatten( array $array, $delimiter = '.', $prefix = '' ) {
    
  // Initialize the result.
  $result = [];

  // Flatten the array.
  foreach( $array as $key => $value ) { 

    // Catch nested arrays.
    if( is_array($value) ) {

      // Handle arrays with prefixes.
      if( $prefix != '' ) { $result = array_merge($result, array_flatten($value, $delimiter, $prefix.$delimiter.$key)); }
      
      // Handle arrays without prefixes.
      else { $result = array_merge($result, array_flatten($value, $delimiter, $key)); }

    }

    // Otherwise, handle values.
    else { 

      // Handle values with a prefix.
      if( $prefix != '' ) { $result[$prefix.$delimiter.$key] = $value; }

      // Handle values without a prefix.
      else { $result[$key] = $value; }

    }

  }
  
  // Return the flattened array.
  return $result;
  
}

function array_expand( array $array, $delimiter = '.' ) {
  
  // Initialize a result set.
  $results = [];
  
  // Expand the array.
  foreach( $array as $key => $value ) {
    
    // Explode the key.
    $exploded = explode($delimiter, $key);

    // Count the exploded keys.
    $length = count($exploded);
    
    // Handle singular keys.
    if( $length == 1 ) { $results[$key] = $value; }
    
    // Handle delimited keys.
    else {
      
      // Initialize the result.
      $result = [];
      $pointer = &$result;
      $index = 0;
      
      // Loop through exploded keys.
      foreach( $exploded as $level ) {

        // Create a series of nested arrays as needed.
        if( $index < $length - 1 and !array_key_exists($level, $result) ) { $pointer[$level] = []; }

        // Move up one level within the hierarchy.
        $pointer = &$pointer[$level]; 

        // Set the array value.
        if( $index == $length - 1 ) { $pointer = $value; }

        // Increment the index.
        $index++;

      }

      // Merge array results
      $results = array_merge_recursive($results, $result);

    }
    
  }
  
  // Return the array.
  return $results;
  
}

function array_colsort( array $array, array $cols = [] ) { 
                                                          
  $result = $array;
  
  usort($result, function( array $a, array $b) use( $cols ) { 
    
    foreach( $cols as $col => $order ) {
      
      if( $a[$col] != $b[$col] ) {
        
        if( $order === SORT_DESC or strpos($order, 'DESC') !== false ) {
          
          if( is_numeric($a[$col]) and is_numeric($b[$col]) ) return $a[$col] < $b[$col] ? 1 : -1;
          
          elseif( is_string($a[$col]) and is_string($b[$col]) ) return strcmp($a[$col], $b[$col]) * -1;
          
          else return strnatcmp($a[$col], $b[$col]) * -1;
          
        }
        
        else {
          
          if( is_numeric($a[$col]) and is_numeric($b[$col]) ) return $a[$col] < $b[$col] ? -1 : 1;
          
          elseif( is_string($a[$col]) and is_string($b[$col]) ) return strcmp($a[$col], $b[$col]);
          
          else return strnatcmp($a[$col], $b[$col]);
          
        }
        
      }
      
    }
    
    return 0;
    
  });
                                                          
  return $result;
  
}

function array_equiv( array $array, array $comp ) {
  
  // First, check length.
  if( count($array) !== count($comp) ) return false;
  
  // Next, check keys and values.
  foreach( $array as $key => $value ) {
    
    // Check if the key exists.
    if( array_key_exists($key, $comp) ) return false;
    
    // Get the value.
    $comp_value = $comp[$key];
    
    // Check for array values.
    if( is_array($value) or is_array($comp_value) ) {
      
      // Check for type equivalence.
      if( is_array($value) and !is_array($comp_value) ) return false;
      if( is_array($comp_value) and !is_array($value) ) return false;
      
      // Check for array equivalence.
      if( !array_equiv($value, $comp_value) ) return false;
      
    }
    
    // Check for scalar values.
    else {
      
      // Check for value equivalence.
      if( $value !== $comp_value ) return false;
      
    }
    
  }
     
  // Otherwise, equivalent.
  return true;
  
}

?>