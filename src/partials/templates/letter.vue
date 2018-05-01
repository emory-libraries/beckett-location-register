<template id="template-letter">

  <div class="letter" :class="{open: letter, closed: !letter}">
  
    <button class="button btn-back" @click="back">Back to List</button>

    <h3>Letter from Samuel Beckett</h3>
    
    <div class="alert" :class="error.state" v-if="error.message">{{error.message}}</div>
    
    <table v-if="letter">
      <tbody>
        
        <tr>
          <th scope="row">Date</th>
          <td>
            {{letter.date.formatted}}
          </td>
        </tr>
        
        <tr>
          <th scope="row">Recipient</th>
          <td>
            {{letter.recipient}}
          </td>
        </tr>
        
        <tr>
          <th scope="row">Description</th>
          <td>
            {{letter.description}}
          </td>
        </tr>
        
         <tr>
          <th scope="row">Addressed</th>
          <td>
            {{letter.addressed}}
          </td>
        </tr>
        
        <tr>
          <th scope="row">Origin</th>
          <td>
            {{letter.location.origin.formatted}}
          </td>
        </tr>
        
        <tr>
          <th scope="row">Destination</th>
          <td>
            {{letter.location.destination.formatted}}
          </td>
        </tr>
        
        <tr>
          <th scope="row">Repository</th>
          <td>
            {{letter.repository}}
          </td>
        </tr>
        
        <tr>
          <th scope="row">Collection</th>
          <td>
            {{letter.collection}}
          </td>
        </tr>
        
        <tr>
          <th scope="row">Public</th>
          <td>
            {{letter.public ? 'Yes' : 'No'}}
          </td>
        </tr>
        
        <tr>
          <th scope="row">Language</th>
          <td>
            {{letter.language}}
          </td>
        </tr>
        
        <tr>
          <th scope="row">Autographed</th>
          <td>
            {{letter.autographed}}
          </td>
        </tr>
        
        <tr>
          <th scope="row">Signed</th>
          <td>
            {{letter.signed ? 'Yes' : 'No'}}
          </td>
        </tr>
        
        <tr>
          <th scope="row">Initialed</th>
          <td>
            {{letter.initialed ? 'Yes' : 'No'}}
          </td>
        </tr>
        
        <tr>
          <th scope="row">Envelope</th>
          <td>
            {{letter.envelope ? 'Yes' : 'No'}}
          </td>
        </tr>
        
        <tr>
          <th scope="row">Leaves</th>
          <td>
            {{letter.leaves}}
          </td>
        </tr>
        
        <tr>
          <th scope="row">Sides</th>
          <td>
            {{letter.sides}}
          </td>
        </tr>
        
      </tbody>
    </table>
  
  </div>
  
</template>