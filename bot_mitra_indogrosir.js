const { Telegraf, session } = require('telegraf');

const axios = require('axios');
const path = require("path");
const dotenv = require('dotenv').config({
  path : path.join(__dirname + '/.env.dev' )
});

const url = process.env.URL;
const bot = new Telegraf(process.env.BOT_TOKEN);

let user_id,user_token, email = null;

bot.start((ctx) => {
    ctx.reply(`Silahkan input email dengan command '/email'`)
})

bot.command('email', async (ctx) => {
  try{
    let format =  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    email = ctx.message.text.slice(7).replace(/\s/g, '');

    if(!email.match(format)){
      return ctx.reply(`Format email tidak valid!`);
    }     
    
    ctx.reply(`Silahkan input password dengan command '/password'`);
  }catch(err){
    console.log(err)
  }
});

bot.command('password', async (ctx) => {
  try{

    let password = (ctx.message.text.slice(9)).replace(/\s/g, '');

    let payload = { email, password};
  
    let res = await axios.post(`${url}/api/otp/user`, payload);
    let data = res.data;
  
    if(!data){
      return ctx.reply(`Username atau password anda salah!`)
    }

    user_id = data.user.id
    user_token = data.token;

    console.log(data);
  }catch(err){
    console.log(err);
    if(err.response.status == 401){
      return ctx.reply(`Akun anda unauthorized!`);
    }
  }
});

bot.command('menu1', async(ctx) =>{ 
  try{
    console.log(typeof(user_id))
    console.log(user_id);
    console.log(user_token)

    if(!user_token){
      return ctx.reply(`Anda belum melakukan login ke Bot Mitra Indogrosir!`);
    }
  
    let res = await axios.get(`${url}/api/otp/generate/${user_id}`, { 
      headers: {
        'Authorization' : user_token.toString()
      }});

    console.log(res);
  
    let data = res.data;
  
    await ctx.reply(`OTP Anda : ${data.otp} \nSilahkan gunakan OTP pada CMS Mitra Indogrosir!`);
  }catch(err){
    console.log(err);
    if(err.response.status == 401){
      return ctx.reply(`Akun anda unauthorized!`);
    }
  }
});

bot.launch();
