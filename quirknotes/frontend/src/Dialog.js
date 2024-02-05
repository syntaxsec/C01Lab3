import React, {useState, useEffect} from "react"
import './App.css';

const baseNote = {title: "", content: ""}

function Dialog({open, initialNote, closeDialog, postNote: postNoteState}) {

    // -- Dialog props --
    const [note, setNote] = useState(baseNote)
    const [status, setStatus] = useState("")

    // -- Dialog functions --
    useEffect(() => {
        !initialNote && setNote(baseNote)
        initialNote && setNote(initialNote)
    }, [initialNote])

    const close = () => {
        setStatus("")
        setNote(baseNote)
        closeDialog()
    }

    // -- Database interaction functions --
    const postNote = async () => {
        if (!note || !note.title || !note.content) {
            return 
        }

        setStatus("Loading...")

        try {
            await fetch("http://127.0.0.1:4000/postNote",
                {method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({title: note.title, content: note.content})} )
            .then(async (response) => {
                if (!response.ok) {
                    setStatus(`Error trying to post note`)
                    console.log("Served failed:", response.status)
                } else {
                    await response.json().then((data) => {
                        postNoteState(data.insertedId, note.title, note.content)
                        //setStatus("Note posted!") // Can be replaced with close(), if you want!
                        close()
                    }) 
                }
            })
        } catch (error) {
            setStatus("Error trying to post note")
            console.log("Fetch function failed:", error)
        } 
    }

    const patchNote = async (entry) => {
        // Code for PATCH here
        setStatus("loading");
        if ( !note.title || !note.content || !note ) {
            console.log("Error: patchNote received a null value");
            return;
        }
        setStatus("Failed");
        
        try {
            await fetch(`http://127.0.0.1/patchNote/${note._id}`, { method: "PATCH", headers: {"Content-Type": "application/json", 
            body: JSON.stringify({ title: note.title, content: note.content }), } }).then(async(response) => {
                if (response.ok) {
                    await response.json().then((data) => {
                        patchNoteState(note._id, note.title, note.content);
                        close();
                    });
                } else {
                    console.log("Server failed:", response.status);
                    setStatus("Error");
                }
            }); 
        } catch (error) {
            console.log("Error", error);
            setStatus("Error.");
        }
    };

    return (
        <dialog open={open} style={DialogStyle.dialog}>
            <input
                placeholder="Your note title goes here!"
                type="text"
                value={note.title}
                maxLength={30}
                style={DialogStyle.title}
                onChange={(e) => setNote({...note, title: e.target.value})}
            />
            <textarea
                placeholder="Your note content goes here!"
                value={note.content}
                rows={5}
                style={DialogStyle.content}
                onChange={(e) => setNote({...note, content: e.target.value})}
            />
            <div style={DialogStyle.buttonWrapper}>
                <button
                    onClick={initialNote ? patchNote : postNote}
                    disabled={!note.title || !note.content}>
                    {initialNote ? 'Patch Note' : 'Post Note'}
                </button>
                {status}
                <button
                    style={DialogStyle.closeButton}
                    onClick={() => close()}
                >
                    Close
                </button>
            </div>
        </dialog>
    )

}

export default Dialog;

const DialogStyle = {
    dialog: {width: "75%"},
    title: {
        fontSize: "40px", 
        display: "block", 
        width: "100%"
    },
    content: {
        fontSize: "20px", 
        display: "block", 
        width: "100%"
    },
    buttonWrapper: {
        display: "flex", 
        justifyContent: "space-between", 
        gap: "10px"
    },
    closeButton: {justifySelf: "end"}
}