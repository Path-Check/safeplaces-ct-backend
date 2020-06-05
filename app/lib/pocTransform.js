// input:      array of Point of Concern data in discreet format
// output:  array of Point of Concern data in duration format

const discreetToDuration = discreetArr => {
  let i, curDiscreet, curDuration;
  const durationArr = [];

  discreetArr.sort((a, b) => (a.time > b.time ? 1 : -1));

  for (i = 0; i < discreetArr.length; i++) {
    curDiscreet = discreetArr[i];
    if (i === 0) {
      durationArr[0] = { ...discreetArr[0], duration: 5 };
    } else {
      curDuration = durationArr[durationArr.length - 1];

      if (discreetMergeCondition(curDiscreet, curDuration)) {
        durationArr[durationArr.length - 1] = discreetMerge(
          curDiscreet,
          curDuration,
        );
      } else {
        durationArr[durationArr.length] = {
          ...curDiscreet,
          duration: 5,
        };
      }
    }
  }

  return roundDuration(durationArr);
};

// input:      array of Point of Concern data in duration format
// output:  array of Point of Concern data in discreet format
const durationToDiscreet = durationArr => {
  durationArr.sort((a, b) => (a.time > b.time ? 1 : -1));

  let i, cur, prv;
  let durationArrMerged = [];
  let discreetArr = [];

  // merge points that intersect one another within a 5 min window
  // NOTE;  duration is not a multiple of 5
  for (i = 0; i < durationArr.length; i++) {
    cur = durationArr[i];
    if (i === 0) {
      durationArrMerged[0] = durationArr[0];
    } else {
      prv = durationArrMerged[durationArrMerged.length - 1];
      if (durationMergeCondition(cur, prv)) {
        durationArrMerged[durationArrMerged.length - 1] = durationMerge(
          cur,
          prv,
        );
      } else {
        durationArrMerged[durationArrMerged.length] = cur;
      }
    }
  }

  durationArrMerged = roundDuration(durationArrMerged);

  for (i = 0; i < durationArrMerged.length; i++) {
    // console.log('durationArrMerged: ', durationArrMerged[i])
    discreetArr = [
      ...discreetArr,
      ...durationPointToDiscreetPoints(durationArrMerged[i]),
    ];
  }

  return discreetArr;
};

const MINUTE = 60 * 1000;

const discreetMergeCondition = (curDiscreet, curDuration) => {
  if (curDiscreet.latitude !== curDuration.latitude) {
    return false;
  }
  if (curDiscreet.longitude !== curDuration.longitude) {
    return false;
  }
  if (curDiscreet.time > curDuration.time + curDuration.duration * MINUTE) {
    return false;
  }
  return true;
};

const discreetMerge = (curDiscreet, curDuration) => {
  const rawDuration =
    (curDiscreet.time + 5 * MINUTE - curDuration.time) / MINUTE;

  return { ...curDuration, duration: rawDuration };
};

const durationMergeCondition = (cur, prv) => {
  if (cur.latitude !== prv.latitude) {
    return false;
  }
  if (cur.longitude !== prv.longitude) {
    return false;
  }
  if (cur.time > prv.time + prv.duration * MINUTE) {
    return false;
  }
  return true;
};

const durationMerge = (cur, prv) => {
  const startTime = prv.time < cur.time ? prv.time : cur.time;
  const endTime =
    cur.time + cur.duration * MINUTE > prv.time + prv.duration * MINUTE
      ? cur.time + cur.duration * MINUTE
      : prv.time + prv.duration * MINUTE;

  return { ...cur, duration: (endTime - startTime) / MINUTE };
};

const durationPointToDiscreetPoints = durationPoint => {
  const discreetPoints = [];
  let i;
  for (i = 0; i < durationPoint.duration / 5; i++) {
    discreetPoints[discreetPoints.length] = {
      latitude: durationPoint.latitude,
      longitude: durationPoint.longitude,
      time: durationPoint.time + i * 5 * MINUTE,
      hash: durationPoint.hash,
      publish_date: durationPoint.publish_date
    };
  }
  return discreetPoints;
};

const roundDuration = durationArr => {
  let i;
  // round down duration to nearest 5 min
  for (i = 0; i < durationArr.length; i++) {
    durationArr[i].duration = Math.floor(durationArr[i].duration / 5) * 5;
  }

  return durationArr;
};

module.exports = {
  discreetToDuration,
  durationToDiscreet
};