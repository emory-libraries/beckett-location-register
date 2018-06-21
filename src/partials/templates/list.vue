<template id="template-list">
  
  <div class="list">
    
    <div class="controls">
      
      <div class="density"> 
        
        <button class="btn-density light"
                :class="{active: $api.density == 'light'}"
                @click="$api.density = 'light'">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
        <button class="btn-density medium"
                :class="{active: $api.density == 'medium'}"
                @click="$api.density = 'medium'">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
        
        <button class="btn-density heavy"
                :class="{active: $api.density == 'heavy'}"
                @click="$api.density = 'heavy'">
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
    
    <table :density="$api.density" 
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
        <tr v-for="letter in data" @click="read(letter)" @keypress.enter="read(letter)" tabindex="0">
          <td class="date">{{letter.date.month}}-{{letter.date.day}}-{{letter.date.year}}</td>
          <td class="recipient">{{letter.recipient}}</td>
          <td class="origin">{{letter.location.origin.city}}</td>
          <td class="destination">{{letter.location.destination.city}}</td>
        </tr>
      </tbody>
      
    </table>
  
  </div>

</template>