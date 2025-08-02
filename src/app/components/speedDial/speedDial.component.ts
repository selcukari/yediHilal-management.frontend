import { Component, OnInit } from '@angular/core';
import { type MenuItem, MessageService } from 'primeng/api';
import { SpeedDial } from 'primeng/speeddial';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-component-speedDial',
  templateUrl: './speedDial.component.html',
  standalone: true,
  imports: [SpeedDial, ToastModule],
  providers: [MessageService]
})
export class SpeedDialComponent implements OnInit {
  items: MenuItem[] = [];

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.items = [
      {
        label: 'Rapor',
        icon: 'pi pi-book',
        command: () => {
          this.messageService.add({ severity: 'info', summary: 'Rapor', detail: 'Rapor Oluşturuldu' });
        }
      },
      {
        label: 'Mail',
        icon: 'pi pi-envelope',
        command: () => {
          this.messageService.add({ severity: 'info', summary: 'Mail', detail: 'Mailler Gönderildi' });
        }
      },
      {
        label: 'Bildirim',
        icon: 'pi pi-bell',
        command: () => {
          this.messageService.add({ severity: 'info', summary: 'Bildirim', detail: 'Bildirimler Gönderildi' });
        }
      },
    ];
  }
}
