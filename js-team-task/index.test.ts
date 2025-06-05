import { parse } from 'date-fns';
import { sortBy } from 'lodash';
import { resolveTimeCollisions } from '.';

function createEvent(id: string, options: { fromTime: string; toTime: string }) {
  return {
    id,
    dateFrom: parse(options.fromTime, 'HH:mm', new Date()),
    dateTo: parse(options.toTime, 'HH:mm', new Date()),
  }
}

const events = [
  createEvent('A', { fromTime: '08:00', toTime: '09:00' }),
  createEvent('B', { fromTime: '08:30', toTime: '10:30' }),
  createEvent('C', { fromTime: '10:00', toTime: '11:00' }),
  createEvent('D', { fromTime: '12:00', toTime: '13:00' }),
  createEvent('E', { fromTime: '13:00', toTime: '14:00' }),
  createEvent('F', { fromTime: '13:00', toTime: '14:00' }),
  createEvent('G', { fromTime: '13:00', toTime: '14:00' }),
];

const collisions = resolveTimeCollisions(events, event => ({
  from: new Date(event.dateFrom),
  to: new Date(event.dateTo)
}));
const [a, b, c, d, e, f, g] = sortBy(collisions, x => x.item.id);

test('A i B powinny być równe i zajmować 50%.', () => {
  expect(a.width).toEqual(b.width);
  expect(a.width).toEqual(0.5);
});

test('A i B nie powinny kolidować.', () => {
  try {
    expect(a.left + a.width).toBeLessThanOrEqual(b.left);
  } catch {
    expect(b.left + b.width).toBeLessThanOrEqual(a.left);
  }
});

test('B i C powinny być równe i zajmować 50%.', () => {
  expect(b.width).toEqual(c.width);
  expect(b.width).toEqual(0.5);
});

test('B i C nie powinny kolidować.', () => {
  try {
    expect(b.left + b.width).toBeLessThanOrEqual(c.left);
  } catch {
    expect(c.left + c.width).toBeLessThanOrEqual(b.left);
  }
});

test('D powinno zająć 100%.', () => {
  expect(d.left).toEqual(0);
  expect(d.width).toEqual(1);
});

test('E, F i G powinny być umieszczone obok siebie w jednym rzędzie i zajmować 1/3.', () => {
  expect(e.left).toEqual(0 * (1 / 3));
  expect(e.width).toEqual(1 / 3);
  
  expect(f.left).toEqual(1 * (1 / 3));
  expect(f.width).toEqual(1 / 3);

  expect(g.left).toEqual(2 * (1 / 3));
  expect(g.width).toEqual(1 / 3);
});

describe('Każde wydarzenie powinno mieścić się na ekranie.', () => { 
  for (const collision of collisions) {
    test(`${collision.item.id} powinno mieścić się na ekranie.`, () => {
      expect(collision.left + collision.width).toBeLessThanOrEqual(1);
    })
  }
});
