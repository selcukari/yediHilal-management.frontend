import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { type MenuItem, MessageService } from 'primeng/api';
import { SpeedDial } from 'primeng/speeddial';
import { ToastModule } from 'primeng/toast';
import { PdfHelperService, PdfConfig, TableColumn } from '../../helpers/repor/pdfHelper';
import { ValueData } from '../../pages/member/member.component';
import { SendMailComponent } from '../sendMail/sendMail.component';
import { SendMessageComponent } from '../sendMessage/sendMessage.component'
import { exportToExcel, ColumnDefinition } from '../../helpers/repor/exportToExcel'

@Component({
  selector: 'app-component-speedDial',
  templateUrl: './speedDial.component.html',
  standalone: true,
  imports: [SpeedDial, ToastModule, SendMailComponent, SendMessageComponent],
  providers: [MessageService, PdfHelperService]
})
export class SpeedDialComponent implements OnInit {
  items: MenuItem[] = [];

  @Input() pdfTitle: string = '';
  @Input() type: number = 2;
  @Input() valueData: ValueData[] = [];
  @Input() pdfColumns: TableColumn[] = [];
  @Input() excelColumns: ColumnDefinition[] = [];

  @ViewChild(SendMailComponent) sendMailComponentRef!: SendMailComponent;
  @ViewChild(SendMessageComponent) sendMessageComponent!: SendMessageComponent;

  constructor(private messageService: MessageService, private pdfHelperService: PdfHelperService) {}

  ngOnInit() {
    this.items = [
      {
        label: 'Rapor-Pdf',
        icon: 'pi pi-book',
        command: () => {

          this.exportPdf(this.pdfTitle);
          this.messageService.add({ severity: 'info', summary: 'Rapor-Pdf', detail: 'Rapor Oluşturuldu' });
        }
      },
      {
        label: 'Rapor-Excel',
        icon: 'pi pi-file-excel',
        command: () => {

          this.exportExcel(this.pdfTitle);
          this.messageService.add({ severity: 'info', summary: 'Rapor-Excel', detail: 'Rapor Oluşturuldu' });
        }
      },
      {
        label: 'Mail',
        icon: 'pi pi-envelope',
        command: () => {

          this.sendMail(this.type);
        }
      },
      {
        label: 'Mesaj',
        icon: 'pi pi-bell',
        command: () => {
          this.sendMessage(this.type);
        }
      },
    ];
  }

   exportPdf(pdfTitle: string) {

    const config: PdfConfig = {
      title: `YediHilal ${this.pdfTitle}`,
      fileName: `yediHilal-` + pdfTitle.toLocaleLowerCase().replace(/\//g,'-').replace(/ /g, '-') + '.pdf',
      pageSize: 'a4',
      orientation: 'landscape',
      showCreationDate: true,
      showPagination: true,
      headerColor: '#3498db', // Mavi
      alternateRowColor: '#f8f9fa', // Açık gri
      textColor: '#2c3e50' // Koyu gri
    };

    const newValueData = this.valueData.map(item => ({
      ...item,
      isMail: item.isMail ? "Evet" : "Hayır",
      isMessage: item.isMessage ? "Evet" : "Hayır"
    }));

    this.pdfHelperService.generatePdf(newValueData, this.pdfColumns, config);
  }

  exportExcel(excelTitle: string) {

    exportToExcel(this.valueData, this.excelColumns, `yediHilal-${excelTitle.toLocaleLowerCase().replace(/\//g,'-').replace(/ /g, '-')}`);
  }

  sendMail(type: number) {

    const newUserData = this.valueData?.filter(value => value.isMail && value.email) || []

    this.sendMailComponentRef.openDialog(
      newUserData.map(value => value.fullName),
      newUserData.map(value => value.email), type);
  }

  sendMessage(type: number) {

    const newUserData = this.valueData?.filter(value => value.isMessage && value.telephone && value.countryCode) || []

    this.sendMessageComponent.openDialog(
      newUserData.map(value => value.fullName),
      newUserData.map(({ telephone, countryCode }) => ({ telephone, countryCode: countryCode ?? '' })), type);
  }
}
