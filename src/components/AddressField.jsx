import { useEffect, useId, useRef, useState } from 'react';
import { api } from '../api';

function Combo({ id, label, placeholder, value, chosen, disabled, busy, items, emptyText, onText, onPick }) {
  const listId = useId();
  const boxRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    function onDoc(e) {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    setActive(0);
    if (items.length) setOpen(true);
  }, [items]);

  function choose(item) {
    setOpen(false);
    onPick(item);
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && open && items.length) {
      e.preventDefault();
      choose(items[active]);
      return;
    }
    if (!open || !items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="field address-combo" ref={boxRef}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onText(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (items.length) setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      {chosen ? <p className="address-picked">נבחר מהרשימה</p> : null}
      {open && !disabled && (items.length > 0 || emptyText) ? (
        <ul className="address-list" id={listId} role="listbox">
          {items.map((item, index) => (
            <li key={item}>
              <button
                type="button"
                role="option"
                aria-selected={index === active}
                className={index === active ? 'is-active' : ''}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(item)}
              >
                {item}
              </button>
            </li>
          ))}
          {!busy && emptyText ? <li className="address-empty">{emptyText}</li> : null}
        </ul>
      ) : null}
    </div>
  );
}

export default function AddressField({ street, city, chosen, onPick, onClear }) {
  const [cityText, setCityText] = useState(city || '');
  const [cityChosen, setCityChosen] = useState(Boolean(chosen && city));
  const [streetText, setStreetText] = useState(street || '');
  const [streetChosen, setStreetChosen] = useState(Boolean(chosen && street));
  const [cities, setCities] = useState([]);
  const [streets, setStreets] = useState([]);
  const [cityBusy, setCityBusy] = useState(false);
  const [streetBusy, setStreetBusy] = useState(false);
  const [cityEmpty, setCityEmpty] = useState(false);
  const [streetEmpty, setStreetEmpty] = useState(false);

  useEffect(() => {
    if (cityChosen) return undefined;
    const q = cityText.trim();
    if (q.length < 1) {
      setCities([]);
      setCityEmpty(false);
      return undefined;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setCityBusy(true);
      try {
        const data = await api.suggestCities(q);
        if (ctrl.signal.aborted) return;
        const next = Array.isArray(data.cities) ? data.cities : [];
        setCities(next);
        setCityEmpty(next.length === 0);
      } catch {
        if (ctrl.signal.aborted) return;
        setCities([]);
        setCityEmpty(true);
      } finally {
        if (!ctrl.signal.aborted) setCityBusy(false);
      }
    }, 180);
    return () => {
      ctrl.abort();
      clearTimeout(timer);
    };
  }, [cityText, cityChosen]);

  useEffect(() => {
    if (!cityChosen || streetChosen) return undefined;
    const q = streetText.trim();
    if (q.length < 1) {
      setStreets([]);
      setStreetEmpty(false);
      return undefined;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setStreetBusy(true);
      try {
        const data = await api.suggestStreets(cityText, q);
        if (ctrl.signal.aborted) return;
        const next = Array.isArray(data.streets) ? data.streets.map((row) => row.street) : [];
        setStreets(next);
        setStreetEmpty(next.length === 0);
      } catch {
        if (ctrl.signal.aborted) return;
        setStreets([]);
        setStreetEmpty(true);
      } finally {
        if (!ctrl.signal.aborted) setStreetBusy(false);
      }
    }, 220);
    return () => {
      ctrl.abort();
      clearTimeout(timer);
    };
  }, [streetText, streetChosen, cityChosen, cityText]);

  return (
    <div className="address-field">
      <Combo
        id="s-city"
        label="יישוב"
        placeholder="הקלידי ובחרי יישוב מהרשימה"
        value={cityText}
        chosen={cityChosen}
        busy={cityBusy}
        items={cities}
        emptyText={cityEmpty ? 'אין יישוב כזה. יש לבחור מהרשימה' : ''}
        onText={(value) => {
          setCityText(value);
          setCityChosen(false);
          setCityEmpty(false);
          setStreetText('');
          setStreetChosen(false);
          setStreets([]);
          onClear();
        }}
        onPick={(name) => {
          setCityText(name);
          setCityChosen(true);
          setCities([]);
          setCityEmpty(false);
          setStreetText('');
          setStreetChosen(false);
          onClear();
          api.suggestStreets(name, '').catch(() => {});
        }}
      />
      <Combo
        id="s-street"
        label="רחוב"
        placeholder={cityChosen ? 'הקלידי ובחרי רחוב מהרשימה' : 'קודם בוחרים יישוב'}
        value={streetText}
        chosen={streetChosen}
        disabled={!cityChosen}
        busy={streetBusy}
        items={streets}
        emptyText={streetEmpty ? 'אין רחוב כזה ביישוב שנבחר' : ''}
        onText={(value) => {
          setStreetText(value);
          setStreetChosen(false);
          setStreetEmpty(false);
          onClear();
        }}
        onPick={(name) => {
          setStreetText(name);
          setStreetChosen(true);
          setStreets([]);
          setStreetEmpty(false);
          onPick({ street: name, city: cityText });
        }}
      />
    </div>
  );
}
