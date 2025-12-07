
const startBtn = document.querySelector('.startBtn');
const stopBtn = document.querySelector('.stopBtn');
const saveBtn = document.querySelector('.saveNote');
const textArea = document.querySelector('.text-area');
const notesList = document.getElementById('notesList');
const emptyState = document.querySelector('.empty-state');
    
// SpeechRecognition initialization
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// to check if browser doesn't support SpeechRecognition API
if (!SpeechRecognition) {
    alert("Your browser does not support speechRecognition.");
}

const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

let previousText = "";

// to load saved notes using LocalStorage
// took help where stuck
document.addEventListener('DOMContentLoaded', function(){
    const savedNotes = JSON.parse(localStorage.getItem('voiceNotes')) || [];
    if (savedNotes.length > 0) {
        emptyState.style.display = 'none';
        for (let i = savedNotes.length - 1; i >= 0; i--) {
            renderNoteToDOM(savedNotes[i]);
        }
    }
});


startBtn.addEventListener('click', function(){
    previousText = textArea.value; 
    if (previousText.length > 0 && !previousText.endsWith(" ")) {
        previousText += " "; 
    }
    try {
        recognition.start();
        startBtn.style.backgroundColor = "#5bb300"; 
        startBtn.innerHTML = '<i class="fa-solid fa-microphone-lines"></i> Listening...';
    } catch (error) { 
        console.log(error); }
});

stopBtn.addEventListener('click', function(){
    recognition.stop();
    startBtn.style.backgroundColor = "#70e000"; 
    startBtn.innerHTML = '<i class="fa-solid fa-record-vinyl"></i>Start Listening';
});

recognition.onresult = function(event){
    let currentSessionTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
        currentSessionTranscript += event.results[i][0].transcript;
    }
    textArea.value = previousText + currentSessionTranscript;
};

// saving notes
saveBtn.addEventListener('click', function(){
    const noteContent = textArea.value.trim();
    if (noteContent === "") {
        alert("Please say something or type a note before saving.");
        return;
    }

    const newNote = {
        id: Date.now(),
        content: noteContent
    };

    saveToLocalStorage(newNote);
    emptyState.style.display = 'none';
    renderNoteToDOM(newNote); 
    
    textArea.value = "";
    previousText = "";
});



function saveToLocalStorage(note) {
    const notes = JSON.parse(localStorage.getItem('voiceNotes')) || [];
    notes.push(note); 
    localStorage.setItem('voiceNotes', JSON.stringify(notes));
}

function renderNoteToDOM(note) {
    const noteItem = document.createElement('div');
    noteItem.classList.add('saved-note-item');
    noteItem.setAttribute('data-id', note.id);

    noteItem.innerHTML = `
        <div class="note-content">${note.content}</div>
        <div class="note-footer">
            <div class="note-actions">
                <button class="action-btn edit-btn" onclick="editNote(${note.id}, this)">
                    <i class="fa-solid fa-pen-to-square"></i> Edit
                </button>
                <button class="action-btn delete-btn" onclick="deleteNote(${note.id}, this)">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;

    if(notesList.firstChild && notesList.firstChild.className !== 'empty-state'){
       notesList.insertBefore(noteItem, notesList.firstChild);
    } else {
       notesList.appendChild(noteItem);
    }
}

// to delete saved notes
window.deleteNote = function(id, btnElement) {
    let notes = JSON.parse(localStorage.getItem('voiceNotes')) || [];
    notes = notes.filter(note => note.id !== id);
    localStorage.setItem('voiceNotes', JSON.stringify(notes));

    const noteItem = btnElement.closest('.saved-note-item');
    noteItem.remove();

    if (notes.length === 0) {
        emptyState.style.display = 'block';
    }
}

// to edit saved notes
window.editNote = function(id, btnElement) {
    const noteItem = btnElement.closest('.saved-note-item');
    const contentDiv = noteItem.querySelector('.note-content');
    const isEditing = contentDiv.isContentEditable;

    if (!isEditing) {
        contentDiv.contentEditable = "true";
        contentDiv.focus();
        btnElement.innerHTML = '<i class="fa-solid fa-check"></i> Save';
        btnElement.style.backgroundColor = "#2ec4b6"; 
    } else {
        const newContent = contentDiv.innerText.trim();
        
        let notes = JSON.parse(localStorage.getItem('voiceNotes')) || [];
        const noteIndex = notes.findIndex(note => note.id === id);
        
        if (noteIndex > -1) {
            notes[noteIndex].content = newContent;
            localStorage.setItem('voiceNotes', JSON.stringify(notes));
        }

        contentDiv.contentEditable = "false";
        btnElement.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit';
        btnElement.style.backgroundColor = "#ffc300"; 
    }
}