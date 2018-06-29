<?php

// Initialize server configurations.
require 'init.php';

// DEBUGGING
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Load the API.
$api = new API( $config );

// Output the API response.
echo $api->response();

?>