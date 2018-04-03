<template id="template-list">
  
  <div class="list">
    
    <div class="controls">
      
      <div class="density">
        
        <button class="btn-density light"
                :class="{active: density == 'light'}"
                @click="density = 'light'">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
        <button class="btn-density medium"
                :class="{active: density == 'medium'}"
                @click="density = 'medium'">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
        
        <button class="btn-density heavy"
                :class="{active: density == 'heavy'}"
                @click="density = 'heavy'">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
      
      </div>
    
      <filtering :enabled="data.length > 0 || filtering"></filtering>
    
      <paging :enabled="data.length > 0"></paging>
      
    </div>
    
    <div class="alert" :class="error.state" v-if="error.message">{{error.message}}</div>
    
    <table :density="density" 
           v-if="data.length > 0"
           class="striped highlight">
      
      <thead>
        <th class="date">
          Date
          <sort :on="'year.start'"></sort>
        </th>
        <th class="topic">
          Topic
          <sort :on="'topic'"></sort>
        </th>
        <th class="location">
          Location
          <sort :on="'location'"></sort>
        </th>
        <th class="source">
          Source
          <sort :on="'source'"></sort>
        </th>
      </thead>
      
      <tbody>
        <tr v-for="item in data" @click="open(item)">
          <td class="date">{{item.year.start}} &ndash; {{item.year.end}}</td>
          <td class="topic">{{item.topic}}</td>
          <td class="location">{{item.location.name}}</td>
          <td class="source">{{item.source}}</td>
          <!-- PLACEHOLDER FOR REAL DATA 
          <td class="date">{{item.date}}</td>
          <td class="recipient">{{item.recipient}}</td>
          <td class="repository">{{item.repository}}</td>
          <td class="origin">{{item.origin}}</div>
          <td class="destination">{{item.destination}}</td>
          -->
        </tr>
      </tbody>
      
    </table>
    
    <letter></letter>
  
  </div>

</template>