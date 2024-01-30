// required pieces for everything to work 
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

// setting up the notes page
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'))
});

// allowing you to get data about the notes, need to read the file so that the file information is updated everytime
app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json('Error reading notes data');
        } else {
            const parsedNotes = JSON.parse(data);
            res.json(parsedNotes);
        }
    });
});

// allowing you to delete it
app.delete('/api/notes/:id', (req, res) => {
    const noteID = req.params.id;
    // pulls the index if it exists of the note that has an id equal to the note id 
    const noteIndex = storedNotes.findIndex(note => note.id === noteID);

    if (noteIndex !== -1) {
        storedNotes.splice(noteIndex, 1);
        // writes to the file the updated notes
        fs.writeFile('./db/db.json', JSON.stringify(storedNotes, null, 4), (writeErr) => {
            if (writeErr) {
                console.log(writeErr);
                res.status(500).json('Error in deleting note!');
            } else {
                console.log('Successfully deleted the note!');
                res.status(200).json('Successfully deleted the note!')
            }
        })
    } else {
        res.status(404).json('Note not found!');
    }
})

// as a final precaution taking back to main page if the element after it doesn't exist in what was already covered
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'))
});

app.post('/api/notes', (req, res) => {
    // destructuring the items in req.body
    const { title, text } = req.body;
    // veriftying that the destructured items are there
    if (title && text) {
        const newNote = {
            title,
            text, 
            id: uuidv4(),
        }; 
        // reading the file that already exists and updating the information inside of it 
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) {
                console.log(err);
            } else {
                const parsedNotes = JSON.parse(data);
                parsedNotes.push(newNote);
                // overwriting the old file with the new information
                fs.writeFile('./db/db.json', JSON.stringify(parsedNotes, null, 4), 
                    (writeErr) => writeErr ? console.error(writeErr) : console.log("Successfully Added the Note!")
                );
            }
        })
        // defining the response that the user will receive 
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
    console.log(`Express server listening on port ${PORT}`)
);