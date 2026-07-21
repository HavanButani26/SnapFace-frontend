import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'sf-usage-bar',
  standalone: true,
  template: `
    <div class="sf-usage-bar">
      <div class="sf-usage-bar__header">
        <span class="sf-usage-bar__label">{{ label() }}</span>
        <span class="sf-usage-bar__values">{{ used() }} / {{ limit() }} {{ unit() }}</span>
      </div>
      <div class="sf-usage-bar__track">
        <div
          class="sf-usage-bar__fill"
          [class]="'sf-usage-bar__fill--' + colorBand()"
          [style.width.%]="percent()"
        ></div>
      </div>
      @if (percent() >= 80) {
        <p class="sf-usage-bar__note" [class.sf-usage-bar__note--urgent]="percent() >= 90">
          @if (percent() >= 100) {
            Limit reached — new uploads/events are paused until you free up space or upgrade.
          } @else if (percent() >= 90) {
            Almost full — consider upgrading soon.
          } @else {
            Getting close to your limit.
          }
        </p>
      }
    </div>
  `,
  styleUrl: './usage-bar.scss',
})
export class UsageBar {
  label = input('');
  used = input(0);
  limit = input(0);
  percent = input(0);
  unit = input('');

  // Progression: gray (barely used) -> blue -> green (healthy) ->
  // orange (80% warning) -> red (90%+ urgent/blocked) — matching the
  // 80/90/100 thresholds from the product spec exactly at the color
  // transition points.
  colorBand = computed(() => {
    const p = this.percent();
    if (p >= 90) return 'red';
    if (p >= 80) return 'orange';
    if (p >= 50) return 'green';
    if (p >= 20) return 'blue';
    return 'gray';
  });
}
