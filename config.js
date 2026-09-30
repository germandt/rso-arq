// Configuración pública de Firebase. Nada de esto es secreto: la seguridad
// la dan las reglas de Firestore (firebase/firestore.rules).
// Se carga como script clásico tanto en la página como en el service worker.
//
// Mientras `apiKey` siga en "PEGAR_...", la app corre en MODO DEMO con los
// datos de demo/data-demo.js y el botón de avisos queda desactivado.
self.APP_CONFIG = {
  firebase: {
    apiKey: "AIzaSyA6lotPQaewj6gbRmSbw2qY9iyIyriftEs",
    authDomain: "rso-arq.firebaseapp.com",
    projectId: "rso-arq",
    storageBucket: "rso-arq.firebasestorage.app",
    messagingSenderId: "1017681598817",
    appId: "1:1017681598817:web:8dfaee5083a44feea88d20",
  },
  // Firebase Console → Configuración → Cloud Messaging → Certificados web push
  vapidKey: "BPnnZrz3wTCymKn1kTTf7MjRTOsUZgjyxNsrk2rp-7taZKWRKdI-z8jh0MhVddlQqx8Y3YiQdoYSqKMU356SvS0",
  obraId: "aires-del-parque",
  firebaseSdk: "10.14.1",
};
self.APP_CONFIG.demo = self.APP_CONFIG.firebase.apiKey.startsWith("PEGAR_");
