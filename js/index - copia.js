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

            alert('just begun!');

            /*$.ajax({
                url: 'http://moodle.dtona.com.mx/webservice/rest/server.php',
                cache: false,
                type: 'GET',
                data: {
                    username: 'tutorial',
                    password: 'Imss2015!',
                    wstoken: '412117ae95a85b91731a91e2b54fa0f4',
                    wsfunction: 'local_subitus_mobile_login',
                    moodlewsrestformat: 'json'                
                },
                dataType: 'text',
                success: function(response) {                    
                    alert('typeof response>>' + typeof response);
                    if (response != 'error') {
                        localStorage.setItem('subitus-data', response);
                        alert('localStorage>>' + localStorage['subitus-data']);
                        response = JSON.parse(response);
                        alert('response>>' + response)
                    }
                }                     
            });            */

            $.get('http://moodle.dtona.com.mx/webservice/rest/server.php', {
                username: 'tutorial',
                password: 'Imss2015!',
                wstoken: '412117ae95a85b91731a91e2b54fa0f4',
                wsfunction: 'local_subitus_mobile_login',
                moodlewsrestformat: 'json'                
            }, function(response) {                
                if (response != 'error') {
                    localStorage.setItem('subitus-data', response);                    
                    jsonLogin = JSON.parse(response);                    

                    $.get('http://moodle.dtona.com.mx/webservice/rest/server.php', {
                        courseid: 4,
                        wstoken: 'e7b142fd620606e2d789ee3c18d3489d',
                        wsfunction: 'core_course_get_contents',
                        moodlewsrestformat: 'json'
                    }, function(response) {      
                        jsonContents = response;
                        //alert('JSON.stringify(response)>>' + JSON.stringify(response));
                        //$("textarea#x").text(JSON.stringify(response));
                        //return;
                        if (response != 'error') {                            
                            localStorage.setItem('subitus-data-course-4', JSON.stringify(response));
                            //jsonLogin = JSON.parse(response);                    
                            var fileurl;
                            for (var i = 0, len = jsonContents.length; i < len; i++) {
                                if (jsonContents[i].modules != undefined && jsonContents[i].modules != null && jsonContents[i].modules.length > 0) {
                                    for (var j = 0, jlen = jsonContents[i].modules.length; j < jlen; j++) {                                        
                                        if (jsonContents[i].modules[j].contents != undefined && jsonContents[i].modules[j].contents != null && jsonContents[i].modules[j].contents.length > 0) {
                                            for (var k = 0, klen = jsonContents[i].modules[j].contents.length; k < klen; k++) {
                                                if (jsonContents[i].modules[j].contents[k].fileurl != undefined && jsonContents[i].modules[j].contents[k].fileurl != null && jsonContents[i].modules[j].contents[k].fileurl.length > 0) {
                                                    fileurl = jsonContents[i].modules[j].contents[k].fileurl;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            alert('fileurl>>' + fileurl);

                            var dirEntry = window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {     

                                //now we have the data dir, get our asset dir
                                //console.log("got main dir",dir);
                                //alert("got main dir>>" + dir);

                                dir.getDirectory("assets/", {create:true}, function(aDir) {                                                                
                                    
                                    //we need access to this directory later, so copy it to globals
                                    alert('aDir>>' + aDir);
                                    fetch(fileurl, aDir);
                                    
                                }, fsError);
                                
                            }, fsError);                            
                            
                            /*//get the current list of assets
                            var assetReader = getAssets();                          
                            assetReader.done(function(results) {
                                
                                //console.log("promise done", results);
                                //alert("promise done>>" + results);

                                if (results.length === 0) {                    
                                    alert("Sorry, but no assets are currently available");
                                } else {
                                    var list = "";                                    
                                    for (var i = 0, len = results.length; i < len; i++) {
                                        
                                        //alert("filename>>" + results[i].name);                        
                                        
                                        if ((results[i].name).split(".").pop() == "zip") {

                                            var source = results[i].toURL();                            
                                            //alert("source>>" + source);

                                            var destination = (results[i].toURL()).split("/");
                                            destination.pop();
                                            destination = destination.join("/");
                                            //alert("destination>>" +  destination);

                                            zip.unzip(source, destination, function(argument) {
                                                //alert("argument>>" + argument);
                                                if (argument == 0) {
                                                    //alert("unzip success!!");
                                                    //if (results[i].name == "ah.zip") {
                                                        list += "<img src='" + destination + "/ah.png' /><hr>";
                                                    //}                                    
                                                    //console.log(list);
                                                    alert(list);                    

                                                    $("body").html(list);
                                                } else {
                                                    alert("fuuuuuck!");
                                                }
                                            });
                                        }                        
                                    }                    
                                    
                                    //$("#assetList").listview();                    
                                }                
                                if (!globals.checkedServer) {                    
                                    $.get(globals.assetServer).done(function(res) {                        
                                        
                                        //Each asset is a URL for an asset. We check the filename
                                        //of each to see if it exists in our current list of assets                   
                                        
                                        //console.log("server assets", res);
                                        //alert("server assets>>" + res);

                                        for (var i = 0, len = res.length; i < len; i++) {
                                            var file = res[i].split("/").pop();
                                            var haveIt = false;

                                            for (var k = 0; k < globals.assets.length; k++) {
                                                if (globals.assets[k].name === file) {
                                                    //console.log("we already have file " + file);
                                                    //alert("we already have file " + file);
                                                    haveIt = true;
                                                    break;
                                                }
                                            }
                                            
                                            if (!haveIt) fetch(res[i]);
                                            
                                        }
                                    });
                                }
                            });*/

                            //alert("jsonLogin.courses[4].summary_file>>" + jsonLogin.courses[4].summary_file);
                            var card = $('.a-card').clone();
                            card.find('.summary-file:first').attr('src', jsonLogin.courses[4].summary_file);
                            card.find('.name:first').text(jsonLogin.courses[4].name);
                            card.find('.summary:first').text(jsonLogin.courses[4].summary);
                            card.removeClass('a-card');
                            $('main').append(card).show(0);

                            var card = $('.a-card').clone();
                            card.find('.summary-file:first').attr('src', jsonLogin.courses[4].summary_file);
                            card.find('.name:first').text(jsonLogin.courses[4].name);
                            card.find('.summary:first').text(jsonLogin.courses[4].summary + "2");
                            card.removeClass('a-card');
                            $('main').append(card).show(0);
                        }
                    });
                }
            });

            //alert('cordova & jquery loaded!');
            $('.button-collapse').sideNav();            
        });        
    }
};

app.initialize();

function fsError(e) {
    //Something went wrong with the file system. Keep it simple for the end user.
    console.log("FS Error", e);
    navigator.notification.alert("Sorry, an error was thrown.", null,"Error");
}

/*
I will access the device file system to see what assets we have already. I also take care of, 
once per operation, hitting the server to see if we have new assets.
*/
function getAssets() {    
    var def = $.Deferred();        

    if (globals.assets) {
        console.log("returning cached assets");        
        alert("returning cached assets");
        def.resolve(globals.assets);
        return def.promise();
    }    
    
    var dirEntry = window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {     

        //now we have the data dir, get our asset dir
        //console.log("got main dir",dir);
        //alert("got main dir>>" + dir);

        dir.getDirectory(globals.assetSubDir+"/", {create:true}, function(aDir) {
            
            //console.log("ok, got assets", aDir);
            //alert("ok, got assets>>" + aDir);    
            
            var reader = aDir.createReader();
            reader.readEntries(function(results) {
                //console.log("in read entries result", results);
                //alert("in read entries result>>" + results);
                globals.assets = results;
                def.resolve(results);
            });
            
            //we need access to this directory later, so copy it to globals
            globals.assetDirectory = aDir;
            
        }, fsError);
        
    }, fsError);
    
    return def.promise();
}

function fetch(url, aDir) {
    alert("fetch url" + url);
    var localFileName = 'test.zip'; //url.split("/").pop();
    var localFileURL = aDir.toURL() + localFileName;
    alert("fetch to " + localFileURL);    
    
    var ft = new FileTransfer();
    ft.download(url, localFileURL, 
        function(entry) {
            alert("I finished it " + JSON.stringify(entry));            

            zip.unzip('file:///data/data/com.ImssAppMaterial/files/assets/test.zip', 'file:///data/data/com.ImssAppMaterial/files/assets', function(argument) {
                //alert("argument>>" + argument);
                if (argument == 0) {
                    alert("unzip success!!");
                    //if (results[i].name == "ah.zip") {
                        //list += "<img src='" + destination + "/ah.png' /><hr>";
                    //}                                    
                    //console.log(list);
                    //alert(list);                    

                    //$("body").html(list);                    
                } else {
                    alert("fuuuuuck!");
                }
            });
        },
        fsError);                
}

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