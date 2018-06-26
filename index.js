'use strict';

const assert = require("assert"),
      com = require("commander"),
      req = require("request-promise");

const { prompt } = require("inquirer");

class Store {
    constructor() {
        this.apiKey = "AIzaSyB8HaRSXDJLeSvHguYo0wy37Oz1xY_rBNg";
    }

    search(args) {
        // const type = "video"; //channel | playlist
        const { type, keyword } = args;
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=${type}&q=${keyword}&maxResults=${25}&key=${this.myKey}`;
        
        return new Promise(function(resolve, reject) {
            req(url).then(resolve);
        });
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
        execute(args) {
            return this.store.search({...args}).then(result => {
                console.log(result);
                const list = [];
                return Promise.resolve({
                    type: "input", name: "index", message: "the number of video index you want to play"
                });
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
    .command("search [keyword]")
    .action(function(keyword, cmd) {
        Invoker.getCommand("search").execute({ keyword, type: "video" })
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