import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<main class="app-shell"><router-outlet></router-outlet></main>',
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        color: #e2e8f0;
        background: #0f131b;
      }

      .app-shell {
        min-height: 100vh;
      }
    `
  ]
})
export class AppComponent {}