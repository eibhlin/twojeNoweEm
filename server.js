var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , util = require('util')
  , nconf = require('nconf')
  , FacebookStrategy = require('passport-facebook').Strategy;

var app = express();

nconf.env().file({file: 'settings.json'});

app.configure(function(){
  app.set('port', process.env.PORT || 80);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon(__dirname + '/public/favicon.png')); 
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('kararara'));
  app.use(express.session());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});//=====================================================================================
var Smieciowka = require('./controllers/oferty');
var smieciowki = new Smieciowka('mongodb://localhost/smieciowki');
Smieciowka.prototype.io=function(msg){io.sockets.emit('log',{output:msg})};
//=================================================================
app.get('/', ensureAuthenticated, smieciowki.nowaUmowa.bind(smieciowki) /*function(req,res){res.redirect('/nowaumowa')}*/); // tutaj pokazujemy główną / redirect
//=================================================================
app.get('/nowaumowa/:id', ensureAuthenticated, //czyli tworzenie nowej śmieciówki
	//res.render('account', { user: req.user });ensureAuthenticated, 
	smieciowki.nowaUmowa.bind(smieciowki)
);//=================================================================
app.get('/nowaumowa', ensureAuthenticated, //czyli tworzenie nowej śmieciówki
	smieciowki.nowaUmowa.bind(smieciowki)
);//=================================================================
app.get('/nowaumowa/',  ensureAuthenticated, //czyli tworzenie nowej śmieciówki
	smieciowki.nowaUmowa.bind(smieciowki)
);//=================================================================
app.post('/wyslij/:id',  ensureAuthenticated, //czyli zapisywanie nowej śmieciówki do wyslania
	//res.render('account', { user: req.user });ensureAuthenticated, 
	smieciowki.przygotujUmowe.bind(smieciowki)
);//=================================================================
app.post('/wyslij/',  ensureAuthenticated, //czyli zapisywanie nowej śmieciówki do wyslania
	//res.render('account', { user: req.user });ensureAuthenticated, 
	smieciowki.przygotujUmowe.bind(smieciowki)
);//=================================================================
app.get('/uzupelnij/:id', //czyli wypelnianie śmieciówki przez pracownika
	//res.render('kontopracownika', { user: req.user }); //ensureAuthenticated, 
	smieciowki.wyswietlUmowe.bind(smieciowki)	
);//=================================================================
app.get('/umowa/:id', ensureAuthenticated, //czyli wypelnianie śmieciówki przez pracownika
	//res.render('kontopracownika', { user: req.user }); //ensureAuthenticated, 
	smieciowki.pokazUmowe.bind(smieciowki)	
);//=================================================================
app.patch('/umowa/:id', ensureAuthenticated, //czyli wypelnianie śmieciówki przez pracownika
	//res.render('kontopracownika', { user: req.user }); //ensureAuthenticated, 
	smieciowki.uaktualnijUmowe.bind(smieciowki)	
);//=================================================================
app.patch('/umowaTpl/:id', ensureAuthenticated, //czyli wypelnianie śmieciówki przez pracownika
	//res.render('kontopracownika', { user: req.user }); //ensureAuthenticated, 
	smieciowki.uaktualnijSzablonUmowy.bind(smieciowki)	
);//=================================================================
app.get('/umowaTpl/:id',  //pobieranie szablonu
	//res.render('kontopracownika', { user: req.user }); //ensureAuthenticated, 
	smieciowki.pokazSzablonUmowy.bind(smieciowki)	
);//=================================================================
app.post('/umowa/:id',  ensureAuthenticated, //czyli wysylanie wypelnionej smieciowki
	smieciowki.zapiszUmowe.bind(smieciowki)
);//=================================================================
app.delete('/umowa/:id',  ensureAuthenticated, //czyli wysylanie wypelnionej smieciowki
	smieciowki.usunUmowe.bind(smieciowki)
);//====================================
app.get('/wyslij/:id', ensureAuthenticated,
  smieciowki.pokazUzupelnionaUmowe.bind(smieciowki)
); // tutaj pokazujemy główną / redirect
//=================================================================
app.get('/umowy*', ensureAuthenticated, //czyli wypelnianie śmieciówki przez pracownika
	//res.render('kontopracownika', { user: req.user }); //ensureAuthenticated, 
	smieciowki.pokazMojeUmowy.bind(smieciowki)	
);//=================================================================
app.get('/ref', function(req,res){
  io.sockets.emit('ref', { });
  res.end();
});//=================================================================
app.get('/channel.html',function(req,res){
  var body='<script src="//connect.facebook.net/pl_PL/all.js"></script>';
  var a=0;(a=new Date('01 Feb 2020')).toUTCString()
  var maxage=60*60*24*365;
  response.writeHead(200, {
    'Content-Length': body.length
    , 'Content-Type': 'text/javascript' 
    , 'Pragma': 'public'
    , 'Cache-Control': 'max-age='+maxage
    , 'Expires:': a
  })
  res.send(body);
});//=================================================================
app.get('/pay', function(req,res){
  // powrót z płatności
  // save pmt
  res.render('pay')
})//====================================================================
app.get('/pmt', function(req,res){
  // powrót z płatności
  // save pmt
  console.log(req)
  io.sockets.emit('pmt', [req.body, req.params]);
  res.render('thankyou')
})//====================================================================
app.post('/pmt', function(req,res){
  console.log(req)
  io.sockets.emit('pmt', [req.body, req.params]);
  res.render('thankyou')
});//====================================================================
//~ app.post('/login', function (req, res) {
  //~ var post = req.body;
  //~ if (post.password == 'smieciowki666') {
    //~ req.session.user_id = johns_user_id_here;
    //~ res.redirect('/');
  //~ } else {
    //~ res.send('Bad user/pass');
  //~ }
//~ });
//=================================================================
app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});//=================================================================
app.get('/auth/facebook',
  passport.authenticate('facebook'),
  function(req, res){} // The request will be redirected to Facebook for authentication, so this function will not be called.
);//=================================================================
// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
  app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function (req, res) {
  	res.redirect('/');
  });
//=================================================================
app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/'); // dzie skierowac po wylogowaniu?
});//=================================================================
function ensureAuthenticated(req, res, next) {
  //~ req['session'] = []
  if(process.env.USERNAME == "Maciej"){
    if(typeof req['session']['passport'] == 'undefined') req['session']['passport'] = []
    req['session']['passport']['user'] = '1073806955';
    return next();
  }
  if (req.isAuthenticated()) { return next(); }
  res.render('login', { user: req.user });
  //~ res.redirect('/login')
}//=================================================================
//=================================================================
//=================================================================
// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Facebook profile is serialized
//   and deserialized.
passport.serializeUser(function (user, done) {
    console.log("ser")
    console.log(user.id)
	done(null, user.id);
});//=================================================================
passport.deserializeUser(function(obj, done) {
    console.log("deser");
    console.log(obj)
	done(null, obj);
});//=================================================================
// Use the FacebookStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Facebook
//   profile), and invoke a callback with a user object.
//=================================================================
passport.use(new FacebookStrategy({
    clientID: nconf.get("facebook:applicationId"),
    clientSecret: nconf.get("facebook:applicationSecret"),
    callbackURL: "http://smieciowki.azurewebsites.net/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      // To keep the example simple, the user's Facebook profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Facebook account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));//=================================================================
//=================================================================
//=================================================================
server = http.createServer(app); // options,
//=================================================================
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});//=================================================================
// for restarting the server
var once=0
var io = require('socket.io').listen(server);
io.set('log level', 1);
io.sockets.on('connection', function (socket) {
	if (!once++) socket.emit('ref', { });
})
