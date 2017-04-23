import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import {RatingComponent} from "./rating/rating.component";

const appRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: ':id',
        component: RatingComponent,
      }
    ]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  }

];

export const routerModule = RouterModule.forRoot(appRoutes, {
  // enableTracing: true
});


