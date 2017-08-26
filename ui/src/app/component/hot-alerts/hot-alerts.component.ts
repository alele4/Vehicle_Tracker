import {Component, ViewChild,ViewChildren,OnInit,Injectable} from '@angular/core';
import {DataSource} from '@angular/cdk/table';
import {MdSort,MdPaginator} from '@angular/material';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {Alerts,VehicleTrackerService,AlertsData} from '../../services/vehicle-tracker.service';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-hot-alerts',
  templateUrl: './hot-alerts.component.html',
  styleUrls: ['./hot-alerts.component.css']
})



export class HotAlertsComponent implements OnInit {
  displayedColumns = ['vehicleId', 'vehicleName', 'readingTime', 'priority', 'component', 'message'];
  constructor(private alertData:AlertsData){
       this.alertData.timeInHours=undefined;
  }

  dataSource: AlertDataSource | null;
  @ViewChild(MdSort) sort: MdSort;
  @ViewChild(MdPaginator) paginator: MdPaginator;
  ngOnInit() {   
    this.dataSource = new AlertDataSource(this.alertData, this.sort, this.paginator);    
  }
  onChangeTime(){
   this.alertData.getData();
  }
    

}


/**
 * Data source to provide what data should be rendered in the table. Note that the data source
 * can retrieve its data in any way. In this case, the data source is provided a reference
 * to a common data base, ExampleDatabase. It is not the data source's responsibility to manage
 * the underlying data. Instead, it only needs to take the data and send the table exactly what
 * should be rendered.
 */
class AlertDataSource extends DataSource<any> {
  constructor(private alertsData:AlertsData, private _sort: MdSort, private _paginator: MdPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Alerts[]> {
    const displayDataChanges = [
      this.alertsData.dataChange,
      this._sort.mdSortChange,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      return this.getSortedData();
    });
  }
  disconnect() {}

  /** Returns a sorted copy of the database data. */
  getSortedData(): Alerts[] {
    const data = this.alertsData.data.slice();

    // Grab the page's slice of data.
    const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
    const data1 = data.splice(startIndex, this._paginator.pageSize);
    
    if (!this._sort.active || this._sort.direction == '') { return data1; }

    return data1.sort((a, b) => {
      let propertyA: number|String|Date = '';
      let propertyB: number|String|Date = '';

      switch (this._sort.active) {
        case 'vehicleId': [propertyA, propertyB] = [a.vehicleId, b.vehicleId]; break;
        case 'vehicleName': [propertyA, propertyB] = [a.vehicleName, b.vehicleName]; break;
        case 'readingTime': [propertyA, propertyB] = [a.readingTime, b.readingTime]; break;
        case 'priority': [propertyA, propertyB] = [a.priority, b.priority]; break;
        case 'component': [propertyA, propertyB] = [a.component, b.component]; break;
        case 'message': [propertyA, propertyB] = [a.message, b.message]; break;
      }

      let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction == 'asc' ? 1 : -1);
    });
  }
}