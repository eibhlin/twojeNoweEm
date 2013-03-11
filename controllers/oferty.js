/*
 * GET users listing.
 */
 var mongoose = require('mongoose')
  , s_mdl = require('../models/smieciowka_mdl.js')
  , ukv_mdl = require('../models/ukv_mdl.js')
  , util = require ('util')
  , fs =    require('fs')
 //console.log(s_mdl);
module.exports = Smieciowka;

function Smieciowka(connection) {
	mongoose.connect(connection, function (err) {
		if (err) {
			console.log("baza wyjebana")
				//~ res.write(req.host);
				console.log(err);
				if (err) throw err;
		}
		//if (err) throw err;
	});
	//~ console.log("skonektowal");
} //~ =====================================================================================================================
Smieciowka.prototype = {
	nowaUmowa: function (req, res) {
		console.log("nowaUmowa")
		console.log(req.session.passport)
		if (typeof req.session.passport != 'undefined') idek = req.session.passport.user; else idek = ''

		if (typeof req.params.id != 'undefined'){
			s_mdl.find({ 'fbid':idek , _id: req.params.id }, function jestSmieciowka(err, umowa) {
			// wyjebongo dla pustego idka?
				if (umowa!=undefined) {
					res.render('nowaumowa', { "umowa":  umowa[0], _dbg: JSON.stringify(umowa[0]),'idek':idek,_host:req.host, _proto:req.protocol }) // edit index template
				} else {
					res.render('nowaumowa', { "umowa":  '', _dbg: JSON.stringify(''),'idek':idek,_host:req.host, _proto:req.protocol }) // edit index template
				}
		}) } else {
			s_mdl.find({ 'fbid':idek , szablon: true }, function jestSmieciowka(err, umowa) {
			// wyjebongo dla pustego idka?
				if (umowa!=undefined) {
					res.render('nowaumowa', { "umowa":  umowa[0], _dbg: JSON.stringify(umowa[0]),'idek':idek,_host:req.host, _proto:req.protocol }) // edit index template
				} else {
					res.render('nowaumowa', { "umowa":  '', _dbg: JSON.stringify(''),'idek':idek,_host:req.host, _proto:req.protocol }) // edit index template
				}
			});
		}
	},//~ =====================================================================================================================
	przygotujUmowe: function (req, res) {
		//console.log("wyslij ludziom")
		var item = req.body;
		nS = new s_mdl();
		nS.data_zawarcia = item.data_zawarcia
		nS.data_wykonania = item.data_wykonania
		nS.miejsce_zawarcia = item.miejsce_zawarcia
		nS.nazwa_firmy = item.nazwa_firmy
		nS.przedstawiciel_firmy = item.przedstawiciel_firmy
		nS.reprezentowana_przez = item.reprezentowana_przez
		nS.miasto_firmy = item.miasto_firmy
		nS.krs_firmy = item.krs_firmy
		nS.nip_firmy = item.nip_firmy
		nS.regon_firmy = item.regon_firmy
		nS.kod_firmy = item.kod_firmy
		nS.adres_firmy = item.adres_firmy
		nS.regon_firmy = item.regon_firmy
		nS.email_przedstawiciela = item.email_przedstawiciela
		nS.tel_przedstawiciela = item.tel_przedstawiciela
		nS.fbid = req.session.passport.user;
		nS.tresc_szablonu = item.tresc_szablonu
		nS.szablon_markdown = item.szablon_markdown
		//~ console.log(item.szablon)
		console.log("\nFBID")
		console.log(req.session.passport.user)
		if (item.szablon=='true') {
			nS.szablon = true;
			s_mdl.findOneAndUpdate({szablon:true}, { szablon: false }, {}, function i(err,rec){console.log(rec);})
			}
		nS.pracownicy=item.pracownicy;
		nS.save(function zapisanaSmieciowka(err) {
			console.log('save')
			if (err) {
				throw err;
				console.log("wyjebalo zapisywanie")
			}
			console.log(nS);
			res.render('dowyslania', { 
				umowa: nS, 
				_dbg: util.inspect(req.body),
				_host:req.host, 
				_proto:req.protocol 
				});
		});
	}, //~ ====================================================================
	wyswietlUmowe: function (req, res) {
		//debugger;
		console.log("pokaz umowe")
		nS = new s_mdl(); 
		//~ console.log(req.params.id)
		s_mdl.find({ 'pracownicy._id':req.params.id /*,i:false*/ }, function jestSmieciowka(err, umowa) {
				//~ console.log(umowa[0]._id)
				if (umowa.length){
					for (var i=0;i<umowa[0].pracownicy.length;i++){
						if (umowa[0].pracownicy[i]._id == req.params.id)
							umowa[0].pracownicy = umowa[0].pracownicy.slice(i,i+1);
					}
					console.log("pracownicy[0]: "+umowa[0].pracownicy);
				}
				umowa[0].tresc_szablonu=""
				res.render('kontopracownika1', { 
				"umowa": /*JSON.stringify(umowa)*/ umowa[0]
				, _dbg: JSON.stringify(umowa[0])
				, iloscUmow : 0
				, "dane_pracownika" : umowa[0].pracownicy.length?umowa[0].pracownicy[0]:[]
				, id: req.params.id
			}) 
		});
	},//~ ===========================================================================
	pokazUmowe: function (req, res) {
		console.log("pokaz umowe")
		//~ nS = new s_mdl(); 
		//~ console.log(req.params.id)
		s_mdl.find({ '_id':req.params.id /*,i:false*/ }, function jestSmieciowka(err, umowa) {
			res.json(umowa) 
		});
	},//~ ===========================================================================
	pokazSzablonUmowy: function (req, res) {
		console.log("pokaz szablon umowy")
		//~ nS = new s_mdl(); 
		//~ console.log(req.params.id)
		s_mdl.find({ '_id':req.params.id /*,i:false*/ }, function jestSmieciowka(err, umowa) {
		//~ console.log(typeof umowa[0])
		if (typeof umowa[0].tresc_szablonu == 'undefined' || umowa[0].tresc_szablonu.length == 0){
			console.log('czytam')
			res.send(fs.readFileSync('views/umowa1.ejs'));
			} 
		else
			{
			console.log('z bazi')
			res.send(umowa[0].tresc_szablonu)
			}
		});
	},//~ ===========================================================================
	uaktualnijSzablonUmowy: function (req, res) {
		console.log("uaktualnij szablon")
		//~ nS = new s_mdl(); 
		console.log(req.params.id + "=" + req.params.tresc_szablonu)
		s_mdl.findOneAndUpdate({ '_id':req.params.id}, {'tresc_szablonu':req.body.tresc_szablonu}, {}, function jestSmieciowka(err, umowa) {
			console.log(umowa)
			console.log(err)
			res.json(umowa) 
		})
	},//~ ===========================================================================
	uaktualnijUmowe: function (req, res) {
		console.log("uaktualnij umowe")
		//~ nS = new s_mdl(); 
		console.log(req.params.id + "=" + req.body.szablon)
		if (req.body.szablon == 'true'){
			s_mdl.findOneAndUpdate({ '_id':req.params.id}, {'szablon':true}, {}, function jestSmieciowka(err, umowa) {
				res.json(umowa)
				console.log(umowa)
				console.log(err)
			})
			console.log('was true')
			}
		else{
			s_mdl.findOneAndUpdate({ '_id':req.params.id}, {'szablon':false}, {}, function jestSmieciowka(err, umowa) {
				console.log(umowa)
				console.log(err)
				res.json(umowa) 
			})
			console.log('was false')
			}
	},//~ ===========================================================================
	zapiszUmowe: function (req, res) {
		console.log("zapisz umowe dla:" + req.params.id)
		var item = req.body;
		s_mdl.findOneAndUpdate({"pracownicy._id":req.params.id}, { "pracownicy.$.dzielo_pracownika":item.dzielo_pracownika,"pracownicy.$.zalacznik":item.zalacznik,  }, {}, function i(err,rec){console.log("rec:"+rec);})
		s_mdl.find({ 'pracownicy._id':req.params.id /*,i:false*/ }, function jestSmieciowka(err, umowa) {
				if (umowa.length){
				for (var i=0;i<umowa[0].pracownicy.length;i++){
					if (umowa[0].pracownicy[i]._id != req.params.id)
						umowa[0].pracownicy.splice(i,1);
				}
				//~ console.log("pracownicy[0] \x1b[7m: "+umowa[0].pracownicy[0]);
				}
				pracownik_form={}
				//~ res.json("mkay");
				res.end()
				res.finished = true
		});
	},//~ =========================================================================
	pokazMojeUmowy: function (req, res) {
		console.log(req.session.passport)
		if (typeof req.session.passport != 'undefined') idek=req.session.passport.user; else idek = ''
		console.log({"kuk idek: ":req.cookies.idek, "paramidek: ":idek});
		s_mdl.find({ 'fbid':idek /*, 'szablon': true */}, function jestSmieciowka(err, umowa) {
		// wyjebongo dla pustego idka?
			console.log(umowa);
			if (umowa!=undefined) {
				res.render('mojewszystkieumowy', { "umowa":  umowa, _dbg: JSON.stringify(umowa),'idek':idek,_host:req.host, _proto:req.protocol }) // edit index template
			} else {
				res.render('mojewszystkieumowy', { "umowa":  '', _dbg: JSON.stringify(''),'idek':idek,_host:req.host, _proto:req.protocol }) // edit index template
			}
		});
	},//~ =========================================================================
	usunUmowe: function (req, res) {
		var idek;
		//~ console.log(req.session.passport)        ).remove(
		if (typeof req.params.id != 'undefined') idek=req.params.id; else idek = '';
		console.log("delete: " + idek);
		a=s_mdl.find({ _id: idek }).remove(function(err,a){console.log(err); console.log(a)});
		//~ console.log(a)
		res.json({'res':a})
		/*, function jestSmieciowka(err, umowa) {
		// wyjebongo dla pustego idka?
			if (err){
				res.json({'err': err})
			} else
				res.json({'result':"ok"})
		});*/
	},//~ =====================================================================================================================
	pokazUzupelnionaUmowe: function(req,res){
		s_mdl.find({ '_id':req.params.id /*,i:false*/ }, function jestSmieciowka(err, umowa) {
			res.render('dowyslania', { 
				umowa: umowa[0], 
				_dbg: util.inspect(req.body),
				_host:req.host, 
				_proto:req.protocol 
			});//render
		});//find
	}// pokazuzupelnionaumowe
}
