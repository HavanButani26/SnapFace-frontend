import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventPhotos } from './event-photos';

describe('EventPhotos', () => {
  let component: EventPhotos;
  let fixture: ComponentFixture<EventPhotos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventPhotos],
    }).compileComponents();

    fixture = TestBed.createComponent(EventPhotos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
