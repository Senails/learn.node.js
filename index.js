import fs from 'fs';
import http from 'http';


http.createServer(async(request, response) => {
    let path = getpath(request.url);
    let type = getMimeType(path);
    let status = 200;
    let res = '';

    try {
        if (/image/.test(type)) {
            let impath = path.replace(/%20/g, ' ');
            res = await fs.promises.readFile(impath);
        } else if (type == 'text/html') {
            let lpath = './pages/layout.html';
            let cpath = './pages' + request.url + '/content.html';
            let tpath = './pages' + request.url + '/title.html';
            let stylepath = './pages/style.css';
            let scriptpath = './pages/script.js';

            let script = await fs.promises.readFile(scriptpath, 'utf8');
            let style = await fs.promises.readFile(stylepath, 'utf8');
            let layout = await fs.promises.readFile(lpath, 'utf8');
            let content = await fs.promises.readFile(cpath, 'utf8');
            let title = await fs.promises.readFile(tpath, 'utf8');

            layout = layout.replace(/\{% get content %\}/, content);
            layout = layout.replace(/\{% get title %\}/, title);
            layout = layout.replace(/\{% get style %\}/, `<style>${style}</style>`);
            layout = layout.replace(/\{% get script %\}/, `<script>${script}</script>`);

            await replaca()

            async function replaca() {
                let reg = /\{% get element '(.+?)' %\}/g;
                let arr = [];
                arr = layout.match(reg);
                for (let elem of arr) {
                    let nameelem = elem.match(/\{% get element '(.+?)' %\}/)[1];
                    let path = './pages/elems/' + nameelem + '.html';
                    let pageelem = await fs.promises.readFile(path, 'utf-8');
                    layout = layout.replace(elem, pageelem);
                }
            }

            try {
                let metapath = './pages' + request.url + '/meta.html';
                let meta = await fs.promises.readFile(metapath, 'utf8');
                layout = layout.replace(/\{% get meta %\}/, meta);
            } catch {
                layout = layout.replace(/\{% get meta %\}/, '');
            }
            res = layout;
        } else {
            res = await fs.promises.readFile(path, 'utf-8');
        }
    } catch { //404
        path = getpath404(request.url, type)
        if (/image/.test(type)) {
            res = await fs.promises.readFile(path);
        } else if (type == 'text/html') {
            let lpath = './pages/layout.html';
            let cpath = './pages/404/content.html';
            let tpath = './pages/404/title.html';
            let stylepath = './pages/404/styc.css';

            let style = await fs.promises.readFile(stylepath, 'utf8');
            let layout = await fs.promises.readFile(lpath, 'utf8');
            let content = await fs.promises.readFile(cpath, 'utf8');
            let title = await fs.promises.readFile(tpath, 'utf8');

            layout = layout.replace(/\{% get content %\}/, content);
            layout = layout.replace(/\{% get title %\}/, title);
            layout = layout.replace(/\{% get style %\}/, `<style>${style}</style>`);
            layout = layout.replace(/\{% get script %\}/, ``);
            layout = layout.replace(/\{% get meta %\}/, '');

            res = layout;
        } else {
            res = await fs.promises.readFile(path, 'utf-8');
        }

        function getpath404(url, type) {
            let path;
            if (type == 'text/html') {
                path = 'pages/404/404.html';
                status = 404;
            } else {
                path = 'pages/404' + url;
                status = 302;
            }
            return path;
        }
    }

    response.writeHead(status, { 'Content-Type': type })
    response.write(res);
    response.end();
}).listen(3000);

function getMimeType(path) {
    let mimes = {
        html: 'text/html',
        jpeg: 'image/jpeg',
        jpg: 'image/jpeg',
        png: 'image/png',
        svg: 'image/svg+xml',
        json: 'application/json',
        js: 'text/javascript',
        css: 'text/css',
        ico: 'image/x-icon',
    };


    let ext = path.match(/\/.*\.([a-z]{2,5}$)/);

    if (ext != null) {
        return mimes[ext[1]]
    } else {
        return 'text/plain';
    }
}

function getpath(url) {
    let str;

    if (url == '/') {
        str = '/index.html'
    } else if (/\/[a-z0-9A-Z]+\/?$/.test(url)) {
        let copy = url.match(/\/([a-z0-9A-Z]+)\/?$/);
        str = url + '/' + copy[1] + '.html';
    } else {
        str = url;
    }
    let path = 'pages' + str;
    return path;
}








//11