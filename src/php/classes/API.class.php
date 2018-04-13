<?php

// `GET` Methods
trait GET {
  
  private function GET( $meta ) {
    
    // Continue if no errors previously occurred.
    if( $this->error ) return;
    
    // Capture meta data.
    $endpoint = $meta['endpoint'];
    $model = $endpoint['model'];
    $aggregate = $endpoint['aggregate'];
    $order = $endpoint['order'];
    $dynamic = isset($meta['regex']);
    
    // Look for a set of named data models.
    $models = $this->config->META['models'];
    
    // Initalize the data set.
    $data = [];
    
    // Initialize data lookup.
    $lookup = function( array $model, $source ) use (&$lookup) {
      
      // Set the delimiter.
      $delimiter = ";";
      
      // Initialize a result.
      $result = [];
      
      // Flatten the model.
      $flattened = array_flatten( $model );
      
      // Loop through all items in the model.
      foreach( $flattened as $target => $src ) {  
        
        // Remove any whitespace from the source data.
        $src = trim($src);

        // Extract any boolean filters.
        if( preg_match_all('/\| *(.+?(?=\||$))/', $src, $filters) ) {
  
          // Remove the matched data.
          array_shift($filters);
          
          // Clean up matched data.
          $filters = array_map('trim', $filters[0]);
          
          // Remove the filter data from the source string.
          $src = trim(preg_replace('/\| *(.+?(?=\||$))/', '', $src));
          
        }
        
        // Otherwise, clear filter data.
        else { $filters = false; }

        // Handle data interpolations.
        if( preg_match_all('/\{(.+?)\}/', $src, $bindings) ) {
          
          // Extract the raw data.
          array_shift($bindings);
          
          // Interpolate each binding.
          foreach( $bindings[0] as $binding ) {
            
            // Bind the source data.
            $src = str_replace("{{$binding}}", $source[$binding], $src);
            
          }
          
          // Save the interpolated data.
          $result[$target] = $src;
          
        }
        
        // Otherwise, handle simple data.
        else { $result[$target] = $source[$src]; }

        // Apply any boolean filters.
        if( $filters ) {

          // Decipher the boolean result.
          $result[$target] = array_search($result[$target], $filters) !== false ? true : false;
          
        }
        
      }

      // Expand the result.
      $result = array_expand( $result );
      
      // Return the result.
      return $result;
      
    };
    
    // Use named models when applicable.
    if( is_string($model) ) {
      
      if( array_key_exists($model, $models) ) $model = $models[$model];
      
      else $model = false;
      
    }
    
    // Build the data set according to the data model.
    if( $model ) {
      
      // Use the data model to extract data from the source data set.
      foreach($this->csv as $item) { $data[] = $lookup( $model, $item ); }
      
    }
    
    // Otherwise, use the data set as is.
    else {
      
      $data = $this->csv;
      
    }
    
    // Handle aggregate data requests.
    if( $aggregate ) {
      
      // Flatten all data.
      $data = array_map( 'array_flatten', $data );

      // Loop through the data set.
      foreach($data as $item) {

        // Group all values.
        foreach($item as $key => $value) {

          // Initialize a result aggregator.
          if( !array_key_exists($key, $this->data) ) $this->data[$key] = [];

          // Save the value to the aggregator.
          $this->data[$key][] = $value;

        }

      }

      // Only keep unique values.
      $this->data = array_map( 'array_values', array_map( 'array_unique', $this->data ) );
      
      // Interpret sort order.
      $order = preg_match('/desc/', $order) ? SORT_DESC : SORT_ASC;
      
      // Sort all the aggregate data.
      array_walk($this->data, function(&$values) use ($order) { 
        
        sort($values, $order); 
      
      });
      
      // Expand the aggregate data.
      $this->data = array_expand($this->data);
      
    }
    
    // Handle non-aggregate data requests.
    else {
      
      // Save data.
      $this->data = $data;
      
      // Filter based on bindings.
      if( $dynamic ) {
        
        // Initialize a comparison method.
        $compare = function( $a, $b, &$flag ) use ( $endpoint ) {
          
          // Get and/or set endpoint modes.
          $strict = $endpoint['strict'] === false ? false : true;
          $insensitive = $endpoint['insensitive'] === false ? false : true;
          $literal = $endpoint['literal'] === true ? true : false;
          
          // Make non-literal if applicable.
          if( !$literal ) {
            
            $a = str_romanize($a);
            $b = str_romanize($b);
            
          }
          
          // Make case insensitive if applicable. 
          if( $insensitive ) {
            
            $a = strtolower($a);
            $b = strtolower($b);
            
          }
  
          // Handle strict comparisons.
          if( $strict ) {
            
            if( $b == $a ) $flag = true;
            
          }
          
          // Otherwise, handle loose comparisons.
          else {
            
            if( strpos($a, $b) !== false ) $flag = true;
            
          }
          
        };

        // Interpret endpoints.
        $target = explode('/', $endpoint['endpoint']);
        $given = explode('/', $this->endpoint);

        // Compare endpoints.
        foreach( $target as $index => $pattern ) {

          // Catch dynamic endpoint data.
          if( preg_match('/:.+/', $pattern) ) {

            // Get the match binding.
            $match = $endpoint['match'];
            $filter = urldecode($given[$index]);

            // Filter the result set.
            $this->data = array_values(array_filter($this->data, function($item) use ($match, $pattern, $filter, $compare) { 
              
              // Initialize a result.
              $result = false;

              // Flatten the item for easier comparison.
              $flattened = array_flatten( $item );

              // Get the field on which data should be matched.
              $field = $match[$pattern];

              // Handle matches allowed on any field.
              if( $field == 'any' ) {

                // Loop through all fields within the item.
                foreach( $flattened as $key => $value ) {
                  
                  // Compare the values.
                  $compare( $value, $filter, $result );

                }

              }
              
              // Otherwise, handle matches allowed on multiple fields.
              else if( is_array($field) ) {
                
                // Loop through the permitted fields.
                foreach( $field as $key ) {
                  
                  // Handle any data interpolations.
                  if( preg_match_all('/\{(.+?)\}/', $key, $bindings) ) {

                    // Extract the raw data.
                    array_shift($bindings);

                    // Interpolate each binding.
                    foreach( $bindings[0] as $binding ) {

                      // Bind the data.
                      if( array_key_exists($binding, $flattened) ) { $key = str_replace("{{$binding}}", $flattened[$binding], $key); }
                      
                      // Otherwise, remove invalid bindings.
                      else { $key = str_replace("{{$binding}}", '', $key); }

                    }
                    
                    // Compare the values.
                    $compare( $key, $filter, $result );

                  }
                  
                  // Handle simple data comparisons.
                  else {
                    
                    // Verify that the key exists.
                    if( array_key_exists($key, $flattened) ) {
                      
                      // Compare the values.
                      $compare( $flattened[$key], $filter, $result );
                      
                    }
                    
                  }
                  
                }
                
              }

              // Otherwise, handle field-based matches.
              else { 
                
                // Handle any data interpolations.
                if( preg_match_all('/\{(.+?)\}/', $field, $bindings) ) {

                  // Extract the raw data.
                  array_shift($bindings);

                  // Interpolate each binding.
                  foreach( $bindings[0] as $binding ) {

                    // Bind the data.
                    if( array_key_exists($binding, $flattened) ) { $field = str_replace("{{$binding}}", $flattened[$binding], $field); }

                    // Otherwise, remove invalid bindings.
                    else { $field = str_replace("{{$binding}}", '', $field); }

                  }
                  
                  // Compare the values.
                  $compare( $field, $filter, $result );

                }
                
                // Otherwise, handle simple data.
                else {
                  
                  // Compare the values.
                  $compare( $flattened[$field], $filter, $result );
                  
                }
              
              }
              
              // Return the result.
              return $result;

            }));

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
      'offset' => 0,
      'pages' => 5
    ],
    'sort' => [
      'order' => SORT_ASC,
    ]
  ];
  
  // Set order in which features should be applied.
  private $precedence = [
    'sort',
    'filter',
    'paging'
  ];
  
  // Enables pagination of data.
  private function __paging( array $settings ) {
    
    // Continue if no errors previously occurred.
    if( $this->error ) return;
    
    // Capture the length of the original data set.
    $length = count($this->data); 
    
    // Determine settings.
    $limit = isset($settings['limit']) ? $settings['limit'] : $this->defaults['paging']['limit'];
    $offset = isset($settings['offset']) ? $settings['offset'] : $this->defaults['paging']['offset'];
    $pages = isset($settings['pages']) ? $settings['pages'] : $this->defaults['paging']['pages'];
    
    // Always use an odd number for pages.
    if( $pages % 2 == 0 ) $pages++;

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
      'previous' => $offset - $limit >= 0 ? $offset - $limit : false, 
      'pages' => [
        'count' => $pages,
        'total' => ($total = ceil($length / $limit)),
        'active' => ($active = $total - ceil(($length - $offset - $limit) / $limit)),
        'next' => [
          'offset' => $limit + $offset < $length ? $limit + $offset : false,
          'number' => ($next = $total - $active > 0 ? $active + 1 : false)
        ],
        'previous' => [
          'offset' => $offset - $limit >= 0 ? $offset - $limit : false,
          'number' => ($previous = $active - 1 > 0 ? $active - 1 : false)
        ],
        'first' => [
          'offset' => 0,
          'number' => 1
        ],
        'last' => [
          'offset' => ($total * $limit) - $limit,
          'number' => $total - 1
        ],
        'index' => []
      ]
    ];
    
    // Determine the page split.
    $split = ($pages - 1) / 2;
    
    // Initialize a counter for previous pages and next pages.
    $p = 0;
    $n = 0;
    
    // Establish a pointer to the array.
    $pointer = &$this->features['paging']['pages']['index'];
    
    // Build page numbers.
    for( $i = 0; $i < $pages; $i++ ) {
      
      $addActive = function() use (&$pointer, $active, $offset) {
        
        $pointer[] = [
          'number' => $active, 
          'offset' => $offset, 
          'active' => true
        ];
        
      };
      
      $addPrevious = function() use (&$pointer, &$previous, $offset, $limit, $active, &$p) {
        
        array_unshift($pointer, [
          'number' => $previous, 
          'offset' => ($offset - ($limit * ($active - $previous))), 
          'active' => false
        ]); 
        $previous--;
        $p++; 
        
      };
      
      $addNext = function() use (&$pointer, &$next, $offset, $limit, $active, &$n) {
        
        array_push($pointer, [
          'number' => $next, 
          'offset' => ($offset + ($limit * ($next - $active))), 
          'active' => false
        ]); 
        $next++; 
        $n++; 
        
      };
     
      // Get the active page.
      if( $i === 0 ) $addActive();
      
      // Get the previous pages.
      else if( $previous != false and $previous > 0 and $p < $split ) $addPrevious();
      
      // Get the next pages.
      else if( $next != false and $next < $total + 1 and $n < $split ) $addNext();
      
      // Otherwise, fill with best available.
      else { 
        
        // Add more previous pages.
        if( $previous != false and $previous > 0 ) $addPrevious();
        
        // Add more next pages.
        else if ( $next != false and $next < $total + 1 ) $addNext();
        
      }
      
    }
      
  }
  
  // Enables sorting of data.
  private function __sort( array $settings ) {
    
    // Continue if no errors previously occurred.
    if( $this->error ) return;
    
    // Get the sort fields.
    $fields = array_keys($settings);
    
    // Handle sorting on each field in the order given.
    if( $fields ) {
      
      // Initialize parameter array for sorting.
      $params = [];
      
      foreach( $settings as $field => $order ) {
        
        // Determine sort order.
        $order = isset($order) ? preg_match('/desc/', strtolower($order)) ? SORT_DESC : SORT_ASC : $this->defaults['sort']['order'];
        
        // Extract the field data.
        $comps = array_map(function($item) use($field) {
          
          return array_flatten($item)[$field];
          
        }, $this->data);
        
        // Save params.
        $params = array_merge($params, [$comps, $order]);
        
      }
      
      // Capture data to be sorted.
      $params[] = &$this->data;
    
      // Sort the data on the fields.
      call_user_func_array('array_multisort', $params);
      
      // Save sort data.
      $this->features['sort'] = $settings;
      
    }
    
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
          
          // Update the value. Enable this for "cleaner" results, or disabled this to return the input query as is.
          $value = $range;
          
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
      
      // Update values. Enable this for "cleaner" results, or disabled this to return the input query as is.
      $settings[$field] = $values;
      
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
    
    // Load data from file.
    $this->csv = $this->__load();
    
    // Handle the request.
    $this->__request();
    
  }
  
  // Load the CSV/XLSX data from file.
  private function __load( $has_headers = true ) {
    
    // Get the path to the file.
    $path = "{$this->config->ROOT}/{$this->config->ROUTER['csv']}";
    
    // Determine the file type.
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    
    // Prepare to capture the data.
    $data = [];
    
    // Handle CSV files.
    if( array_search($ext, ['csv']) !== false ) { 
      
      $data = csv_to_array($path, $has_headers);
  
    }
    
    // Otherwise, handle XLSX files.
    else if( array_search($ext, ['xlsx', 'xlsm', 'xls', 'xlm']) !== false ) {
      
      // Read the XLSX file.
      $xlsx = new XLSXReader($path); 
      
      // Extract the first sheet name.
      $sheet = $xlsx->getSheetNameByNumber(1); 
      
      // Get the sheet data as an array.
      $array = $xlsx->getSheetData($sheet);
      
      // Handle headers.
      if( $has_headers ) {
        
        // Extract headers.
        $headers = array_shift($array);
        
        // Map headers to the array data.
        $array = array_map(function($row) use ($headers) {
          
          return array_combine($headers, $row);
          
        }, $array);
        
      }
      
      // Save the array without index data.
      $data = array_values($array);
      
    }
 
    // Return the data.
    return $data;
    
  }
  
  // Convert values into their true data types.
  private function __typify( $values ) {
    
    // Catch the original format.
    $array = is_array($values);
    
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
      elseif( preg_match('/\d/', $value) and (bool) ($time =  strtotime($value)) ) { $values[$key] = (new DateTime())->setTimestamp($time); }
      
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