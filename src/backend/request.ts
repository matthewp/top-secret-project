import { ipcMain } from 'electron';
import http from 'http';
import https from 'https';
import fs from 'fs';

ipcMain.handle('request', async (event, rawUrl) => {
  const url = new URL(rawUrl);

  switch(url.protocol) {
    case 'http:':
    case 'https:': {
      return handleHttpRequest(url);  
    }
    case 'browser:': {
      return handleBrowserRequest(url);
    }
  }
});

function handleHttpRequest(url) {
  const options = {
    host: url.host,
    path: url.pathname + url.search
  };

  let h = url.protocol === 'https:' ? https : http;
  
  return new Promise((resolve, reject) => {
    h.get(options, response => {
      let str = '';
      response.on('data', chunk => str += chunk);

      response.on('end', () => {
        resolve({
          status: response.statusCode,
          content: str
        });
      });
    });
  });
}

async function handleBrowserRequest(url: URL) {
  switch(url.host) {
    case 'newtab': {
      const pth = __dirname + '/../content/browser/newtab.html'
      const content = await fs.promises.readFile(pth, 'utf-8');
      return {
        status: 200,
        content
      };
    }
    default: {
      const pth = __dirname + '/../content/browser'  + url.pathname;
      try {
        const content = await fs.promises.readFile(pth, 'utf-8');
        return {
          status: 200,
          content
        };
      } catch {
        return {
          status: 404
        };
      }
    }
  }
}