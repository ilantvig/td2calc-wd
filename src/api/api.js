export function updateHash(name, value) {
  // console.log(`called: updateHash('${name}', '${value}')`);
  const urlParams = new URLSearchParams(window.location.hash.slice(1));
  urlParams.set(name, value);
  window.location.hash = urlParams.toString();
}

export function getHashValue(name) {
  // console.log(`called: getHashValue('${name}')`);
  const urlParams = new URLSearchParams(window.location.hash.slice(1));
  return urlParams.get(name);
}

export function boolArrToInt32(arr) {
  return arr.reduce((s, e, i) => s + (e ? 1 << i : 0), 0);
}

export function int32ToBoolArr(num, arr_size) {
  let result = [];
  if (arr_size === undefined) {
    console.log("arr_size === undefined");
  }
  for (let i = 0; i < arr_size; i++) {
    result.push(Boolean(num & (1 << i)));
  }
  return result;
}

export function filterArray(arr, mask_arr) {
  return arr.reduce((r, e, i) => (mask_arr[i] ? [...r, e] : [...r]), []);
}

export function comparisonSign(a, b) {
  if (+a > +b) {
    return ">";
  } else if (+a < +b) {
    return "<";
  } else {
    return "=";
  }
}

export function shortNumber(value) {
  value = +value;
  if (value < 1000) {
    return value;
  } else if (value < 1000000) {
    return (value / 1000).toFixed(1) + " k";
  } else {
    return (value / 1000000).toFixed(1) + " M";
  }
}

export function isCorrectInput(number) {
  return (
    typeof number == "number" &&
    // number == Math.round(number) &&
    0 <= number &&
    number <= 1000000
  );
}
