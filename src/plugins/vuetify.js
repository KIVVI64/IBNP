import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: "#7cb342", // #E53935
        secondary: "#512da8", // #FFCDD2
        accent: "#e65100", // #3F51B5
      },
    },
  },
});
