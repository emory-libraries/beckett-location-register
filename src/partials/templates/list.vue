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
          <span class="asterisk fa-asterisk"></span>
          Date
          <sort :on="['date.day', 'date.month', 'date.year']"></sort>
        </th>
        <th class="recipient">
          Recipient
          <sort :on="'recipient'"></sort>
        </th>
        <th class="origin">
          <span class="asterisk fa-asterisk"></span>
          Addressed From
          <sort :on="'location.regularized.from.city'"></sort>
        </th>
        <th class="destination">
          <span class="asterisk fa-asterisk"></span>
          Addressed To
          <sort :on="'location.regularized.to.city'"></sort>
        </th>
      </thead>
      
      <tbody>
        <tr v-for="letter in data" @click="read(letter)" @keypress.enter="read(letter)" tabindex="0">
          <td class="date">{{letter.date.day}}-{{letter.date.month}}-{{letter.date.year}}</td>
          <td class="recipient">{{letter.recipient}}</td>
          <td class="origin">{{letter.location.regularized.from.city}}</td>
          <td class="destination">{{letter.location.regularized.to.city}}</td>
        </tr>
      </tbody>
      
      <tfoot>
        <tr>
          <td colspan="4">
            <span class="asterisk fa-asterisk"></span>
            All dates are displayed in European date format (<code>dd-mm-yy</code>).
          </td>
        </tr>
        <tr>
          <td colspan="4">
            <span class="asterisk fa-asterisk"></span>
            Regularized locations have been used for the <strong>Addressed From</strong> and <strong>Addressed To</strong> columns.
          </td>
        </tr>
      </tfoot>
      
    </table>
  
  </div>

</template>