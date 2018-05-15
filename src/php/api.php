<?php

// Initialize server configurations.
require 'init.php';

// Load the API.
$api = new API( $config );

// Output the API response.
echo $api->response();

?>