<?php

class Search {
  
  // Intialize data.
  protected $data = [];
  
  // Set search modes.
  public $strict = false;
  public $literal = false;
  public $approximate = false;
  public $insensitive = true;
  
  // Constructor
  function __construct( $data ) {
    
    // Save the data as is if it's already in array form.
    if( is_array($data) ) $this->data = array_values($data);
    
    // Otherwise, save the data to an array.
    else $this->data[] = $data;
    
  }
  
  // Search
  public function search( $query ) { 
   
    // Initialize the result.
    $result = false;
    
    // Localize the data set.
    $comps = $this->data;

    // Prepare the query for string comparison.
    $this->__prepare( $query );

    // Extract ANDs, NOTs, and ORs from query string.
    preg_match_all('/\+[\"\'].+?[\"|\']|\+.+?(?= |\+|\-|\~|$)/', $query, $ands);
    preg_match_all('/\-[\"\'].+?[\"|\']|\-.+?(?= |\+|\-|\~|$)/', $query, $nots);
    preg_match_all('/\~[\"\'].+?[\"|\']|\~.+?(?= |\+|\-|\~|$)/', $query, $ors);

    // Clean up the ANDs, NOTs, and ORs arrays.
    if( isset($ands) ) {
      
      // Extract matches.
      $ands = $ands[0];

      // Remove the values from the original query string.
      $query = trim( str_replace($ands, '', $query) );

      // Clean up the array.
      $ands = array_map(function( $and ) {
        
        return trim( preg_replace('/^[\"\']|[\"\']$/', '', preg_replace('/^\+/', '', $and)) );
      
      }, $ands );

    }
    if( isset($nots) ) {

      // Extract matches.
      $nots = $nots[0];
      
      // Remove the values from the original query string.
      $query = trim( str_replace($nots, '', $query) );

      // Clean up the array.
      $nots = array_map(function( $not ) {
        
        return trim( preg_replace('/^[\"\']|[\"\']$/', '', preg_replace('/^\-/', '', $not)) );
     
      }, $nots );

    }
    if( isset($ors) ) {
      
      // Extract matches.
      $ors = $ors[0];

      // Remove the values from the original query string.
      $query = trim( str_replace($ors, '', $query) );

      // Clean up the array.
      $ors = array_map(function( $or ) {

        return trim( preg_replace('/^[\"\']|[\"\']$/', '', preg_replace('/^\~/', '', $or)) );

      }, $ors );

    }

    // Loop through all data.
    foreach( $comps as $comp ) {
    
      // Prepare data for string comparison.
      $this->__prepare( $comp ); 

      // Compare the query as is.
      $result = !$result ? ($this->__compare($query, $comp) or $this->__proximate($query, $comp)) : $result;

      // Then, permit any alternate words or phrases.
      $result = (!$result and isset($ors)) ? $this->__or($ors, $comp) : $result;

      // Next, require certain words or phrases.
      $result = ($result and isset($ands)) ? $this->__and($ands, $comp) : $result;

      // Finally, exclude certain words or phrases.
      $result = ($result and isset($nots)) ? $this->__not($nots, $comp) : $result;

      
    }

    // Return the result.
    return $result;
    
  }
  
  // Prepare data prior to search
  private function __prepare( &$string ) {
    
    $this->__transliterate( $string );
    $this->__desensitize( $string );
    
  }
  
  // Handle transliteratation.
  private function __transliterate( &$string ) {
    
    if( !$this->literal ) $string = str_romanize( $string );
    
  }
  
  // Handle case sensitivity
  private function __desensitize( &$string ) {
    
    if( $this->insensitive ) $string = strtolower( $string );
    
  }
  
  // Compare strings as phrases
  private function __compare( $a, $b ) {
    
    if( $this->strict ) return ($a == $b);

    return (strpos($b, $a) !== false);
    
  }
  
  // Compare strings as words
  private function __proximate( $a, $b ) {
    
    $a = array_map( 'trim', preg_split('/[-+_ ]/', $a) );
    $b = array_map( 'trim', preg_split('/[-+_ ]/', $b) );
    
    $result = [];
    
    foreach( $a as $word ) {
        
      $result[] = (array_search($word, $b) !== false);

    }
    
    return array_every($result, function($r) { return $r === true; });
    
  }
  
  // Apply AND (`+`) comparisons
  private function __and( array $ands, $b ) { 
    
    if( empty($ands) ) return true;
    
    // Initialize a result set.
    $result = [];
    
    // Look for each word or phrase that is required. 
    foreach( $ands as $a ) { $result[] = $this->__compare( $a, $b ); }

    // Verify that all required strings were found.
    return array_every($result, function($r) { return $r === true; });
    
  }
  
  // Apply NOT (`-`) comparisons
  private function __not( array $nots, $b ) { 
    
    if( empty($nots) ) return true;
    
    // Initialize a result set.
    $result = [];
    
    // Look for each word or phrase that should be excluded.
    foreach( $nots as $a ) { $result[] = !$this->__compare( $a, $b ); }

    // Verify that all excluded strings were not found.
    return (array_search(false, $result) === false); 
    
  }
  
  // Apply OR (`~`) comparisons
  private function __or( array $ors, $b ) {
    
    // Initialize a result set.
    $result = [];
    
    // Look for each word or phrase that can be used as an alternate.
    foreach( $ors as $a ) { $result[] = $this->__compare( $a, $b ); }

    // Verify that anything was found.
    return (array_search(true, $result) !== false);
    
  }
  
}

?>