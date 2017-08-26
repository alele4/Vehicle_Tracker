import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HotAlertsComponent } from './hot-alerts.component';

describe('HotAlertsComponent', () => {
  let component: HotAlertsComponent;
  let fixture: ComponentFixture<HotAlertsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HotAlertsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HotAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
