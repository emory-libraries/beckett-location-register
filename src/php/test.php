<?php

// Initialize server configurations.
require 'init.php';

// Attempt to connect to the Microsoft Graph API.
$excel = new MSO365\Excel();

$excel->test();

?>