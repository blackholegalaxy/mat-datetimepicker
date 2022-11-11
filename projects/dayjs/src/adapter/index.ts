import { NgModule } from '@angular/core';
import {
  MatDayjsDateModule,
  DayjsDateModule,
} from '@tabuckner/material-dayjs-adapter';
import {
  DatetimeAdapter,
  MAT_DATETIME_FORMATS,
} from '@mat-datetimepicker/core';
import { DayjsDatetimeAdapter } from './dayjs-datetime-adapter';
import { MAT_DAYJS_DATETIME_FORMATS } from './dayjs-datetime-formats';

export * from './dayjs-datetime-adapter';
export * from './dayjs-datetime-formats';

@NgModule({
  imports: [DayjsDateModule],
  providers: [
    {
      provide: DatetimeAdapter,
      useClass: DayjsDatetimeAdapter,
    },
  ],
})
export class DayjsDatetimeModule { }

@NgModule({
  imports: [DayjsDatetimeModule, MatDayjsDateModule],
  providers: [
    { provide: MAT_DATETIME_FORMATS, useValue: MAT_DAYJS_DATETIME_FORMATS },
  ],
})
export class MatDayjsDatetimeModule { }
