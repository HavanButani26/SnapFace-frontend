import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestMyPhotos } from './guest-my-photos';

describe('GuestMyPhotos', () => {
  let component: GuestMyPhotos;
  let fixture: ComponentFixture<GuestMyPhotos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestMyPhotos],
    }).compileComponents();

    fixture = TestBed.createComponent(GuestMyPhotos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
