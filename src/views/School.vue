<template>
  <div class="school">
    <div id="container">
      <v-card elevation="20" z-index="10">
        <v-card-text>
          <div>Szkoła</div>
          <h1 class="display-1 text--primary">
            {{ name }}
          </h1>
          <v-chip-group
            active-class="deep-purple accent-4 white--text"
            column
          >
            <v-chip v-for="level in levels" :key="level"> {{ level}} </v-chip>
          </v-chip-group>
          <v-row
            align="center"
            class="mx-0"
          >
            <v-rating
              :value="4.5"
              color="amber"
              dense
              half-increments
              readonly
              size="14"
            ></v-rating>

            <div class="grey--text ml-4">4.5 (413)</div>
          </v-row>
        </v-card-text>

        <v-list-item>
          <v-icon class="mr-3">mdi-map-marker</v-icon>
          <v-list-item-subtitle>{{ address }}</v-list-item-subtitle>
        </v-list-item>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn icon>
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
      <v-card elevation="20" :loading="popLoading">
        <v-list avatar>
          <v-subheader>Popularni nauczyciele</v-subheader>
          <div v-if="!teachersList[0] && !popLoading" class="text-center caption text--secondary">Brak danych do wyświetlenia</div>
          <v-skeleton-loader
              v-if="!teachersList[0] && popLoading"
              type="list-item-avatar@4"
              width="90%"
            >
            </v-skeleton-loader>
            <v-list-item
              v-for="teacher in teachersList"
              :key="teacher.uid"
              :to="'/nauczyciel/' + teacher.uid"
            >
              <v-list-item-avatar>
                <v-img :src="teacher.avatar || 'https://uczenplus.pl/FILES/teacher/teacher.jpeg'"></v-img>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title v-text="teacher.namef + ' ' + teacher.namel"></v-list-item-title>
              </v-list-item-content>

              <v-list-item-action>
                <v-chip
                  class="ma-2"
                  color="primary"
                  text-color="white"
                  small
                >1 new
                </v-chip>
              </v-list-item-action>
            </v-list-item>
        </v-list>

        <v-card-actions>
          <v-btn rounded small block color="secondary" dark :loading="popLoading" @click="loadMore()">Pełna lista</v-btn>
        </v-card-actions>
      </v-card>
      <v-card elevation="20">
        <v-list two-line>
          <v-subheader>Szkoły w okolicy</v-subheader>
          <v-list-item
            v-for="item in items"
            :key="item.title"
          >
            <v-list-item-avatar>
              <v-img :src="item.avatar"></v-img>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title v-text="item.title"></v-list-item-title>
              <v-list-item-subtitle v-text="item.subtitle"></v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-card-actions>
          <v-btn rounded small block color="secondary" dark>Pełna lista</v-btn>
        </v-card-actions>
      </v-card>
      <v-card elevation="20">
        <v-card-text>
          <canvas id="my-chart" width="100%" height="50px"></canvas>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script>
import { schoolsCollection, teachersCollection } from '../plugins/firebase'
import { auth } from '../plugins/firebase'
import { usersCollection } from '../plugins/firebase'

import Chart from 'chart.js';
import MagicGrid from "magic-grid"

export default {
  name: "School",
  data() {
    return {
      // Szkoła
      school_uid: null,
      name: "",
      city: null,
      levels: [],
      address: null,
      userRef: null, // id osoby dodającej szkołę

      //Nauczyciele
      teachersList: [],
      popLoading: true,
      items: [
        { active: true, title: 'Jason Oner', avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg', subtitle: '9 nauczycieli' },
        { active: true, title: 'Ranee Carlson', avatar: 'https://cdn.vuetifyjs.com/images/lists/2.jpg', subtitle: '41 nauczycieli' },
        { title: 'Cindy Baker', avatar: 'https://cdn.vuetifyjs.com/images/lists/3.jpg', subtitle: '1 nauczyciel' },
        { title: 'Ali Connors', avatar: 'https://cdn.vuetifyjs.com/images/lists/4.jpg', subtitle: '15 nauczycieli' },
      ],
      
      // Meta
      dialog: false,
      erno: false,
      loading: true,

      //User add
      userIP: null,
      userID: null,
      userPoints: null,
    }
  },
  beforeRouteEnter(to, from, next) {
    //Podstawowe dane nauczycielas
    schoolsCollection.doc(to.params.school_uid)
      .get()
      .then(doc => {
        if (doc.exists) {
          next(vm => {
            vm.school_uid = doc.id;
            vm.name = doc.data().name;
            document.title = 'IBNP - ' + vm.name || 'IBNP';
          });
        } else {
          console.log("Nie znaleziono tej szkoły!", "Spadaj z tej strony");
          next(vm => {
            vm.erno = true;
          })
        }
      });
  },
  created() {
    // Dane usera
    let user = auth.currentUser;
    if (user) {
      this.userID = user.uid;
      usersCollection.doc(this.userID)
        .get()
        .then(doc => {
          this.userPoints = doc.data().points;
        });
    }

    fetch('https://api.ipify.org?format=json')
    .then(x => x.json())
    .then(({ ip }) => {
        this.userIP = ip;
    });

    schoolsCollection.doc(this.$route.params.school_uid)
      .get()
      .then(doc => {
        this.name = doc.data().name;
        this.city = doc.data().city;
        this.levels = doc.data().levels;
        this.address = doc.data().address;
      });
    
    // Ładownie pop nauczycieli
    this.popLoading = true;
    teachersCollection
      .where("schoolsRef", "array-contains", this.$route.params.school_uid)
      .limit(3)
      .get()
      .then(doc => {
        doc.forEach(elem => {
          const data = {
            uid: elem.id,
            namef: elem.data().name_f,
            namel: elem.data().name_l,
            date: elem.data().date
          };
          this.teachersList.push(data);
        })
        this.popLoading = false;
      })

    
  },
  updated() {
    // Grid
    let magicGrid = new MagicGrid({
      container: "#container", // Required. Can be a class, id, or an HTMLElement.
      items: 4, // For a grid with 20 items. Required for dynamic content.
      animate: true, // Optional.
      gutter: 24,
    });
    magicGrid.listen();

    new Chart(document.getElementById('my-chart'), {
      type: 'line',
      data: {
        labels: ['Wrz.', 'Paź.', 'Lis.', 'Gru.', 'Sty.'],
        datasets: [{
          label: 'Popularność',
          data: [300, 700, 450, 750, 450],
          borderColor: "#512da8",
          backgroundColor: "#8559da",
          borderWidth: 6,
          pointRadius: 0
        }],
      },
      options: {
        responsive: true,
				scales: {
          xAxes: [{
            gridLines: {
              display: false,
            },
					}],
					yAxes: [{
						ticks: {
              display: false,
              beginAtZero: true
            },
            gridLines: {
              display: false,
            },
					}]
				}
			}
    });

  },
  methods: {
    loadMore() {
      // Ładownie pop nauczycieli
    this.popLoading = true;
    this.teachersList = []
    teachersCollection
      .where("schoolsRef", "array-contains", this.$route.params.school_uid)
      .get()
      .then(doc => {
        doc.forEach(elem => {
          const data = {
            uid: elem.id,
            namef: elem.data().name_f,
            namel: elem.data().name_l,
            date: elem.data().date
          };
          this.teachersList.push(data);
        })
        this.popLoading = false;
      })
    }
  }
}
</script>

<style>
.v-card {
  border-radius: 18px !important;
  width: 360px;
}
</style>