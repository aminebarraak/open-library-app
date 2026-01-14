import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookService } from '../../services/book';
import { SearchBarComponent } from '../search-bar/search-bar';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, SearchBarComponent],
  templateUrl: './book-list.html',
  styleUrl: './book-list.css'
})
export class BookListComponent implements OnInit {
  booksList: any[] = [];
  isLoading: boolean = true;
  currentSortOption: string = '';

  constructor(
    private bookService: BookService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.isLoading = true;
    this.bookService.getBooks().subscribe((data) => {
      this.booksList = data.works;
      this.isLoading = false;
      this.applySorting();
    });
  }

  getCoverImageUrl(coverId: number): string {
    return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
  }

  onBookClick(bookKey: string): void {
    const bookId = bookKey.split('/').pop();
    this.router.navigate(['/book', bookId]);
  }

  searchByTitle(title: string): void {
    this.isLoading = true;
    this.bookService.searchByTitle(title).subscribe((data) => {
      this.booksList = data.docs;
      this.isLoading = false;
      this.applySorting();
    });
  }

  searchByYear(year: number): void {
    this.isLoading = true;
    this.bookService.searchByYear(year).subscribe((data) => {
      this.booksList = data.docs;
      this.isLoading = false;
      this.applySorting();
    });
  }

  onSortChange(sortOption: string): void {
    this.currentSortOption = sortOption;
    this.applySorting();
  }

  private applySorting(): void {
    if (!this.currentSortOption || this.booksList.length === 0) {
      return;
    }

    const [field, direction] = this.currentSortOption.split('-');

    this.booksList.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      if (field === 'title') {
        valueA = (a.title || '').toLowerCase();
        valueB = (b.title || '').toLowerCase();
      } else if (field === 'year') {
        valueA = a.first_publish_year || 0;
        valueB = b.first_publish_year || 0;
      }

      if (direction === 'asc') {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    });
  }
}