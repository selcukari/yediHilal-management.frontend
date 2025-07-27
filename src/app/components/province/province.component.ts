import { Component, inject, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ProvinceService } from '../../../services/province.service';

interface Province {
    name: string;
    code: string;
}

interface ProvinceParams {
  countryId?: number;
  areaId?: number;
}

@Component({
  selector: 'app-component-province',
  standalone: true,
  imports: [FormsModule, Select],
  templateUrl: './province.component.html',
})

export class ProvinceComponent implements OnInit {

  private provinceService = inject(ProvinceService);
  provinces!: Province[];

  @Input() countryCode?: number;
  @Input() areaCode?: number;

  @Output() provinceSelected = new EventEmitter<string>();

  modelValueCode?: string | null = null;


  async ngOnInit() {
    // await this.fetchProvinceData({});
  }

   async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['countryCode'] || changes['areaCode']) {

      await this.fetchProvinceData({
        ...(this.countryCode !== undefined ? {countryId: this.countryCode } : {}),
        ...(this.areaCode !== undefined ? {areaId: this.areaCode } : {})
      });

      this.modelValueCode = null;
      console.log('Selected countryCode111:', this.countryCode);
    }
  }

 private async fetchProvinceData(params: ProvinceParams): Promise<void> {
    try {

      const getProvinces = await this.provinceService.provinces(params);
      if (getProvinces) {
        this.provinces = getProvinces.map((country: any) => ({
          name: country.name,
          code: country.id
        }));
      } else {
        console.error('No getProvinces data found');
      }
    } catch (error: any) {
      console.error('Error fetching getProvinces:', error.message);
    }
  }

  onProvinceSelect(provinceCode: any): void {
    console.log('Selected getProvinces:', provinceCode);
    this.provinceSelected.emit(provinceCode);
  }
}
