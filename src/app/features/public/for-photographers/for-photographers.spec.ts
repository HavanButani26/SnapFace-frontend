import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForPhotographers } from './for-photographers';

describe('ForPhotographers', () => {
  let component: ForPhotographers;
  let fixture: ComponentFixture<ForPhotographers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForPhotographers],
    }).compileComponents();

    fixture = TestBed.createComponent(ForPhotographers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
