<template>
  <div id="nav">
    <router-link to="/">quick start</router-link>
    | <router-link to="/geometry">geometry</router-link>
    | <router-link to="/material">material</router-link>
    | <router-link to="/plf">plf</router-link>
    | <router-link to="/light">light</router-link>
    | <router-link to="/group">group</router-link>
    | <router-link to="/curve">curve</router-link>
    | <router-link to="/texture">texture</router-link>
    | <router-link to="/camera">camera</router-link>
    | <router-link to="/spirit">spirit</router-link>
    | <router-link to="/skeleton">skeleton</router-link>
    | <router-link to="/audio">audio</router-link>
    | <router-link to="/loader">loader</router-link>
    | <router-link to="/audio">audio</router-link>
    | <router-link to="/render">render</router-link>
  </div>
  <router-view />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
