import { Component } from '@angular/core';

@Component({
  selector: 'app-head-bar',
  standalone: true,
  templateUrl: './head-bar.html',
  styleUrls: ['./head-bar.css']
})
export class HeadBarComponent {
  title = 'Open Library';
}
