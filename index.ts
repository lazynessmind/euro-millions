import { type Server} from 'bun'
import * as cheerio from "cheerio";

const EUROMILLIONS_URL = 'https://www.jogossantacasa.pt/web/SCCartazResult/'; 
const M1LHAO_URL = 'https://www.jogossantacasa.pt/web/SCCartazResult/m1lhao';

const index = String.raw`
  <h1>Status OK</h1>
  <h2>Endpoints:</h2>
  <ul>
    <li><a href='/last'>/last</a> - retrives last results including M1LHAO.</li>
    <li><a href='/euro'>/euro</a> - retrives only last result from EUROMILHAO.</li>
    <li><a href='/milhao'>/milhao</a> - retrives only last M1LHAO key.</li>
  </ul>
`;

export default {
  async fetch(req: Request, _: Response) {
    const url = new URL(req.url);
    if (url.pathname == "/euro") {
      const html = await (await fetch(EUROMILLIONS_URL)).text();
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
      
      return Response.json(sendKey);
    } else if (url.pathname == "/milhao") {
      const html = await (await fetch(M1LHAO_URL)).text();
      const $ = cheerio.load(html);
      
      let code = $('#code_m1').text()
      let codeDate = $('.dataInfo').text().split(' ')[7];
      
      const getM1lhao = {
        code: code,
        code_date: codeDate
      };

      return Response.json(getM1lhao);
    } else if (url.pathname === "/last") {
      let html = await (await fetch(EUROMILLIONS_URL)).text();
      let $ = cheerio.load(html);
      
      const date = $('.dataInfo').text().split(' ')[7];
              
      const key = $('.colums').find('li').first().text().split('+');
      const balls = key[0].trimEnd();
      const stars = key[1].trimStart();
      
      const jackpot = $('.noLine').find('.stronger').last().text().trim();
      
      html = await (await fetch(M1LHAO_URL)).text();
      $ = cheerio.load(html);
      
      const code = $('#code_m1').text()
      const codeDate = $('.dataInfo').text().split(' ')[7];
      
      const sendKey = {
        date: date,
        balls: balls,
        stars: stars,
        jackpot: jackpot,
        milhaoCode: code,
        milhaoData: codeDate,
      };

      return Response.json(sendKey);
    } else {
      return new Response(index, {
        status: 200,
        headers: {
          "Content-Type": "text/html;charset=utf-8",
        },
      });
    }
  }
}
