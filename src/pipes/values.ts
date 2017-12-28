import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'values',
  pure: false // Needed for change detection / zone business to update the UI
})
export class Values implements PipeTransform {
  transform(value: any, args: any[] = null): any {
    if (typeof value === 'undefined') return value
    return Object.keys(value).map(key => {
      return value[key]
    })
  }
}
