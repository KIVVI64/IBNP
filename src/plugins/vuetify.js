import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: "#0ead69", // #E53935
        secondary: "#540d6e", // #FFCDD2
        accent: "#ffd23f", // #3F51B5

        success: "#7CB342",
        info: "#3bceac",
        warning: "#E65100",
        error: "#AD1457"
      },
    },
  },
});
