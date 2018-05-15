<?php

class Client {
  
  public $client;
  
  function __construct() {
    
    // Initialize the client.
    $this->client = new Google_Client();
    
    // Set the application name.
    $this->client->setApplicationName( $_ENV['APP_NAME'] );
    
    // Set the API key.
    $this->client->setDeveloperKey( $_ENV['API_KEY'] );
    
  }
  
}

?>