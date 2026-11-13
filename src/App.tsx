import { useCallback, useEffect, useState } from "react";
import { isComplete } from "./analysis";
import { Rate } from "./Rate";
import { Results } from "./Results";
import {
  getMyId, isShared, listRoom, newRoomCode, saveParticipant, setMyId, type Participant, type Ratings,
} from "./store";

const roomFromHash = () => /^#\/r\/([a-z]{4})$/i.exec(location.hash)?.[1].toUpperCase() ?? null;

export default function App() {
  const [room, setRoom] = useState(roomFromHash);
  useEffect(() => {
    const onHash = () => setRoom(roomFromHash());
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, []);

  return (
    <main>
      <header className="masthead">
        <a href="#/" className="brand">Art Compare</a>
        {room && <span className="room-tag">Room {room}</span>}
      </header>
      {!isShared && (
        <p className="notice">
          Demo mode: no shared database is configured, so rooms only exist in this browser.
        </p>
      )}
      {room ? <Room key={room} code={room} /> : <Home />}
    </main>
  );
}

function Home() {
  const [code, setCode] = useState("");
  const clean = code.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
  return (
    <section className="home">
      <h1>What do you actually like?</h1>
      <p className="lede">
        React to 30 paintings, see what your taste leans toward, then compare with a friend:
        what you both love, and where you split.
      </p>
      <div className="home-actions">
        <button className="primary" onClick={() => (location.hash = `#/r/${newRoomCode()}`)}>
          Start a new room
        </button>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (clean.length === 4) location.hash = `#/r/${clean}`;
          }}
        >
          <label htmlFor="code">Or join with a code</label>
          <div className="row">
            <input
              id="code" value={clean} onChange={(e) => setCode(e.target.value)}
              placeholder="ABCD" autoComplete="off" autoCapitalize="characters" maxLength={4}
            />
            <button disabled={clean.length !== 4}>Join</button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Room({ code }: { code: string }) {
  const [people, setPeople] = useState<Participant[] | null>(null);
  const [myId, setMine] = useState(() => getMyId(code));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const rows = await listRoom(code);
      // Keep my own in-progress ratings; the server copy may lag a save.
      setPeople((prev) => {
        const mine = prev?.find((p) => p.id === getMyId(code));
        return mine ? rows.map((r) => (r.id === mine.id ? mine : r)) : rows;
      });
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [code]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, [refresh]);

  const me = people?.find((p) => p.id === myId) ?? null;

  const save = async (p: Participant) => {
    setPeople((prev) => [...(prev ?? []).filter((x) => x.id !== p.id), p]);
    try {
      await saveParticipant(p);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (!people) return <p className="status">{error ? `Could not load the room: ${error}` : "Loading…"}</p>;

  if (!me) {
    return (
      <Join
        others={people}
        onJoin={(name) => {
          const p: Participant = { id: crypto.randomUUID(), room_code: code, name, ratings: {} };
          setMyId(code, p.id);
          setMine(p.id);
          save(p);
        }}
      />
    );
  }

  const setRatings = (ratings: Ratings) => save({ ...me, ratings });

  return (
    <>
      {error && <p className="notice error">Not saved: {error}. Your next rating will retry.</p>}
      {isComplete(me.ratings) ? (
        <Results me={me} people={people} code={code} onRedo={() => setRatings({})} />
      ) : (
        <Rate me={me} onChange={setRatings} />
      )}
    </>
  );
}

function Join({ others, onJoin }: { others: Participant[]; onJoin: (name: string) => void }) {
  const [name, setName] = useState("");
  const trimmed = name.trim();
  const taken = others.some((p) => p.name.toLowerCase() === trimmed.toLowerCase());
  return (
    <section className="home">
      <h1>Who are you?</h1>
      <p className="lede">
        {others.length
          ? `Already here: ${others.map((p) => p.name).join(", ")}.`
          : "You're the first one in this room."}{" "}
        You'll see 30 paintings with the labels hidden. Go with your gut.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (trimmed && !taken) onJoin(trimmed);
        }}
      >
        <label htmlFor="name">Your name</label>
        <div className="row">
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={24} autoFocus />
          <button className="primary" disabled={!trimmed || taken}>Begin</button>
        </div>
        {taken && <p className="hint">Someone in this room already has that name.</p>}
      </form>
    </section>
  );
}
