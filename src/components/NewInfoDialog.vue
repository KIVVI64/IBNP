<template>
  <v-row justify="center">
    <v-snackbar
      v-model="NewInfoAlert"
      dark
      timeout="6000"
    >
      Nowe informacje do sprawdzenia
      <template v-slot:action="{ attrs }">
      <v-btn
        outlined
        small
        color="accent"
        v-bind="attrs"
        @click="NewInfoDialog = true, NewInfoAlert = false"
      >
        Zobacz
      </v-btn>
      <v-btn
        small
        text
        v-bind="attrs"
        @click="NewInfoAlert = false"
      >
        X
      </v-btn>
    </template>
    </v-snackbar>

    <v-dialog
      class="new-info-dialog"
      v-model="NewInfoDialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar
          dark
          color="black"
        >
          <v-btn
            icon
            dark
            @click="NewInfoDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Do sprawdzenia</v-toolbar-title>
        </v-toolbar>

        <!--<div class="d-flex justify-space-around">
          <v-alert
            border="left"
            colored-border
            dense
            color="red"
          > Stara informacja
          </v-alert>
          <v-alert
            border="left"
            colored-border
            dense
            color="green"
          > Nowa informacja
          </v-alert>
        </div>-->

        <v-card
          flat
          class="rounded-xl mt-4"
          v-for="(change, key) in changesList"
          :key="change.uid"
        >
          <v-card-title>{{ change.field }}</v-card-title>
          <v-card-text class="text--primary pb-0">
            <p><s>{{ change.oldData.toString().replace('\[\"', '').replace('\"\]', '') }}</s></p>
            <p>{{ change.newData.toString().replace('\[\"', '').replace('\"\]', '') }}</p>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="red"
              text
              @click="cancelData(change.uid, change.pointsRef), this.removeElement(key)"
            >
              Odrzuć
            </v-btn>

            <v-btn
              color="green"
              text
              @click="acceptData(change.uid, change.pointsRef, change.field, change.newData, change.userPoints), removeElement(key)"
            >
              Potwierdź
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-card>
    </v-dialog>
    
  </v-row>
</template>

<script>
import { auth } from '@/plugins/firebase'
import { schoolsCollection, editsCollection, usersCollection, pointsCollection } from '@/plugins/firebase'

export default {
  name: 'NewInfoDialog',
  data() {
    return {
      changesList: [],
      changesListLoading: true,
      NewInfoAlert: false,
      NewInfoDialog: false,

      //User add
      user: auth.currentUser,
      userIP: null,
      userID: null,
      userPoints: null,
    }
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

    editsCollection
    .where('where', '==', 'school')
    .where('objRef', '==', this.$route.params.school_uid)
    .where('verificated', '==', 'waiting')
    .where('userRef', '!=', this.userID)
    .get()
    .then(doc => {
      doc.forEach(elem => {
        const data = {
          uid: elem.id,
          field: elem.data().field,
          newData: elem.data().newData,
          oldData: elem.data().oldData,
          pointsRef: elem.data().pointsRef,
          userPoints: elem.data().userPoints,
        };
        this.changesList.push(data);
      })
      if (this.changesList.length) {
        this.NewInfoAlert = true;
      }
      this.changesListLoading = false;
    });
  },
  methods: {
    cancelData(uid, pointsRef) {
      editsCollection
      .doc(uid)
      .set({
        verificated: false,
      }, { merge: true })
      .then(() => {
        console.log("Odrzucono informacje");
        pointsCollection
        .doc(pointsRef)
        .set({
          verificated: false
        }, { merge: true })
        .then(() => {
          console.log("Odrzucono punkty");
        })
      })
    },
    acceptData(uid, pointsRef, field, newData, points) {
      editsCollection
      .doc(uid)
      .set({
        verificated: true,
      }, { merge: true })
      .then(() => {
        console.log("Potwierdzono informacje");
        pointsCollection
        .doc(pointsRef)
        .set({
          verificated: true
        }, { merge: true })
        .then(() => {
          console.log("Potwierdzono punkty");
        })
      })
      if (field == "Nazwa szkoły") {
        schoolsCollection
        .doc(this.$route.params.school_uid)
        .set({
          name: newData,
          namePoints: points,
        }, { merge: true })
        .then(() => {
          // Usuń obiekt z listy
        })
      }
      if (field == "Potoczne nazwy") {
        schoolsCollection
        .doc(this.$route.params.school_uid)
        .set({
          subnames: newData,
          subnamesPoints: points,
        }, { merge: true })
        .then(() => {
          // Usuń obiekt z listy
        })
      }
      if (field == "Poziomy") {
        schoolsCollection
        .doc(this.$route.params.school_uid)
        .set({
          levels: newData,
          levelsPoints: points,
        }, { merge: true })
        .then(() => {
          // Usuń obiekt z listy
        })
      }
      if (field == "Adres pocztowy") {
        schoolsCollection
        .doc(this.$route.params.school_uid)
        .set({
          address: newData,
          addressPoints: points,
        }, { merge: true })
        .then(() => {
          // Usuń obiekt z listy
        })
      }
    },
    removeElement(index) {
      this.changesList.splice(index, 1);
    }
  }
}
</script>

<style>

</style>