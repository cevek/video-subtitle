import * as Koa from 'koa';
import { createPackerInstance } from './packer.config';
import * as serve from 'koa-static';
import { renderHTML } from 'webbuilder/dist/plugins/html';
import * as request from 'request';
const port = 5000;
const app = new Koa();
app.listen(port);
const packer = createPackerInstance();
function getUrl(options: request.RequiredUriUrl & request.CoreOptions) {
    return new Promise<{ response: request.RequestResponse, body: Buffer }>((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) return reject(error);
            resolve({ response, body });
        });
    });
}

packer.run({ watch: true });
app.use(serve(packer.options.dest));
app.use(async (ctx, next) => {
    if (!ctx.path.match(/\./) && !ctx.path.match(/^\/api\//)) {
        const packerResult = await packer.getResult();
        ctx.body = renderHTML('index.html', packerResult, {});
    }
    await next();
});
app.use(async (ctx) => {
    if (ctx.path === '/api/subtitles') {
        var yturl = ctx.query.yturl;
        var data = await getUrl({ url: 'http://downsub.com/', qs: { url: yturl } });
        // console.log(data.body);
        console.log(yturl);
        var re = /<a href=".\/index.php\?title=.*?&url=(.*?)">/g;
        var body = data.body.toString();
        var urls = [];
        var m: RegExpExecArray | null = null;
        while (m = re.exec(body)) {
            urls.push(decodeURIComponent(m[1]));
        }
        console.log(urls);
        
        //<a href="./index.php?title=Building+a+Media+Player+4&url=https%3A%2F%2Fwww.youtube.com%2Fapi%2Ftimedtext%3Fsignature%3D5E6142840D479E276C33B0F473A4999A30467A52.29E969EA1B9E465A9813386AC66E906CCAF06518%26asr_langs%3Dnl%252Cit%252Ces%252Cru%252Cfr%252Cja%252Cpt%252Cen%252Cko%252Cde%26v%3DCPFE34ngysU%26caps%3Dasr%26hl%3Den_US%26key%3Dyttt1%26sparams%3Dasr_langs%252Ccaps%252Cv%252Cexpire%26expire%3D1489967078%26lang%3Den%26name%3DCC">>>Download<<</a>
        ctx.body = { status: 'ok', urls: urls, body: body };
    }
});

