<?php

// Parses a CSV file into an associative PHP array.
function csv_to_array( $path ) {
  
  // Get data from CSV.
  $csv = array_map( 'str_getcsv', file($path) ); 
  
  // Combine headers with each array item.
  array_walk( $csv, function(&item) use ($csv) {
    
    item = array_combine($csv[0], item);
    
  });
  
  // Remove headers from array.
  array_shift( $csv );
  
  // Return associative array.
  return $csv;
  
}

// Parses a CSV file into a JSON array.
function csv_to_json( $path ) {
  
  return json_encode( csv_to_array($path) );
  
}

?>