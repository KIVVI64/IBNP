import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

// firebase init
const firebaseConfig = {
  apiKey: "AIzaSyDRp-aPmSDaK4tpdPMAmj3y2YWmnhxCG_c",
  authDomain: "ibnp-pl.firebaseapp.com",
  databaseURL: "https://ibnp-pl.firebaseio.com",
  projectId: "ibnp-pl",
  storageBucket: "ibnp-pl.appspot.com",
  messagingSenderId: "713280225954",
  appId: "1:713280225954:web:3d7e9ce1fcfe250190cdfb"
}
firebase.initializeApp(firebaseConfig)

// utils
const db = firebase.firestore()
const auth = firebase.auth()

// collection references
const teachersCollection = db.collection('teachers')
const factsCollection = db.collection('facts')
const schoolsCollection = db.collection('schools')
const usersCollection = db.collection('users')
const viewsCollection = db.collection('views')

// export that biatch
export {
  db,
  auth,
  teachersCollection,
  schoolsCollection,
  usersCollection,
  factsCollection,
  viewsCollection
}