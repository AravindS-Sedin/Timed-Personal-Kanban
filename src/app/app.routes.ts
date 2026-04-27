import { Routes, CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { OnboardingComponent } from './features/onboarding/onboarding';
import { ProjectListComponent } from './features/projects/project-list';
import { BoardComponent } from './features/board/board';
import { StorageService } from './core/services/storage';
import { User } from './models/user.model';

const USER_KEY = 'kanban_user';

const hasUser = (): boolean => {
  const storage = inject(StorageService);
  const user = storage.get<User>(USER_KEY);
  return !!user?.name;
};

const onboardingMatch: CanMatchFn = () => !hasUser();
const projectsMatch: CanMatchFn = () => hasUser();

const requireUser: CanActivateFn = () => {
  if (hasUser()) {
    return true;
  }

  return inject(Router).createUrlTree(['/']);
};

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canMatch: [onboardingMatch],
    component: OnboardingComponent
  },
  {
    path: '',
    pathMatch: 'full',
    canMatch: [projectsMatch],
    component: ProjectListComponent
  },
  {
    path: 'projects',
    canActivate: [requireUser],
    component: ProjectListComponent
  },
  {
    path: 'board/:id',
    canActivate: [requireUser],
    component: BoardComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];