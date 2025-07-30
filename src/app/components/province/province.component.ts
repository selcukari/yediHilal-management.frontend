import { Component, inject, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ProvinceService } from '../../../services/province.service';

interface Province {
    name: string;
    code: string;
}

interface ProvinceParams {
  countryId: number;
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
  @Input() isRequired?: boolean = false;
  @Input() formSubmitted: boolean = false;

  @Output() provinceSelected = new EventEmitter<string | undefined>();

  @Input() model?: number = undefined;


  async ngOnInit() {
    await this.fetchProvinceData({ countryId: this.countryCode || 1 });
  }

   async ngOnChanges(changes: SimpleChanges): Promise<void> {
      let shouldFetchData = false;

    // countryCode değişikliği kontrolü
    if (changes['countryCode']) {
      const currentCountryCode = changes['countryCode'].currentValue;
      const previousCountryCode = changes['countryCode'].previousValue;

      // Sadece gerçekten değiştiyse işlem yap
      if (currentCountryCode !== previousCountryCode) {
        shouldFetchData = true;
      }
    }

    // areaCode değişikliği kontrolü
    if (changes['areaCode']) {
      const currentAreaCode = changes['areaCode'].currentValue;
      const previousAreaCode = changes['areaCode'].previousValue;

      // Sadece gerçekten değiştiyse işlem yap
      if (currentAreaCode !== previousAreaCode) {
        shouldFetchData = true;
      }
    }

    // Sadece gerçek bir değişiklik varsa veri çek ve model'i temizle
    if (shouldFetchData) {
      await this.fetchProvinceData({
        ...({countryId: this.countryCode || this.model || 1 }),
        ...(this.areaCode != undefined ? {areaId: this.areaCode } : {})
      });

      this.model = undefined;
      this.provinceSelected.emit(undefined);
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
    this.provinceSelected.emit(provinceCode);
  }
}
