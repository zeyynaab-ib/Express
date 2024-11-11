const express = require('express');
const app = express();
const port = 3002;

app.set('view engine', 'ejs');

app.use(express.static('public'));

const checkWorkinHours = (req, res, next) => {
  const currentDate = new Date();
  const currentDay = currentDate.getDay();
  const currentHour = currentDate.getHours();

  if (currentDay >= 1 && currentDay <= 5 && currentHour >= 9 && currentHour <= 17) {
    // Si c'est pendant les heures de travail, passez au middleware suivant
    next();
  } else {
    // En dehors des heures de travail, renvoyer un message d'erreur
    res.send('Sorry, the App is Only Available at Working Hours (Monday to Friday 9 AM to 5 PM)');
  }
};

// Utilisation du middleware checkWorkinHours pour toutes les routes
app.use(checkWorkinHours);

app.get('/', (req, res) => {
  res.render('Home');
});

app.get('/Services', (req, res) => {
  res.render('Services');
});

app.get('/Contact', (req, res) => {
  res.render('Contact');
}); 

app.listen(port, () => {            
  console.log(`Server is running on http://localhost:${port}`);
});