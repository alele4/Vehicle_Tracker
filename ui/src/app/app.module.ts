import { BrowserModule } from '@angular/platform-browser';
import { NgModule,CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';

import { AppComponent } from './app.component';
import { HomeComponent } from './component/home/home.component';
import { VehiclesComponent } from './component/vehicles/vehicles.component';
import { HotAlertsComponent } from './component/hot-alerts/hot-alerts.component';
import { HistoryComponent } from './component/history/history.component';
import { LocateComponent } from './component/locate/locate.component';
import { VehicleTrackerService,AlertsData,ReadingsData } from './services/vehicle-tracker.service';
import { VehicleNameFilter } from './services/pipe.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import { MaterialModule,MdButtonModule,MdNativeDateModule,MdDatepickerModule  } from '@angular/material';
import { RouterModule, Routes } from '@angular/router';
import { HttpModule } from '@angular/http';
import { CdkTableModule } from '@angular/cdk/table';
import { AgmCoreModule } from '@agm/core';
import 'hammerjs';
const appRoutes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'vehicles',      component: VehiclesComponent },
  { path: 'recent-alerts',      component: HotAlertsComponent },
  { path: 'history',  component: HistoryComponent },
  { path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  }
];
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    VehiclesComponent,
    HotAlertsComponent,
    HistoryComponent,
    LocateComponent,
    VehicleNameFilter
    
  ],
  schemas:  [ CUSTOM_ELEMENTS_SCHEMA ],
  imports: [
    RouterModule.forRoot(
      appRoutes
    ),
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,MdButtonModule,
    MdDatepickerModule,
    MdNativeDateModule,
    HttpModule,
    FormsModule,
    CdkTableModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCiRgL5BNsV7oQ3mm5VR8GGKNVqEFWgoP4'
    })
  ],
  providers: [ VehicleTrackerService,AlertsData,ReadingsData],
  bootstrap: [AppComponent],
  exports: [
        MaterialModule]
})
export class AppModule { }
