import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JefeDeCarreraComponent } from './jefe-de-carrera.component';

describe('PendingComponent', () => {
  let component: JefeDeCarreraComponent;
  let fixture: ComponentFixture<JefeDeCarreraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JefeDeCarreraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JefeDeCarreraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
