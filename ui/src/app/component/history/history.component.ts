import {Component, ViewChild,ViewChildren,OnInit,Injectable} from '@angular/core';
import {DataSource} from '@angular/cdk/table';
import {MdSort,MdPaginator,} from '@angular/material';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {Readings,VehicleTrackerService,ReadingsData} from '../../services/vehicle-tracker.service';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import { VehicleNameFilter } from '../../services/pipe.service';
import { LatLngLiteral,LatLngBoundsLiteral  } from '@agm/core';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
   zoom: number = 8;
   markers=[];
  displayedColumns = ['vehicleName', 
                      'timestamp', 
                      'latitude', 
                      'longitude',
                      'fuelVolume', 
                      'speed', 
                      'engineHp', 
                      'checkEngineLightOn',
                      'engineCoolantLow', 
                      'cruiseControlOn', 
                      'engineRpm', 
                      'frontLeft',
                      'frontRight', 
                      'rearLeft', 
                      'rearRight'
  ];
  constructor(private readingsData:ReadingsData){
       this.readingsData.timeInHours=undefined;
  }

  dataSource: HistoryDataSource | null;
  @ViewChild(MdSort) sort: MdSort;
  @ViewChild(MdPaginator) paginator: MdPaginator;
  ngOnInit() {   
    this.dataSource = new HistoryDataSource(this.readingsData, this.sort, this.paginator);    
  }
  clickedMarker(label: string, index: number) {
    console.log(`clicked the marker: ${label || index}`)
  }
  refresh(){
   this.readingsData.getData();
  }
    

}
/**
 * Data source to provide what data should be rendered in the table. Note that the data source
 * can retrieve its data in any way. In this case, the data source is provided a reference
 * to a common data base, ExampleDatabase. It is not the data source's responsibility to manage
 * the underlying data. Instead, it only needs to take the data and send the table exactly what
 * should be rendered.
 */
class HistoryDataSource extends DataSource<any> {
  public selectedValue: string;
  public timeInHours:number;
  public timeInMinutes:number;
  constructor(private readingsData:ReadingsData, private _sort: MdSort, private _paginator: MdPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Readings[]> {
    const displayDataChanges = [
      this.readingsData.dataChange,
      this._sort.mdSortChange,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      return this.getSortedData();
    });
  }
  disconnect() {}
  getNewCenter():LatLngLiteral{
    let data:Readings[]=this.getSortedData();
    let center:LatLngLiteral={lat:0,lng:0}
    let bounds:LatLngBoundsLiteral={west:null,east:null,north:null,south:null};
    for(let reading of data){
      if(!bounds.west){
        bounds.west=reading.longitude;
      }else{
        if(bounds.west>reading.longitude){
          bounds.west=reading.longitude;
        }
      }
      if(!bounds.east){
        bounds.east=reading.longitude;
      }else{
          if(bounds.east<reading.longitude){
            bounds.east=reading.longitude;
          }
      }
      if(!bounds.north){
        bounds.north=reading.latitude;
      }else{
          if(bounds.north<reading.latitude){
            bounds.north=reading.latitude;
          }
      }
      if(!bounds.south){
        bounds.south=reading.latitude;
      }else{
          if(bounds.south>reading.latitude){
            bounds.south=reading.latitude;
          }
      }  
    }  
    var west = bounds.west-2;
    var east = bounds.east+2;
    center={lng:(bounds.east+bounds.west)/2,lat:(bounds.north+bounds.south)/2};
    return center;
  }
  getNewZoom():number{
    let data:Readings[]=this.getSortedData();
    let center:LatLngLiteral={lat:0,lng:0}
    let bounds:LatLngBoundsLiteral={west:null,east:null,north:null,south:null};
    for(let reading of data){
      if(!bounds.west){
        bounds.west=reading.longitude;
      }else{
        if(bounds.west>reading.longitude){
          bounds.west=reading.longitude;
        }
      }
      if(!bounds.east){
        bounds.east=reading.longitude;
      }else{
          if(bounds.east<reading.longitude){
            bounds.east=reading.longitude;
          }
      }
      if(!bounds.north){
        bounds.north=reading.latitude;
      }else{
          if(bounds.north<reading.latitude){
            bounds.north=reading.latitude;
          }
      }
      if(!bounds.south){
        bounds.south=reading.latitude;
      }else{
          if(bounds.south>reading.latitude){
            bounds.south=reading.latitude;
          }
      }  
    }  
    var GLOBE_WIDTH = 256; // a constant in Google's map projection
    var west = bounds.west-2;
    var east = bounds.east+2;
    var angle = east - west;
    if (angle < 0) {
      angle += 360;
    }
    return Math.round(Math.log(1000 * 360 / angle / GLOBE_WIDTH) / Math.LN2);
  }
  /** Returns a sorted copy of the database data. */
  getSortedData(): Readings[] {
    const data = this.readingsData.data.slice();
    let data1=data;
    if(this.selectedValue){
      data1=data1.filter(item => item.vehicleId.indexOf(this.selectedValue) !== -1) ;
    }
    let time:Date=new Date();
    if(this.timeInHours){      
      time.setHours(time.getHours() - this.timeInHours);
      data1=data1.filter(item => item.timestamp>time);
    }
    if(this.timeInMinutes){
      time.setMinutes(time.getMinutes() - this.timeInMinutes);
      data1=data1.filter(item => item.timestamp>time);
    }
    const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
    data1 = data1.splice(startIndex, this._paginator.pageSize);
    // Grab the page's slice of data.
    if (!this._sort.active || this._sort.direction == '') { return data1; }
    return data1.sort((a, b) => {
      let propertyA: Number|String|Date|Boolean = '';
      let propertyB: Number|String|Date|Boolean = '';

      switch (this._sort.active) {
        case 'vehicleId': [propertyA, propertyB] = [a.vehicleId, b.vehicleId]; break;
        case 'vehicleName': [propertyA, propertyB] = [a.vehicleName, b.vehicleName]; break;
        case 'timestamp': [propertyA, propertyB] = [a.timestamp, b.timestamp]; break;
        case 'latitude': [propertyA, propertyB] = [a.latitude, b.latitude]; break;
        case 'longitude': [propertyA, propertyB] = [a.longitude, b.longitude]; break;
        case 'fuelVolume': [propertyA, propertyB] = [a.fuelVolume, b.fuelVolume]; break;
        case 'speed': [propertyA, propertyB] = [a.speed, b.speed]; break;
        case 'engineHp': [propertyA, propertyB] = [a.engineHp, b.engineHp]; break;
        case 'checkEngineLightOn': [propertyA, propertyB] = [a.checkEngineLightOn, b.checkEngineLightOn]; break;
        case 'engineCoolantLow': [propertyA, propertyB] = [a.engineCoolantLow, b.engineCoolantLow]; break;
        case 'cruiseControlOn': [propertyA, propertyB] = [a.cruiseControlOn, b.cruiseControlOn]; break;
        case 'engineRpm': [propertyA, propertyB] = [a.engineRpm, b.engineRpm]; break;
        case 'frontLeft': [propertyA, propertyB] = [a.frontLeft, b.frontLeft]; break;
        case 'frontRight': [propertyA, propertyB] = [a.frontRight, b.frontRight]; break;
        case 'rearLeft': [propertyA, propertyB] = [a.rearLeft, b.rearLeft]; break;
        case 'rearRight': [propertyA, propertyB] = [a.rearRight, b.rearRight]; break;
      }

      let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction == 'asc' ? 1 : -1);
    });
  }
}