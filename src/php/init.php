<?php

// Increase memory limit to handle large files.
ini_set('memory_limit', '1000M');

// Increase time limit to handle large requests.
set_time_limit( 50 );

// Set session path.
session_save_path('/tmp');

// Set the default timezone.
date_default_timezone_set('America/New_York');

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