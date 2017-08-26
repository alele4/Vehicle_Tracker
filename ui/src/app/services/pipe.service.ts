import {Injectable, Pipe,PipeTransform} from '@angular/core';

@Pipe({
    name: 'myfilter'
})
@Injectable()
export class VehicleNameFilter implements PipeTransform {
    transform(items: any[], args: any[]): any {
        return items.filter(item => item.vehicleName.indexOf(args[0]) !== -1);
    }
}