<?php

// Use dependencies.
use \ForceUTF8\Encoding;

// Parses a CSV file into an associative PHP array.
function csv_to_array( $path, $has_headers = true ) { 
  
  // Open the file.
  $handle = fopen($path, 'r');
  
  // Verify that the file was opened.
  if( $handle ) {
    
    // Initialize the data.
    $csv = [];
    
    // Get each line one at a time.
    while( ($data = fgetcsv($handle)) ) { $csv[] = $data; }
    
    // Close the file.
    fclose($handle);
    
    // Handle headers.
    if( $has_headers ) {
      
      // Extract headers.
      $headers = array_map(function($header) {
        
        return trim(Encoding::toUTF8($header));
        
      }, array_shift($csv)); 

      // Map headers to the array data.
      $csv = array_map(function($row) use ($headers) {

        return array_combine($headers, $row);
        
      }, $csv);
      
    }
    
    return $csv;
    
  }
  
}

// Parses a CSV file into a JSON array.
function csv_to_json( $path ) {
  
  return json_encode( csv_to_array($path) );
  
}

?>