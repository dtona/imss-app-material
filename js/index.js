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
            
            navigator.notification.alert('cordova & jquery loaded', null, 'YEAH :D');

            //$('div#log').show(0);

            //para activar el menu deslizable
            $('.button-collapse').sideNav();

            //comportamiento de los links de 'abrir curso'
            $('body').on('click', '.card-action a', function(e) {
                e.preventDefault();                                
                var course = $(this).data('course');
                if (course != undefined) {
                    $('div#home').hide(0);
                    alert('course>>' + course);
                    $('iframe#myIframe').attr('src', 'file:///data/data/com.ImssAppMaterial/files/assets/course_'+ course + '/index.html').show(0);
                } else {
                    navigator.notification.alert('Éste curso no tiene html', null, '');
                }
            });

            $('a#sync').click(function(e) {
                e.preventDefault();
                $('.button-collapse').sideNav('hide');
                sync();
            });                        
        });        
    }
};

app.initialize();

function sync() {    

    //$('div#log').append('sync<br>');

    //primero guardamos el directorio donde van a caer los downloads por default
    //if (localStorage.aDir == undefined) {
        //$('div#log').append('1<br>');
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
            //$('div#log').append('2<br>');
            dir.getDirectory('assets/', {create: true}, function(aDir) {                        
                //$('div#log').append('3<br>');
                localStorage.aDir = aDir.toURL();                        
                //$('div#log').append('4<br>');
            }, fsError);

        }, fsError);
    //}

    //$('div#log').append('5<br>');
    //hacemos login a moodle
    $.get('http://moodle.dtona.com.mx/webservice/rest/server.php', {
        username: 'tutorial',
        password: 'Imss2015!',
        wstoken: '412117ae95a85b91731a91e2b54fa0f4',
        wsfunction: 'local_subitus_mobile_login',
        moodlewsrestformat: 'json'
    }, function(response) { 

        //$('div#log').append('6<br>');                               

        if (typeof response == 'string' && response != 'error') {                    
            //$('div#log').append('7<br>');                               

            localStorage.setItem('subitus-data', response);
            //$('div#log').append('8<br>');                               
            jsonLogin = JSON.parse(response);
            //$('div#log').append('9<br>');

            if (jsonLogin.courses == undefined) {
                //$('div#log').append('10<br>');
                navigator.notification.alert('error', null, 'Error');
                return;
            }

            if (Object.keys(jsonLogin.courses).length == 0) {
                //$('div#log').append('11<br>');
                navigator.notification.alert('No hay cursos asignados', null, 'Alerta');
                return;
            }

            //$('div#log').append('12<br>');
            coursesArray = Object.keys(jsonLogin.courses);
            //$('div#log').append('13<br>');
            getCourseData(0);                    

        } else {
            navigator.notification.alert('error', null, 'Error');
        }
    });
}

function getCourseData(index) {

    //alert('getCourseData');

    //$('div#log').append('14<br>');

    var courseid = coursesArray[index];
    //$('div#log').append('15<br>');
    if (courseid != undefined) {
        //$('div#log').append('16<br>');
        $.get('http://moodle.dtona.com.mx/webservice/rest/server.php', {
            courseid: courseid,
            wstoken: 'e7b142fd620606e2d789ee3c18d3489d',
            wsfunction: 'core_course_get_contents',
            moodlewsrestformat: 'json'
        }, function(response) { 

            //$('div#log').append('17<br>');       

            //cordova.plugins.clipboard.copy(JSON.stringify(response)); //copy the response to clipboard :)

            if (typeof response == 'object' && response != 'error') {

                //$('div#log').append('18<br>');

                localStorage.setItem('subitus-data-course-' + courseid, JSON.stringify(response));
                //$('div#log').append('19<br>');
                jsonContents = response;
                //$('div#log').append('20<br>');

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

                //$('div#log').append('21<br>');

                if (fileurl.length > 0) {
                    //$('div#log').append('22<br>');
                    fetch(index, fileurl, 0);
                }                

            } else {
                navigator.notification.alert('error', null, 'Error');
            }
        });
    } else {
        if (index > 0) {            
            navigator.notification.alert('Sincronización Finalizada', null, '');
        } else {
            navigator.notification.alert('error', null, 'Error');
        }
    }
}

function fetch(index, fileurl, indez) {

    //$('div#log').append('23<br>');
    
    var url = fileurl[indez] + '&token=e7b142fd620606e2d789ee3c18d3489d';
    var name = url.split('/').pop().split('?')[0].split('.')[0];
    var ext = url.split('/').pop().split('?')[0].split('.')[1];
    var courseid = coursesArray[index];
    var localFileURL = localStorage.aDir + 'course_' + courseid + '/' + name + '.' + ext;    
    var ft = new FileTransfer();

    //alert('url>>' + url);
    //alert('localFileURL>>' + localFileURL);

    //$('div#log').append('url>>' + url + '<br>');
    //$('div#log').append('localFileURL>>' + localFileURL + '<br>');

    ft.download(url, localFileURL,
        function(entry) {    

            //alert('guardado en>>' + entry.nativeURL);            
            //$('div#log').append('guardado en>>' + entry.nativeURL + '<br>');

            if (ext == 'zip') {                

                var origen = entry.nativeURL;
                var destino = localStorage.aDir + 'course_' + courseid;

                //$('div#log').append('origen>>' + origen + '<br>');
                //$('div#log').append('destino>>' + destino + '<br>');

                zip.unzip(origen, destino, function(argument) {

                    if (argument == 0) {                        
                        //addCard(courseid);
                        next(index, indez, courseid, fileurl, true);
                    } else {
                        navigator.notification.alert('Unzip error\norigen>>' + origen + '\ndestino>>' + destino, null, 'Error');
                    }
                });                                

            } else {
                next(index, indez, courseid, fileurl, false);
            }
        },
    fsError);                    
}

function next(index, indez, courseid, fileurl, isZip) {            

    ++indez;
    if (fileurl[indez] == undefined) {
        addCard(courseid, isZip);
        getCourseData(++index);
    } else {                
        fetch(index, fileurl, indez);
    }
}

function addCard(courseid, isZip) {  

    //$('div#log').append('addCard<br>');

    var card = $('.a-card').clone();
    card.find('.summary-file:first').attr('src', jsonLogin.courses[courseid].summary_file);
    card.find('.name:first').text(jsonLogin.courses[courseid].name);
    card.find('.summary:first').text(jsonLogin.courses[courseid].summary);
    if (isZip) {
        card.find('.card-action a').data('course', courseid);
    }    
    card.removeClass('a-card');
    $('main').append(card).show(0);    
}

function fsError(e) {
    //Hay algun problema con el fileSystem    
    navigator.notification.alert('Disculpa, hay un error.', null, 'Error');
    //alert('Disculpa, hay un error');
}