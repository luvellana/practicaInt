import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleLogInComponent } from './google-log-in.component';

describe('GoogleLogInComponent', () => {
  let component: GoogleLogInComponent;
  let fixture: ComponentFixture<GoogleLogInComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoogleLogInComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoogleLogInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
