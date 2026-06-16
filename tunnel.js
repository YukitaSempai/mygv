const lt = require('localtunnel');
const fs = require('fs');
(async () => {
  try {
    const tunnel = await lt({ port: 80, subdomain: 'mygv' });
    const url = tunnel.url;
    fs.writeFileSync(__dirname + '/tunnel-url.txt', url);
    console.log('TUNNEL_URL:' + url);
    tunnel.on('close', () => console.log('Tunnel closed'));
  } catch (e) {
    console.error('TUNNEL_ERROR:' + e.message);
    fs.writeFileSync(__dirname + '/tunnel-url.txt', 'ERROR:' + e.message);
  }
})();
