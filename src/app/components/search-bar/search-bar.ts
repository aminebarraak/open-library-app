import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBarComponent {
  titleQuery = '';
  yearQuery: number | null = null;
  selectedSort = '';

  @Output() searchByTitle = new EventEmitter<string>();
  @Output() searchByYear = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<string>();

  onSearchByTitle(): void {
    const value = this.titleQuery.trim();
    if (value) {
      this.searchByTitle.emit(value);
    }
  }

  onSearchByYear(): void {
    if (this.yearQuery != null) {
      this.searchByYear.emit(this.yearQuery);
    }
  }

  onSortChange(): void {
    this.sortChange.emit(this.selectedSort);
  }
}
