import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-bar.html',
  styleUrls: ['./search-bar.css']
})
export class SearchBarComponent {
  title: string = '';
  year: number | null = null;
  sortBy: string = 'title-asc';

  constructor(private searchService: SearchService) { }

  onSearchTitle() {
    console.log('🔎 Bouton recherche titre cliqué:', this.title);
    if (this.title.trim()) {
      this.searchService.setSearchTitle(this.title);
    }
  }

  onSearchYear() {
    console.log('🔎 Bouton recherche année cliqué:', this.year);
    if (this.year) {
      this.searchService.setSearchYear(this.year);
    }
  }

  onSortChange() {
    console.log('📊 Tri changé:', this.sortBy);
    this.searchService.setSortBy(this.sortBy);
  }

  resetSearch() {
    console.log('🔄 Réinitialisation de la recherche');
    this.title = '';
    this.year = null;
    this.sortBy = 'title-asc';
    this.searchService.setSearchTitle('');
    this.searchService.setSearchYear(null);
    this.searchService.setSortBy('title-asc');
  }
}
