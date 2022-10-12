import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SingleNote from "../SingleNote/SingleNote";
import { notesActions } from "../../../store/note-slice";
import classes from "./UserNotes.module.scss";
import { sendNotesToFirebase } from "../../../helpers/AllHelpers";

const UserNotes = () => {
  const [error, setError] = useState(null);
  const [filteredNotes, setFilteredNotes] = useState([]);

  const dispatch = useDispatch();

  // Fetching user notes from database(firebase):
  useEffect(() => {
    const fetchUserNotes = async () => {
      const response = await fetch(
        `https://notes-90ac8-default-rtdb.firebaseio.com/notes.json`
      );

      // Check for errors:
      if (!response.ok)
        throw new Error("Fetch notes from database was failed!");

      const fetchedNotes = await response.json();

      // Loop on fetchedNotes to extract all note objects into a new array:
      const notesArray = [];
      for (const note in fetchedNotes) {
        notesArray.push(fetchedNotes[note]);
      }

      // Store notesArray in Redux store:
      dispatch(notesActions.addNotesArr(notesArray));
    };

    fetchUserNotes().catch((error) => {
      setError(error);
    });
  }, [dispatch]);

  const userNotes = useSelector((state) => state.note.notes);
  const totalUserNotes = useSelector((state) => state.note.totalNotes);
  // Search for a specific note by title.
  let searchedNote = [];
  const changeSearchHandler = (e) => {
    searchedNote = userNotes.filter((note) =>
      note.title.includes(e.target.value)
    );
    setFilteredNotes(searchedNote);
  };

  // Delete a note by double click:
  const deleteNoteHandler = (id) => {
    // First step: delete from Redux store.
    const theRestOfTheNotes = userNotes.filter(
      (deletedNote) => deletedNote.title !== id
    );

    /* Second step:delete from database by sending a new notes array 
    but with method:'PUT',
    to replace the current notes array in database by the new one here */
    sendNotesToFirebase(theRestOfTheNotes, "PUT");
  };

  // Mapping on userNotes.
  const existingNotes = userNotes.map((note) => (
    <SingleNote
      key={note.title}
      title={note.title}
      content={note.content}
      deleteNote={deleteNoteHandler}
    />
  ));

  const returnedNotes = filteredNotes.map((note) => (
    <SingleNote
      key={note.title}
      title={note.title}
      content={note.content}
      deleteNote={deleteNoteHandler}
    />
  ));

  return (
    <div className={classes["user-notes"]}>
      {totalUserNotes === 0 && (
        <p className={classes["no-notes"]}>
          You have no notes, <Link to="/add-new-note">Add one?</Link>
        </p>
      )}
      {error && <p className={classes.error}>{error}</p>}
      {totalUserNotes !== 0 && !error && (
        <div className={classes["all-notes"]}>
          <input
            type="search"
            placeholder="Search by the title"
            onChange={changeSearchHandler}
          />
          <div className={classes["total-button-box"]}>
            <h4>
              Your Notes are{" "}
              <span className={classes.signs}>
                &lt;
                <span className={classes.number}> {totalUserNotes} </span>
                &gt;
              </span>
            </h4>
            <Link to="/add-new-note">Add another one?</Link>
          </div>
          <ul>
            {filteredNotes.length > 0 && returnedNotes}
            {filteredNotes.length === 0 && existingNotes}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserNotes;
