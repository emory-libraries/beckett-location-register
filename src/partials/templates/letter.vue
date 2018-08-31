<template id="template-letter">

  <div class="letter" :class="{open: letter, closed: !letter}">

    <h3>Letter from Samuel Beckett</h3>
    
    <div class="alert" :class="error.state" v-if="error.message">{{error.message}}</div>
    
    <table v-if="letter">
      <tbody>
        
        <tr>
          <th scope="row"><span class="asterisk fa-asterisk"></span>Date</th>
          <td>{{letter.date.formatted}}</td>
        </tr>
        
        <tr>
          <th scope="row">Recipient</th>
          <td>{{letter.recipient}}</td>
        </tr>
        
        <tr>
          <th scope="row">Physical Description</th>
          <td v-html="descriptionFormatted"></td>
        </tr>
        
        <tr>
          <th scope="row">Envelope</th>
          <td>{{letter.envelope ? 'Yes' : 'No'}}</td>
        </tr>
        
        <tr>
          <th scope="row">Postmark</th>
          <td>{{letter.postmark}}</td>
        </tr>
        
         <tr>
          <th scope="row">Addressed To (actual)</th>
          <td>{{letter.location.addressed.to}}</td>
        </tr>
        
        <tr>
          <th scope="row">Addressed To (regularized)</th>
          <td>{{letter.location.regularized.to.formatted}}</td>
        </tr>
        
        <tr>
          <th scope="row">Addressed From (actual)</th>
          <td>{{letter.location.addressed.from}}</td>
        </tr>
        
        <tr>
          <th scope="row">Addressed From (regularized)</th>
          <td>{{letter.location.regularized.from.formatted}}</td>
        </tr>
        
        <tr>
          <th scope="row">Repository</th>
          <td>{{letter.repository.primary.repo}}</td>
        </tr>
        
        <tr>
          <th scope="row">Format</th>
          <td>{{letter.repository.primary.format || 'original'}}</td>
        </tr>
        
        <tr v-if="letter.repository.secondary.repo && letter.repository.secondary.public">
          <th scope="row">Second Repository</th>
          <td>{{letter.repository.secondary.repo}}</td>
        </tr>
        
        <tr v-if="letter.repository.secondary.repo && letter.repository.secondary.public && letter.repository.secondary.format">
          <th scope="row">Second Format</th>
          <td>{{letter.repository.secondary.format}}</td>
        </tr>
        
        <tr>
          <th scope="row">Collection</th>
          <td>{{letter.collection}}</td>
        </tr>
        
        <tr>
          <th scope="row">Previous Publication</th>
          <td>{{letter.publication.previous}}</td>
        </tr>
        
        <tr>
          <th scope="row">Language</th>
          <td>{{letter.language}}</td>
        </tr>
        
        <tr v-if="letter.image.postcard">
          <th scope="row">Postcard Image</th>
          <td>{{letter.image.postcard}}</td>
        </tr>
        
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4">
            <span class="asterisk fa-asterisk"></span>
            All dates are displayed in European date format (<code>dd-mm-yy</code>).
          </td>
        </tr>
      </tfoot>
    </table>
  
  </div>
  
</template>