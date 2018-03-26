<?php

// `GET` Methods
trait GET {
  
  private function GET( $meta ) {
    
    // Continue if no errors previously occurred.
    if( $this->error ) return;
    
    // Capture meta data.
    $endpoint = $meta['endpoint'];
    $regex = $meta['regex'];
    
    // Initialize data lookup.
    $lookup = function( array $model, $source ) use (&$lookup) {
      
      // Initialize a result.
      $result = [];
      
      // Flatten the model.
      $flattened = array_flatten( $model );
      
      // Loop through all items in the model.
      foreach( $flattened as $target => $src ) {
        
        // Retrieve the data from the source.
        $result[$target] = $source[$src];
        
      }

      // Expand the result.
      $result = array_expand( $result );
      
      // Return the result.
      return $result;
      
    };
    
    // Use data model to capture data from source.
    foreach($this->csv as $item) { $this->data[] = $lookup( $endpoint['model'], $item ); }

    // Filter based on bindings.
    if( $regex ) {
      
      // Interpret endpoints.
      $target = explode('/', $endpoint['endpoint']);
      $given = explode('/', $this->endpoint);
      
      // Compare endpoints.
      foreach( $target as $index => $pattern ) {

        // Catch dynamic endpoint data.
        if( preg_match('/:.+/', $pattern) ) {
          
          // Get the match binding.
          $match = $endpoint['match'];
          $filter = $given[$index];
          
          // Filter the result set.
          $this->data = array_filter($this->data, function($item) use ($match, $pattern, $filter) { 
            
            // Flatten the item for easier comparison.
            $flattened = array_flatten( $item );

            // Get the field on which data should be matched.
            $field = $match[$pattern];
            
            // Handle matches allowed on any field.
            if( $field == 'any' ) {
              
              // Initialize the result.
              $result = false;
              
              // Loop through all fields within the item.
              foreach( $flattened as $key => $value ) {
                
                // Look for matches.
                if( $value == $filter ) $result = true;
                
              }
              
              // Return the result.
              return $result;
              
            }
            
            // Otherwise, handle field-based matches.
            else { return $flattened[$field] == $filter; }
            
          });
          
        }
        
      }
      
    }
    
    // Enable features.
    if( !empty($this->query) ) {
      
      // Initialize an ordered set of parameters.
      $params = [];
      
      // Sort the query parameters by order of precedence.
      foreach( $this->precedence as $key ) {
     
        if( array_key_exists($key, $this->query) ) {
          
          $params[$key] = $this->query[$key];
          
          unset( $this->query[$key] );
          
        }
        
      }
      
      // Merge remaining parameters without any specific order.
      $params = array_merge($params, $this->query);

      // Loop through features.
      foreach( $params as $feature => $settings ) { 
        
        // Apply each feature one by one.
        if( method_exists($this, "__$feature") ) { $this->{"__$feature"}( $settings ); }
      
      }
      
    }
    
    // Convert data types for all data.
    $this->data = $this->__typify( $this->data );
    
    // Set the status code to 200.
    if( !$this->error ) $this->__status( 200 );
    
  }
  
}

// Feature Interface
trait FEATURES {
  
  // Set default values for features.
  private $defaults = [
    'paging' => [
      'limit' => 10,
      'offset' => 0
    ],
    'sort' => [
      'order' => SORT_ASC,
    ]
  ];
  
  // Set order in which features should be applied.
  private $precedence = [
    'sort',
    'paging'
  ];
  
  // Enables pagination of data.
  private function __paging( array $settings ) {
    
    // Continue if no errors previously occurred.
    if( $this->error ) return;
    
    // Capture the length of the original data set.
    $length = count($this->data);
    
    // Determine limit and offset.
    $limit = isset($settings['limit']) ? $settings['limit'] : $this->defaults['paging']['limit'];
    $offset = isset($settings['offset']) ? $settings['offset'] : $this->defaults['paging']['offset'];

    // Catch errors.
    if( is_bool($limit) or !is_numeric($limit) or is_bool($offset) or !is_numeric($offset) ) {

      // Respond with a status of 400.
      $this->__error( 400 );
      
      return;
      
    }

    // Extract subset of data.
    $this->data = array_slice($this->data, $offset, $limit);
    
    // Save pagination data.
    $this->features['paging'] = [
      'limit' => $limit,
      'offset' => $offset < $length ? $offset : false,
      'next' => $limit + $offset < $length ? $limit + $offset : false,
      'previous' => $offset - $limit >= 0 ? $offset - $limit : false
    ];
      
  }
  
  // Enables sorting of data.
  private function __sort( array $settings ) {
    
    // Continue if no errors previously occurred.
    if( $this->error ) return;
    
    // Determine the sort order.
    $order = isset($settings['order']) ?  
             preg_match('/desc/', strtolower($settings['order'])) ? SORT_DESC : SORT_ASC : 
             $this->defaults['sort']['order'];
    
    // Initialize the sort field.
    $field = isset($settings['field']) ? $settings['field'] : array_keys($this->data[0])[0];
      
    // Extract field data.
    $comps = array_map(function($item) use ($field) {

      return $item[$field];

    }, $this->data);

    // Sort the data.
    array_multisort($comps, $order, $this->data);
    
    // Save sort data.
    $this->features['sort'] = [
      'order' => $order,
      'field' => $field
    ];
    
  }
  
  // Enables advanced filtering.
  private function __filter( array $settings ) {
    
    // Continue if no errors previously occurred.
    if( $this->error ) return;
    
    // Only continue if filtering should be applied.
    if( empty($settings) ) return;
    
    // Filter on each field.
    foreach( $settings as $field => $values ) {
      
      // Convert non-array values into arrays.
      if( !is_array($values) ) {
        
        // Convert to array.
        $values = $this->__typify(array_map('trim', preg_split('/[,:]/', $values)));
        
      }
      
      // Initialize subset of data.
      $subset = [];

      // Loop through each value.
      foreach( $values as &$value ) {
        
        // Handle ranges.
        if( preg_match('/^(.+?)-(.+)$/', $value, $range) ) {
          
          // Remove original value from range match.
          array_shift( $range );
          
          // Add keys to the range for better interpretation.
          $range = $this->__typify(array_combine(['min', 'max'], $range));
          
          // Update the value.
          //$value = $range;
          
          // Apply range filter to data.
          $subset = array_merge($subset, array_filter($this->data, function($item) use ($field, $range) {
            
            // Flatten the item for easier comparison.
            $flattened = array_flatten( $item );
            
            // Filter for matches.
            return $flattened[$field] >= $range['min'] and $flattened[$field] <= $range['max'];
            
          }));
          
        }

        // Handle all other values.
        else {
          
          // Convert the data type of the value.
          $value = $this->__typify($value);
          
          // Apply filter to data.
          $subset = array_merge($subset, array_filter($this->data, function($item) use ($field, $value) {

            // Flatten the item for easier comparison.
            $flattened = array_flatten( $item );

            // Filter for matches.
            return $flattened[$field] == $value;

          }));
          
        }

      }
      
      // Update values.
      //$settings[$field] = $values;
      
      // Update data set.
      $this->data = $subset;
      
    }
    
    // Save filter data.
    $this->features['filter'] = $settings;
    
  }
  
}

// API
class API {
  
  use GET, FEATURES;
  
  private $headers = [
    'Access-Control-Allow-Origin' => '*',
    'Access-Control-Allow-Methods' => '*',
    'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
    'Pragma' => 'no-cache',
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
  protected $error = false;
  
  public $method = 'GET';
  public $uri = '';
  public $endpoint = '';
  public $params = [];
  public $query = [];
  public $status = [
    'code' => null, 
    'message' => null
  ];
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
    $this->endpoint = trim(str_replace('?', '', str_replace($_SERVER['QUERY_STRING'], '', str_replace($this->path, '', $this->uri))), '/');
    $this->params = explode('/', $this->endpoint);
    $this->query = $this->__typify( $_GET );

    // Set default status.
    $this->status = ['code' => 400, 'message' => $this->codes[400]];
    
    // Send initial headers.
    foreach( $this->headers as $key => $value ) { header("$key: $value"); }
    
    // Load CSV data.
    $this->csv = csv_to_array("{$config->ROOT}/{$config->ROUTER['csv']}"); 
    
    // Handle the request.
    $this->__request();
    
  }
  
  // Convert values into their true data types.
  private function __typify( $values ) {
    
    // Determine if the value passed in was an array.
    $array = is_array($values) ? true : false;
    
    // Convert non-array values to an array for easier manipulation.
    if( !is_array($values) ) $values = [$values];
    
    // Loop through each value.
    foreach( $values as $key => $value ) {
      
      // Convert each value within arrays.
      if( is_array($value) ) { $values[$key] = $this->__typify( $value ); }
      
      // Convert numeric values to numbers.
      elseif( is_numeric($value) ) { $values[$key] = (float) $value; }
      
      // Convert boolean values to `true` or `false`.
      elseif( in_array($value, ['true', 'false']) ) { $values[$key] = $value == 'true' ? true : false; }
      
      // Convert null values to `null`.
      elseif( $value == 'null' ) { $values[$key] = null; }
      
      // Convert date-like values to dates.
      elseif( (bool) ($time =  strtotime($value)) ) { $values[$key] = (new DateTime())->setTimestamp($time); }
      
    }
    
    // Return new value.
    return $array ? $values : $values[0];
    
  }
  
  // Set the response status.
  private function __status( $code ) {
    
    if( array_key_exists($code, $this->codes) ) {
    
      $this->status = ['code' => $code, 'message' => $this->codes[$code]];
      
    }
    
  }
  
  // Determine the validity of an endpoint.
  private function __endpoint( $endpoint ) {
    
    // Get implemented endpoints.
    $endpoints = $this->config->META['endpoints'][$this->method];
    
    // Initialize result.
    $result = ['valid' => false];
        
    // Determine validity of the given endpoint.
    foreach( $endpoints as $ep ) {
      
      // Get the endpoint pattern.
      $pattern = $ep['endpoint'];
          
      // Handle patterns with bindings.
      if( preg_match('/:.+/', $pattern) ) {

        // Build a regex based on the pattern.
        $regex = str_replace('/', '\/', preg_replace('/:.+/', "([^/]+?)", $pattern));
        
        // Test the regex.
        if( preg_match("/^$regex$/", $endpoint) ) {
          
          $result['valid'] = true;
          $result['endpoint'] = $ep;
          $result['regex'] = "/^$regex$/";
          
        }
        
      }
          
      // Handle patterns without bindings.
      else if( $endpoint == $pattern ) {

        $result['valid'] = true;
        $result['endpoint'] = $ep;
        break;

      }

    }
    
    return $result;
    
  }
  
  // Handles incoming requests.
  private function __request() {

    // Handle invalid requests (missing method or endpoint).
    if( !$this->method or !$this->endpoint ) { return; }
    
    // Handle methods.
    switch( $this->method ) {
      
      // Permit `GET` requests.
      case 'GET': 
        
        // Get the endpoint configuration.
        $endpoint = $this->__endpoint( $this->endpoint );

        // Handle valid endpoints.
        if( $endpoint['valid'] ) {

          // Get the requested data. 
          $this->GET( $endpoint );
          
        }
        
        // Handle invalid endpoints.
        else {
          
          // Set the status code to 501.
          $this->__error( 501 );
          
        }
        
        break;
        
      // All other requests are not currently implemented.
      default: 
        
        // Set the status code to 405.
        $this->__error( 405 );
        
    }
    
  }
  
  // Prevents further processing on errors.
  private function __error( $code ) {
    
    // Set the error flag.
    $this->error = true;
    
    // Set the status.
    $this->__status( $code );
    
  }
  
  // Send an API response.
  function response() {
    
    // Build output.
    $output = ['status' => $this->status];
    
    if( !$this->error ) {
    
      if( !empty($this->data) or $this->method == 'GET' ) { $output['data'] = $this->data; }
    
      if( !empty($this->features) ) { $output = array_merge($output, $this->features); }
      
    }
    
    // Set response code.
    http_response_code( $this->status['code'] );
    
    // Return JSON.
    return json_encode($output);
    
  }
  
}

?>