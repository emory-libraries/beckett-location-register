<template id="template-navigation">

  <nav>
    <ul>
      <li :class="{active: active == '/'}"><router-link to="/">Home</router-link></li>
      <li :class="{active: active == '/about'}"><router-link to="/about">About</router-link></li>
      <li :class="{active: active == '/list'}"><router-link to="/list">List</router-link></li>
    </ul>
  </nav>

</template>