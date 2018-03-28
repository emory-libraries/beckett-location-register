<template id="template-list">
  
  <div class="list">
  
    <div class="alert" :class="error.state">{{error.message}}</div>
    
    <div class="filter"></div>
    
    <paging :enabled="data.length > 0"></paging>
    
    <div class="items" v-if="data.length > 0">
      
      <div class="item" v-for="item in data">
      
        <!-- DEVELOPING WITH TEST DATA -->
        <div class="date">{{item.year.start}} &ndash; {{item.year.end}}</div>
        <div class="topic">{{item.topic}}</div>
        <div class="location">{{item.location.name}}</div>
        <div class="source">{{item.source}}</div>
        
        <!-- PLACEHOLDER FOR REAL DATA 
        <div class="date">{{item.date}}</div>
        <div class="recipient">{{item.recipient}}</div>
        <div class="repository">{{item.repository}}</div>
        <div class="origin">{{item.origin}}</div>
        <div class="destination">{{item.destination}}</div>
        -->
      
      </div>
      
    </div>
  
  </div>

</template>