import express, {type Response, type Request} from "express";
import * as cheerio from "cheerio";
import ky from "ky";

const app = express();

const EUROMILLIONS_URL = 'https://www.jogossantacasa.pt/web/SCCartazResult/'; 
const M1LHAO_URL = 'https://www.jogossantacasa.pt/web/SCCartazResult/m1lhao';

const DEBUG = false;

const HOST_URL = DEBUG ? "http://localhost:3000" 
                : "https://euro-millions-lazynessmind.vercel.app";

const index = String.raw`
  <h1>Status OK</h1>
  <h2>Endpoints:</h2>
  <ul>
    <li><a href='/last'>/last</a> - retrives last results including M1LHAO.</li>
    <li><a href='/euro'>/euro</a> - retrives only last result from EUROMILHAO.</li>
    <li><a href='/milhao'>/milhao</a> - retrives only last M1LHAO key.</li>
  </ul>
`;

app.get('/', (_: Request, res: Response) => {
  res.send(index);
});

interface Euro {
  date: string,
  balls: string,
  stars: string,
  jackpot: string,
};

interface Milhao {
  code: string,
  code_date: string,
};

app.get('/last', async (_: Request, res: Response) => {

  const euro = await ky.get(HOST_URL + "/euro").json<Euro>();
  const milhao = await ky.get(HOST_URL + "/milhao").json<Milhao>();
  
  const sendKey = {
      date: euro.date,
      balls: euro.balls,
      stars: euro.stars,
      jackpot: euro.jackpot,
      milhaoCode: milhao.code,
      milhaoDate: milhao.code_date
  };
    
  res.send(sendKey);      
});

app.get('/euro', async (_: Request, res: Response) => {
  const html = await ky.get(EUROMILLIONS_URL).text();
          
  const $ = cheerio.load(html);
  
  let date = $('.dataInfo').text().split(' ')[7];
          
  let key = $('.colums').find('li').first().text().split('+');
  let balls = key[0].trimEnd();
  let stars = key[1].trimStart();
  
  let jackpot = $('.noLine').find('.stronger').last().text().trim();
          
  const sendKey = {
    date: date,
    balls: balls,
    stars: stars,
    jackpot: jackpot
  };
  
  res.send(sendKey)
});

app.get('/milhao', async (_: Request, res: Response) => {  
  const html = await ky.get(M1LHAO_URL).text();
  
  const $ = cheerio.load(html);
  
  let code = $('#code_m1').text()
  let codeDate = $('.dataInfo').text().split(' ')[7];
  
  const getM1lhao = {
    code: code,
    code_date: codeDate
  };
  
  res.send(getM1lhao);
});

app.listen(3000, () => {
    console.log("Listenning")
});
