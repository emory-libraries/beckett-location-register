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
          <sort :on="['date.year', 'date.month', 'date.day']"></sort>
        </th>
        <th class="recipient">
          Recipient
          <sort :on="'recipient'"></sort>
        </th>
        <th class="origin">
          Origin
          <sort :on="'location.origin.city'"></sort>
        </th>
        <th class="destination">
          Destination
          <sort :on="'location.destination.city'"></sort>
        </th>
      </thead>
      
      <tbody>
        <tr v-for="letter in data" @click="read(letter)">
          <td class="date">{{letter.date.month}}-{{letter.date.day}}-{{letter.date.year}}</td>
          <td class="recipient">{{letter.recipient}}</td>
          <td class="origin">{{letter.location.origin.city}}</td>
          <td class="destination">{{letter.location.destination.city}}</td>
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
  
  </div>

</template>