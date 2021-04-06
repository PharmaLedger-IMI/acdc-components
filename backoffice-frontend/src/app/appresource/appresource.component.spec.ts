import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppResourceComponent } from './appresource.component';

describe('AppresourceComponent', () => {
  let component: AppResourceComponent;
  let fixture: ComponentFixture<AppResourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppResourceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
