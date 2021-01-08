import { interval, fromEvent, merge, NEVER } from "rxjs";
import {
  scan,
  mapTo,
  map,
  startWith,
  tap,
  switchMap,
  buffer,
  debounceTime,
  filter,
} from "rxjs/operators";

import "./index.css";

const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");

const format = (value) => value.toString().padStart(2, "0");

const print = (txt) => {
  document.getElementById("value").innerHTML = txt;
};

function timeToString(time) {
  const diffInHrs = time / 3600;
  const hh = Math.floor(diffInHrs);

  const diffInMin = (diffInHrs - hh) * 60;
  const mm = Math.floor(diffInMin);

  const diffInSec = (diffInMin - mm) * 60;
  const ss = Math.floor(diffInSec);

  print(`${format(hh)}:${format(mm)}:${format(ss)}`);
}

const showButton = (buttonKey) => {
  const buttonToShow = buttonKey === "start" ? startBtn : stopBtn;
  const buttonToHide = buttonKey === "start" ? stopBtn : startBtn;
  buttonToShow.style.display = "block";
  buttonToHide.style.display = "none";
};

const start$ = fromEvent(startBtn, "click");
const stop$ = fromEvent(stopBtn, "click");
const pause$ = fromEvent(pauseBtn, "click");
const reset$ = fromEvent(resetBtn, "click");

const pauseClick$ = pause$.pipe(
  buffer(pause$.pipe(debounceTime(300))),
  map((list) => list.length),
  filter((x) => x === 2)
);

const events$ = merge(
  start$.pipe(mapTo({ count: true })),
  stop$.pipe(mapTo({ count: false, value: 0 })),
  pauseClick$.pipe(mapTo({ count: false })),
  reset$.pipe(mapTo({ count: true, value: 0 }))
);

const timer$ = events$.pipe(
  startWith({
    count: false,
    value: 0,
  }),
  scan((state, curr) => ({ ...state, ...curr }), {}),
  tap((state) => timeToString(state.value)),
  switchMap((state) => {
    if (state.count) {
      showButton("stop");
      return interval(1000).pipe(
        tap((_) => (state.value += 1)),
        tap((_) => timeToString(state.value))
      );
    } else {
      showButton("start");
      return NEVER;
    }
  })
);

timer$.subscribe();
