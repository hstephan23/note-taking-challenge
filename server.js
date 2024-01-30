const express = require('express');
const path = require('path');
const fs = require('fs');
const storedNotes = require("./db/db.json");
const { v4: uuidv4 } = require('uuid');


const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.static('public'));

// Middleware for parsing application/json and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// setting up the mainpage as the default
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'))
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'))
});

app.get('/api/notes', (req, res) => {
    res.json(storedNotes);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'))
});

app.post('/api/notes', (req, res) => {
    // destructuring the items in req.body
    const { title, text } = req.body;

    if (title && text) {
        const newNote = {
            title,
            text, 
            id: uuidv4(),
        }; 

        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) {
                console.log(err);
            } else {
                const parsedNotes = JSON.parse(data);
                parsedNotes.push(newNote);

                fs.writeFile('./db/db.json', JSON.stringify(parsedNotes, null, 4), 
                    (writeErr) => writeErr ? console.error(writeErr) : console.log("Successfully Added the Note!")
                );
            }
        })
        
        const response = {
            status: 'successfully made note',
            body: newNote,
        }

        console.log(response);
        res.status(200).json(response);
    } else {
        res.status(500).json('Error in saving note!');
    };

    // show the user agent information in the terminal
    console.info(req.rawHeaders);
    // log the request to the terminal
    console.info(`${req.method} request received`);
});

app.listen(PORT, () => 
    console.log(`Express server listneing on port ${PORT}`)
);