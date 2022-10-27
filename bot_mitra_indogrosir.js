const { Telegraf, session } = require('telegraf');

const jwt = require('jsonwebtoken');
const axios = require('axios');
const path = require("path");
const dotenv = require('dotenv').config({
  path : path.join(__dirname + '/.env.dev' )
});

const url = process.env.URL;
const bot = new Telegraf(process.env.BOT_TOKEN);

let user_token = null;

bot.start((ctx) => {
    ctx.reply(`Silahkan input email dengan command '/email'`)
})

bot.command('email', async (ctx) => {
    let format =  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    let email = ctx.message.text.slice(7).replace(/\s/g, '');
    if(!email.match(format)){
      return ctx.reply(`Format email tidak valid!`);
    }     
    
    await ctx.reply(`Silahkan input password dengan command '/password'`);

    bot.command('password', async (ctx) => {
      let password = (ctx.message.text.slice(9)).replace(/\s/g, '');
    
      let payload = { email, password};

      let res = await axios.post(url + '/api/otp/user', payload);
      let data = res.data;

      user_token = data.token;

      console.log(data);

    });
});

bot.command('menu1', async(ctx) =>{
  let res = await axios.get(url + '/api/otp/generate/1', { 
    headers: {
      'Authorization' : user_token
    }});

  console.log(res);

  let data = res.data;

  // console.log(data);
});

bot.command('quit', async (ctx) => {
    // Explicit usage
    await ctx.telegram.leaveChat(ctx.message.chat.id);

    // Using context shortcut
    await ctx.leaveChat();
});

bot.launch();
