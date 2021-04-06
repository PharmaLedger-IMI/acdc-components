import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppresourceSearchComponent } from './appresource-search.component';

describe('AppresourceSearchComponent', () => {
  let component: AppresourceSearchComponent;
  let fixture: ComponentFixture<AppresourceSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppresourceSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppresourceSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
