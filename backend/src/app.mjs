import express from 'express';
import { User, Image } from './db.mjs'; 
import * as auth from './auth.mjs';
import sanitize from 'mongo-sanitize';
import session from 'express-session';
import cors from 'cors';
import url from 'url';
import path from 'path';

const loginMessages = {"PASSWORDS DO NOT MATCH": 'Incorrect password', "USER NOT FOUND": 'User doesn\'t exist'};
const registrationMessages = {"USERNAME ALREADY EXISTS": "Username already exists", "USERNAME PASSWORD TOO SHORT": "Username or password is too short"};

const app = express();
const __dirname=path.dirname(url.fileURLToPath(import.meta.url));
const __root=path.resolve(__dirname, '..', '..');
app.use(express.static(path.join(__root, 'frontend/build')));

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});
app.use(cors());

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

app.get('/api/home', async (req, res) => {
  // console.log('Hit /home endpoint')
  try {
    const randomImages = await Image.aggregate([{ $sample: { size: 12 } }]);
    res.json({images:randomImages});//a list of images (dic)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

app.get('/api/search', async (req, res) => {
  const query = req.query.query;
  console.log("query is:",query);
  if (!query) return res.status(400).json({ error: 'Query is required.' });

  try {
    const randomImages = await Image.aggregate([{ $sample: { size: 12 } }]);
    res.json({images:randomImages});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Search failed.' });
  }
});

// Registration Route
app.post('/api/register', async (req, res) => {
  try {
    const newUser = await auth.register(
      sanitize(req.body.username),
      req.body.password
    );
    await auth.startAuthenticatedSession(req, newUser);
    res.json({user:newUser}); 
  } catch(err) {
    console.log(err);
    res.json({ message: registrationMessages[err.message] ?? 'Registration error' }); 
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const user = await auth.login(
      sanitize(req.body.username), 
      req.body.password
    );
    await auth.startAuthenticatedSession(req, user);
    res.json({user:user}); 
  } catch(err) {
    console.log(err);
    res.json({ message: loginMessages[err.message] ?? 'Login unsuccessful' }); 
  }
});

app.post('/api/logout', async (req, res) => {
  await auth.endAuthenticatedSession(req);
  res.json({ message: 'Logged out' });
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__root, 'frontend', 'build', 'index.html'));
});

console.log('Listening on port', process.env.PORT);
app.listen(process.env.PORT);
// app.listen(3001);

