import { Component, inject, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { CountryService } from '../../../services/country.service';

interface Country {
  name: string;
  code: string;
}

@Component({
  selector: 'app-component-country',
  standalone: true,
  imports: [FormsModule, Select, MessageModule],
  templateUrl: './country.component.html',
})

export class CountryComponent implements OnInit {

  private countryService = inject(CountryService);
  countries!: Country[];
  @Input() isRequired?: boolean = false;
  @Output() countrySelected = new EventEmitter<number>();
  @Output() countrySelectedName = new EventEmitter<string>();

  @Input() model?: number;
  @Input() isDisabled: boolean = false;

  async ngOnInit() {
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
    const selectedCountry = this.countries.find(country => country.code === countryCode);
    if (selectedCountry) {
      this.countrySelectedName.emit(selectedCountry.name);
    } else {
      this.countrySelectedName.emit('');
    }
  }
}
