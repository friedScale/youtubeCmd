'use strict';

const com = require("commander"),
      req = require("request-promise");

com
    .version("0.0.1")
    .command("get [url]")
    .action(function(url) {
        console.log("url: " +  url);
    })
    // .option("-r", "--url [optional]", "API url that you want to download the data")
    // .action(function(url) {
        
    // })
    // .option("-p", "--param [optional]", "the parameter you want to pass to the API")
    // .action(function(url) {
        
    // })
    .parse(process.argv);

    

function getDataFromAPI(url) {
    return req(url);
}

console.log(com.url);

const myKey = "AIzaSyAfiSjOZdH8jtOwv0QU-Q8g4Ppz_7YQXxc",
url = `https://www.googleapis.com/youtube/v3/search?part=snippet&key=${myKey}`

getDataFromAPI(url).then(function(data) {
    console.log("youtube search result");
    console.log(JSON.parse(data).items.length);
})