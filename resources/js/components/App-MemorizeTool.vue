<template>
  <div>
    <p class="switchContainer">
      <b-field>
        <b-switch v-model="underlineMode">Underline rest of word</b-switch>
      </b-field>
        <a class="button" @click.prevent="copyText">Copy Text</a>
    </p>
    <div class="columns">
      <div class="column">
        <b-field>
          <b-input type="textarea" v-model="inputText"></b-input>
        </b-field>
      </div>
      <div class="column">
        <div class="card">
          <p class="card-content" v-html="displayText">
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./App-MemorizeTool.vue.js"></script>

<style>
.switchContainer {
  padding: 1em 0;
}
</style>
