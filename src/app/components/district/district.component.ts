import { Component, inject, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
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
  imports: [FormsModule, Select],
  templateUrl: './district.component.html',
})

export class DistrictComponent implements OnInit {

  private provinceService = inject(DistrictService);
  districts!: District[];

  @Input() provinceCode?: number;
  @Output() districtSelected = new EventEmitter<string | undefined>();

  @Input() model?: number = undefined;
  @Input() firstProvinceCode?: number = undefined;

  private isInitialLoad = true;

  async ngOnInit() {
    console.log('ngOnInit provinceCode:', this.provinceCode);
    console.log('ngOnInit model:', this.model);
    await this.fetchDistrictData({ provinceId: this.firstProvinceCode || 1 });
    this.isInitialLoad = false;
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    console.log("ngOnChanges:", this.model);
    console.log("ngOnChanges changes:", changes, this.provinceCode);

    // Province değişikliği kontrolü
    if (changes['provinceCode'] && !this.isInitialLoad) {
      const currentProvinceCode = changes['provinceCode'].currentValue;
      const previousProvinceCode = changes['provinceCode'].previousValue;

      console.log("Province code changed from", previousProvinceCode, "to", currentProvinceCode);

      // Sadece province gerçekten değiştiyse district listesini yenile
      if (currentProvinceCode && currentProvinceCode !== previousProvinceCode) {
        await this.fetchDistrictData({ provinceId: currentProvinceCode });

        // Yalnızca province değiştiğinde model'i temizle
        // Edit durumunda province aynıysa model'i korumak için bu kontrolü ekliyoruz
        if (previousProvinceCode && previousProvinceCode !== currentProvinceCode) {
          this.model = undefined;
          this.districtSelected.emit(undefined);
        }
      }
    }

    // Model değişikliği kontrolü (edit durumu için)
    if (changes['model'] && !changes['model'].firstChange) {
      console.log("Model changed to:", changes['model'].currentValue);
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
      console.log('Fetching districts for province:', params.provinceId);

      const getDistricts = await this.provinceService.districts(params);
      if (getDistricts) {
        this.districts = getDistricts.map((district: any) => ({
          name: district.name,
          code: district.id
        }));

        console.log('Districts loaded:', this.districts.length);

        // Edit durumunda model varsa ve districts listesinde mevcutsa korumak için
        if (this.model && this.districts.some(d => String(d.code) === String(this.model))) {
          console.log('Keeping existing model:', this.model);
        }
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
    console.log('Selected district:', districtCode);
    this.districtSelected.emit(districtCode);
  }
}
