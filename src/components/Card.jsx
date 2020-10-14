import React from "react";
import "./card.scss";

export const ASPECT_RATIO = 1.4; // card 宽高比
export const CARD_ARR = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];
export const SUIT_ARR = ["♦", "♣", "♥", "♠"];

const getCardByNumber = (number) => {
  let count = number % CARD_ARR.length;
  let suit = parseInt(number / CARD_ARR.length);
  return { suit, count };
};

function Card({ number, width }) {
  let card = getCardByNumber(number);
  return (
    <>
      {number === -1 ? (
        <div
          className="card back"
          style={{
            width: width,
            height: width * ASPECT_RATIO,
          }}
        ></div>
      ) : (
        <div
          className="card"
          style={{
            width: width,
            height: width * ASPECT_RATIO,
            color: [0, 2].includes(card.suit) ? "#ee3333" : "#010101",
          }}
        >
          <span className="text">{CARD_ARR[card.count]}</span>
          <span className="icon-mini">{SUIT_ARR[card.suit]}</span>
          <span className="icon-large">{SUIT_ARR[card.suit]}</span>
        </div>
      )}
    </>
  );
}

export function EmptyCard({ number, width }) {
  return (
    <div
      className="card empty"
      style={{
        width: width,
        height: width * ASPECT_RATIO,
        color: [0, 2].includes(number) ? "#ee3333" : "#010101",
      }}
    >
      {SUIT_ARR[number] && <span className="icon-large">{SUIT_ARR[number]}</span>}
    </div>
  );
}

export default Card;
