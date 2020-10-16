<template>
  <div class="account">
    <h1>Moje Konto IBNP</h1>
    <p>Moje punkty: {{ pointsFromList || 0 }}</p>

    <v-card
      class="mx-auto"
      max-width="400"
      tile
    >
      <v-subheader>Historia punktów</v-subheader>
      <v-list-item
        three-line
        v-for="points in pointsList"
        :key="points.uid"
      >
        <v-list-item-content>
          <v-list-item-title>{{ points.action }}</v-list-item-title>
          <v-list-item-subtitle>
            Ilość punktów: {{ points.amount }}
          </v-list-item-subtitle>
          <v-list-item-subtitle>
            Status: {{ points.verificated }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-card>
  </div>
</template>

<script>
import { auth } from '@/plugins/firebase'
import { usersCollection, pointsCollection } from '@/plugins/firebase'

export default {
  name: 'Account',
  data() {
    return {
      //User
      userIP: null,
      userID: null,
      userPoints: null,
      pointsList: [],

      //Meta
      pointsListLoading: true,
      pointsFromList: 0,
    }
  },
  created() {
    // Dane usera
    let user = auth.currentUser;
    if (user) {
      this.userID = user.uid;
      usersCollection
      .doc(this.userID)
      .get()
      .then(doc => {
        this.userPoints = doc.data().points;
      });
    }

    pointsCollection
    .where('userRef', '==', this.userID)
    .get()
    .then(doc => {
      doc.forEach(elem => {
        const data = {
          uid: elem.id,
          action: elem.data().action,
          amount: elem.data().amount,
          verificated: elem.data().verificated,
        };
        if (elem.data().verificated != false) {
          this.pointsFromList = this.pointsFromList + elem.data().amount;
        }
        this.pointsList.push(data);
      })
      this.pointsListLoading = false;
      //Aktualizowanie punktów
      usersCollection
      .doc(this.userID)
      .set({
        points: this.pointsFromList
      }, { merge: true })
    });
  },
}
</script>

<style>

</style>