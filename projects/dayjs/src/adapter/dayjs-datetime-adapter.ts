import { Inject, Injectable, Optional } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import {
  MAT_DAYJS_DATE_ADAPTER_OPTIONS,
  // DayJsDateAdapterOptions, // TODO EXPORT IN ORIGINAL LIB
} from '@tabuckner/material-dayjs-adapter';
import { DatetimeAdapter } from '@mat-datetimepicker/core';

import * as dayjs_ from 'dayjs';
import { Dayjs } from 'dayjs';

export interface DayJsDateAdapterOptions {
  /**
   * Turns the use of utc dates on or off.
   * Changing this will change how Angular Material components like DatePicker output dates.
   * {@default false}
   */
  useUtc?: boolean;
}

const dayjs = 'default' in dayjs_ ? dayjs_['default'] : dayjs_;

function range<T>(length: number, valueFunction: (index: number) => T): T[] {
  const valuesArray = Array(length);
  for (let i = 0; i < length; i++) {
    valuesArray[i] = valueFunction(i);
  }
  return valuesArray;
}

@Injectable()
export class DayjsDatetimeAdapter extends DatetimeAdapter<Dayjs> {
  private _localeData: {
    firstDayOfWeek: number;
    longMonths: string[];
    shortMonths: string[];
    dates: string[];
    hours: string[];
    minutes: string[];
    longDaysOfWeek: string[];
    shortDaysOfWeek: string[];
    narrowDaysOfWeek: string[];
  };

  private _useUtc = false;

  constructor(
    @Optional() @Inject(MAT_DATE_LOCALE) matDateLocale: string,
    @Optional()
    @Inject(MAT_DAYJS_DATE_ADAPTER_OPTIONS)
    matDayjsAdapterOptions: DayJsDateAdapterOptions,
    _delegate: DateAdapter<Dayjs>
  ) {
    super(_delegate);
    this.setLocale(matDateLocale || dayjs.locale());
    this._useUtc = matDayjsAdapterOptions.useUtc;
  }

  setLocale(locale: string) {
    super.setLocale(locale);

    const dayjsLocaleData = dayjs.localeData(locale);
    this._localeData = {
      firstDayOfWeek: dayjsLocaleData.firstDayOfWeek(),
      longMonths: dayjsLocaleData.months(),
      shortMonths: dayjsLocaleData.monthsShort(),
      dates: range(31, (i) => super.createDate(2017, 0, i + 1).format('D')),
      hours: range(24, (i) =>
        this.createDatetime(2017, 0, 1, i, 0).format('H')
      ),
      minutes: range(60, (i) =>
        this.createDatetime(2017, 0, 1, 1, i).format('m')
      ),
      longDaysOfWeek: dayjsLocaleData.weekdays(),
      shortDaysOfWeek: dayjsLocaleData.weekdaysShort(),
      narrowDaysOfWeek: dayjsLocaleData.weekdaysMin(),
    };
  }

  getHour(date: Dayjs): number {
    return super.clone(date).hour();
  }

  getMinute(date: Dayjs): number {
    return super.clone(date).minute();
  }

  isInNextMonth(startDate: Dayjs, endDate: Dayjs): boolean {
    const nextMonth = this.getDateInNextMonth(startDate);
    return super.sameMonthAndYear(nextMonth, endDate);
  }

  createDatetime(
    year: number,
    month: number,
    date: number,
    hour: number,
    minute: number
  ): Dayjs {
    // Check for invalid month and date (except upper bound on date which we have to check after
    // creating the Date).
    if (month < 0 || month > 11) {
      throw Error(
        `Invalid month index "${month}". Month index has to be between 0 and 11.`
      );
    }

    if (date < 1) {
      throw Error(`Invalid date "${date}". Date has to be greater than 0.`);
    }

    if (hour < 0 || hour > 23) {
      throw Error(`Invalid hour "${hour}". Hour has to be between 0 and 23.`);
    }

    if (minute < 0 || minute > 59) {
      throw Error(
        `Invalid minute "${minute}". Minute has to be between 0 and 59.`
      );
    }

    // const result = dayjs({year, month, date, hour, minute}).locale(this.locale);
    let result = dayjs({ year, month, date, hour, minute });
    if (this._useUtc) {
      result = result.utc();
    }

    // If the result isn't valid, the date must have been out of bounds for this month.
    if (!result.isValid()) {
      throw Error(`Invalid date "${date}" for month with index "${month}".`);
    }

    return result;
  }

  getFirstDateOfMonth(date: Dayjs): Dayjs {
    return super.clone(date).startOf('month');
  }

  getHourNames(): string[] {
    return this._localeData.hours;
  }

  getMinuteNames(): string[] {
    return this._localeData.minutes;
  }

  addCalendarHours(date: Dayjs, hours: number): Dayjs {
    return super.clone(date).add(hours, 'days');
  }

  addCalendarMinutes(date: Dayjs, minutes: number): Dayjs {
    return super.clone(date).add(minutes, 'minutes');
  }

  deserialize(value: any): Dayjs | null {
    return this._delegate.deserialize(value);
  }

  private getDateInNextMonth(date: Dayjs) {
    return super.clone(date).date(1).add(1, 'month');
  }
}
