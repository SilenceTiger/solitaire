// 生成顺序数组
export const createArr = (n) => {
  let res = [];
  for (let i = 0; i < n; i++) {
    res.push(i);
  }
  return res;
};

// 乱序
export const shuffle = (arr) => {
  for (let i = arr.length; i; i--) {
    let j = Math.floor(Math.random() * i);
    [arr[i - 1], arr[j]] = [arr[j], arr[i - 1]];
  }
  return arr;
};

export function getNumInPx(str) {
  if (str.includes("px")) {
    return parseInt(str.substring(0, str.length - 2));
  } else {
    return parseInt(str || "0");
  }
}

export function getRectByDom(dom) {
  return {
    x: getNumInPx(dom.style.left),
    y: getNumInPx(dom.style.top),
    w: dom.clientWidth,
    h: dom.clientHeight,
  };
}

/**
 *
 * @param rect1 矩形1 {x, y, w, h}
 * @param rect2 矩形2 {x, y, w, h}
 * 判断两个矩形是否相交
 * 规则: 若两个矩形相交, 则两个矩形中心点的距离小于两个矩形边长和的一半
 */
export function isRectIntersection(rect1, rect2) {
  let center1 = {
    x: (rect1.x + rect1.x + rect1.w) / 2,
    y: (rect1.y + rect1.y + rect1.h) / 2,
  };
  let center2 = {
    x: (rect2.x + rect2.x + rect2.w) / 2,
    y: (rect2.y + rect2.y + rect2.h) / 2,
  };
  let dx = Math.abs(center1.x - center2.x);
  let dy = Math.abs(center1.y - center2.y);
  return dx < (rect1.w + rect2.w) / 2 && dy < (rect1.h + rect2.h) / 2;
}

/**
 *
 * @param dom1
 * @param dom2
 * 判断两个dom是否相交
 */
export function isDomIntersection(dom1, dom2) {
  if (!(dom1 && dom2)) return false;
  const rect1 = getRectByDom(dom1);
  const rect2 = getRectByDom(dom2);
  return isRectIntersection(rect1, rect2);
}

export function resolveExchangeList(list, fromId, toId) {
  let fromGroup = list.filter((group) => group.includes(+fromId));
  let toGroup = list.filter((group) => group.includes(+toId));
  fromGroup[0].splice(fromGroup[0].length - 1, 1);
  toGroup[0].push(+fromId);
  return list;
}
