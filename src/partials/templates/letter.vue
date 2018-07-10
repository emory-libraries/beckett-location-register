<template id="template-letter">

  <div class="letter" :class="{open: letter, closed: !letter}">
  
    <!--button class="button btn-back" @click="back">Back</button-->

    <h3>Letter from Samuel Beckett</h3>
    
    <div class="alert" :class="error.state" v-if="error.message">{{error.message}}</div>
    
    <table v-if="letter">
      <tbody>
        
        <tr>
          <th scope="row">
            <span class="asterisk fa-asterisk"></span>
            Date
          </th>
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
          <th scope="row">
            <span class="asterisk fa-asterisk"></span>
            Physical Description
          </th>
          <td>
            {{letter.description.code}}
          </td>
        </tr>
        
         <tr>
          <th scope="row">Actual Addressed To</th>
          <td>
            {{letter.location.addressed.to}}
          </td>
        </tr>
        
        <tr>
          <th scope="row">Regularized Addressed To</th>
          <td>
            {{letter.location.regularized.to.formatted}}
          </td>
        </tr>
        
        <tr>
          <th scope="row">Actual Addressed From</th>
          <td>
            {{letter.location.addressed.from}}
          </td>
        </tr>
        
        <tr>
          <th scope="row">Regularized Addressed From</th>
          <td>
            {{letter.location.regularized.from.formatted}}
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
          <th scope="row">Language</th>
          <td>
            {{letter.language}}
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
      <tfoot>
        <tr>
          <td colspan="4">
            <span class="asterisk fa-asterisk"></span>
            All dates are displayed in European date format (<code>dd-mm-yy</code>).
          </td>
        </tr>
        <tr>
          <td colspan="2" class="has-glossary">
            <span class="asterisk fa-asterisk"></span>
            Some physical descriptions have been abbreviated. 
            <button class="button btn-glossary icon"
                    @click="toggleGlossary('descriptions')"
                    title="More information available.">
              <span class="icon fa-info-circle"></span>
            </button>
            <transition name="fade">
              <glossary id="descriptions" v-if="glossary.descriptions"></glossary>
            </transition>
          </td>
        </tr>
      </tfoot>
    </table>
  
  </div>
  
</template>