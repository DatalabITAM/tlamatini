
//jQuery, necesario para scraping
var s = document.createElement("script");
s.type = "text/javascript";
s.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js";
s.async=false;
$("head").append(s);



function getPage(w){
	/*
	solo si la palabra es nueva (no existe en el diccionario) y
	si la palabra no esta en lista negra (no existe pagina con esa palabra), 
	entonces se pide la pagina a aulex (get request)
	*/

	var isInDict = inDict(w, localStorage.getItem("dict_words") ); // existe en el diccionario ?
	var isInBL = inBlackList(w, localStorage.getItem("black_list")); // existe en lista negra ?

	if(isInBL) { 
		console.log('%c  >>  ...', 'color: #7142f4');
		return; 
	} else if (isInDict){
		console.log('%c  >>  "' + w + '" ya existe en el dicc', 'color: #7142f4');
		return;
	} else {

		scrapeAndSetAulex(w, localStorage.getItem("dict")); // inicia scraping
		addToDict(w, localStorage.getItem("dict_words")); // agrega palabra al dicc
		
	}
}

function inDict(word, wordStorage){
	/*
	verifica si palabra esta en el dicc
	*/
	var ret = false;
	var words = wordStorage.split(";");

	for(var w in words){
		if(word === words[w]) return true;
	}

	return ret;
}

function inBlackList(word, wordStorage){
	/*
	verifica si palabra esta en lista negra ;
	en esta lista se encuentran las palabras que no arrojaron resultados de pagina
	*/
	var ret = false;
	var words = wordStorage.split(";");

	for(var w in words){
		if(word === words[w]) return true;
	}

	return ret;
}

function addToDict(word, wordStorage){
	/*
	agrega palabra al dicc ;
	utilizamos el localStorage (persistencia de valores al cambiar de pagina)
	*/
	return localStorage.setItem("dict_words", wordStorage + word + ";");
}

function pushToBlackList(word, wordStorage){
	/*
	agrega palabra a lista negra
	*/
	var isIn = false;
	var wd = word;
	var words = wordStorage.split(";");

	for(var w in words){
		if(words[w] === wd) isIn = true;
	}
	
	if(!isIn) localStorage.setItem("black_list", wordStorage + wd + ";");
	return console.log('%c  >>' 
			+ " No hay resultados para '" 
			+ word + "'", 'color: #7142f4');
	
}

function scrapeAndSetAulex(w, wordStorage){
	/*
	scraping y metodos para la pagina aulex
	*/
	var urlA = 'https://aulex.org/nah-es/?busca=';
	
	$.get(urlA + w, function(res){ // GET request
			console.log('%cPalabra: ' + w, 'color: #7142f4');

			var thisDict = ";";
			var storage = wordStorage;
			var noMatch = !!res.match(/No hay resultados para  &laquo;\<b\>/); // pagina sin resultados
	
			if(noMatch) {
				 pushToBlackList(w, localStorage.getItem("black_list") ); // agrega palabra a lista negra y se sale
				 return;
			} else {
				// en la pagina, los resultados se encuentran dentro de la siguiente estructura
				// esta variable es un vector con cada resultado
				var matches = res.match(/<p><span class=dict>(.*)<\/span><\/p>/gm); 

				for(var m in matches){

			    	if(typeof matches[m] !== "undefined"){
			    		var thisMatch = matches[m];
			        
				        thisMatch = thisMatch.replace(/<span class=abre>(f|m)<\/span>/g,""); // limpiamos el texto
				        thisMatch = thisMatch.replace(/(\<[^\>]+\>)+/g,"");
				        
				        // sug, quizas quitar palabra query. e.g. dedo meñique

				        // en la pagina los resultados aparacen como "nah:esp1, esp2, .." o "esp:nah1, ..."
				        var w1 = thisMatch.split(":")[0].trim().toLowerCase();
				        var w2 = thisMatch.split(":")[1].split(',')[0].trim().toLowerCase(); //omitiendo sinonimos. e.g vendedor:tlanamakak, tiankiski 
				        
				        //unicamente resultados en donde se trata de una sola palabra en ambos idiomas
				        var l1 = w1.split(' ').length==1;
				        var l2 = w2.split(' ').length==1;

			        if(l1&&l2) thisDict += w1 + ':' + w2 + ';';	// formato	  

			    }
			}

			// actualiza dicc con traducciones
			localStorage.setItem('dict', storage + thisDict);
			
		}
	});
}

function test(){

	console.log("Dict:\n\n" + localStorage.getItem("dict"));
	console.log("Palabras:  " + localStorage.getItem("dict_words"));
	console.log("BL:  " + localStorage.getItem("black_list"));
}

function resetStorage(){
	localStorage.setItem('black_list',';')
	localStorage.setItem('dict',';')
	localStorage.setItem('dict_words',';')
}

function main(word_string) {
	var temp=[];
	temp.push(word_string);

	var words = word_string.split(';');
	var l = words.length - 1;

	
	setInterval(function(){
		if(l>=0){
		var newWord = !(temp.includes(words[l]));
		if(newWord) {
			temp.push(words[l]);
			getPage(words[l]);
        }
		
		}
		l -= 1;
		words.pop();
	}, 3000);
}

function cleanDict(){
	var results = localStorage.getItem("dict").split(';');
	var str = ";";
	results = results.filter( onlyUnique );

	for(var x in results) if(results[x] === "") results.splice(x, 1); 
	for(var x in results.sort()) str+= results[x] + ";" ;
}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}
