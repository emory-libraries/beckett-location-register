<?php

// Parses a CSV file into an associative PHP array.
function csv_to_array( $path, $has_headers = true ) {
  
  // Open the file.
  $handle = fopen($path, 'r');
  
  // Verify that the file was opened.
  if( $handle ) {
    
    // Initialize the data.
    $csv = [];
    $headers = [];
    $index = 1;
    
    // Get each line one at a time.
    while( ($data = fgetcsv($handle)) ) { var_dump($data);
      
      if( $has_headers ) { 
        
        if( $index == 1 ) { $headers = $data; }
        
        else { $csv[] = array_combine($headers, $data); }
      
      }
      
      else { $csv[] = $data;  }
      
      $index++;
      
    }
    
    fclose($handle);
    
    return $csv;
    
  }
  
}

// Parses a CSV file into a JSON array.
function csv_to_json( $path ) {
  
  return json_encode( csv_to_array($path) );
  
}

?>