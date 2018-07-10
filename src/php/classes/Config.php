<?php

class Config {
  
  private $config = [
    'DEVELOPMENT' => DEVELOPMENT, 
    'LOCAL_DATABASE' => LOCALDB,
    'ROOT' => ROOT
  ];
  
  // Constructor
  function __construct() { 

    // Load meta data.
    $this->config['ROUTER'] = json_decode(file_get_contents("{$this->ROOT}/router.json"), true);
    $this->config['META'] = json_decode(file_get_contents("{$this->ROOT}/meta.json"), true);
    $this->config['PROGRESS'] = "{$this->ROOT}/.progress.json";

  }
  
  // Getter
  function __get( $key ) {
    
    if( array_key_exists($key, $this->config) ) { return $this->config[$key]; }
    
  }
  
  // Setter
  function __set( $key, $value ) {
    
    $this->config[$key] = $value;
    
  }
  
}

?>
