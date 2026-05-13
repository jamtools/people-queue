import path from 'path';
import { serveStatic } from '@hono/node-server/serve-static';
import { serverRegistry } from 'springboard-server/src/register';

serverRegistry.registerServerModule(api => {
    // Serve all files from the assets directory
    api.hono.use('/assets/*', serveStatic({
        root: './',
        onFound: (_path, c) => {
            // Set appropriate content type and caching
            c.header('Cache-Control', 'public, max-age=3600');
        },
    }));
});
