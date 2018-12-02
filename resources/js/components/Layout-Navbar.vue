<template>
  <div class="navbar">
    <div class="container">
      <div class="navbar-brand"> <div class="navbar-burger"></div>
      </div>
      <div class="navbar-menu">
        <div class="navbar-start">
          <router-link class="navbar-item" tag="a" :to="{ name: 'home' }">Home</router-link>
          <router-link class="navbar-item" tag="a" :to="{ name: 'about' }">About</router-link>
        </div>
        <div class="navbar-end">
          <router-link class="navbar-item" tag="a" :to="{ name: 'login' }">Login</router-link>
          <router-link class="navbar-item" tag="a" :to="{ name: 'register' }">Register</router-link>
        </div>
      </div>
    </div>
  </div>
</template>
