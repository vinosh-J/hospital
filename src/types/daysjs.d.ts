/* eslint-disable prettier/prettier */
import 'dayjs';

declare module 'dayjs' {
  interface Dayjs {
    tz(timezone?: string, keepLocalTime?: boolean): Dayjs;
    utc(): Dayjs;
  }
}