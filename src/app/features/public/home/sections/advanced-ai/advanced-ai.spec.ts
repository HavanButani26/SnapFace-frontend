import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedAi } from './advanced-ai';

describe('AdvancedAi', () => {
  let component: AdvancedAi;
  let fixture: ComponentFixture<AdvancedAi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedAi],
    }).compileComponents();

    fixture = TestBed.createComponent(AdvancedAi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
