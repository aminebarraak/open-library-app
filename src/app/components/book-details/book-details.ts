// src/app/book-details/book-details.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../services/book';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-details.html',
  styleUrl: './book-details.css'
})
export class BookDetailsComponent implements OnInit {
  book: any = null;
  bookId: string = '';
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.bookId = params['id'];
      this.loadBookDetails();
    });
  }

  loadBookDetails(): void {
    this.isLoading = true;
    this.bookService.getBookById(this.bookId).subscribe(data => {
      this.book = data;
      this.isLoading = false;
    });
  }

  getCoverImageUrl(coverId: number): string {
    return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
  }

  getDescription(): string {
    if (!this.book.description) return 'Aucune description disponible';
    
    if (typeof this.book.description === 'string') {
      return this.book.description;
    }
    
    if (this.book.description.value) {
      return this.book.description.value;
    }
    
    return 'Aucune description disponible';
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}