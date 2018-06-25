'use strict';

const assert = require("assert"),
      com = require("commander"),
      req = require("request-promise");

const { prompt } = require("inquirer");


// function getDataFromAPI(url) {
//     return req(url);
// }

// console.log(com.url);

// url = `https://www.googleapis.com/youtube/v3/search?part=snippet&key=${myKey}`

// getDataFromAPI(url).then(function(data) {
//     console.log("youtube search result");
//     console.log(JSON.parse(data).items.length);
// })

class Store {
    constructor() {
        this.apiKey = "AIzaSyAfiSjOZdH8jtOwv0QU-Q8g4Ppz_7YQXxc";
    }

}

class Command { 
    constructor(prop) {
        this.store = new Store();
    }

    execute() {} 
};

const commFactory = {
    searchCommand: class extends Command {
        execute() {
            return Promise.resolve({
                type: "input", name: "index", message: "the number of video index you want to play"
            });
        }
    },
    
    playCommand: class extends Command {
        execute() {
            return Promise.resolve();            
        }    
    }
}

class Invoker {
    static getCommand(cmd) {
        let klass = commFactory[cmd + "Command"];
        if (klass) {
            this.command = new klass();
        }
        return this.command;
    }

    static execute() {
        this.command.execute();
        return this.command;
    }
}


com
    .version("0.0.1")
    .command("search")
    .action(function(keyword, cmd) {
        Invoker.getCommand("search").execute()
               .then(prompt)
               .then(index => {
                    console.log(index);
                });
    });


com
    .command("play")
    .action(function(list, cmd) {
        console.log(Store.keyword);
    });


com
    .parse(process.argv);