const express = require('express');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev, dir: 'src' });
const handler = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
    const app = express();
    app.set('port', (process.env.PORT || 5000));
    app.get('*', (req, res) => {
        return handler(req, res);
    });

    app.listen(app.get('port'), () => {
        console.log('[*] Server started on port ' + app.get('port'));
    });
})
