import React, { useState, useMemo, useEffect, useLayoutEffect } from "react";
import Card, { EmptyCard, ASPECT_RATIO } from "./Card";
import {
  createArr,
  shuffle,
  isDomIntersection,
  resolveExchangeList,
} from "./utils";
import classnames from "classnames";
import { debounce } from "lodash";
import "./game.scss";

/**
 * relation: 7 * width + 6 * padding + 2 * margin = containerWidth
 * init: 7 * 70 + 6 * 20 + 2 * 45 = 700
 */

let DRAG_CARD;

function Game() {
  // 布局属性
  const [width, setWidth] = useState(70);
  const [padding, setPadding] = useState(20);
  const [margin, setMargin] = useState(45);
  const [split, setSplit] = useState(26);
  const [marginTop1, setMarginTop1] = useState(40);
  const [marginTop2, setMarginTop2] = useState(40);
  // 空位置
  const originEmptyCardList = useMemo(() => {
    let res = [];
    let top = marginTop1;
    for (let i = 0; i < 2; i++) {
      res.push({
        top: top,
        left: margin + (padding + width) * i,
      });
    }
    return res;
  }, [marginTop1, margin, padding, width]);
  const targetEmptyCardList = useMemo(() => {
    let res = [];
    let top = marginTop1;
    for (let i = 3; i < 7; i++) {
      res.push({
        top: top,
        left: margin + (padding + width) * i,
      });
    }
    return res;
  }, [marginTop1, margin, padding, width]);
  const exchangeEmptyCardList = useMemo(() => {
    let res = [];
    let top = marginTop1 + marginTop2 + width * ASPECT_RATIO;
    for (let i = 0; i < 7; i++) {
      res.push({
        top: top,
        left: margin + (padding + width) * i,
      });
    }
    return res;
  }, [marginTop1, marginTop2, margin, padding, width]);
  // 原始数组
  const [originList, setOriginList] = useState([]);
  const [targetList, setTargetList] = useState([[], [], [], []]);
  const [exchangeList, setExchangeList] = useState([]);
  const [showList, setShowList] = useState([]);

  const exchangeTop = useMemo(() => {
    return marginTop1 + marginTop2 + width * ASPECT_RATIO;
  }, [marginTop1, marginTop2, width]);

  useEffect(() => {
    let arr = shuffle(createArr(52));
    const getList = (arr) => {
      let exchange = [];
      let origin = [];
      let show = [];
      let index = 0;
      for (let i = 0; i < 7; i++) {
        let temp = [];
        for (let j = 0; j <= i; j++) {
          temp.push(arr[index++]);
        }
        show.push(temp[temp.length - 1]);
        exchange.push(temp);
      }
      origin = arr.slice(index);
      return { exchange, origin, show };
    };
    const list = getList(arr);
    setExchangeList(list.exchange);
    setOriginList([list.origin, []]);
    setShowList(list.show);
  }, []);

  useLayoutEffect(() => {
    const CONTAINER = document.querySelector(".game-wrap");
    const mouseMove = (e) => {
      if (DRAG_CARD) {
        DRAG_CARD.dom.style.zIndex = 10;
        DRAG_CARD.dom.style.left = `${
          e.pageX - CONTAINER.getBoundingClientRect().left - DRAG_CARD.shiftX
        }px`;
        DRAG_CARD.dom.style.top = `${
          e.pageY - CONTAINER.getBoundingClientRect().top - DRAG_CARD.shiftY
        }px`;
        // 判断dom 是否与可drop dom相交 找到可drop dom
        let dropDoms = [...document.querySelectorAll(".drop")];
        let intersectionDoms = dropDoms.filter((dom) => {
          dom.classList.remove("shadow");
          return (
            DRAG_CARD.dom.id !== dom.id && isDomIntersection(DRAG_CARD.dom, dom)
          );
        });
        if (intersectionDoms.length === 1) {
          intersectionDoms[0].classList.add("shadow");
        }
      }
    };

    document.addEventListener("mousemove", mouseMove);
    return () => {
      document.removeEventListener("mousemove", mouseMove);
    };
  }, []);

  // function
  const switchCard = (group, card, i, j) => {
    let from = originList[0].slice();
    let to = originList[1].slice();
    if (i === 0 && j === group.length - 1) {
      from.splice(from.length - 1, 1);
      to.push(card);
    }
    if (from.length === 0) {
      from = to.reverse();
      to = [];
    }
    setOriginList([from, to]);
  };

  const cardMouseDown = (e, group, card, i, j) => {
    if (e.currentTarget.className.includes('show')) {
      DRAG_CARD = {
        dom: e.currentTarget,
        shiftX: e.pageX - e.currentTarget.getBoundingClientRect().left,
        shiftY: e.pageY - e.currentTarget.getBoundingClientRect().top,
      };
    }
    e.stopPropagation();
  };

  const cardMouseUp = (e, group, card, i, j) => {
    let _list = exchangeList.slice();
    let dropDoms = [...document.querySelectorAll(".drop")];
    let intersectionDoms = dropDoms.filter((dom) => {
      dom.classList.remove("shadow");
      return (
        DRAG_CARD.dom.id !== dom.id && isDomIntersection(DRAG_CARD.dom, dom)
      );
    });
    if (intersectionDoms.length === 1) {
      let targetDom = intersectionDoms[0];
      if (targetDom.id) {
        let fromId = DRAG_CARD.dom.id;
        let toId = targetDom.id;
        if (targetDom.className.includes("exchange")) {
          resolveExchangeList(_list, fromId, toId);
        }
      }
    }
    setExchangeList(_list);
    DRAG_CARD = undefined;
    e.stopPropagation();
  };

  useEffect(() => {
    const autoLayout = () => {
      setTimeout(() => {
        exchangeList.forEach((group, i) => {
          group.forEach((card, j) => {
            let target = document.getElementById(card);
            if (target) {
              target.style.top = exchangeTop + j * split + "px";
              target.style.left = margin + i * (padding + width) + "px";
              target.style.display = "block";
            }
          });
        });
      });
    };
    const autoLayoutFn = debounce(autoLayout, 10);
    autoLayoutFn();
    return () => {
      autoLayoutFn.cancel();
    };
  }, [exchangeList, exchangeTop, margin, padding, split, width]);

  return (
    <div className="game-wrap">
      {originEmptyCardList.map((card, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: card.left,
            top: card.top,
          }}
        >
          <EmptyCard width={width} />
        </div>
      ))}

      {targetEmptyCardList.map((card, index) => (
        <div
          className="target-card-box"
          key={index}
          style={{
            position: "absolute",
            left: card.left,
            top: card.top,
          }}
        >
          <EmptyCard width={width} number={index} />
        </div>
      ))}

      {exchangeEmptyCardList.map((card, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: card.left,
            top: card.top,
          }}
        >
          <EmptyCard width={width} />
        </div>
      ))}

      {originList.map((group, i) =>
        group.map((card, j) => (
          <div
            key={j}
            className={classnames("card-box", { show: i === 1 })}
            onClick={() => switchCard(group, card, i, j)}
            style={{
              position: "absolute",
              cursor: "pointer",
              top: marginTop1 + (j / 8) * (i - 1),
              left: margin + (padding + width) * i - (j / 5) * (i - 1),
            }}
          >
            <Card width={width} number={-1} />
            <Card width={width} number={card} />
          </div>
        ))
      )}

      {exchangeList.map((group, i) =>
        group.map((card, j) => (
          <div
            id={card}
            key={j}
            className={classnames(
              "card-box",
              "exchange",
              { show: showList.includes(card) },
              { drop: group.length && group.length - 1 === j }
            )}
            onMouseDown={(e) => cardMouseDown(e, group, card, i, j)}
            onMouseUp={(e) => cardMouseUp(e, group, card, i, j)}
            style={{
              display: "none",
            }}
          >
            <Card width={width} number={-1} />
            <Card width={width} number={card} />
          </div>
        ))
      )}
    </div>
  );
}

export default Game;
