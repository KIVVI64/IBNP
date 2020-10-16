<template>
  <div class="school">
    <div id="container" class="mt-sm-5">
      <v-card
      elevation="8"
      class="rounded-xl"
      z-index="10"
      :loading="loading"
      >
        <v-skeleton-loader
          :loading="loading"
          transition="fade-transition"
          type="article"
        >
          <v-card-text>
            <div style="color: rgba(0, 0, 0, 0.6);">Szkoła</div>
            <h1 class="display-1 text--primary">
              {{ name }}
            </h1>
            <div class="d-inline-flex" v-if="subnames.length">
              <span class="aka text-overline">AKA</span>
              <v-chip-group
                active-class="deep-purple accent-4 white--text"
                column
              >
                <v-chip small v-for="subname in subnames" :key="subname"> {{ subname }} </v-chip>
              </v-chip-group>
            </div>
          </v-card-text>
        </v-skeleton-loader>
        <v-divider></v-divider>
        <v-skeleton-loader
          :loading="loading"
          type="list-item-avatar-two-line@3"
        >
        <span>
          <v-simple-table>
            <tbody>
              <tr>
                <td>Adres</td>
                <td>{{ address }}</td>
              </tr>
              <tr>
                <td>Nauczyciele</td>
                <td>{{ teachersList.length }}</td>
              </tr>
              <tr>
                <td>Poziomy</td>
                <td>
                  <p v-if="!levels.length">Nie podano</p>
                  <v-chip v-else small v-for="level in levels" :key="level"> {{ level }} </v-chip>
                </td>
              </tr>
            </tbody>
          </v-simple-table>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              icon
              :to="{ name: 'SchoolEdit', params: { school_uid: this.school_uid } }"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </v-card-actions>
        </span>
        </v-skeleton-loader>
      </v-card>
      <v-card
      elevation="8" 
      class="rounded-xl"
      :loading="popLoading"
      >
        <v-list avatar>
          <v-subheader>Popularni nauczyciele</v-subheader>
          <div
            v-if="!teachersList[0] && !popLoading"
            class="text-center caption text--secondary"
          >
            <router-link :to="{ name: 'TeacherAdd', query: { school_uid: this.school_uid } }">
              Dodaj pierwszego nauczyciela
            </router-link>
          </div>
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
          <v-btn rounded block color="secondary" dark :loading="popLoading" @click="loadMore()">Pełna lista</v-btn>
        </v-card-actions>
      </v-card>
      <v-card
      elevation="8"
      class="rounded-xl"
      >
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
          <v-btn rounded block color="secondary" dark>Pełna lista</v-btn>
        </v-card-actions>
      </v-card>
      <v-card
      elevation="8"
      class="rounded-xl"
      >
        <v-card-text>
          <canvas id="my-chart" width="100%" height="50px"></canvas>
        </v-card-text>
      </v-card>
    </div>

    <v-dialog
      persistent
      scrollable
      v-model="erno"
    >
      <v-card>
        <v-card-title class="headline">Szukaliśmy wszędzie 😞</v-card-title>

        <v-card-text>
          Niestety nie możemy znaleźć szkoły, którą chcesz zobaczyć. Naprawdę nie mam pojęcia co się z nią stało 😕
        </v-card-text>

        <v-card-actions>
          <v-btn
            color="primary"
            text
            @click="$router.go(-1)"
          >
            Wróć
          </v-btn>

          <v-btn
            color="primary"
            text
            @click="dialog = false"
          >
            Dodaj nową szkołę
          </v-btn>

          <v-btn
            color="primary"
            text
            @click="dialog = false"
          >
            Przejdź na główną
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <NewInfoDialog v-if="user" />

    <v-dialog
      v-model="pointsPopup"
      elevation="24"
      transition="fab-transition"
      max-width="160px"
      class="border"
    >
      <v-card
      class="text-center rounded-circle"
      color="secondary"
      height="160px"
      >
        <div class="d-flex flex-column align-center pa-4">
          <span class="white--text overline">Zdobywasz</span>
          <span class="white--text display-4">{{ pointsEarned }}<span class="display-2">p</span></span>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import NewInfoDialog from '@/components/NewInfoDialog.vue'

import { auth } from '@/plugins/firebase'
import { schoolsCollection, teachersCollection, usersCollection } from '@/plugins/firebase'

import Chart from 'chart.js';
import MagicGrid from "magic-grid"

export default {
  name: "School",
  components: {
    NewInfoDialog
  },
  data() {
    return {
      // Szkoła
      school_uid: null,
      name: "",
      city: null,
      editPoints: 0,
      levels: [],
      subnames: [],
      address: null,
      userRef: null, // id osoby dodającej szkołę

      //Nauczyciele
      teachersList: [],
      popLoading: true,
      items: [
        { title: 'Chemik', avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg', subtitle: '9 nauczycieli' },
        { title: 'Dziewiątka', avatar: 'https://cdn.vuetifyjs.com/images/lists/2.jpg', subtitle: '41 nauczycieli' },
        { title: 'Czart', avatar: 'https://cdn.vuetifyjs.com/images/lists/3.jpg', subtitle: '1 nauczyciel' },
        { title: 'Piątka', avatar: 'https://cdn.vuetifyjs.com/images/lists/4.jpg', subtitle: '15 nauczycieli' },
      ],
      
      // Meta
      dialog: false,
      erno: false,
      loading: true,
      waitingForCheck: false,
      pointsPopup: false,
      pointsEarned: 0,

      //User add
      user: auth.currentUser,
      userIP: null,
      userID: null,
      userPoints: null,
    }
  },
  watch: {
    pointsPopup (val) {
      if (!val) return

      setTimeout(() => (this.pointsPopup = false), 1500)
    },
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
          console.log("Spadaj z tej strony", "Nie ma tej szkoły!");
          next(vm => {
            vm.erno = true;
          })
        }
      });
  },
  created() {
    // Dane usera
    if (this.user) {
      this.userID = this.user.uid;
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

    //Punkty
    if (this.$route.query.points) {
      this.pointsEarned = this.$route.query.points || 0;
      this.$router.replace('/szkola/'+this.$route.params.school_uid);
      if (this.pointsEarned != 0) this.pointsPopup = true;
    }

    schoolsCollection.doc(this.$route.params.school_uid)
      .get()
      .then(doc => {
        this.waitingForCheck = doc.data().waitingForCheck;
        if (this.waitingForCheck == true && this.user) { this.NewInfoAlert = true; }
        this.name = doc.data().name;
        this.city = doc.data().city;
        this.levels = doc.data().levels || [];
        this.subnames = doc.data().subnames || [];
        this.address = doc.data().address || "Nie podano";
        this.editPoints = doc.data().editPoints || 0;
        this.loading = false;
      });
    
    // Ładownie pop nauczycieli
    this.popLoading = true;
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
          borderColor: "#540d6e",
          backgroundColor: "#763d8b",
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
.v-card.rounded-xl {
  min-width: 334px;
  max-width: 540px;
  width: 100%;
}
.v-dialog.border {
  border-radius: 100px !important;
}
.aka {
  line-height: 40px !important;
  margin-right: 8px;
}
.fixed {
  position: fixed;
  bottom: 0;
  z-index: 220;
  margin-bottom: -3px;
}
</style>
