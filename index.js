const express = require('express');
const play = require('play-dl');

const app = express();
const port = 3000;

app.get('/downsearch/playdl', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter q is required' });
        }

        console.log(`Received search query: ${query}`);

        // Cari lagu di YouTube
        let results;
        try {
            results = await play.search(query, { limit: 1, source: { youtube: 'video' } });
        } catch (searchError) {
            console.error(`Search error: ${searchError}`);
            return res.status(500).json({ error: 'Failed to search for tracks' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'No results found' });
        }

        const song = results[0];
        console.log(`Found song: ${song.title} (${song.url})`);

        try {
            const stream = await play.stream(song.url);
            console.log(`Stream URL: ${stream.url}`);

            res.json({
                title: song.title,
                url: song.url,
                downloadUrl: stream.url
            });
        } catch (streamError) {
            console.error(`Error streaming song: ${streamError}`);
            res.status(500).json({ error: 'Failed to stream song' });
        }
    } catch (error) {
        console.error(`Error processing request: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Print available routes
app._router.stack.forEach(printRoutes);

function printRoutes(middleware) {
    if (middleware.route) {
        // This is a route middleware
        console.log(`${middleware.route.stack[0].method.toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
        // This is a router middleware
        middleware.handle.stack.forEach(printRoutes);
    }
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log('Available routes:');
    app._router.stack.forEach(printRoutes);
});
