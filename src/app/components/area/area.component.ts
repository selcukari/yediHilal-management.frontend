import { Component, inject, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { AreaService } from '../../../services/area.service';
interface Area {
  name: string;
  code: string;
}
@Component({
  selector: 'app-component-area',
  standalone: true,
  imports: [FormsModule, Select],
  templateUrl: './area.component.html',
})

export class AreaComponent implements OnInit {

  private areaService = inject(AreaService);
  areas!: Area[];

  @Output() areaSelectedName = new EventEmitter<string>();
  @Output() areaSelected = new EventEmitter<string>();
  @Input() model?: number = undefined;

  async ngOnInit() {
    await this.fetchAreaData();
  }

 private async fetchAreaData(): Promise<void> {
    try {
      const getAreas = await this.areaService.areas();
      if (getAreas) {
        this.areas = getAreas.map((country: any) => ({
          name: country.name,
          code: country.id
        }));
      } else {
        console.error('No getAreas data found');
      }
    } catch (error: any) {
      console.error('Error fetching getAreas:', error.message);
    }
  }

  onAreaSelect(areaCode: any): void {
    this.areaSelected.emit(areaCode);
    const selectedArea = this.areas.find(area => area.code === areaCode);
    if (selectedArea) {
      this.areaSelectedName.emit(selectedArea.name);
    } else {
      this.areaSelectedName.emit('');
    }
  }
}
