const { Telegraf } = require('telegraf');

const superagent = require('superagent');
const axios = require('axios');
const path = require("path");
const dotenv = require('dotenv').config({
  path : path.join(__dirname + '/.env.dev' )
});

const url = process.env.URL;
const bot = new Telegraf(process.env.BOT_TOKEN);

let user = {};

bot.start((ctx) => {
    ctx.reply(`Selamat datang di Bot Indogrosir!\nUntuk mengetahui command-command yang ada, silahkan gunakan command '/help'`)
})

bot.command('help',async (ctx) =>{
    ctx.reply(`List command untuk Bot Indogrosir\n1. '/menu1' : Untuk generate OTP yang akan digunakan untuk CMS Mitra Indogrosir.\n 2. '/logout' : Untuk logout dari Bot\nSilahkan login terlebih dahulu untuk menggunakan command diatas dengan cara \n'/email email_anda' dan '/password password_anda'`)
});

bot.command('email', async (ctx) => {
  try{
    let format =  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    email = ctx.message.text.slice(7).replace(/\s/g, '');

    if(!email.match(format)){
      return ctx.reply(`Format email tidak valid!`);
    }     

    if (!user.email) user.email = email;
    
    ctx.reply(`Silahkan input password dengan command '/password'`);
  }catch(err){
    console.log(err)
  }
});

bot.command('password', async (ctx) => {
  try{
    let password = ctx.message.text.slice(9).replace(/\s/g, "");
    if (!user.password) user.password = password;

    let payload = { email, password };

    let {data} = await axios.post(`${url}/api/otp/user`, payload);

    user.id = data.user.id;
    user.token = data.token;

    if (!data) {
      return ctx.reply(`Username atau password anda salah!`);
    }else{
      return ctx.reply(`Login berhasil`);
    }
  }catch(err){
    console.log(err);
    if(err.response.status == 401){
      return ctx.reply(`Akun anda unauthorized!`);
    }else if(err.response.status == 400){
      return ctx.reply(`Username atau password anda salah!`);
    }
  }
});

bot.command('menu1', async(ctx) =>{ 
  try{
    console.log(user.token);

    if(!user.token){
      return ctx.reply(`Anda belum melakukan login ke Bot Mitra Indogrosir!`);
    }
  
    let {data} =await  axios
    .get(`${url}/api/otp/generate/${user.id}`, {
      headers: {
        authorization: user.token,
      },
    })  
    ctx.reply(`OTP Anda : ${data.otp} \nSilahkan gunakan OTP pada CMS Mitra Indogrosir!`);

    let counter= 60;
    
    // const {message_id} = await ctx.reply(`OTP berlaku selama ${counter} detik`);
    let {message_id} = await ctx.telegram.sendMessage(ctx.message.chat.id,
      `OTP berlaku selama ${counter} detik`
    )
    while(counter != 0){
      counter--

      await new Promise(r => setTimeout(r,1000))

      await ctx.telegram.editMessageText(ctx.message.chat.id, message_id,undefined, `OTP berlaku selama ${counter} detik`);
      if(counter == 0){
        return await ctx.telegram.editMessageText(ctx.message.chat.id, message_id,undefined,
          `OTP telah expired!`
        )
      }
    }
  }catch(err){
    console.log(err);
    if(err.response.status == 401){
      return ctx.reply(`Akun anda unauthorized!`);
    }
  }
});

bot.command('logout', async(ctx) =>{ 
    if(!user.token)return ctx.reply(`Anda belum melakukan login ke Bot Mitra Indogrosir!`);
    user = {}
    return ctx.reply(`Logout berhasil!`);
});

bot.launch();
