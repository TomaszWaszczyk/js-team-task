import { getHours, getMinutes } from "date-fns";

interface TimeRange {
  from: Date;
  to: Date;
}

export interface CollisionResult<T> {
  item: T;
  left: number;
  width: number;
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
}

/**
 * Grupuje pozycje, które nachodzą na siebie w czasie.
 */
function groupByCollisions<T>(
  array: T[],
  getTimeRange: (item: T) => TimeRange
): T[][] {
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
export function resolveTimeCollisions<T>(
  events: T[],
  getTime: (event: T) => { from: Date; to: Date }
): CollisionResult<T>[] {
  // Sortuje wydarzenia chronologicznie
  const sortedEvents = [...events].sort((a, b) => {
    const aTime = getTime(a);
    const bTime = getTime(b);
    return (
      aTime.from.getTime() - bTime.from.getTime() ||
      bTime.to.getTime() - aTime.to.getTime()
    );
  });

  // Tworzę sobie grupy kolidujących wydarzeń
  const collisionGroups = groupByCollisions(sortedEvents, getTime);

  const results: CollisionResult<T>[] = [];

  // Oblicza układ kolumn dla każdej grupy kolidujących wydarzeń
  for (const group of collisionGroups) {
    const columns: T[][] = [];

    // Przypisuje wydarzenia do kolumn
    for (const event of group) {
      const eventStart = getTime(event).from;
      let placed = false;

      // Znajduje pierwszą kolumnę, w której ostatnie wydarzenie kończy się przed rozpoczęciem bieżącego wydarzenia
      for (const column of columns) {
        const lastEvent = column[column.length - 1];
        const lastEnd = getTime(lastEvent).to;

        if (eventStart >= lastEnd) {
          column.push(event);
          placed = true;
          break;
        }
      }

      if (!placed) columns.push([event]);
    }

    // Oblicza pozycje na podstawie liczby kolumn
    const columnCount = columns.length;
    columns.forEach((column, columnIndex) => {
      const left = columnIndex / columnCount;
      const width = 1 / columnCount;

      column.forEach((event) => {
        results.push({ item: event, left, width });
      });
    });
  }

  return results;
};
