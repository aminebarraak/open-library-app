import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookService } from '../../services/book.service';
import { SearchService } from '../../services/search.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './book-list.html',
  styleUrls: ['./book-list.css']
})
export class BookListComponent implements OnInit, OnDestroy {
  booksList: any[] = [];
  filteredBooks: any[] = [];
  loading: boolean = true;
  error: string = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private bookService: BookService,
    private searchService: SearchService
  ) { }

  ngOnInit() {
    this.loadBooks();
    
    // S'abonner aux changements de recherche
    this.subscriptions.push(
      this.searchService.searchTitle$.subscribe(title => {
        this.searchByTitle(title);
      })
    );

    this.subscriptions.push(
      this.searchService.searchYear$.subscribe(year => {
        this.searchByYear(year || 0);
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadBooks() {
    this.loading = true;
    this.error = '';
    this.bookService.getBooks().subscribe({
      next: (data) => {
        console.log('Livres chargés:', data);
        this.booksList = data.works || [];
        this.filteredBooks = this.booksList;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur complète:', error);
        this.error = 'Erreur lors du chargement des livres. Vérifiez votre connexion.';
        this.loading = false;
        // Charger des données de test si l'API échoue
        this.loadDefaultBooks();
      }
    });
  }

  loadDefaultBooks() {
    // Données de test si l'API ne fonctionne pas
    this.booksList = [
      {
        key: '/works/OL17365W',
        title: 'Introduction to Algorithms',
        edition_count: 3,
        cover_id: 5412914,
        first_publish_year: 1990,
        subtitle: 'The MIT Press',
        description: 'A comprehensive introduction to algorithms'
      }
    ];
    this.filteredBooks = this.booksList;
  }

  searchByTitle(title: string) {
    if (!title.trim()) {
      console.log('🔄 Recherche vide - affichage de tous les livres');
      this.filteredBooks = this.booksList;
      this.loading = false;
      this.error = '';
      return;
    }
    
    const searchTerm = title.toLowerCase().trim();
    console.log('🔍 Recherche par titre:', searchTerm);
    
    // Réinitialiser le loading
    this.loading = true;
    this.error = '';
    
    // Rechercher localement d'abord
    const localResults = this.booksList.filter(book => {
      const bookTitle = (book.title || '').toLowerCase();
      const bookSubtitle = (book.subtitle || '').toLowerCase();
      const bookDescription = (book.description || '').toLowerCase();
      
      return bookTitle.includes(searchTerm) || 
             bookSubtitle.includes(searchTerm) || 
             bookDescription.includes(searchTerm);
    });
    
    console.log(`📚 Livres trouvés localement pour "${searchTerm}":`, localResults.length);
    
    // Afficher les résultats locaux immédiatement
    this.filteredBooks = localResults.length > 0 ? localResults : [];
    this.loading = false;
    
    // Toujours faire une recherche API pour plus de résultats
    console.log('🌐 Recherche API pour "${searchTerm}"...');
    this.loading = true;
    this.bookService.searchByTitle(title).subscribe({
      next: (data) => {
        console.log('✅ Résultats de l\'API:', data);
        if (data.docs && data.docs.length > 0) {
          this.filteredBooks = data.docs;
          console.log(`✨ ${data.docs.length} livre(s) trouvé(s) via l'API`);
          this.error = '';
        } else {
          console.warn('⚠️ Aucun résultat de l\'API');
          if (localResults.length === 0) {
            this.error = 'Aucun livre trouvé';
          }
          this.filteredBooks = localResults;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur recherche API:', error);
        this.loading = false;
        
        // Garder les résultats locaux en cas d'erreur
        if (localResults.length > 0) {
          this.filteredBooks = localResults;
          this.error = '';
        } else {
          this.filteredBooks = [];
          this.error = 'Aucun livre trouvé. Vérifiez votre connexion.';
        }
      }
    });
  }

  searchByYear(year: number) {
    if (!year) {
      this.filteredBooks = this.booksList;
      return;
    }
    console.log('🔍 Recherche par année:', year);
    
    // Rechercher les livres de cette année ou proches
    this.filteredBooks = this.booksList.filter(book => {
      const bookYear = book.first_publish_year;
      if (!bookYear) return false;
      
      // Accepter l'année exacte ou ±2 ans
      return Math.abs(bookYear - year) <= 2;
    });
    
    console.log(`📚 Livres trouvés pour l'année ${year}:`, this.filteredBooks.length);
    
    // Si aucun livre trouvé localement, faire une recherche API
    if (this.filteredBooks.length === 0) {
      console.log('❌ Aucun livre trouvé localement, recherche API...');
      this.loading = true;
      this.bookService.searchByYear(year).subscribe({
        next: (data) => {
          console.log('✅ Résultats de l\'API:', data);
          this.filteredBooks = data.docs || [];
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur recherche par année:', error);
          this.loading = false;
          this.error = 'Aucun livre trouvé pour cette année.';
        }
      });
    }
  }

  getBookId(key: string): string {
    return key.replace('/works/', '');
  }

  getCoverUrl(coverId: number): string {
    return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
  }
}
