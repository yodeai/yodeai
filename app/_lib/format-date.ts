import formatDistance from "date-fns/formatDistance";
import { utcToZonedTime } from 'date-fns-tz';

export default function formatDate( date: string | Date, { relative } = { relative: true, }): string {
  if (relative) {
    const utcNow = utcToZonedTime(new Date(), 'UTC');
    const distance = formatDistance(new Date(date), utcNow, { addSuffix: true });

    return distance;
  }
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}