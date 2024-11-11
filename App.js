const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const horairesOuverture = {
  lundi: [9, 17],
  mardi: [9, 17],
  mercredi: [9, 17],
  jeudi: [9, 17],
  vendredi: [9, 17],
  samedi: null, // Fermé
  dimanche: null, // Fermé
};

// Fonction pour vérifier si on est dans les heures d’ouverture
const estOuvert = () => {
  const date = new Date();
  const jourSemaine = date.toLocaleString('fr-FR', { weekday: 'long' }).toLowerCase();
  const heures = date.getHours();

  const horaires = horairesOuverture[jourSemaine];
  if (horaires && heures >= horaires[0] && heures < horaires[1]) {
    return true;
  }
  return false;
};

// Fonction pour calculer le temps jusqu'à la prochaine ouverture
const prochainOuverture = () => {
  const date = new Date();
  const jour = date.getDay();
  const heure = date.getHours();

  // Trouver le jour suivant avec des horaires d’ouverture
  for (let i = 1; i <= 7; i++) {
    const jourSuivant = (jour + i) % 7;
    const jourSemaine = Object.keys(horairesOuverture)[jourSuivant];
    const horaires = horairesOuverture[jourSemaine];

    if (horaires) {
      const heuresRestantes = horaires[0] - heure;
      const minutesRestantes = (60 - date.getMinutes()) % 60;
      return `Le site ouvrira dans ${i === 1 ? 'aujourd\'hui' : ` ${i} jour(s)`} à ${horaires[0]}h.`;
    }
  }
  return "Nous serons fermés pour un certain temps.";
};

// Fonction pour enregistrer les tentatives hors heures de travail
const enregistrerTentative = (req) => {
  const date = new Date();
  const log = `[${date.toISOString()}] Tentative de connexion à ${req.originalUrl} en dehors des heures d'ouverture\n`;
  fs.appendFileSync('logs.txt', log);
};

// Middleware pour vérifier les horaires
const horairesMiddleware = (req, res, next) => {
  if (estOuvert()) {
    next();
  } else {
    enregistrerTentative(req);
    res.render('ferme', { prochainOuverture: prochainOuverture() });
  }
};

// Configurer le moteur de template EJS
app.set('view engine', 'ejs');

// Servir les fichiers statiques (comme le CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Utiliser le middleware d’horaires pour toutes les routes
app.use(horairesMiddleware);

// Routes principales
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/services', (req, res) => {
  res.render('services');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

// Démarrer le serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
