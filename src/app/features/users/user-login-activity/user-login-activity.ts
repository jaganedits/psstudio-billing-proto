import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { UserService } from '../../../shared/services/user.service';
import { User, LoginActivity } from '../../../shared/models/user.model';

@Component({
  selector: 'app-user-login-activity',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableModule,
    TagModule,
    ButtonModule,
    TooltipModule,
  ],
  templateUrl: './user-login-activity.html',
  styleUrl: './user-login-activity.scss',
})
export class UserLoginActivity {
  private readonly userService = inject(UserService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly userId = signal<number>(0);
  readonly user = signal<User | undefined>(undefined);
  readonly loginActivity = signal<LoginActivity[]>([]);

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? parseInt(idParam, 10) : 0;
    this.userId.set(id);

    const foundUser = this.userService.users().find((u) => u.id === id);
    this.user.set(foundUser);
    this.loginActivity.set(this.userService.getLoginActivity(id));
  }

  readonly userName = computed(() => this.user()?.name ?? 'Unknown User');

  getStatusSeverity(status: string): 'success' | 'danger' {
    return status === 'Success' ? 'success' : 'danger';
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
