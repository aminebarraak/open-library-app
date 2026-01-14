// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { BookListComponent } from './components/book-list/book-list';
import { BookDetailsComponent } from './components/book-details/book-details';

export const routes: Routes = [
  { path: '', component: BookListComponent },
  { path: 'book/:id', component: BookDetailsComponent },
  { path: '**', redirectTo: '' }
];