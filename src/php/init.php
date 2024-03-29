<?php

// Increase memory limit to handle large files.
ini_set('memory_limit', '1000M');

// Increase time limit to handle large requests.
set_time_limit( 120 );

// Set session path.
session_save_path('/tmp');

// Set the default timezone.
date_default_timezone_set('America/New_York');

// Define constants.
define('ROOT', dirname(__DIR__));
define('DEVELOPMENT', false);
define('LOCALDB', false);

// Silence errors for production.
if( !DEVELOPMENT ) {
  
  error_reporting(0);
  ini_set('display_errors', 0);
    
}
else {
  
  error_reporting(E_ALL);
  ini_set('display_errors', 1);
    
}

// Autoload classes.
include 'autoload.php';

// Autoload dependencies.
if( file_exists($dependencies = 'dependencies/autoload.php') ) include $dependencies;

// Load configurations.
$config = new Config();

// Initialize the environment.
$dotenv = new Dotenv\Dotenv( $config->ROOT );

// Load environment variables.
$dotenv->load();

// Save environment variables.
$config->ENV = $_ENV;

?>