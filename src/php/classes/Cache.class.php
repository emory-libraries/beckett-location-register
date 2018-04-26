<?php

class Cache {
  
  protected $id;
  protected $cache;
  
  // Constructor
  function __construct( $id = 'cache' ) {
    
    // Save the ID.
    $this->id = $id;
    
    // Start a session.
    session_start();
    
    // FOR DEVELOPMENT
    //unset($_SESSION);

    // Reload the cache if it already exists.
    if( isset($_SESSION[$this->id]) ) $this->cache = &$_SESSION[$this->id];
    
    // Otherwise, initialize the cache.
    else $this->cache = $_SESSION[$this->id] = [];

    
  }
  
  // Check if the cache exists.
  function exists() {
    
    return !empty($this->cache);
    
  }
  
  // Define a cache value.
  function def( $key, $value = false ) {
    
    if( $value ) {
      
      $this->cache[$key] = $value;
      
    }
    
    else {
      
      return $this->cache[$key];
      
    }
    
  }
  
  // Set some cache data.
  function set( $method, $endpoint, $query, $value ) {
  
    // Initialize some cached data.
    $cached;
    
    // Search for an existing record.
    foreach( $this->cache as $index => &$data ) { 
      
      if( isset($data['method']) and isset($data['endpoint']) and isset($data['query']) ) {
        
        // Compare data.
        $same_method = $data['method'] == $method;
        $same_endpoint = $data['endpoint'] == $endpoint;
        $same_query = count(array_diff_assoc($data['query'], $query)) > 0;

        if( $same_method and $same_endpoint and $same_query ) {

          $cached = &$data; 

          break;

        }
        
      }
      
    }
   
    // Update the cached data if it exists.
    if( isset($cached) ) {
      
      $cached = array_merge($cached, $value);
      
    }
    
    // Otherwise, add the new data to the cache.
    else { 
      
      $this->cache[] = array_merge([
        'method'    => $method,
        'endpoint'  => $endpoint,
        'query'     => $query
      ], $value);
      
    }
    
  }
                          
  // Get some cache data.
  function get( $method, $endpoint, $query ) {
    
    $match = array_filter($this->cache, function($data) use($method, $endpoint, $query) {
      
      return isset($data['method']) and $data['method'] == $method and
             isset($data['endpoint']) and $data['endpoint'] == $endpoint and
             isset($data['query']) and $data['query'] == $query;
      
    });
    
    if( isset($match) and !empty($match) ) return $match[0];

  }
  
}

?>