import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrustSecurity } from './trust-security';

describe('TrustSecurity', () => {
  let component: TrustSecurity;
  let fixture: ComponentFixture<TrustSecurity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrustSecurity],
    }).compileComponents();

    fixture = TestBed.createComponent(TrustSecurity);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
