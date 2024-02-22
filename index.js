// Navegació pels menús

let geoID;  // variable que guarda la localització del dispositiu

function canvia_seccio(num_boto) {
    const menu = document.getElementById("menu");
    const num_botons = menu.children.length;    // el nombre de botons dins de l'element "menu"
    if (validat) {
        for (let i = 1; i < num_botons; i++) {
            let boto = document.getElementById("boto_" + i);
            let seccio = document.getElementById("seccio_" + i);
            if (i == num_boto) {
                boto.style.color = "#950E17";    // es destaca la secció activa amb el canvi de colors del botó corresponent
                boto.style.backgroundColor = "#FCDEE0";
                seccio.style.display = "flex";    // es fa visible la secció activa
                if (num_boto == 3) {    // si es prem el botó de la secció "Galeria"
                    omple_llista();
                }
                if (num_boto == 4) {
                    mapa.invalidateSize();
                    marcadors();
                    if (typeof geoID === "undefined") {    // si encara no s'han obtingut les dades de localització del dispositiu
                        navigator.geolocation.watchPosition(geoExit);    // inicia el seguiment de la localització del dispositiu
                    }
    
                }
            }
            else {
                boto.style.color = "white";    // colors dels botons de seccions inactives
                boto.style.backgroundColor = "#950E17";
                seccio.style.display = "none";    // s'oculten les seccions inactives
            }
        }
    }
}

// Inici de sessió

let validat = false;    // variable que permet saber si hi ha algun usuari validat
let nom, contrasenya;
let scriptURL = "https://script.google.com/macros/s/AKfycbyeY1Z7_0cq2dSw_iUU2QygiGAKMTYJz_MdkKPvfeJwiiWD4yLoSFVXPdo1Qmn4ph_m/exec"    // s'ha de substituir la cadena de text per la URL del script

function inici_sessio() {
    nom = document.getElementById("nom_usuari").value;    // la propietat "value" d'un quadre de text correspon al text escrit per l'usuari
    contrasenya = document.getElementById("contrasenya").value;
    let consulta = scriptURL + "?query=select&where=usuari&is=" + nom + "&and=contrasenya&equal=" + contrasenya;
    fetch(consulta)
        .then((resposta) => {   // registres que contenen el nom d'usuari i contrasenya escrits per l'usuari
            return resposta.json();    // conversió a llista
        })
        .then((resposta) => {
            if(resposta.length == 0) {    // llista buida
                window,alert("El nom d'usuari o la contrasenya no són correctes.");
            }
            else {    // llista amb (almenys) un registre
                window.alert("S'ha iniciat correctament la sessió.");
                inicia_sessio();    // usuari validat, s'executen les instruccions del procediment "inicia_sessio"
            }
        });
}

function inicia_sessio() {
    validat = true;    // usuari validat
    document.getElementById("seccio_0").style.display = "none";    // s'oculta la secció de validació d'usuaris
    canvia_seccio(1);    // es mostra la secció 1
}

// Creació nou usuari

function nou_usuari() {
    nom = document.getElementById("nom_usuari").value;
    contrasenya = document.getElementById("contrasenya").value;
    let consulta_1 = scriptURL + "?query=select&where=usuari&is=" + nom;    // primera consulta per saber si ja existeix algun usuari amb el nom escrit per l'usuari que es vol registrar
    fetch(consulta_1)
        .then((resposta) => {
            return resposta.json();
        })
        .then((resposta) => {
            if(resposta.length == 0) {    // No hi ha cap altres usuari amb el mateix nom
                let consulta_2 = scriptURL + "?query=insert&values=" + nom + "$$" + contrasenya;    // segona consulta per registrar l'usuari nou
                fetch(consulta_2)
                    .then((resposta) => {
                        if (resposta.ok) {    // s'ha pogut afegir una registre en la base de dades
                            window.alert("S'ha completat el registre d'usuari.")
                            inicia_sessio();
                        }
                        else {    // no s'ha pogut afegir un registre en la base de dades
                            alert("S'ha produït un error en el registre d'usuari.")
                        }
                    })
            } 
            else {    // l'usuari ha de tornar-ho a intentar amb un nom diferent
                alert("Ja existeix un usuari amb aquest nom.");
            }
        });
}

// En iniciar l'app es genera una base de dades per les fotos i un mapa per la secció 4

let mapa;

window.onload = () => {    // funció que s'executa un cop carregat el document HTML
    let base_de_dades = localStorage.getItem("base_de_dades");   // compte! Ha de ser localStorage o sessionStorage
    if(base_de_dades == null) {    // la base de dades només es crea si encara no existeix
        indexedDB.open("Dades").onupgradeneeded = event => {     // esdeveniment de creació o actualització de la base de dades "Dades"  
            event.target.result.createObjectStore("Fotos", {keyPath: "ID", autoIncrement:true}).createIndex("Usuari_index", "Usuari");
        }   // es crea la taula "Fotos" amb la clau principal "ID" i els indexos de consulta "Usuari_index" i "Usuari"
            // les fotos es desen a la taula "Fotos"
        localStorage.setItem("base_de_dades","ok");    // es desa la informació conforme la base de dades ja s'ha creat
    }
    document.getElementById("obturador").addEventListener("change", function() {    // procediment que s'executa quan s'obté el fitxer de la foto realitzada (esdeveniment "change")
        if(this.files[0] != undefined) {    // instruccions que s'executen només si s'obté algun fitxer (només es processa el primer que es rebi)
                                            // this fa referència a l'element on s'ha generat l'esdeveniment (en aquest cas l' <input> del fitxer de la foto). 
            let canvas = document.getElementById("canvas");    // contenidor on es desa temporalment la imatge
            let context = canvas.getContext("2d");
            let imatge = new Image;
            imatge.src = URL.createObjectURL(this.files[0]);    // es crea la imatge a partir del fitxer
            imatge.onload = () => {    // procediment que s'executa un cop la imatge s'ha carregat en el contenidor
                canvas.width = imatge.width;
                canvas.height = imatge.height;                
                context.drawImage(imatge,0,0,imatge.width,imatge.height);    // es "dibuixa" la imatge en el canvas
                document.getElementById("foto").src = canvas.toDataURL("image/jpeg");    // la imatge es mostra en format jpg
                document.getElementById("icona_camera").style.display = "none";    // s'oculta la icona que hi havia abans de fer la foto
                document.getElementById("desa").style.display = "unset";    // es mostra el botó per desar la foto
            }
        }
    });
    mapa = L.map("seccio_4").setView([41.72, 1.82], 8);    // assigna el mapa a la secció, centrat en el punt i amb el nivell de zoom
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {    // capa d'OpenStreetMap
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'    // autoria de la capa
    }).addTo(mapa);    // s'afegeix la capa al mapa
}

// Secció 2: Càmera de fotos

function mostra_foto(id) {
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext("2d");
    let imatge = new Image;
    if (id == 0) {    // darrera foto realitzada, potser sense desar
        seccio_origen = 2;    // origen en la seccció "càmera"
        document.getElementById("seccio_2").style.display = "none";    // s'oculta la secció "càmera"
        imatge.src = document.getElementById("foto").src;
    }
    else {
        seccio_origen = 3;    // origen en la seccció "galeria"
        indexedDB.open("Dades").onsuccess = event => {    // s'obté la foto de la base de dades
            event.target.result.transaction(["Fotos"], "readonly").objectStore("Fotos").get(id).onsuccess = event => {
                document.getElementById("seccio_3").style.display = "none";    // s'oculta la secció "galeria"
                imatge.src = event.target.result["Foto"];
            }
        }
    }
    imatge.onload = () => {    // esdeveniment que es produeix un cop s'ha carregat la imatge
        if (imatge.width > imatge.height) {    // imatge apaïsada
            canvas.width = imatge.height;
            canvas.height = imatge.width;
            context.translate(imatge.height, 0);
            context.rotate(Math.PI / 2);
        } else {    // imatge vertical
            canvas.width = imatge.width;
            canvas.height = imatge.height;
        }
        context.drawImage(imatge,0,0,imatge.width,imatge.height);
        document.getElementById("foto_gran").src = canvas.toDataURL("image/jpeg", 0.5);
    }
    document.getElementById("superior").classList.add("ocult");    // s'oculta provisionalment el contenidor superior
    document.getElementById("menu").style.display = "none";    // s'oculta el menú
    document.getElementById("div_gran").style.display = "flex";    // es mostra el contenidor de la foto a pantalla completa
}

function retorn_a_seccio() {
    document.getElementById("superior").classList.remove("ocult");    // s'elimina la classe provisional del contenidor superior
    document.getElementById("menu").style.display = "flex";    // es mostra el menú
    document.getElementById("div_gran").style.display = "none";    // s'oculta el contenidor de pantalla completa
    if (seccio_origen == 2) {    // càmera
        document.getElementById("seccio_2").style.display = "flex";
    } else {    // galeria
        document.getElementById("seccio_3").style.display = "flex";
    }
}

function desa_foto() {
    let nou_registre = {    // contingut del nou registre de la base de dades
        Usuari: nom,    // nom d'usuari
        Data: new Date().toLocaleDateString() + " - " + new Date().toLocaleTimeString(),    // data i hora actuals
        Foto: document.getElementById("foto").src    // foto
    };
    indexedDB.open("Dades").onsuccess = event => {   
        event.target.result.transaction("Fotos", "readwrite").objectStore("Fotos").add(nou_registre).onsuccess = () => {
            document.getElementById("desa").style.display = "none";
            alert("La foto s'ha desat correctament.");    
        };
    };
}

// Secció 3: Galeria

function omple_llista() {
    let llista = '';
    indexedDB.open("Dades").onsuccess = event => {
        event.target.result.transaction(["Fotos"], "readonly").objectStore("Fotos").index("Usuari_index").getAll(nom).onsuccess = event => {
            dades = event.target.result;
            for (i in dades) {    // per cada foto
                llista+= '<div class="llista_fila"><div><img src="';    // es crea un contenidor de fila
                llista+= dades[i]["Foto"];    // miniatura de la foto
                llista+= '" onclick="mostra_foto(';    // atribut d'esdeveniment (mostrar la foto)
                llista+= dades[i]["ID"];    // valor numèric que identifica el registre de la foto
                llista+= ')" /></div><span>'; 
                llista+= dades[i]["Data"];    // data i hora de la foto
                llista+= '</span><i class="fa-solid fa-trash" onclick="esborra_foto(';    // atribut d'esdeveniment (esborrar la foto)
                llista+= dades[i]["ID"];
                llista+= ')"></i></div>';         
            }
            document.getElementById("llista_fotos").innerHTML = llista;    // s'ocupa el contenidor "llista_fotos" amb el fragment HTML creat
        }
    }
}

function esborra_foto(id) {
    if (confirm("Vols esborrar la foto?")) {    // es demana la confirmació a l'usuari
        indexedDB.open("Dades").onsuccess = event => {   
                event.target.result.transaction("Fotos", "readwrite").objectStore("Fotos").delete(id).onsuccess = () => {
                alert("La foto s'ha esborrat.");
                canvia_seccio(3);    // es recarrega la galeria per tal que ja no mostri la foto esborrada
            };
        };
    }
}

// Secció 4: Mapa

function marcadors() {
    L.marker([41.39, 2.17], {title:"Barcelona"}).addTo(mapa);    // l'opció "title" fa que es mostri el text "Barcelona" quan es passa el ratolí sobre el marcador
    let vegueries = [[41.39, 2.17, "Àmbit metropolità (Barcelona)"],    // llista on cada element és una llista amb els valors de latitud, longitud i nom de vegueria com a elements
                 [42.17, 0.89, "Alt Pirineu i Aran (Tremp)"],
                 [41.12, 1.24, "Camp de Tarragona (Tarragona)"],
                 [41.73, 1.83 ,"Comarques centrals (Manresa)"],
                 [41.98, 2.82, "Comarques gironines (Girona)"],
                 [41.62, 0.62, "Ponent (Lleida)"],
                 [40.81, 0.52, "Terres de l'Ebre (Tortosa)"],
                 [41.35, 1.70, "Penedès (Vilafranca del Penedès"]];
    for (i in vegueries) {    // per cada element de la llista
        L.marker([vegueries[i][0], vegueries[i][1]],{title:vegueries[i][2]}).addTo(mapa);
    }
}

function geoExit(posicio){
    let latitud = posicio.coords.latitude;
    let longitud = posicio.coords.longitude;
    if (typeof geoID === "undefined") {    
        geoID = L.marker([latitud, longitud], {zIndexOffset:100, title:"Usuari"}).addTo(mapa);    // es defineix el marcador  geoID i es situa per sobre dels altres
    } else {    // primeres dades de localització, es crea el marcador d'usuari 
        geoID.setLatLng([latitud, longitud]);    // actualització de la posició del marcador d'usuari en el mapa
    }
}

// Tancament de sessió

function tanca_sessio() {
    if (validat) {
        usuari=document.getElementById("nom_usuari");
        if (confirm("Vols tancar la sessió?")) {    // S'ha respost "Sí"
            //storage.setItem("usuari", "");
            usuari.value = "";
            location.reload();    // recàrrega de la pàgina, es reinicialitzen totes les variables
        }
    }
}