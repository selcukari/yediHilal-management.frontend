import { Component, inject, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { CountryService } from '../../../services/country.service';

interface Country {
    name: string;
    code: string;
}

@Component({
  selector: 'app-component-country',
  standalone: true,
  imports: [FormsModule, Select],
  templateUrl: './country.component.html',
})

export class CountryComponent implements OnInit {

  private countryService = inject(CountryService);
  countries!: Country[];
  // model: number = 1;
  @Output() countrySelected = new EventEmitter<number>();

  @Input() model?: number = 1;
  @Input() isDisabled: boolean = false;

  async ngOnInit() {
    console.log('CountryComponent initialized with isDisabled:', this.isDisabled);
    console.log('CountryComponent initialized with model:', this.model);
    await this.fetchCountryData();

    this.countrySelected.emit(this.model != null ? this.model : undefined);

  }

 private async fetchCountryData(): Promise<void> {
    try {
      const getCountries = await this.countryService.countries();
      if (getCountries) {
        this.countries = getCountries.map((country: any) => ({
          name: country.name,
          code: country.id
        }));
      } else {
        console.error('No countries data found');
      }
    } catch (error: any) {
      console.error('Error fetching countries:', error.message);
    }
  }

  onCountrySelect(countryCode: any): void {
    this.countrySelected.emit(countryCode as number);
  }
}
