<?php

class Progress {
  
  // Save configurations.
  protected $config;
  
  // Initialize progress data.
  protected $progress = [];
  
  // Constructor
  function __construct( Config $config ) {
    
    // Save configurations.
    $this->config = $config;
    
    // Read the progress data.
    $this->progress = $this->readProgress();
    
  }
  
  // Get a process' progress.
  public function getProgress( $pid ) {
    
    // Retrieve the progress for the given process ID.
    if( array_key_exists($pid, $this->progress) ) return $this->progress[$pid];
    
  }
  
  // Set a process' progress.
  public function setProgress( $pid, $progress, $status = null ) {
    
    // Set the progress for the given process ID.
    $this->progress[$pid] = ['progress' => $progress, 'status' => $status];
    
    // Save the progress data.
    $this->saveProgress();
    
  }
  
  // Clear a process' progress.
  public function clearProgress( $pid ) {
    
    // Unset the progress for the given process ID.
    if( array_key_exists($pid, $this->progress) ) unset($this->progress[$pid]);
    
    // Save the progress data.
    $this->saveProgress();
    
  }
  
  // Read progress data.
  private function readProgress() {
    
    // Read the progress data from a file.
    return json_decode(file_get_contents($this->config->PROGRESS), true);
    
  }
  
  // Save progress data.
  private function saveProgress() {
    
    // Save the progress data to a file.
    file_put_contents($this->config->PROGRESS, json_encode($this->progress, JSON_PRETTY_PRINT));
    
  }
  
  // Reset progress data.
  private function resetProgress() {
    
    // Delete all progress data.
    $this->progress = [];
    
    // Save the progress data.
    $this->saveProgress();
    
  }
  
}

?>