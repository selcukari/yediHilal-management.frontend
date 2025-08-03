import { Component, Input, OnInit } from '@angular/core';
import { type MenuItem, MessageService } from 'primeng/api';
import { SpeedDial } from 'primeng/speeddial';
import { ToastModule } from 'primeng/toast';
import { PdfHelperService, PdfConfig, TableColumn } from '../../helpers/pdfHelper';
import { ValueData } from '../../pages/home/home.component';
@Component({
  selector: 'app-component-speedDial',
  templateUrl: './speedDial.component.html',
  standalone: true,
  imports: [SpeedDial, ToastModule],
  providers: [MessageService, PdfHelperService]
})
export class SpeedDialComponent implements OnInit {
  items: MenuItem[] = [];

  @Input() pdfTitle: string = '';
  @Input() tableData: ValueData[] = [];
  @Input() tableColumns: TableColumn[] = [];

  constructor(private messageService: MessageService, private pdfHelperService: PdfHelperService) {}

  ngOnInit() {
    this.items = [
      {
        label: 'Rapor',
        icon: 'pi pi-book',
        command: () => {

          this.exportPdf(this.pdfTitle);
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

   exportPdf(pdfTitle: string) {

    const config: PdfConfig = {
      title: `YediHilal ${this.pdfTitle}`,
      fileName: `yediHilal-` + pdfTitle.toLocaleLowerCase().replace(/\//g,'-').replace(/ /g, '-') + '.pdf',
      pageSize: 'a4',
      orientation: 'portrait',
      showCreationDate: true,
      showPagination: true,
      headerColor: '#3498db', // Mavi
      alternateRowColor: '#f8f9fa', // Açık gri
      textColor: '#2c3e50' // Koyu gri
    };

    console.log('tableColumns:', this.tableColumns)
    this.pdfHelperService.generatePdf(this.tableData, this.tableColumns, config);
  }
}
