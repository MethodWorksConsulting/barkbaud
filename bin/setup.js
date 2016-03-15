/*jslint node: true, nomen: true*/
(function () {
    'use strict';

    var colors,
        dotenv,
        fs,
        sequence,
        yesno;

    fs = require('fs');

    function start() {
        var commands,
            configVars;

        console.log("Setup started (this may take a few minutes)...".cyan);

        commands = [];
        configVars = [];

        // Heroku deployment configurations.
        if (process.env.npm_config_heroku) {
            configVars = [
                'AUTH_CLIENT_ID=' + process.env.AUTH_CLIENT_ID,
                'AUTH_CLIENT_SECRET=' + process.env.AUTH_CLIENT_SECRET,
                'AUTH_SUBSCRIPTION_KEY=' + process.env.AUTH_SUBSCRIPTION_KEY,
                'AUTH_REDIRECT_URI=' + process.env.AUTH_REDIRECT_URI,
                'DATABASE_URI=' + process.env.DATABASE_URI
            ];

            // Set the Heroku app config vars.
            commands.push('heroku config:set ' + configVars.join(" "));
        }

        sequence(commands, function () {

            // Setting this config var will tell Barkbaud to build the database.
            process.env.npm_config_build_database = true;

            // Run the app (equivalent to `node index.js`).
            require('../index.js').ready(function () {
                console.log("Setup complete!".cyan);
            });
        });
    }

    fs.open('node_modules', 'r', function (error) {
        if (error && error.code === 'ENOENT') {
            console.log("ERROR: Please run `npm install`, first.");
            process.exit();
            return;
        } else {

            colors = require('colors');

            fs.open('barkbaud.env', 'r', function (error) {
                if (error && error.code === 'ENOENT') {
                    console.log("ERROR: barkbaud.env environment file not found!".red);
                    console.log("Please add a barkbaud.env file to your project root. See https://github.com/blackbaud/barkbaud for more information.");
                    process.exit();
                    return;
                }

                yesno = require('yesno');
                dotenv = require('dotenv').config({ path: 'barkbaud.env' });
                sequence = require(__dirname + '/lib/sequence');

                yesno.ask(
                    'This process will autopopulate your database with default information. Any existing data will be overwritten.' +
                    colors.yellow('\nAre you sure you want to continue? (y/n)'), true, function (ok) {
                    if (ok) {
                        start();
                    } else {
                        console.log("Setup cancelled.".grey);
                        process.exit();
                    }
                });
            });
        }
    });
}());
