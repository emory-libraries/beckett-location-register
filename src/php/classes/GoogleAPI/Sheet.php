<?php

class Sheet {
  
  protected $service;
  
  public $id;
  
  function __construct( $id ) {

    // Load the service.
    $this->service = new Google_Service_Sheets( (new Client())->client );
    
    // Set the sheet ID.
    $this->id = $id;
    
  }
  
  function read( $range = null ) { var_dump($range);
    
    // Query the sheet.
    $response = $this->service->spreadsheets_values->get($this->id, $range);
    
    // Return the values.
    return $response->getValues();
    
  }
  
}

?>