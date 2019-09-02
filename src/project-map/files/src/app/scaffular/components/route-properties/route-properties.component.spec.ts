import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoutePropertiesComponent } from './route-properties.component';

describe('RoutePropertiesComponent', () => {
  let component: RoutePropertiesComponent;
  let fixture: ComponentFixture<RoutePropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoutePropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoutePropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
