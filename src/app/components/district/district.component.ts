import { Component, inject, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { DistrictService } from '../../../services/district.service';

interface District {
    name: string;
    code: string;
}

interface DistrictParams {
  provinceId: number;
}

@Component({
  selector: 'app-component-district',
  standalone: true,
  imports: [FormsModule, Select, MessageModule],
  templateUrl: './district.component.html',
})

export class DistrictComponent implements OnInit {

  private provinceService = inject(DistrictService);
  districts!: District[];

  @Input() provinceCode?: number;
  @Input() areaCode?: number;
  @Input() isRequired: boolean = false;
  @Output() districtSelected = new EventEmitter<string | undefined>();

  @Input() model?: number = undefined;
  @Input() firstProvinceCode?: number = undefined;

  private isInitialLoad = true;

  async ngOnInit() {
    await this.fetchDistrictData({ provinceId: this.firstProvinceCode || 1 });
    this.isInitialLoad = false;
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {

    // Province değişikliği kontrolü
    if (changes['provinceCode'] && !this.isInitialLoad) {
          console.log('46');

      const currentProvinceCode = changes['provinceCode'].currentValue;
      const previousProvinceCode = changes['provinceCode'].previousValue;

      // Sadece province gerçekten değiştiyse district listesini yenile
      if (currentProvinceCode && currentProvinceCode !== previousProvinceCode) {
        await this.fetchDistrictData({ provinceId: currentProvinceCode });
          console.log('54');
          this.model = undefined;
          this.districtSelected.emit(undefined);


        // Yalnızca province değiştiğinde model'i temizle
        // Edit durumunda province aynıysa model'i korumak için bu kontrolü ekliyoruz
        if (previousProvinceCode && previousProvinceCode !== currentProvinceCode) {
          console.log('60');
          this.model = undefined;
          this.districtSelected.emit(undefined);
        }
      }
    }

    // Area değişikliği kontrolü
    if (changes['areaCode'] && !this.isInitialLoad) {
               console.log('72');

      this.model = undefined;
          this.districtSelected.emit(undefined);
    }

    // firstProvinceCode değişikliği kontrolü
    if (changes['firstProvinceCode'] && !this.isInitialLoad) {
      const newFirstProvinceCode = changes['firstProvinceCode'].currentValue;
      if (newFirstProvinceCode) {
        await this.fetchDistrictData({ provinceId: newFirstProvinceCode });
      }
    }
  }

  private async fetchDistrictData(params: DistrictParams): Promise<void> {
    try {
      const getDistricts = await this.provinceService.districts(params);
      if (getDistricts) {
        this.districts = getDistricts.map((district: any) => ({
          name: district.name,
          code: district.id
        }));

      } else {
        console.error('No districts data found');
        this.districts = [];
      }
    } catch (error: any) {
      console.error('Error fetching districts:', error.message);
      this.districts = [];
    }
  }

  onDistrictSelect(districtCode: any): void {
    this.districtSelected.emit(districtCode);
  }
}
