<?php

// Autoload dependencies.
include 'autoload.php';

// Load configurations.
$config = new Config();

// Initialize the API.
$api = new API( $config );

// Output the API response.
echo $api->response();

?>