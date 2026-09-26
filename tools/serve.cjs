// Vain paikallinen staattinen esikatselu. GitHub Pagesissa tätä ei ajeta.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.json':'application/json; charset=utf-8' };
const allowed = /^(index\.html|(?:opettaja|espanja|suomi|pohjoissaame|assets|css|js|data)\/)/;
const server=http.createServer((req,res)=> {
  try {
    if(!['GET','HEAD'].includes(req.method)) {res.writeHead(405);res.end();return;}
    let route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(route==='/GiellaStudio') {res.writeHead(308,{Location:'/GiellaStudio/'});res.end();return;}
    if(route.startsWith('/GiellaStudio/')) route=route.slice('/GiellaStudio'.length);
    route=route.replace(/^\//,'');
    if(route.includes('..')||route.includes('\\')) throw new Error('Invalid path');
    if(!route || route.endsWith('/')) route+='index.html';
    if(!allowed.test(route)) {res.writeHead(404);res.end('Not found');return;}
    const file=path.resolve(root,route);
    if(!file.startsWith(root+path.sep)) throw new Error('Invalid path');
    if(fs.existsSync(file)&&fs.statSync(file).isDirectory()) {
      const current=new URL(req.url,'http://localhost');res.writeHead(308,{Location:current.pathname+'/'});res.end();return;
    }
    const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);
  } catch {res.writeHead(404);res.end('Not found');}
});
server.listen(Number(process.env.PORT)||4186,'127.0.0.1',()=>console.log('GiellaStudio Classroom: http://127.0.0.1:'+server.address().port+'/GiellaStudio/'));
