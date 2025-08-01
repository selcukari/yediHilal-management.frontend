import { Component, inject, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { RoleService } from '../../../services/role.service';

interface Role {
  name: string;
  code: string;
}

@Component({
  selector: 'app-component-role',
  standalone: true,
  imports: [FormsModule, Select, MessageModule],
  templateUrl: './role.component.html',
})

export class RoleComponent implements OnInit {

  private roleService = inject(RoleService);
  roles!: Role[];

  @Output() roleSelected = new EventEmitter<string | undefined>();
  @Input() model?: number = 1;

  async ngOnInit() {
    await this.fetchRoleData();
  }

 private async fetchRoleData(): Promise<void> {
    try {

      const getRoles = await this.roleService.roles();
      if (getRoles) {
        this.roles = getRoles.map((country: any) => ({
          name: country.name,
          code: country.id
        }));
      } else {
        console.error('No getRoles data found');
      }
    } catch (error: any) {
      console.error('Error fetching getRoles:', error.message);
    }
  }

  onRoleSelect(roleCode: any): void {
    this.roleSelected.emit(roleCode);
  }
}
