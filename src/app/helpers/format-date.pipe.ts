import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate'
})
export class FormatDatePipe implements PipeTransform {

  transform(dateString?: string): string {
    if (!dateString) return ''; // null/undefined/boş kontrolü

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return dateString; // geçersizse olduğu gibi döndür
    }

    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

}
