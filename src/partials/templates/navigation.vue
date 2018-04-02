<template id="template-navigation">

  <nav>
    <label class="fa-bars">
      <input type="checkbox" v-model="open">
    </label>
    <ul :class="{open: open, closed: !open}">
      <li :class="{active: active == '/'}">
        <router-link @click.native="close" to="/">Home</router-link>
      </li>
      <li :class="{active: active == '/about'}">
        <router-link @click.native="close" to="/about">About</router-link>
      </li>
      <li :class="{active: active == '/list'}">
        <router-link @click.native="close" to="/list">List</router-link>
      </li>
    </ul>
  </nav>

</template>