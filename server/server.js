const http=require('http');
const pool=require('./db')
let book_count=0;
const server=http.createServer(async (req,res)=>{
    // res.writeHead(200,{'content-type': 'application/json'})

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods','POST,GET,DELETE,PUT,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization')

    //preflight
    if(req.method==='OPTIONS'){
        res.writeHead(204); // No Content
        res.end();
        return;
    };

    //ROUTES
    switch (req.method){
        case 'GET':
            switch (req.url){
                case '/api/books/single':

                    try {
                        const result = await pool.query('SELECT title FROM books WHERE id = 1');

                        if (result.rows.length > 0) {
                            const bookTitle = result.rows[0].title;                     
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ title: bookTitle }));                            
                            console.log(`The title is: ${bookTitle}`);
                        } else {
                            res.writeHead(404, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: "Book not found" }));
                            console.log("No book found with that ID.");
                        }
                    } catch (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: "Internal Server Error" }));
                        console.error("Database Error:", err);
                    }

                break;
                default:
                    // Node.js default case (GET /api/books)
                    try {
                        const result = await pool.query('SELECT * FROM books');
                        if (result.rows.length > 0) {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(result.rows)); 
                            // console.log(result.rows)
                        } else {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify([])); 
                        }
                    } catch (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: "Internal Server Error" }));
                        console.error("Database Error:", err);
                    }
                
                
            }
        
        break;
        case 'DELETE':
            if(req.url.startsWith('/api/books/')){
            // 1. Extract the ID from the URL string
                // URL looks like: "/api/books/2"
                const parts = req.url.split('/'); 
                const bookId = parts[parts.length - 1]; // Grabs last part of url  - 2         
            try {
                // 2. The Secure SQL Delete
                const query = 'DELETE FROM books WHERE id = $1 RETURNING *';
                const result = await pool.query(query, [bookId]);

                if (result.rowCount === 0) {
                    // Nothing was deleted (ID didn't exist)
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: "Book not found" }));
                } else {
                    // Success!
                    console.log(result)
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "Book deleted successfully" }));
                }
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: "Database error during delete" }));
            }
        }        
        break;
        case 'PUT':
            if (req.url.startsWith('/api/books/')) {
                const editId = req.url.split('/').pop(); 
                let body = '';
                
                // 1. Collect the data chunks
                req.on('data', (chunk) => {
                    body += chunk.toString();
                });

                // 2. Mark this callback as ASYNC to use await inside
                req.on('end', async () => {
                    try {
                        const parsedData = JSON.parse(body);
                        const { title, author} = parsedData; // Destructuring for cleanliness

                        // 3. Perform the async DB query
                        const query = 'UPDATE books SET title = $1, author = $2 WHERE id = $3 RETURNING *';
                        const result = await pool.query(query, [title,author,editId]);
                        
                        const updatedBook = result.rows[0];
                        console.log(updatedBook)

                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                             book: updatedBook 
                        }));
                    } catch (err) {
                        console.error("update Error:", err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: "Failed to add book" }));
                    }
                });
            }
        break;
        case 'POST':
            if (req.url === '/api/add-book') {
                let body = '';
                
                // 1. Collect the data chunks
                req.on('data', (chunk) => {
                    body += chunk.toString();
                });

                // 2. Mark this callback as ASYNC to use await inside
                req.on('end', async () => {
                    try {
                        const parsedData = JSON.parse(body);
                        const { newBook, author } = parsedData; // Destructuring for cleanliness

                        // 3. Perform the async DB query
                        const query = 'INSERT INTO books (title, author) VALUES ($1, $2) RETURNING *';
                        const result = await pool.query(query, [newBook, author]);
                        
                        const addedBook = result.rows[0];

                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                             book: addedBook 
                        }));
                    } catch (err) {
                        console.error("POST Error:", err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: "Failed to add book" }));
                    }
                });
            }
            break;
         default:
            res.writeHead(404,{'content-type': 'text/plain'})
            res.end('...oops ,page not found')
    }



});


server.listen(4000,'localhost',()=>{
   console.log( 'server live @ http//:localhost:4000')
})


