import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BookService } from '../../services/book.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './book-details.html',
  styleUrls: ['./book-details.css']
})
export class BookDetailsComponent implements OnInit, OnDestroy {
  book: any = null;
  loading: boolean = true;
  error: string = '';
  bookId: string = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService
  ) { }

  ngOnInit() {
    console.log('BookDetailsComponent initialisé');
    
    this.subscriptions.push(
      this.route.params.subscribe(params => {
        this.bookId = params['id'];
        console.log('📖 ID du livre reçu:', this.bookId);
        if (this.bookId) {
          this.loadBookDetails();
          
          // Timeout de secours après 3 secondes - afficher les données par défaut rapidement
          setTimeout(() => {
            if (this.loading && !this.book) {
              console.warn('⚠️ Timeout de chargement après 3s - affichage des données par défaut');
              this.loading = false;
              this.loadDefaultBookDetails();
            }
          }, 3000);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadBookDetails() {
    this.loading = true;
    this.error = '';
    console.log('🔄 Début du chargement des détails pour:', this.bookId);
    
    const bookObservable = this.bookService.getBookById(this.bookId);

    this.subscriptions.push(
      bookObservable.subscribe({
        next: (data) => {
          console.log('✅ Détails du livre chargés avec succès:', data);
          console.log('📚 Auteurs reçus:', data.authors);
          this.book = data;
          this.loading = false;
          this.error = '';
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement:', error.message || error);
          this.loading = false;
          this.loadDefaultBookDetails();
        },
        complete: () => {
          console.log('✓ Chargement des détails terminé');
          this.loading = false;
        }
      })
    );
  }

  loadDefaultBookDetails() {
    console.log('📚 Chargement des données par défaut');
    this.book = {
      key: `/works/${this.bookId}`,
      title: `📖 Livre ${this.bookId}`,
      subtitle: 'Données temporaires - Connexion API indisponible',
      first_publish_year: 2024,
      edition_count: 5,
      description: 'Une erreur s\'est produite lors du chargement des détails de ce livre depuis l\'API OpenLibrary. Vérifiez votre connexion Internet et rafraîchissez la page pour réessayer.',
      authors: [
        { name: 'Auteur inconnu' }
      ],
      covers: []
    };
    this.loading = false;
  }

  getCoverUrl(): string {
    if (this.book && this.book.covers && this.book.covers.length > 0) {
      const coverId = this.book.covers[0];
      return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
    }
    return '';
  }

  getAuthors(): any[] {
    if (!this.book) return [];
    
    // Vérifier différentes structures possibles d'auteurs
    let authors = this.book.authors || [];
    
    if (!Array.isArray(authors)) {
      return [];
    }
    
    // Mapper les auteurs pour extraire les noms correctement
    return authors.map(author => {
      if (typeof author === 'string') {
        return { name: author };
      }
      
      // Si c'est un objet avec une propriété 'name'
      if (author.name) {
        return author;
      }
      
      // Si c'est un objet avec une propriété 'author' (structure OpenLibrary)
      if (author.author) {
        return {
          name: author.author.name || 'Auteur inconnu'
        };
      }
      
      return { name: 'Auteur inconnu' };
    }).filter(author => author.name);
  }

  goBack() {
    window.history.back();
  }
}
