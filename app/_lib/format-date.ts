import formatDistanceToNow from "date-fns/formatDistanceToNow";

export default function formatDate(
  date: string | Date,
  { relative } = {
    relative: true,
  }
): string {
  if (relative) {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
    });
  }
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}