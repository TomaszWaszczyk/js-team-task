import { getHours, getMinutes } from 'date-fns';
import { sortBy } from 'lodash';

interface TimeRange {
  from: Date;
  to: Date;
}

interface CollisionItem<T> {
  left: number;
  width: number;
  item: T;
}

/**
 * Zwraca czas z podanej daty w postaci minut od północy. Np.: 01:00 = 60, 02:30 = 150. 
 */
function dateToMinutes(date: Date) {
  return getHours(date) * 60 + getMinutes(date);
}

/**
 * Sprawdza czy dwa wydarzenia nachodzą na siebie w czasie.
 */
function isCollides(a: TimeRange, b: TimeRange) {
  const aFrom = dateToMinutes(a.from);
  const aTime = dateToMinutes(a.to) - aFrom;
  const bFrom = dateToMinutes(b.from);
  const bTime = dateToMinutes(b.to) - bFrom;

  return aFrom < bFrom + bTime && aFrom + aTime > bFrom;
};

/**
 * Grupuje pozycje, które nachodzą na siebie w czasie.
 */
function groupByCollisions<T>(array: T[], getTimeRange: (item: T) => TimeRange): T[][] {
  const groups: T[][] = [];
  groups[0] = [];

  if (array.length > 0) {
    groups[0].push(array[0]);

    for (let itemIndex = 1, l = array.length; itemIndex < l; ++itemIndex) {
      const item = array[itemIndex];

      let hasCollision = false;
      let prevItemIndex = itemIndex - 1;
      do {
        const prevItem = array[prevItemIndex];

        if (isCollides(getTimeRange(item), getTimeRange(prevItem))) {
          let hasGroup = false;
          let groupIndex = groups.length;
          while (!hasGroup && groupIndex--) {
            const groupContainsPrevItemId = groups[groupIndex].includes(prevItem);
            if (groupContainsPrevItemId) {
              groups[groupIndex].push(item);
              hasGroup = true;
            }
          }

          hasCollision = true;
        }
      } while (!hasCollision && prevItemIndex--);

      if (!hasCollision) {
        groups.push([item]);
      }
    }
  }

  return groups;
};

/**
 * Oblicza wartość top i left dla pozycji w tablicy aby nie kolidowały ze sobą.
 */
export function resolveTimeCollisions<T>(array: T[], getTimeRange: (item: T) => TimeRange): CollisionItem<T>[] {
  return groupByCollisions(array, getTimeRange).flatMap(group => {
    return group.map((item, itemIndex) => {
      const width = 1 / group.length;
      const left = itemIndex * width;

      return {
        left,
        width,
        item
      };
    })
  })
}
