'use strict'

/** BOT LIKE **/
/** CODE BY CCOCOT | CCOCOT.CO **/
/** ccocot@bc0de.net **/
/** BC0DE.NET - NAONLAH.NET - WingKocoli **/
/** NOTE : RUN WITH PM2 **/

const Client = require('instagram-private-api').V1;
const delay = require('delay');
const chalk = require('chalk');
const _ = require('lodash');
const inquirer = require('inquirer');

const User = [
    {
        type:'input',
        name:'username',
        message:'Insert Username',
	validate: function(value){
		if(!value) return 'Can\'t Empty';
		return true;
	}
    },
    {
        type:'password',
        name:'password',
        message:'Insert Password',
        mask:'*',
	validate: function(value){
		if(!value) return 'Can\'t Empty';
		return true;
	}
    },
    {
        type:'input',
        name:'sleep',
        message:'Insert Sleep (In MiliSeconds)',
        validate: function(value){
            value = value.match(/[0-9]/);
            if (value) return true;
            return 'Delay is number';
        }
    }
]

const Login = async function(User){

    /** Save Account **/
    const Device = new Client.Device(User.username);
    const Storage = new Client.CookieMemoryStorage();
    const session = new Client.Session(Device, Storage);

    try {
        await Client.Session.create(Device, Storage, User.username, User.password)
        const account = await session.getAccount();
        return Promise.resolve({session,account});
    } catch (err) {
        return Promise.reject(err);
    }

}

const Like = async function(session,media){
    try {
        if (media.params.hasLiked) {
           return chalk`{bold.blue Already Liked}`;
        }
        await Client.Like.create(session, media.id);
        return chalk`{bold.green Liked}`;
    } catch (err) {
        return chalk`{bold.red Failed}`;
    }
}

const Excute = async function(User, sleep){
    try {
        console.log(chalk`\n{yellow [?] Try to Login ....}`);
        const doLogin = await Login(User);
        console.log(chalk`{green [+] Login Succsess}, {yellow Try Like all media in feed ....}`);
        const feed = new Client.Feed.Timeline(doLogin.session);
        var cursor;
        do {
            if (cursor) feed.setCursor(cursor);
            var media = await feed.get();
            media = _.chunk(media, 5);
            for (var i = 0; i < media.length; i++) {
                await Promise.all(media[i].map(async (media) => {
                    const doLike = await Like(doLogin.session, media);
                    console.log(chalk`${media.params.user.username} [{cyan ${media.id}}] => ${doLike}`);
                }))
                await console.log(chalk`{yellow [-] Delay For ${sleep} MiliSeconds}`);
                await delay(sleep);
            }
        } while(feed.isMoreAvailable());
    } catch (err) {
        console.log(err);
    }
}

console.log(chalk`
{bold Instagram BOT LIKE v1}
{green BC0DE.NET - NAONLAH.NET - WingKocoli}
{bold.red Code By Ccocot | ccocot@bc0de.net}
{bold /** NOTE : RUN WITH PM2 **/}
`);

inquirer.prompt(User)
    .then(answers => {
        Excute({
            username:answers.username,
            password:answers.password
        },answers.sleep);
    })
