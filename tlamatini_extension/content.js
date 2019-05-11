//agarra todos los elementos
var elements = document.getElementsByTagName('*');

//define url a utilizar
const url = chrome.runtime.getURL('diccionario.json');

//contruye el HTTP request
const Http = new XMLHttpRequest();

Http.open("GET", url);
Http.send();

Http.onreadystatechange=(e)=>{
console.log(typeof(Http.responseText))    
console.log(Http.responseText)
var dict_json = JSON.parse(Http.responseText)
}



for (var i = 0; i < elements.length; i++) {
    var element = elements[i];

    for (var j = 0; j < element.childNodes.length; j++) {
        var node = element.childNodes[j];

        if (node.nodeType === 3) {
            var text = node.nodeValue;
            // funcion busca el texto en el json
            // si lo encuentras, agarra la traducción y ponla en la variable traducccion
            // haz replace del texto por el texto + traduccion

            var replacedText = text.replace(/persona/gi, 'persona (en Xalapeño: puta vatillo)');

            if (replacedText !== text) {
                element.replaceChild(document.createTextNode(replacedText), node);
            }
        }
    }
}