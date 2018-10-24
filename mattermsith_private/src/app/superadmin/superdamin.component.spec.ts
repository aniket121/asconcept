import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperdaminComponent } from './superdamin.component';

describe('SuperdaminComponent', () => {
  let component: SuperdaminComponent;
  let fixture: ComponentFixture<SuperdaminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuperdaminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperdaminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
