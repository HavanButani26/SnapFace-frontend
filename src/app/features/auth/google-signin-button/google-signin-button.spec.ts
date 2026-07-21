import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleSigninButton } from './google-signin-button';

describe('GoogleSigninButton', () => {
  let component: GoogleSigninButton;
  let fixture: ComponentFixture<GoogleSigninButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoogleSigninButton],
    }).compileComponents();

    fixture = TestBed.createComponent(GoogleSigninButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
