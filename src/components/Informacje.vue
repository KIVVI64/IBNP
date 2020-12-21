<template>
  <v-card id="informacje" elevation="8" class="mx-auto rounded-xl main-card" width="100%">
    <v-card-title>
      {{ section.charAt(0).toUpperCase() + section.slice(1) }}
    </v-card-title>
    <v-card-text style="padding: 0;">
      <v-skeleton-loader
        :loading="info_loading"
        transition="fade-transition"
        type="list-item-three-line"
      >
        <v-expansion-panels accordion flat>
          <v-expansion-panel v-for="info in info_list" :key="info.id">
            <v-expansion-panel-header class="multiline-element">{{ info.content }}</v-expansion-panel-header>
            <v-expansion-panel-content>
                <v-btn value="up" text tile @click='vote(info.id, "up")'>
                  <v-icon left>mdi-thumb-up-outline</v-icon> <span>8</span>
                </v-btn>
                <v-btn value="down" text tile  @click='vote(info.id, "down")'>
                  <v-icon left>mdi-thumb-down-outline</v-icon> <span>3</span>
                </v-btn>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <div v-if="!info_list.length && !info_loading" class="text-center caption text--secondary">Brak danych do wyświetlenia</div>
        </v-expansion-panels>
      </v-skeleton-loader>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-dialog v-model="new_info_dialog" max-width="600px">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            outlined
            rounded
            color="secondary"
            v-bind="attrs"
            v-on="on"
          >
            Dodaj więcej
          </v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class="headline">Dodaj nowe {{ section }}</span>
          </v-card-title>
          <v-card-text>
            <v-textarea
              v-model="content"
              auto-grow
              label="Napisz coś śmiesznego"
              single-line
            >
            </v-textarea>
            <p class="text-caption">*twoja informacja będzie dostępna publicznie po jej zwerefikowaniu</p>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="new_info_dialog = false">Anuluj</v-btn>
            <v-btn color="blue darken-1" text @click="factAdd(section)">Dodaj</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-actions>
  </v-card>
</template>

<script>
import { factsCollection } from '@/plugins/firebase'
import { auth, usersCollection } from '@/plugins/firebase'

export default {
  name: 'Informacje',
  data() {
    return {
      //Meta
      info_loading: true,
      new_info_dialog: false,

      //Nauczyciel
      info_list: [],

      //User add
      userIP: null,
      userID: null,
      userPoints: null,
      content: null
    }
  },
  props: {
    section: String
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

    //Informacje tego nauczyciela z tej kat
    factsCollection
      .where("teacherRef", "==", this.$route.params.teacher_uid)
      .where("section", "==", this.section)
      .orderBy("date", "desc")
      .onSnapshot(doc => {
        doc.forEach(elem => {
          const info = elem.data();
          info.id = elem.id;
          //info.votes = subColection;
          this.info_list.push(info);
        })
        this.info_loading = false;
      })
  },
  methods: {
    factAdd(section) {
      let currentDate = new Date();
      // console.log(currentDate.getTime());

      factsCollection
        .doc()
        .set({
          accessLevel: 1,
          code: currentDate.getTime(),
          content: this.content,
          date: currentDate,
          editPoints: this.userPoints,
          ip: this.userIP,
          section: section,
          teacherRef: this.$route.params.teacher_uid,
          userRef: this.userID,
          verificated: true
        })
        .then(() => {
          console.log("Dodano ", section);
          this.new_info_dialog = false;
        })
        .catch(err => console.log(err.message));
    },
    vote(id, content) {
      console.log(id, content);
      factsCollection
      .doc(id)
      .collection("votes")
      .doc()
      .set({
        content: content,
        userRef: this.userID
      })
    }
  }
}
</script>

<style>

</style>