import { Component, inject, OnInit, ViewChild } from '@angular/core';
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

  private authService = inject(CountryService);
  countries!: Country[];

  async ngOnInit() {
    await this.fetchCountryData();
  }
 private async fetchCountryData(): Promise<void> {
    try {
      const countries = await this.authService.countries();
      if (countries) {
        console.log('Countries fetched successfully:', countries);
        this.countries = countries.map((country: any) => ({
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

  onCountrySelect(country: Country): void {
    console.log('Selected country:', country);
    // Implement any additional logic needed when a country is selected
  }
}
