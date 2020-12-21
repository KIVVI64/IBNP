<template>
  <div class="teacher">
    <v-row no-gutters>
      <v-col cols="12" sm="12" md="8" xl="9">
        <v-card elevation="8" class="mx-auto rounded-xl main-card" width="100%">
          <v-card-text>
            <v-skeleton-loader
              :loading="loading"
              transition="fade-transition"
              type="article"
            >
              <v-card flat>
                <div class="text-center">
                  <v-avatar
                    size="180"
                    rounted
                    class="mb-3"
                  >
                    <img
                      src="https://uczenplus.pl/FILES/teacher/teacher.jpeg"
                      :alt="namef"
                    >
                  </v-avatar>
                </div>
                
                <h1 class="display-2 text-center">{{ namef }} {{ namel }}</h1>
                <!--<p class="display-1">{{ new_namef }} {{ new_namel }}</p>-->
                <p class="mt-3 mb-1">Szkoła:</p>
                <v-chip class="mr-2 mb-2" v-for="school in schoolsList" :to="{ name: 'School', params: { school_uid: school.id } }" :key="school.id" >
                  {{ school.name }}
                  <v-icon class="mr-1" small right>mdi-open-in-new</v-icon>
                </v-chip>
                <p class="mt-3 mb-1">Przedmioty:</p>
                <v-chip class="mr-2 mb-2" v-for="subject in subjects" :key="subject">
                  {{ subject }}
                </v-chip>
              </v-card>
            </v-skeleton-loader>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn icon>
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
        <Informacje section="powiedzenia" />
        <Informacje section="ciekawostki" />
        

        

        <h2>Opinie</h2>
        <p>Op1</p>
        <p>Op2</p>
      </v-col>
      <v-col cols="12" sm="12" md="4" xl="3">
        <h3>Inni z tej szkoły</h3>
        <p>Imie Nazwisko</p>
        <p>Imie Nazwisko</p>

        <h3>Warto zobaczyć</h3>
        <p>Imie Nazwisko</p>
        <p>Imie Nazwisko</p>
      </v-col>
    </v-row>

    <v-dialog
      persistent
      scrollable
      v-model="erno"
    >
      <v-card>
        <v-card-title class="headline">Szukaliśmy wszędzie 😞</v-card-title>

        <v-card-text>
          Niestety nie możemy znaleźć nauczyciela, którego chcesz zobaczyć. Naprawdę nie mam pojęcia co się z nim stało 😕
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

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
            Dodaj nowego nauczyciela
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
  </div>
</template>

<script>
import Informacje from '@/components/Informacje.vue'

import { teachersCollection, schoolsCollection, viewsCollection } from '@/plugins/firebase'
import { usersCollection } from '@/plugins/firebase'
import { auth } from '@/plugins/firebase'

export default {
  name: "Teacher",
  data() {
    return {
      // Nauczyciel
      teacherRef: null,
      namef: null,
      namel: null,
      new_namef: "Imie",
      new_namel: "Nazwisko",
      schoolsRef: [], // id szkół nauczyciela
      schoolsList: [], // obiekt z danymi szkół
      teacher_uid: "",
      userRef: null, // id osoby dodającej nauczyciela
      subjects: [],
      facts: [],
      says: [],
      
      // Meta
      dialog: false,
      factsDialog: false,
      saysDialog: false,
      erno: false,
      loading: true,
      saying_loading: true,
      facts_loading: true,

      //User add
      userIP: null,
      userID: null,
      userPoints: null,
      content: null,
    }
  },
  components: {
    Informacje
  },
  beforeRouteEnter(to, from, next) {
    //Podstawowe dane nauczyciela
    teachersCollection.doc(to.params.teacher_uid)
    .get()
    .then(doc => {
      if (doc.exists) {
        next(vm => {
          vm.teacherRef = doc.id;
          vm.namef = doc.data().name_f;
          vm.namel = doc.data().name_l;
          vm.schoolsRef = doc.data().schoolsRef;
          vm.userRef = doc.data().userRef;
        });
      } else {
        console.log("Nie znaleziono nauczyciela!", "Spadaj z tej strony");
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

    teachersCollection.doc(this.$route.params.teacher_uid)
    .get()
    .then(doc => {
      this.teacherRef = doc.id;
      this.namef = doc.data().name_f;
      this.namel = doc.data().name_l;
      document.title = 'IBNP - ' + this.namef + ' ' + this.namel || 'IBNP'
      this.schoolsRef = doc.data().schoolsRef;
      this.schoolsRef.forEach(elem => {
        schoolsCollection
          .doc(elem)
          .get()
          .then(doc2 => {
            const data = {
              id: doc2.id,
              name: doc2.data().name
            }
            this.schoolsList.push(data);
          })
      })
      this.userRef = doc.data().userRef;
      this.subjects = doc.data().subjects;
      this.loading = false;

      //Aktualizowanie metadanych
      let currentDate = new Date();
      viewsCollection
      .doc()
      .set({
        date: currentDate,
        schoolsRef: this.schoolsRef,
        teacherRef: this.teacherRef,
        userRef: this.userID,
        userIP: this.userIP
      })
      .then(() => {
        console.log("Successfully addedd click");
      })
      .catch(err => {
        console.log(err.message);
      });
    })

  }
}
</script>

<style scoped>
.main-card {
  margin-bottom: 12px;
}
.blockquote-old {
  border-left: 4px solid #8bc34a;
  margin: 2px 0px;
  margin-left: 5px;
  padding: 5px;
  min-height: 28px;
}
.multiline-element {
  white-space: pre-line;
  word-wrap: break-word;
}
</style>
