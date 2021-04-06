import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppResourceDetailComponent } from './appresource-detail.component';

describe('AppResourceDetailComponent', () => {
  let component: AppResourceDetailComponent;
  let fixture: ComponentFixture<AppResourceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppResourceDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppResourceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
