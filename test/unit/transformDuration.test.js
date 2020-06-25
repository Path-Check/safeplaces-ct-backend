process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const randomCoordinates = require('random-coordinates');

const transform = require('../../app/lib/pocTransform.js');

const mockData = require('../lib/mockData');

function getRandomCoordinates() {
  const coords = randomCoordinates({ fixed: 5 }).split(',');
  return {
    longitude: parseFloat(coords[1]),
    latitude: parseFloat(coords[0]),
  };
}

describe('Points of Concern', () => {
  it('should group and ungroup a simple set of coordinates', async () => {
    const coordinates = {
      longitude: 14.91328448,
      latitude: 41.24060321,
    };

    const startTime = new Date().getTime() - 86400000 * 30;

    const trails = mockData._generateGroupedTrailsData(
      coordinates,
      startTime,
      25,
    );
    const grouped = transform.discreetToDuration(trails);
    const ungrouped = transform.durationToDiscreet(grouped);

    expect(trails.length).to.be.equal(5);
    expect(grouped.length).to.be.equal(1);
    expect(ungrouped.length).to.be.equal(5);

    expect(grouped[0].longitude).to.be.equal(trails[0].longitude);
    expect(ungrouped[0].longitude).to.be.equal(grouped[0].longitude);
    expect(ungrouped[0].longitude).to.be.equal(trails[0].longitude);
  });

  it('should group and ungroup a more complex set of coordinates', async () => {
    const startTime = new Date().getTime() - 86400000 * 30;

    let final = [];
    let testGrouping;

    // Start One month ago, and add 25 minutes.
    const groupOne = mockData._generateGroupedTrailsData(
      getRandomCoordinates(),
      startTime,
      25,
    );
    final = final.concat(groupOne);
    testGrouping = transform.discreetToDuration(groupOne);
    expect(groupOne.length).to.be.equal(5);
    expect(testGrouping.length).to.be.equal(1);

    // Start 5 minutes after the last trail point and add 100 random points in 5 min increments
    const randomTrails = mockData._generateTrailsData(
      100,
      300,
      groupOne[4].time + 300000,
      false,
    );
    final = final.concat(randomTrails);
    expect(randomTrails.length).to.be.equal(100);

    // Create another grouping for 45 min
    const groupTwo = mockData._generateGroupedTrailsData(
      getRandomCoordinates(),
      randomTrails[99].time + 300000,
      45,
    );
    final = final.concat(groupTwo);
    testGrouping = transform.discreetToDuration(groupTwo);
    expect(groupTwo.length).to.be.equal(9);
    expect(testGrouping.length).to.be.equal(1);

    // Start 5 minutes after the last trail point and add 250 random points in 5 min increments
    const randomTrailsTwo = mockData._generateTrailsData(
      250,
      300,
      groupTwo[4].time + 300000,
      false,
    );
    expect(randomTrailsTwo.length).to.be.equal(250);
    final = final.concat(randomTrailsTwo);

    // Create another grouping for 15 min
    const groupThree = mockData._generateGroupedTrailsData(
      getRandomCoordinates(),
      randomTrailsTwo[99].time + 300000,
      15,
    );
    final = final.concat(groupThree);
    testGrouping = transform.discreetToDuration(groupThree);
    expect(groupThree.length).to.be.equal(3);
    expect(testGrouping.length).to.be.equal(1);

    expect(final.length).to.be.equal(367);

    // Check that when it groups, it adds the 350 random points to the 3 grouped points
    const grouped = transform.discreetToDuration(final);
    expect(grouped.length).to.be.equal(353);

    // When reverted it equals the original length.
    const ungrouped = transform.durationToDiscreet(grouped);
    expect(ungrouped.length).to.be.equal(367);
  });
});
