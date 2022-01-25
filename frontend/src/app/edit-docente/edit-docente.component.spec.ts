import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDocenteComponent } from './edit-docente.component';

describe('EditDocenteComponent', () => {
  let component: EditDocenteComponent;
  let fixture: ComponentFixture<EditDocenteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditDocenteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDocenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
