import { useEffect, useState } from 'react';

const format = (timeZone: string) =>
  new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone }).format(new Date());

/** Live clock for a time zone, e.g. "09:41 PM". */
export function useLocalTime(timeZone: string) {
  const [time, setTime] = useState(() => format(timeZone));
  useEffect(() => {
    const id = window.setInterval(() => setTime(format(timeZone)), 1000);
    return () => clearInterval(id);
  }, [timeZone]);
  return time;
}
