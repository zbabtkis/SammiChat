var app=angular.module("SammiApp",["ngRoute","ionic","ionic.ui.sideMenu"]);String.prototype.splice=String.prototype.splice||function(){var a=this.split("");return a.splice.apply(a,arguments),a.join("")},app.config(function(a){a.when("/",{templateUrl:"views/instructions.html",controller:"WordsCtrl"}).when("/:vocabId",{templateUrl:"views/words.html",controller:"WordsCtrl"}).otherwise({redirectTo:"/"})}),app.run(function(a,b,c){b.initialize(),c.initialize()}),app.directive("sentenceReset",function(){return{restrict:"A",link:function(a,b){console.log(b),console.log(a),b.bind("click",a.resetSentence)}}}),app.directive("ngEnter",function(){return{link:function(a,b,c){b.bind("keydown keypress",function(b){13===b.which&&(a.$apply(function(){a.$eval(c.ngEnter)}),b.preventDefault())})}}}),app.controller("WordsCtrl",function(a,b,c,d,e,f){e.queryOne({id:b.vocabId}).then(function(b){a.category=b}),a.newWord=new d,a.noCategory=!!b.vocabId,a.load=function(){a.category&&(a.words=[],a.hide=!1,d.query({category:a.category.id}).then(function(b){a.words=b}))},a.$watch("category",a.load),a.clear=function(){a.words.forEach(function(a){a.delete()})},a.saveWord=function(b){b.text&&(b.text=b.text.trim(),b.isNew&&(b.category=a.category.id,a.words.push(b)),b.save(),a.newWord=new d)},c.currentStatement="",c.say=function(a){f.request().then(function(b){b(a)})},a.selectWord=function(b){b.active?(c.currentStatement=c.currentStatement.replace(b.text+" ",""),b.active=!1):(c.currentStatement+=b.text+" ",a.say(b.text),b.active=!0)},a.readStatement=function(){a.read(a.currentStatement)},a.resetSentence=function(){c.currentStatement="",a.words.forEach(function(a){a.active=!1}),c.$apply()},a.deleteWord=function(b){var c=a.words.indexOf(b);b.delete(),a.words.splice(c,1)},a.itemButtons=[{text:"Edit",type:"button-calm",onTap:function(a){scope.newWord=angular.copy(a),scope.deleteWord(a)}},{text:"Delete",type:"button-assertive",onTap:a.deleteWord}],a.toggleMenu=function(){a.sideMenuController.toggleLeft()}}),app.controller("CategoryCtrl",function(a,b,c){a.newCategory=new b,b.query().then(function(b){a.categories=b}),a.setCategory=function(a){c.path("/"+a.id)},a.saveCategory=function(c){c.label&&(a.categories.push(c),a.newCategory=new b,c.save())},a.deleteCategory=function(b){console.log(b);var c=a.categories.indexOf(b);console.log(c),a.categories.splice(c,1),b.delete()},a.editCategory=function(b){a.newCategory=angular.copy(b),a.deleteCategory(b)},a.btns=[{text:"Edit",type:"button-calm",onTap:a.editCategory},{text:"Delete",type:"button-assertive",onTap:a.deleteCategory}]}),app.service("Speak",function(a,b){return{initialize:function(){var b;"SpeechSynthesisUtterance"in window?(this._say=function(a){var b=new SpeechSynthesisUtterance(a);window.speechSynthesis.speak(b)},this._isLoaded=!0):window.device&&"Android"===window.device.platform?(b=document.createElement("script"),b.src="tts.js",b.async=!0,document.body.appendChild(b),b.onload=function(){this._isLoaded=!0,a.broadcast("ttsLoaded",window.tts.speak)}):this._isLoaded=!0},_say:function(){},_isLoaded:!1,request:function(){var c=b.defer();return this._isLoaded?c.resolve(this._say):a.$on("ttsLoaded",c.resolve),c.promise}}}),app.service("DB",function(a,b,c){var d=null,e={},f="SammiApp",g="1.0",h="SammiApp Data Storage",i=1e5,j="deviceready";this.initialize=function(){document.addEventListener(j,function(){d=b.openDatabase(f,g,h,i),a.$emit("dbready")})},e.query=function(a){var b=[].slice.call(arguments,1),f=c.defer();return d.transaction(function(c){a.apply(e,[c].concat(b))},f.reject,f.resolve),f.promise},e.QUERY=function(a){var b=[].slice.call(arguments,1);console.log(b),a.executeSql.apply(a,b)},e.CREATE_TABLE=function(a,b,c,d,e){var f=[];for(var g in c)c.hasOwnProperty(g)&&f.push([g].concat(c[g]).join(" "));a.executeSql("CREATE TABLE IF NOT EXISTS "+b+" ("+f.join(",")+")",[],d,e)},this.exists=function(){return!!d},this.requestDB=function(){var b=c.defer();return this.exists()?b.resolve(e):a.$on("dbready",function(){b.resolve(e)}),b.promise}}),app.run(function(a){a.requestDB().then(function(a){a.query(a.CREATE_TABLE,"words",{id:["INTEGER","NOT NULL","PRIMARY KEY","AUTOINCREMENT"],category:["int","NOT NULL"],text:["varchar(255)"]})})}),app.factory("Word",function(a,b){var c=function(a){angular.extend(this,a)};return c.prototype.isNew=!0,c.prototype.save=function(){var b=this;a.requestDB().then(function(a){b.isNew?a.query(a.QUERY,"INSERT INTO words (category, text) VALUES ('"+[b.category,b.text].join("','")+"')",[],function(a,c){b.id=c.insertId},function(a,b){console.log(b)}):a.query(a.QUERY,"UPDATE words set category="+b.category,", text="+b.text," WHERE id="+b.id)})},c.prototype.delete=function(){var b=this;a.requestDB().then(function(a){a.query(a.QUERY,"DELETE FROM words WHERE id="+b.id)})},c.query=function(d){var e="",f=b.defer();return a.requestDB().then(function(a){d&&d.category?(e=" WHERE category='"+d.category+"'",a.query(a.QUERY,"SELECT * FROM words"+e,[],function(a,b){for(var d=[],e=0;e<b.rows.length;e++)d.push(new c(b.rows.item(e)));f.resolve(d)},function(a,b){console.log(b)})):a.query(a.QUERY,"SELECT * FROM words",[],function(a,b){for(var d=[],e=0;e<b.rows.length;e++)d.push(new c(b.rows.item(e)));f.resolve(d)})}),f.promise},c}),app.run(function(a){a.requestDB().then(function(a){a.query(a.CREATE_TABLE,"categories",{id:["INTEGER","NOT NULL","PRIMARY KEY","AUTOINCREMENT"],label:["varchar(255)"]})})}),app.factory("Category",function(a,b){var c=function(a){this.id=null,this.label="",angular.extend(this,a)};return c.prototype.isNew=!0,c.prototype.save=function(){var b=this;a.requestDB().then(function(a){b.isNew?a.query(a.QUERY,"INSERT INTO categories (label) VALUES ('"+b.label+"')",[],function(a,c){b.id=c.insertId},function(a,b){console.log(b)}):a.query(a.QUERY,"UPDATE categories set label="+b.label," WHERE id="+b.id)})},c.prototype.delete=function(){var b=this;a.requestDB().then(function(a){a.query(a.QUERY,"DELETE FROM categories WHERE id="+b.id),a.query(a.QUERY,"DELETE FROM wordsWHERE category="+b.id)})},c.query=function(d){var e="",f=b.defer();return a.requestDB().then(function(a){d&&d.id?(e=" WHERE id='"+d.id+"'",a.query(a.QUERY,"SELECT * FROM categories"+e,[],function(a,b){for(var d=[],e=0;e<b.rows.length;e++)d.push(new c(b.rows.item(e)));f.resolve(d)},function(a,b){console.log(b)})):a.query(a.QUERY,"SELECT * FROM categories",[],function(a,b){for(var d=[],e=0;e<b.rows.length;e++)d.push(new c(b.rows.item(e)));f.resolve(d)})}),f.promise},c.queryOne=function(){var a=b.defer();return c.query.apply(c,arguments).then(function(b){b.length?a.resolve(b[0]):a.reject()}),a.promise},c});