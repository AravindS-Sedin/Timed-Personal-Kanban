import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../core/services/storage';
import { InputComponent } from '../../shared/components/input/input';
import { ButtonComponent } from '../../shared/components/button/button.';
import { User } from '../../models/user.model';

const USER_KEY = 'kanban_user';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [InputComponent, ButtonComponent],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.css'
})
export class OnboardingComponent {
  name = '';

  constructor(
    private readonly storageService: StorageService,
    private readonly router: Router
  ) {
    const user = this.storageService.get<User>(USER_KEY);
    if (user?.name) {
      void this.router.navigate(['/projects']);
    }
  }

  continue(): void {
    const value = this.name.trim();
    if (!value) {
      return;
    }

    this.storageService.set<User>(USER_KEY, { name: value });
    void this.router.navigate(['/projects']);
  }
}
