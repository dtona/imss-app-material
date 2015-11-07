/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var jsonLogin,
    jsonContents,    
    app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {       
        $(function() {            
            
            //navigator.notification.alert('cordova & jquery loaded', null, 'YEAH :D');

            //para activar el menu deslizable
            $('.button-collapse').sideNav();

            //comportamiento de los links de 'abrir curso'
            $('body').on('click', '.card-action a', function(e) {
                e.preventDefault();                
                $('div#home').hide(0);
                $('iframe#myIframe').attr('src', 'file:///data/data/com.ImssAppMaterial/files/assets/demo/index.html').show(0);               
            });
            
            //primero guardamos el directorio donde van a caer los downloads por default
            if (localStorage.aDir == undefined) {
                window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
                    dir.getDirectory('assets/', {create: true}, function(aDir) {                        
                        localStorage.aDir = aDir.toURL();                        
                    }, fsError);

                }, fsError);
            }      

            //hacemos login a moodle
            $.get('http://moodle.dtona.com.mx/webservice/rest/server.php', {
                username: 'tutorial',
                password: 'Imss2015!',
                wstoken: '412117ae95a85b91731a91e2b54fa0f4',
                wsfunction: 'local_subitus_mobile_login',
                moodlewsrestformat: 'json'
            }, function(response) {                                

                if (typeof response == 'string' && response != 'error') {                    

                    localStorage.setItem('subitus-data', response);
                    jsonLogin = JSON.parse(response);

                    if (jsonLogin.courses == undefined) {
                        navigator.notification.alert('error', null, 'Error');
                        return;
                    }

                    if (Object.keys(jsonLogin.courses).length == 0) {
                        navigator.notification.alert('No hay cursos asignados', null, 'Alerta');
                        return;
                    }

                    coursesArray = Object.keys(jsonLogin.courses);
                    getCourseData(0);                    

                } else {
                    navigator.notification.alert('error', null, 'Error');
                }
            });                    
        });        
    }
};

app.initialize();

function getCourseData(index) {

    var courseid = coursesArray[index];
    if (courseid != undefined) {
        $.get('http://moodle.dtona.com.mx/webservice/rest/server.php', {
            courseid: courseid,
            wstoken: 'e7b142fd620606e2d789ee3c18d3489d',
            wsfunction: 'core_course_get_contents',
            moodlewsrestformat: 'json'
        }, function(response) {        

            //cordova.plugins.clipboard.copy(JSON.stringify(response)); //copy the response to clipboard :)

            if (typeof response == 'object' && response != 'error') {

                localStorage.setItem('subitus-data-course-' + courseid, JSON.stringify(response));
                jsonContents = response;

                //Comenzamos a buscar los fileurl que tenga el curso, cada fileurl representa una url para bajar un asset
                var fileurl = new Array();
                for (var i = 0, len = jsonContents.length; i < len; i++) {
                    if (jsonContents[i].modules != undefined && jsonContents[i].modules != null && jsonContents[i].modules.length > 0) {
                        for (var j = 0, jlen = jsonContents[i].modules.length; j < jlen; j++) {                                        
                            if (jsonContents[i].modules[j].contents != undefined && jsonContents[i].modules[j].contents != null && jsonContents[i].modules[j].contents.length > 0) {
                                for (var k = 0, klen = jsonContents[i].modules[j].contents.length; k < klen; k++) {
                                    if (jsonContents[i].modules[j].contents[k].fileurl != undefined && jsonContents[i].modules[j].contents[k].fileurl != null && jsonContents[i].modules[j].contents[k].fileurl.length > 0) {
                                        fileurl.push(jsonContents[i].modules[j].contents[k].fileurl);
                                    }
                                }
                            }
                        }
                    }
                }

                if (fileurl.length > 0) {
                    fetch(index, fileurl, 0);
                }                

            } else {
                navigator.notification.alert('error', null, 'Error');
            }
        });
    } else {
        if (index > 0) {            
            navigator.notification.alert('finish!', null, ':D');
        } else {
            navigator.notification.alert('error', null, 'Error');
        }
    }
}

function fetch(index, fileurl, indez) {
    
    var url = fileurl[indez] + '&token=e7b142fd620606e2d789ee3c18d3489d';
    var ext = url.split('/').pop().split('?')[0].split('.')[1];        
    var localFileURL = localStorage.aDir + 'new_asset.' + ext;        
    var ft = new FileTransfer();

    ft.download(url, localFileURL,
        function(entry) {            
            
            var courseid = coursesArray[index];            

            if (ext == 'zip') {

                /*window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
                    dir.getDirectory('assets/course_' + courseid + '/', {create: true}, function(aDir) {                        */

                        //+ 'course_' + courseid + '/'

                        var origen = entry.nativeURL;
                        var destino = localStorage.aDir + 'course_' + courseid;

                        zip.unzip(origen, destino, function(argument) {

                            if (argument == 0) {
                                //alert('unzip success!!');
                                //$('.summary-file').attr('src', 'file:///data/data/com.ImssAppMaterial/files/assets/dino.png');
                                addCard(courseid, index, fileurl, indez);
                            } else {
                                navigator.notification.alert('Unzip error\norigen>>' + origen + '\ndestino>>' + destino, null, 'Error');
                            }
                        });                                

                    /*}, fsError);

                }, fsError);*/
            } else {

                ++indez;
                if (fileurl[indez] == undefined) {
                    getCourseData(++index);
                } else {
                    fetch(index, fileurl, indez);
                }

                /*} else {
                    addCard(courseid, index, fileurl, indez);
                }*/
            }
        },
    fsError);                    
}

function addCard(courseid, index, fileurl, indez) {
    //Aqui podemos hacer un ciclo para insertar varios cards (dependiendo de cuantos cursos sean)
    var card = $('.a-card').clone();
    card.find('.summary-file:first').attr('src', jsonLogin.courses[courseid].summary_file);
    card.find('.name:first').text(jsonLogin.courses[courseid].name);
    card.find('.summary:first').text(jsonLogin.courses[courseid].summary);
    card.removeClass('a-card');
    $('main').append(card).show(0);

    ++indez;
    if (fileurl[indez] == undefined) {
        getCourseData(++index);
    } else {
        fetch(index, fileurl, indez);
    }
}

function fsError(e) {
    //Hay algun problema con el fileSystem    
    navigator.notification.alert('Disculpa, hay un error.', null, 'Error');
    //alert('Disculpa, hay un error');
}

//Codigo para basarme tomado del proyecto con angular
/*function courseDownloadInfo(course_id, callback) {
    console.log("*** Descarga la info del curso " + course_id + " ***");
    $http.get( system.mobileWebService.host + '/webservice/rest/server.php', {
        params: {
            courseid: course_id,
            wstoken: system.mobileWebService.token,
            wsfunction: 'core_course_get_contents',
            moodlewsrestformat: 'json'
        }
    })
        .success(function(response) {
            console.log("Exito al descargar info de cursos");
            
            if(response != 'error') {    
                localStorage.setItem('subitus-data-course-' + course_id, JSON.stringify(response));
                $scope.system.courses[course_id] = response;
                
                console.log(response);
            }
        
            // Iteración por cada objeto recibido
            angular.forEach(response, function(value, key){
                console.log("Iterando " + key + " primer nivel");
                //console.log(value);
                
                // Iterando por los diferentes módulos
                angular.forEach(value, function(course_modules, key) {
                    console.log("--Iterando " + key + " segundo nivel");
                    //console.log(course_modules);
                    if(key == 'modules') {
                        // Iterando dentro de los módulos en búsqueda de recursos
                        angular.forEach(course_modules, function(course_module, key) {
                            console.log("----Iterando " + key + " tercer nivel");
                            //console.log("----" + course_module.modname);
                            if(course_module.modname == 'resource') {
                                console.log("------Iterando " + key + " cuarto nivel");
                                //console.log(course_module.contents);
                                angular.forEach(course_module.contents, function(course_file, key) {
                                    console.log("--------Iterando " + key + " quinto nivel ** ARCHIVO **");
                                    fileCompleteUrl = course_file.fileurl + "&token=" + system.mobileWebService.token;
                                    if(fileCompleteUrl != '') {
                                        var fileFolder = "/mnt/sdcard/Subitus";
                                        var fileURL = fileFolder + "/" + course_id + "/" + course_module.id + "/" + course_file.filename;                                        
                                        
                                        console.log(fileURL);
                                    }
                                });
                            }
                        });
                    }
                });
            });
        
            
        
            
            //callback(response);
        });*/