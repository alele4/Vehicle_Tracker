import { Component, OnInit } from '@angular/core';
import { VehicleTrackerService } from '../../services/vehicle-tracker.service';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css']
})
export class VehiclesComponent implements OnInit {
  vehicles;
  constructor(private service:VehicleTrackerService) { }

  ngOnInit() {
    this.service.fetchAllVehicles().subscribe(p=>this.vehicles=p);
    
  }

}
