import { Component } from '@angular/core';
import { 
  Facebook,
  Instagram,
  LucideAngularModule
 } from 'lucide-angular';

@Component({
  selector: 'app-info',
  imports: [LucideAngularModule],
  templateUrl: './info.html',
  styleUrl: './info.css',
})
export class Info {
  // Icons
  readonly Facebook = Facebook;
  readonly Instagram = Instagram;
}
