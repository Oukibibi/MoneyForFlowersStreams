$(document).foundation();

import { Config } from '../config/config.js';

var clientId = Config.clientId;
var clientSecret = Config.clientSecret;

var url = "https://id.twitch.tv/oauth2/token?client_id=" + clientId + "&client_secret=" + clientSecret + "&grant_type=client_credentials";

var xhr = new XMLHttpRequest();
xhr.open("POST", url);

var idCategory = 0;

xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
        var responseJson = JSON.parse(xhr.responseText);
        var bearer = responseJson.access_token;

        // var url = "https://api.twitch.tv/helix/search/channels?query=Destroyer&live_only=true";
        // var url = "https://api.twitch.tv/helix/streams?query=IronPaper";
        var userLoginString = '';
        Config.users.forEach(user => {
            userLoginString += 'user_login='+user+'&'
        });
        // var url = "https://api.twitch.tv/helix/streams?game_id=" + Config.category + "&language=fr&"+userLoginString;
        var url = "https://api.twitch.tv/helix/streams?"+userLoginString;

        var xhrRequest = new XMLHttpRequest();
        xhrRequest.open("GET", url);
        xhrRequest.setRequestHeader('Authorization', 'Bearer ' + bearer);
        xhrRequest.setRequestHeader('Client-Id', clientId);
        xhrRequest.onreadystatechange = function () {
            if (xhrRequest.readyState === 4) {
                var responseJson = JSON.parse(xhrRequest.responseText);
                //responseJson.data = [];
                if(responseJson.data.length === 0)
                {
                    displayNoStream();
                }
                else{
                    document.getElementById('twitch-channels-content').innerHTML = '';
                    var countViewer = 0;
                    responseJson.data.forEach(element => {
                        if(element.title.toUpperCase().includes(Config.titleToCheck))
                        {
                            countViewer += (element.viewer_count ?? 0);
                        }
                        displayThumnail(element);
                    });
                    document.getElementById('viewerCount').innerHTML = "Les streams Money for Flowers : " + (countViewer == 1 ? countViewer + " spectateur" : countViewer + " spectateurs");
                    if(document.getElementById('twitch-channels-content').innerHTML.length === 0){
                        displayNoStream()
                    }
                }
                AutoRefresh(300000);
            }
        };

        xhrRequest.send();
        //list-channels
        var listChannels = "";
        Config.users.forEach(user => {
            var element = "<li class='colorWhite'><a class='colorWhite' href='https://twitch.tv/" + user + "'>" + user + "</a></li>";
            listChannels += element;
        });
        document.getElementById('list-channels').innerHTML = listChannels;
    }
};

xhr.send();

function displayThumnail(element) {
    var url = element.thumbnail_url.replace('{width}', '250');
    url = url.replace('{height}', '150');
    if(element.title.toUpperCase().includes(Config.titleToCheck))
    {
        document.getElementById('twitch-channels-content').innerHTML += "<div class='cell cellStream'><span class='viewerCount'><img src='./img/twitchIcon.png'/>" + element.viewer_count + "</span><img src='./img/Basic_red_dot.png' class='reddot'></span>"
        + "<a target='_blank' href='https://twitch.tv/" + element.user_name + "' class='img__wrap'><p class='img__description'>" + element.title + "</p><img class='thumbnail img__img' src='" + url + "'></a>"
        + "<h5><a href='https://twitch.tv/" + element.user_name + "' class='text-center colorWhite'>" + element.user_name + "</a></h5>"
        + "</div>";
    } 
}

function reloadXHR()
{
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    document.getElementById('twitch-channels-content').innerHTML = "<div class='loader'>Chargement...</div>";
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            var responseJson = JSON.parse(xhr.responseText);
            var bearer = responseJson.access_token;
    
            // var url = "https://api.twitch.tv/helix/search/channels?query=Destroyer&live_only=true";
            // var url = "https://api.twitch.tv/helix/streams?query=IronPaper";
            var userLoginString = '';
            Config.users.forEach(user => {
                userLoginString += 'user_login='+user+'&'
            });
            var url = "https://api.twitch.tv/helix/streams?"+userLoginString;
    
            var xhrRequest = new XMLHttpRequest();
            xhrRequest.open("GET", url);
            xhrRequest.setRequestHeader('Authorization', 'Bearer ' + bearer);
            xhrRequest.setRequestHeader('Client-Id', clientId);
            xhrRequest.onreadystatechange = function () {
                if (xhrRequest.readyState === 4) {
                    var responseJson = JSON.parse(xhrRequest.responseText);
                    //responseJson.data = [];
                    if(responseJson.data.length === 0)
                    {
                        displayNoStream();
                    }
                    else{
                        document.getElementById('twitch-channels-content').innerHTML = '';
                        var countViewer = 0;
                        responseJson.data.forEach(element => {
                            
                            if(element.title.toUpperCase().includes(Config.titleToCheck))
                            {
                                countViewer += (element.viewer_count ?? 0);
                            }
                            displayThumnail(element);
                        });
                        document.getElementById('viewerCount').innerHTML = "Les streams Money for Flowers : " + (countViewer == 1 ? countViewer + " spectateur" : countViewer + " spectateurs");
                        if(document.getElementById('twitch-channels-content').innerHTML.length === 0){
                            displayNoStream()
                        }
                    }
                    AutoRefresh(300000);
                }
            };
    
            xhrRequest.send();
        }
    };
    xhr.send();
}

function displayNoStream()
{
    document.getElementById('twitch-channels-content').innerHTML = "<div class='blockNoLive'><p>Aucun stream actuellement, reviens un peu plus tard</p><img src='./img/MFF25flower_pink.png' class='flower row'/><br /></div>";
}

function AutoRefresh( t ) {
    setTimeout( function() {
        reloadXHR();
      }, t);
 }
