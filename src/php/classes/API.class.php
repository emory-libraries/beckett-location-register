<?php

// GET Methods
trait GET {}

// API
class API {
  
  use GET;
  
  private $headers = [
    'Access-Control-Allow-Origin' => '*',
    'Access-Control-Allow-Methods' => '*',
    'Content-Type' => 'application/json; charset=utf-8'
  ];
  
  private $codes = [
    200 => 'OK',
    201 => 'Created',
    204 => 'No Content',
    301 => 'Moved Permanently',
    400 => 'Bad Request',
    401 => 'Unauthorized',
    403 => 'Forbidden',
    404 => 'Not Found',
    405 => 'Method Not Allowed',
    409 => 'Conflict',
    410 => 'Gone',
    500 => 'Internal Server Error',
    501 => 'Not Implemented',
    503 => 'Service Unavailable'
  ];
  
  protected $config;
  protected $path = '';
  protected $csv = [];
  
  public $method = 'GET';
  public $uri = '';
  public $endpoint = '';
  public $params = [];
  public $query = [];
  public $status = ['code' => null, 'message' => null];
  public $data = [];
  public $features = [];
  
  // Constructor
  function __construct( Config $config ) {
    
    // Determine API path.
    $this->path = str_replace($_SERVER['DOCUMENT_ROOT'], '', $config->ROOT) . '/' . $config->ROUTER['api'];
    
    // Initialize API data.
    $this->config = $config;
    $this->method = $_SERVER['REQUEST_METHOD'];
    $this->uri = $_SERVER['REQUEST_URI'];
    $this->endpoint = str_replace('?', '', str_replace($_SERVER['QUERY_STRING'], '', str_replace($this->path, '', $this->uri)));
    $this->params = explode('/', $this->endpoint);
    $this->query = $_GET;

    // Set default status.
    $this->status = ['code' => 400, 'message' => $this->codes[400]];
    
    // Send initial headers.
    foreach( $this->headers as $key => $value ) { header("$key: $value"); }
    
    // Load CSV data.
    $this->csv = csv_to_array("{$config->ROOT}/{$config->ROUTER['csv']}"); 
    
    // Start the request handler.
    $this->__request();
    
  }
  
  // Set the response status.
  private function __status( $code ) {
    
    if( array_key_exists($code, $this->codes) ) {
    
      $this->status = ['code' => $code, 'message' => $this->codes[$code]];
      
    }
    
  }
  
  // Handles incoming requests.
  private function __request() {
    
  }
  
  // Send an API response.
  function response() {
    
    // Build output.
    $output = ['status' => $this->status];
    
    if( !empty($this->data) ) { $output['data'] = $this->data; }
    
    if( !empty($this->features) ) { $output = array_merge($output, $this->features); }
    
    // Set response code.
    http_response_code( $this->status['code'] );
    
    // Return JSON.
    return json_encode($output);
    
  }
  
}

?>