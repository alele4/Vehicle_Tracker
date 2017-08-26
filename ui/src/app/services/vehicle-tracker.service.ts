import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import { LatLngLiteral,LatLngBoundsLiteral  } from '@agm/core';

@Injectable()
export class VehicleTrackerService {
  private baseUrl: string = 'http://localhost:8090';
  private vehicles:VehicleDTO[];
  constructor(private http:Http) { }
  
  fetchAllVehicles(): Observable<VehicleDTO[]>{
   let people$ = this.http
      .get(`${this.baseUrl}/vehicles`)
      .map(mapVehicles);
      return people$;
  }
  fetchReadings(): Observable<ReadingWrapper>{
   let people$ = this.http
      .get(`${this.baseUrl}/readings`)
      .map(mapReadings);
      return people$;
  }
  fetchLatestAlerts(timeInSeconds:Number): Observable<Alerts[]>{
   let people$ = this.http
      .get(`${this.baseUrl}/alerts?elapsedTime=${timeInSeconds}`)
      .map(mapAlerts);
      return people$;
  }
  fetchAllAlerts(): Observable<Alerts[]>{
   let people$ = this.http
      .get(`${this.baseUrl}/alerts`)
      .map(mapAlerts);
      return people$;
  }
  getHeaders() : Headers{
    // I included these headers because otherwise FireFox
    // will request text/html instead of application/json
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    return headers;
  }

}

@Injectable()
export class AlertsData {
  public timeInHours:number;
  /** Stream that emits whenever the data has been modified. */
  dataChange: BehaviorSubject<Alerts[]> = new BehaviorSubject<Alerts[]>([]);
  get data(): Alerts[] { return this.dataChange.value; }
  constructor(private service:VehicleTrackerService) {
    this.getData();
  }
  getData(){
    if(this.timeInHours){
       this.service.fetchLatestAlerts(this.timeInHours*3600).subscribe(p=>this.dataChange.next(p));
    }else{
      this.service.fetchAllAlerts().subscribe(p=>this.dataChange.next(p));
    }
    
  }
  
  getLength(){
    return this.data.length;
  }
}

@Injectable()
export class ReadingsData {
  public timeInHours:number=200;
  public vehicleName:String;
  public latitute:String;
  public longitude:String;
  public fuelVolume:String;
  /** Stream that emits whenever the data has been modified. */
  dataChange: BehaviorSubject<ReadingWrapper> = new BehaviorSubject<ReadingWrapper>(new ReadingWrapper());
  get data(): Readings[] { return this.dataChange.value.readings; }
  constructor(private service:VehicleTrackerService) {
    this.getData();
  }
  getData(){
    this.service.fetchReadings().subscribe(p=>this.dataChange.next(p));
    
  }
  get bound():LatLngBoundsLiteral{
    return this.dataChange.value.bounds;
  }
  get center():LatLngLiteral{
    return this.dataChange.value.center;
  }
  get zoom():number{
    return this.dataChange.value.zoom;
  }
  get vehicleData():any[]{
    return this.dataChange.value.maps;
  }
  
  getLength(){
    return this.data.length;
  }
}
const componentMap:Map<String,String>=new Map([
  ["RPM","RPM"],
  ["ENGINE","Engine"],
  ["FUEL","Fuel"],
  ["TIRE_PRESSURE_FRONT_LEFT","Front-Left tire pressure"],
  ["TIRE_PRESSURE_FRONT_RIGHT","Front-Right tire pressure"],
  ["TIRE_PRESSURE_REAR_LEFT","Rear-Left tire pressure"],
  ["TIRE_PRESSURE_REAR_RIGHT","Rear-Right tire pressure"]
]);
const priorityMap:Map<String,String>=new Map([
  ["LOW","Low"],
  ["MEDIUM","Medium"],
  ["HIGH","High"]
]);
function mapAlerts(response:Response): Alerts[]{
  // The response of the API has a results
  // property with the actual results
  //console.log(response.json())
  let alerts:Alerts[]=new Array<Alerts>();
  if(response.json().vehicles){
  let vehicles:VehicleDTO[]=response.json().vehicles.map(toVehicleDTO);
  console.log("Vehicles:",vehicles);
  
  for(let vehicle of vehicles){
    if(vehicle.readings!=undefined){
      for(let reading of vehicle.readings){
        if(reading.alerts!=undefined){
          for(let alert of reading.alerts){
            let alertCustom:Alerts=new Alerts();
            alertCustom.vehicleId = vehicle.vin;
            alertCustom.vehicleName=vehicle.model+","+vehicle.make;
            alertCustom.readingTime=reading.timestamp;
            alertCustom.component=componentMap.get(alert.component);
            alertCustom.message=alert.message;
            alertCustom.priority=priorityMap.get(alert.priority);
            alerts.push(alertCustom);
          }
        }
      }
    }
  }
  }
  console.log("Alerts:",alerts);
  return alerts;
  
}
function mapReadings(response:Response): ReadingWrapper{
  // The response of the API has a results
  // property with the actual results
  //console.log(response.json())
  let readings:Readings[]=new Array<Readings>();
  let wrapper:ReadingWrapper=new ReadingWrapper();
  if(response.json().vehicles){
  let vehicles:VehicleDTO[]=response.json().vehicles.map(toVehicleDTO);
  console.log("Vehicles:",vehicles);
  wrapper.bounds={west:null,east:null,north:null,south:null};
  
  for(let vehicle of vehicles){
    if(vehicle.readings!=undefined){
      for(let reading of vehicle.readings){
            if(!wrapper.bounds.west){
              wrapper.bounds.west=reading.longitude;
            }else{
              if(wrapper.bounds.west>reading.longitude){
                wrapper.bounds.west=reading.longitude;
              }
            }
            if(!wrapper.bounds.east){
              wrapper.bounds.east=reading.longitude;
            }else{
                if(wrapper.bounds.east<reading.longitude){
                  wrapper.bounds.east=reading.longitude;
                }
            }
            if(!wrapper.bounds.north){
              wrapper.bounds.north=reading.latitude;
            }else{
                if(wrapper.bounds.north<reading.latitude){
                  wrapper.bounds.north=reading.latitude;
                }
            }
            if(!wrapper.bounds.south){
              wrapper.bounds.south=reading.latitude;
            }else{
                if(wrapper.bounds.south>reading.latitude){
                  wrapper.bounds.south=reading.latitude;
                }
            }            
            let readingDomain:Readings=new Readings();
            readingDomain.vehicleId = vehicle.vin;
            readingDomain.vehicleName=vehicle.model+", "+vehicle.make;
            readingDomain.timestamp=reading.timestamp;
            readingDomain.checkEngineLightOn=reading.checkEngineLightOn;
            readingDomain.cruiseControlOn=reading.checkEngineLightOn;
            readingDomain.engineCoolantLow=reading.checkEngineLightOn;
            readingDomain.engineHp=reading.engineHp;
            readingDomain.engineRpm=reading.engineRpm;
            readingDomain.fuelVolume=reading.fuelVolume;
            readingDomain.latitude=reading.latitude;
            readingDomain.longitude=reading.longitude;

            if(reading.tires){
                readingDomain.frontLeft=reading.tires.frontLeft;
                readingDomain.frontRight=reading.tires.frontRight;
                readingDomain.rearLeft=reading.tires.rearLeft;
                readingDomain.rearRight=reading.tires.rearRight;
            }           
            readingDomain.speed=reading.speed;
            readings.push(readingDomain);         
      }
    }
  }
  
  }
  wrapper.readings=readings;
  wrapper.maps=new Array();
  let maps=new Map<String,String>();
  if(readings){
    for(let reading of readings){
      maps.set(reading.vehicleId,reading.vehicleName);
     
    }
    var GLOBE_WIDTH = 256; // a constant in Google's map projection
    var west = wrapper.bounds.west-2;
    var east = wrapper.bounds.east+2;
    wrapper.center={lng:(wrapper.bounds.east+wrapper.bounds.west)/2,lat:(wrapper.bounds.north+wrapper.bounds.south)/2};
    var angle = east - west;
    if (angle < 0) {
      angle += 360;
    }
    wrapper.zoom = Math.round(Math.log(1000 * 360 / angle / GLOBE_WIDTH) / Math.LN2);
  }
  maps.forEach((value: String, key: String) => {
     wrapper.maps.push({value: key, viewValue: value});
});

  console.log("Readings:",wrapper);
  return wrapper;
  
}
function mapVehicles(response:Response): VehicleDTO[]{
  // The response of the API has a results
  // property with the actual results
  //console.log(response.json())
  return response.json().vehicles.map(toVehicleDTO)
}

function toVehicleDTO(r:any): VehicleDTO{
  //console.log(r)    
  let vehicle:VehicleDTO=new VehicleDTO();
  vehicle.vin=r.vin;
  vehicle.make=r.make;
  vehicle.model=r.model;
  vehicle.year=r.year;
  vehicle.redlineRpm=r.redlineRpm;
  vehicle.maxFuelVolume=r.maxFuelVolume;
  vehicle.lastServiceDate=new Date(r.lastServiceDate);
  if(r.readings!=undefined)
  vehicle.readings=r.readings.map(toVehicleReadingDTO);
  //console.log('Parsed vehicle:', r);
  return vehicle;
}
function toVehicleReadingDTO(r:any): VehicleReadingDTO{
  //console.log(r)    
  let vehicleReading:VehicleReadingDTO=new VehicleReadingDTO();
  vehicleReading.vin=r.vin;
  vehicleReading.timestamp=new Date(r.timestamp);
  vehicleReading.latitude=r.latitude;
  vehicleReading.longitude=r.longitude;
  vehicleReading.fuelVolume=r.fuelVolume;
  vehicleReading.speed=r.speed;
  vehicleReading.engineHp=r.engineHp;
  vehicleReading.checkEngineLightOn=r.checkEngineLightOn;
  vehicleReading.engineCoolantLow=r.engineCoolantLow;
  vehicleReading.cruiseControlOn=r.cruiseControlOn;
  vehicleReading.engineRpm=r.engineRpm;
  if(r.tires!=undefined)
  vehicleReading.tires=toTireDTO(r.tires);
  if(r.alerts!=undefined)
  vehicleReading.alerts=r.alerts.map(toAlertDTO);
  //console.log('Parsed vehicle:', r);
  return vehicleReading;
}
function toTireDTO(r:any): TireDTO{
  //console.log(r)    
  let tireDTO:TireDTO=new TireDTO();
  tireDTO.frontLeft=r.frontLeft;
  tireDTO.frontRight=r.frontRight;
  tireDTO.rearLeft=r.rearLeft;
  tireDTO.rearRight=r.rearRight;  
  //console.log('Parsed vehicle:', r);
  return tireDTO;
}
function toAlertDTO(r:any): AlertDTO{
  //console.log(r)    
  let alertDTO:AlertDTO=new AlertDTO();
  alertDTO.priority=r.priority;
  alertDTO.component=r.component;
  alertDTO.message=r.message;
  //console.log('Parsed vehicle:', r);
  return alertDTO;
}
export class VehicleDTO{
  public vin:String;
  public make:String;
  public model:String;
  public year:number;
  public redlineRpm:number;
  public maxFuelVolume:number;
  public lastServiceDate:Date;
  public readings:VehicleReadingDTO[];
}
export class VehicleReadingDTO{
  public vin:String;
  public timestamp:Date;
  public latitude:number;
  public longitude:number;
  public fuelVolume:number;
  public speed:number;
  public engineHp:number;
  public checkEngineLightOn:Boolean;
  public engineCoolantLow:Boolean;
  public cruiseControlOn:Boolean;
  public engineRpm:number;
  public tires:TireDTO;
  public alerts:AlertDTO[];
}
export class TireDTO{
  public frontLeft:number;
  public frontRight:number;
  public rearLeft:number;
  public rearRight:number;
}
export class AlertDTO{
  public priority:String;
  public component:String;
  public message:String;
}

export class Alerts{
  public vehicleId:String;
  public vehicleName:String;
  public readingTime:Date;
  public priority:String;
  public component:String;
  public message:String;
}

export class Readings{
  public vehicleId:String;
  public vehicleName:String;
  public timestamp:Date;
  public latitude:number;
  public longitude:number;
  public fuelVolume:number;
  public speed:number;
  public engineHp:number;
  public checkEngineLightOn:Boolean;
  public engineCoolantLow:Boolean;
  public cruiseControlOn:Boolean;
  public engineRpm:number;
  public frontLeft:number;
  public frontRight:number;
  public rearLeft:number;
  public rearRight:number;
}
export class ReadingWrapper{
    constructor(){
      this.readings=new Array<Readings>();
    }
   public zoom:number;
   public center:LatLngLiteral;
   public bounds:LatLngBoundsLiteral ; 
   public readings:Readings[];
   public maps:any[];
}