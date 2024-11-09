import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { User, Image } from './db.mjs'; 
import * as auth from './auth.mjs';
import sanitize from 'mongo-sanitize';
import session from 'express-session';

const loginMessages = {"PASSWORDS DO NOT MATCH": 'Incorrect password', "USER NOT FOUND": 'User doesn\'t exist'};
const registrationMessages = {"USERNAME ALREADY EXISTS": "Username already exists", "USERNAME PASSWORD TOO SHORT": "Username or password is too short"};

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname);

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));  
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Homepage route
app.get('/', (req, res) => {
  res.redirect('/home');
});

app.get('/home', async (req, res) => {
  const userInput = req.query.userInput;
  try {
    const randomImage = await Image.aggregate([{ $sample: { size: 1 } }]);
    console.log(randomImage);
    res.render('home', {
      image: randomImage[0],  
      userInput: userInput,
    });
  } catch (error) {
    console.error(error);
    res.render('home', { error: 'Something went wrong.' });
  }
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  try {
    const newUser = await auth.register(
      sanitize(req.body.username),
      req.body.password
    );
    await auth.startAuthenticatedSession(req, newUser);
    res.redirect('/'); 
  } catch(err) {
    console.log(err);
    res.render('register', {message: registrationMessages[err.message] ?? 'Registration error'}); 
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
try {
  const user = await auth.login(
    sanitize(req.body.username), 
    req.body.password
  );
  await auth.startAuthenticatedSession(req, user);
  res.redirect('/'); 
} catch(err) {
  console.log(err);
  res.render('login', {message: loginMessages[err.message] ?? 'Login unsuccessful'}); 
}
});

app.listen(process.env.PORT ?? 3000);
